import OpenAI from "openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import querystring from "node:querystring";

// https://vercel.com/docs/functions/quickstart#create-an-api-route

const supabase: SupabaseClient<Database> = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE || ""
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

export async function run(
  prompt: string,
  systemPrompt: string
): Promise<string | null> {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
  });

  const [choice] = chatCompletion?.choices || [];
  const { message } = choice || {};
  const { content } = message || {};
  return content;
}

// invoke this endpoint locally from localhost:3000/api/hello
// run a vercel dev server via `npx vercel dev`
// believe you can run the vite server and vercel server at the same time.

export async function GET(request: Request) {
  const [, qs] = request.url.split("?") || [];
  const { name1, name2 } = querystring.parse(qs);

  if (typeof name1 === "string" && typeof name2 === "string") {
    const res = await prompt(name1, name2);

    const emoji = typeof res === "string" ? await promptEmoji(res) : null;

    return new Response(JSON.stringify([res, emoji]));
  } else {
    const res = new Response("Bad request", { status: 400 });
    return res;
  }
}

export async function promptEmoji(label: string): Promise<string | null> {
  const { data } =
    (await supabase.from("combos").select("emojis").eq("res_name1", label)) ||
    {};

  const [row] = data || [];
  const { emojis: existing } = row || {};
  if (existing) return existing;

  const output = await run(
    `What emoji best represents this idea? No more than 3 emojis, prefer 1 emoji:
    
    ${label}`,
    "You are a creative, humorous individual good at clearly communicating via emojis."
  );

  if (supabase) {
    const { error } = await supabase
      ?.from("combos")
      .update({ emojis: output })
      .eq("res_name1", label);
    if (error) {
      console.log("insert failed", error);
    }
  }
  return output;
}

export async function prompt(name1: string, name2: string): Promise<string> {
  const [n1, n2] =
    [name1, name2]
      .map((n) => n.replaceAll(" ", "_").replace(/\W/g, "").toLowerCase())
      .sort() || [];

  const { data } =
    (await supabase
      .from("combos")
      .select("res_name1")
      .eq("name1", n1)
      .eq("name2", n2)) || [];

  const [row] = data || [];
  const { res_name1: existing } = row || {};
  if (existing) return existing;

  const prompt = [name1, name2, "?"].join("|");

  const output = await run(prompt, infiniteCraftPrompt);

  const s = output?.split("|");
  const [res_name1] = s?.slice(Math.max(s.length - 1, 0)) || [];

  const r1 = res_name1.replaceAll(" ", "_").replace(/\W/g, "").toLowerCase();

  if (supabase) {
    const { error } = await supabase
      ?.from("combos")
      .insert({ name1: n1, name2: n2, res_name1: r1 });
    if (error) {
      console.log("insert failed", error);
    }
  }
  return r1;
}

export const gamePrompt = `We are playing a game, I will provide you a string of the form of
      
{subject} combines {A}( and {B})* =

And you will respond with a single phrase or word that makes logical sense given the prior statement. Think of it as the subject is a coding function, and A, B, etc. are the inputs to that function. You answer with an item or phrase that would be the logical output of that function, where the objects are ACTED upon by the subject. If you think the combination is illogical, just respond with null.


BUT you are a creative thinker, and consider all possible meanings of a word before answering with null. Your answer should strongly prefer concrete nouns over concepts and verbs whenever possible. 


For example:

Input: {oven} combines {egg}
Output: Frittata

Input {cook} combines {beef} and {pastry}
Output: Beef Wellington

Input {share} combines {beef} and {wine}
Output: Date Night

Input {share} combines {pizza} and {beer}
Output: Party

Input {vomiting} combines {pizza}
Output: Vomit

Input {choking} combines {bone}
Output: Death

Input {swimming} combines {shark} and {person}
Output: Dead Person

Input {swimming} combines {shark}
Output: null

Input: {Construction Corp.} combines {brick} and {glass}
Output: Wall

Input: {Construction Corp.} combines {beef} and {pastry}
Output: null

Input: {cow} combines {grass}
Output: manure

Input: {cow} combines {farmer}
Output: null

Input: {farmer} combines {cow}
Output: milk

Prefer concrete objects as answers instead of concepts or abstractions
Input: {burger} combines {sold}
Bad Output: Profit 
Good Output: Money

Input: {sell} combines {burger}
Bad Output: Transaction
Good Output: Money

Input: {Obama} combines {Party Alignment} and {California}
Good Output: Strong Endorsement

When the combiner is sufficiently abstract, if the combination is a stretch, return null instead.

Input: {Party Alignment} combines {Obama} and {California}
Bad output: Democratic Support
Good output: null
`;

export const infiniteCraftPrompt = `
We are creating new recipes for a crafting game on the fly. Follow the pattern and use your creativity to complete the recipes. 

The answer should only be one line in the format Input1|Input2|Result. Absolutely under no circumstances break this format in your answer.

Make sure the Result is a terse noun no more than three words long.


Here are some examples
Question>Acid Rain|Cannabis|?
Answer>Acid Rain|Cannabis|Bong Water

Question>Hole|Human|?
Answer>Hole|Human|Grave

Question>Hole|Marijuana|?
Answer>Hole|Marijuana|Pot

Question>Devil|Gold|?
Answer>Devil|Gold|Rich

Question>SpongeBob|Weed|?
Answer>SpongeBob|Weed|Spongeweed

Question>Glass|Lagoon|?
Answer>Glass|Lagoon|Aquarium

Question>Splash|Superhero|?
Answer>Splash|Superhero|Aquaman

Question>Quagmire|Stone|?
Answer>Quagmire|Stone|Squirrel

Question>Mountain Dew|Sour Tea|?
Answer>Mountain Dew|Sour Tea|Mountain Tea

Question>Dandelion Patch|Surfing|?
Answer>Dandelion Patch|Surfing|Dandelion Surfer

Question>Prince|Swiss Cheese|?
Answer>Prince|Swiss Cheese|Swiss Prince

Question>Pencil|Spongebob|?
Answer>Pencil|Spongebob|DoodleBob

Question>Ship|Wet Paper|?
Answer>Ship|Wet Paper|Paper Boat

Question>Acid Warfare|Brick|?
Answer>Acid Warfare|Brick|TNT

Question>Dinosaur|Wedding|?
Answer>Dinosaur|Wedding|Bride

Question>Fighter|Mountain Dew|?
Answer>Fighter|Mountain Dew|Mountain Man

Question>Frankenfish|Pineapple|?
Answer>Frankenfish|Pineapple|Pineapplefish

Question>Mutant|Wheel|?
Answer>Mutant|Wheel|Monster Truck

Question>Eclipse|Saturn|?
Answer>Eclipse|Saturn|Cassini

Question>Brick|Honey|?
Answer>Brick|Honey|Honeycomb

Question>Firefly|Road Runner|?
Answer>Firefly|Road Runner|Fire Road

Question>Thunderstorm|Troy|?
Answer>Thunderstorm|Troy|Troyan Horse

Question>Engine|Salt|?
Answer>Engine|Salt|Saltwater

Question>Moby Dick|Piranha|?
Answer>Moby Dick|Piranha|Whale Shark

Question>Epiphany|Thanos|?
Answer>Epiphany|Thanos|Infinity Gauntlet

Question>Iceberg|Telescope|?
Answer>Iceberg|Telescope|Ice Cube

Question>Planet|Sour Soup|?
Answer>Planet|Sour Soup|Pluto

Question>Fireball|Statue Of Liberty|?
Answer>Fireball|Statue Of Liberty|Liberty Bell

Question>Green Tea|SpongeBob SquarePants|?
Answer>Green Tea|SpongeBob SquarePants|Sponge Tea

Question>Chemist|Farm|?
Answer>Chemist|Farm|Alchemist

Question>Lagoon|Pollution|?
Answer>Lagoon|Pollution|Dead Fish

Question>Candle|Farmer|?
Answer>Candle|Farmer|Wax

Question>Burning Bush|Window|?
Answer>Burning Bush|Window|Fireplace

Question>Skeleton|Sour Sub|?
Answer>Skeleton|Sour Sub|Skull

Question>Crack|Gnome|?
Answer>Crack|Gnome|Gnomercy

Question>Fog|Prayer|?
Answer>Fog|Prayer|Priest

Question>Squirrel|Trade Winds|?
Answer>Squirrel|Trade Winds|Nut

Question>Commandments|Ice Age|?
Answer>Commandments|Ice Age|Ice Commandments

Question>Cinder|Iron|?
Answer>Cinder|Iron|Steel

Question>Blizzard|Health|?
Answer>Blizzard|Health|Frostbite

Question>Troll|Werewolf|?
Answer>Troll|Werewolf|Were-Troll

Question>Evil Queen|Fire|?
Answer>Evil Queen|Fire|Evil Witch

Question>Galileo|Statue|?
Answer>Galileo|Statue|Pendulum

Question>Autumn|Sulfur|?
Answer>Autumn|Sulfur|Fall

Question>Rover|Scent|?
Answer>Rover|Scent|Dog

Question>Jupiter|Photographer|?
Answer>Jupiter|Photographer|Astrologist

Question>Poison Ivy|Titanium|?
Answer>Poison Ivy|Titanium|Titanium Dioxide

Question>Hula Hoop|Sneeze|?
Answer>Hula Hoop|Sneeze|Hula Sneeze

Question>Parting|Steamroller|?
Answer>Parting|Steamroller|Road

Question>Sodium Acetate Trihydrate|Titanium|?
Answer>Sodium Acetate Trihydrate|Titanium|Sodium Titanate

Question>Dandelion Patch|Sour Ale|?
Answer>Dandelion Patch|Sour Ale|Dandelion Wine

Question>Air Force One|Hail|?
Answer>Air Force One|Hail|Air Force None

Question>Soggy|Toxic Fairy|?
Answer>Soggy|Toxic Fairy|Swamp Fairy

Question>Ammonia|Venom|?
Answer>Ammonia|Venom|Cleaner

Question>Pirate|Sky|?
Answer>Pirate|Sky|Pirate Ship

Question>Crab|Wine|?
Answer>Crab|Wine|Crabs

Question>Nymph|Odyssey|?
Answer>Nymph|Odyssey|Calypso

Question>Dust Bowl|Table|?
Answer>Dust Bowl|Table|Dinner

Question>Flat Earth|Train|?
Answer>Flat Earth|Train|Flat Train

Question>Mutant Fish|Road Runner|?
Answer>Mutant Fish|Road Runner|Mutant Road Runner

Question>God|Hot Tub|?
Answer>God|Hot Tub|Jacuzzi

Question>Michelangelo|Tumbleweed|?
Answer>Michelangelo|Tumbleweed|Sistine Chapel

Question>Hipster|Ring|?
Answer>Hipster|Ring|Hobbit

Question>Dust Colada|Tumbleweed|?
Answer>Dust Colada|Tumbleweed|Dusty

Question>Evil Balloon|Flying Fish|?
Answer>Evil Balloon|Flying Fish|Evil Flying Fish

Question>Caveman|Wind|?
Answer>Caveman|Wind|Flute

Question>Hay Fever|Mushroom|?
Answer>Hay Fever|Mushroom|Shiitake

Question>Evil Balloon|Vaporizer|?
Answer>Evil Balloon|Vaporizer|Evil Gas

Question>Camel|Priest|?
Answer>Camel|Priest|Caravan

ONLY RESPOND WITH A SINGLE RECIPE THAT MATCHES THE PROMPT!!!`;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      combos: {
        Row: {
          count1: number | null;
          count2: number | null;
          count3: number | null;
          count4: number | null;
          created_at: string;
          emojis: string | null;
          id: number;
          ingredients_consumed: boolean | null;
          name1: string | null;
          name2: string | null;
          name3: string | null;
          name4: string | null;
          res_count1: number | null;
          res_count2: number | null;
          res_name1: string | null;
          res_name2: string | null;
        };
        Insert: {
          count1?: number | null;
          count2?: number | null;
          count3?: number | null;
          count4?: number | null;
          created_at?: string;
          emojis?: string | null;
          id?: number;
          ingredients_consumed?: boolean | null;
          name1?: string | null;
          name2?: string | null;
          name3?: string | null;
          name4?: string | null;
          res_count1?: number | null;
          res_count2?: number | null;
          res_name1?: string | null;
          res_name2?: string | null;
        };
        Update: {
          count1?: number | null;
          count2?: number | null;
          count3?: number | null;
          count4?: number | null;
          created_at?: string;
          emojis?: string | null;
          id?: number;
          ingredients_consumed?: boolean | null;
          name1?: string | null;
          name2?: string | null;
          name3?: string | null;
          name4?: string | null;
          res_count1?: number | null;
          res_count2?: number | null;
          res_name1?: string | null;
          res_name2?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      post_type: "place" | "route" | "summary";
      source_type: "colorset";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;
