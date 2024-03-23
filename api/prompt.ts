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
    const res = name1 && name2 ? await prompt(name1, name2) : name1;

    const emoji = typeof res === "string" ? await promptEmoji(res) : null;

    const props = typeof res === "string" ? await promptProps(res) : null;

    return new Response(JSON.stringify([res, emoji, props]));
  } else {
    const res = new Response("Bad request", { status: 400 });
    return res;
  }
}

function strictCamelToSnakeCase(str: string) {
  // Strict camelCase check
  if (typeof str === "string" && /^[a-z]+(?:[A-Z][a-z]*)*$/.test(str)) {
    const snakeCaseStr = str.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    return snakeCaseStr;
  }
  return str; // Return unchanged if it's not strictly camelCase
}

export function parseCustomSyntax(input: string) {
  // Initialize an empty object to store our result
  try {
    const result: { [key: string]: { [k: string]: unknown } } = {};

    // Extract the key (e.g., 'emits') and the values inside the brackets
    const [, key, values] = input.match(/(\w+)\[([^[\]]+)]/) || [];

    // Create a properties object within the result
    result[key] = {};

    // Split the key-value pairs and loop through them
    values.split(",").forEach((pair) => {
      // Split each key-value pair
      const [k, v] = pair.split("=");

      // Assign to the properties object, attempting to parse numbers if necessary
      result[key][k] = isNaN(v as unknown as number)
        ? strictCamelToSnakeCase(v)
        : Number(v);
    });

    return result;
  } catch (e) {
    console.log("error parsing", input);
  }
}
export async function promptProps(label: string) {
  const { data } = await supabase
    .from("entity_properties")
    .select()
    .eq("entity_name", label);

  if (data && data.length !== 0) return data;

  const ideas = await run(label, generateComponentIdeasPrompt);

  if (!ideas) return [];

  const output = await run(ideas, selectComponentIdeasPrompt);
  if (!output) return [];

  const [propsString] = output.split("> ").reverse();

  const propsWithFail = [
    ...propsString.matchAll(/(\w+)\[(\w+=[\w]+)(,\s*\w+=\w+)*\]/g),
  ].map(([match]) => parseCustomSyntax(match));

  const fails = propsWithFail.filter((x) => !x);
  if (fails.length > 0) console.log("error parsing", label, propsString);

  const props = propsWithFail.filter((x) => x);
  const propRows = props.map(
    (p): Database["public"]["Tables"]["entity_properties"]["Insert"] => {
      const [[k, v]] = Object.entries(p as object) || [];

      return {
        name: k,
        config: JSON.parse(JSON.stringify(v)),
        entity_name: label,
      };
    }
  );
  if (supabase) {
    const { error } = await supabase.from("entity_properties").insert(propRows);
    if (error) console.log("insert failed", error);
  }
  return propRows;
}
export async function promptEmoji(label: string): Promise<string | null> {
  const { data } =
    (await supabase
      .from("entity_emojis")
      .select("emojis")
      .eq("res_name1", label)) || {};

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
      .insert({ emojis: output, res_name1: label });
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
      .insert({ name1: n1, name2: n2, res_name1: r1, res_name2: res_name1 });
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

const selectComponentIdeasPrompt = `
### Facts:

You are a game designer, and we are assigning game objects properties, or components, in an ECS system that allow them to live and act in our 2D game world.

We currently have the following properties we can assign to game objects:

- \`movementPattern\` dictates how the game object moves.
  Fields are the following -- name: 'meander' |'snakeUpwards' | 'farmerBackAndForth';
  - meander: moves one direction for a while, may pause for a while, then moves in another direction. Used with e.g. a cow in a field.
  - snakeUpwards: moves in sine wave like shape upwards, repeatedly. Used with e.g. smoke from a fire
  - farmerBackAndForth: moves in a back and forth motion with an ever downward direction like a farmer would move, sowing seeds into his plot of land.
- \`emits\` defines what and how often the game object "emits" some other game object. Fields are the following -- object: string; frequencyMs: number;
- \`disappears\` defines the duration until a game object is removed from the scene. Fields are the following -- timeLeftMs: number;

Additionally, multiple components can compose together to create new ideas in our system. For example, a meat game object could be assigned the following pair of properties to "transform it" into spoiled meat:

emits[object=spoiled meat, frequencyMs=10000] disappears[timeLeftMs=10000]

or a kitten could grow up into a cat in the following manner:

emits[object=cat, frequencyMs=120000] disappears[timeLeftMs=120000]

You're welcome to use this transform concept or any other ideas regarding similar compositions of components.

### Your Task:

You will be provided with behaviors and properties of an entity that seem to map well to the aforementioned game behaviors. This prompt is trying to trick you - many of the suggested ideas will NOT map well to the game. Use your best judgement to select between 0 and 3 game behaviors which you are certain make sense as game properties, and output them in the custom format used under "// Your output"

// My input
A [cow] is known to:

- walk in a field
- eat grass
- poop
- produce milk
- have calves
- be playful

'walk in a field' moves the cow around, and could be a \`movementPattern\`.

'poop' is the cow producing or emitting poop, and could be an \`emits\`.

'produce milk' is the cow producing milk, and could be an \`emits\`.

'have calves' is the cow giving birth and creating a new cow, and could be an \`emits\`.
// Your output
"cow> movementPattern[name=meander] emits[object=milk,frequencyMs=5000] emits[object=poop,frequencyMs=10000]

// My input
{input}
// Your output
`;

const generateComponentIdeasPrompt = `
### Facts:

You are a game designer, and we are assigning game objects properties, or components, in an ECS system that allow them to live and act in our 2D game world.

We currently have the following properties we can assign to game objects:

- \`movementPattern\` dictates how the game object moves.
  Fields are the following -- name: 'meander' |'snakeUpwards' | 'farmerBackAndForth';
  - meander: moves one direction for a while, may pause for a while, then moves in another direction. Used with e.g. a cow in a field.
  - snakeUpwards: moves in sine wave like shape upwards, repeatedly. Used with e.g. smoke from a fire
  - farmerBackAndForth: moves in a back and forth motion with an ever downward direction like a farmer would move, sowing seeds into his plot of land.
- \`emits\` defines what and how often the game object "emits" some other game object. Fields are the following -- object: string; frequencyMs: number;
- \`disappears\` defines the duration until a game object is removed from the scene. Fields are the following -- timeLeftMs: number;

Additionally, multiple components can compose together to create new ideas in our system. For example, a meat game object could be assigned the following pair of properties to "transform it" into spoiled meat:

emits[object=spoiled meat, frequencyMs=10000] disappears[timeLeftMs=10000]

or a kitten could grow up into a cat in the following manner:

emits[object=cat, frequencyMs=120000] disappears[timeLeftMs=120000]

You're welcome to use this transform concept or any other ideas regarding similar compositions of components.

### Task Overview:

You will be provided with the name of some entity. You will list of 7 behaviors or properties that that entity may be known to exhibit.

Then, you will analyze your list of behaviors or properties, and attempt to find ways to represent these properties using the game properties we have available to us. If a behavior is highly abstract, do not bother to try to represent it in the game.

### Examples

// My input
Cow
// Your output
A [cow] is known to:

- walk in a field
- eat grass
- poop
- produce milk
- have calves
- be playful

Logical options are the following:

- walk in a field: movementPattern[name=meander]

- poop: emits[object=poop, frequencyMs=5000] because a cow regularly produces or emits poop.

- produce milk: emits[object=milk,frequencyMs=10000] because a cow regularly produces milk, and could be an \`emits\`.

- have calves: emits[object=calf, frequencyMs=1000000] is the cow giving birth and creating a new cow, and could be an \`emits\`. Cows do not give birth often, so the frequencyMs is set to a high value

// My input
Soap
// Your output
A [Soap] is known to:

- help things get cleaner
- make people slip and fall
- be rectangular
- be made of lard
- create a foamy lather when used
- clean someone's face and skin
- be used up after enough usage in the shower

Logical options are the following:

- be used up after enough usage in the shower: This doesn't seem to make sense as a game property. Soap won't disappear on its own, it needs to be used by something to eventually make it disappear.

- create a foamy lather when used: emits[object=bubbles,frequencyMs=10000] could make sense, though usually the bubbles happen during use of the soap, and not when the soap is completely inert

- help things get cleaner: this doesn't seem to directly map to any game properties

// My input
Coffee Bean
// Your output
A [Coffee Bean] is known to:

- get roasted and ground to prepare a cup of coffee
- smell really good
- be planted to grow a coffee tree

Logical options are the following:

- be planted to grow a coffee tree: emits[object=tree, frequencyMs=30000] disappears[timeLeftMs=30000] could work as this represents the coffee bean transforming or growing into a tree
- smell really good: this doesn't seem like it maps to our existing game components
- get roasted and ground to prepare a cup of coffee: this doesn't seem like it maps to our existing game components

// My input
Ray of sun
// Your output
A [Ray of sun] is known to:

Cause shadows
Enable photosynthesis in plants
Fade over time
Illuminate objects
Sparkle on water
Logical options are the following:

Cause shadows: This could be represented by a visual effect rather than a direct property in the ECS. However, if shadows are objects, it might be something like emits[object=shadow, frequencyMs=1000] where the frequency and existence are conditional on the light source's position. But because our game engine does not support this right now, there is no clear mapping.

Enable photosynthesis in plants: This is another indirect effect and does not clearly map to our game components.

Fade over time: disappears[timeLeftMs=20000] could represent the ray of sun slowly disappearing as a ray of sun is usually temporary.

Illuminate objects: This effect is more of a visual rendering effect than something directly modeled in ECS, akin to causing shadows. It does not map well to our game components.

Sparkle on water: emits[object=sparkle, frequencyMs=2000] could simulate the visual sparkles seen on water surfaces under sunlight, indicating a periodic visual effect.

### Your task

// My input
{entity_name}
// Your output
`;

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
      attachments: {
        Row: {
          created_at: string | null;
          creator_id: string | null;
          id: string;
          issue_id: string | null;
          metadata: Json | null;
          org_id: string | null;
          title: string | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          metadata?: Json | null;
          org_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          metadata?: Json | null;
          org_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_attachments_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_attachments_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      chats: {
        Row: {
          assistant_id: string | null;
          created_at: string;
          id: number;
          ip: string | null;
          issue_id: string | null;
          message: string | null;
          org_id: string | null;
          project_id: string | null;
          response: Json | null;
          run_id: string | null;
          subject: string | null;
          thread_id: string | null;
        };
        Insert: {
          assistant_id?: string | null;
          created_at?: string;
          id?: number;
          ip?: string | null;
          issue_id?: string | null;
          message?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          response?: Json | null;
          run_id?: string | null;
          subject?: string | null;
          thread_id?: string | null;
        };
        Update: {
          assistant_id?: string | null;
          created_at?: string;
          id?: number;
          ip?: string | null;
          issue_id?: string | null;
          message?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          response?: Json | null;
          run_id?: string | null;
          subject?: string | null;
          thread_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_chats_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_chats_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_chats_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
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
      comments: {
        Row: {
          body: string | null;
          created_at: string | null;
          creator_id: string | null;
          id: string;
          issue_id: string | null;
          org_id: string | null;
          parent_id: string | null;
          reaction_data: Json | null;
          updated_at: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          parent_id?: string | null;
          reaction_data?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          parent_id?: string | null;
          reaction_data?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_comments_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_comments_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      contacts: {
        Row: {
          assistant_id: string | null;
          created_at: string;
          email_address: string | null;
          id: string;
          name: string | null;
        };
        Insert: {
          assistant_id?: string | null;
          created_at?: string;
          email_address?: string | null;
          id?: string;
          name?: string | null;
        };
        Update: {
          assistant_id?: string | null;
          created_at?: string;
          email_address?: string | null;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      emails: {
        Row: {
          attachments: Json[] | null;
          created_at: string;
          data: Json | null;
          id: string;
        };
        Insert: {
          attachments?: Json[] | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
        };
        Update: {
          attachments?: Json[] | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
        };
        Relationships: [];
      };
      entity_properties: {
        Row: {
          config: Json | null;
          created_at: string;
          entity_name: string | null;
          id: number;
          name: string | null;
        };
        Insert: {
          config?: Json | null;
          created_at?: string;
          entity_name?: string | null;
          id?: number;
          name?: string | null;
        };
        Update: {
          config?: Json | null;
          created_at?: string;
          entity_name?: string | null;
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
      histories: {
        Row: {
          added_label_ids: string[] | null;
          archived: boolean | null;
          archived_at: string | null;
          attachment_ids: string[] | null;
          changes: Json | null;
          created_at: string | null;
          creator_id: string | null;
          from_assignee_id: string | null;
          from_due_date: string | null;
          from_estimate: number | null;
          from_parent_id: string | null;
          from_priority: number | null;
          from_project_id: string | null;
          from_state_id: string | null;
          from_title: string | null;
          id: string;
          issue_id: string | null;
          org_id: string | null;
          removed_label_ids: string[] | null;
          to_assignee_id: string | null;
          to_due_date: string | null;
          to_parent_id: string | null;
          to_priority: number | null;
          to_project_id: string | null;
          to_state_id: string | null;
          to_title: string | null;
          trashed: boolean | null;
          updated_at: string | null;
          updated_description: boolean | null;
        };
        Insert: {
          added_label_ids?: string[] | null;
          archived?: boolean | null;
          archived_at?: string | null;
          attachment_ids?: string[] | null;
          changes?: Json | null;
          created_at?: string | null;
          creator_id?: string | null;
          from_assignee_id?: string | null;
          from_due_date?: string | null;
          from_estimate?: number | null;
          from_parent_id?: string | null;
          from_priority?: number | null;
          from_project_id?: string | null;
          from_state_id?: string | null;
          from_title?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          removed_label_ids?: string[] | null;
          to_assignee_id?: string | null;
          to_due_date?: string | null;
          to_parent_id?: string | null;
          to_priority?: number | null;
          to_project_id?: string | null;
          to_state_id?: string | null;
          to_title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          updated_description?: boolean | null;
        };
        Update: {
          added_label_ids?: string[] | null;
          archived?: boolean | null;
          archived_at?: string | null;
          attachment_ids?: string[] | null;
          changes?: Json | null;
          created_at?: string | null;
          creator_id?: string | null;
          from_assignee_id?: string | null;
          from_due_date?: string | null;
          from_estimate?: number | null;
          from_parent_id?: string | null;
          from_priority?: number | null;
          from_project_id?: string | null;
          from_state_id?: string | null;
          from_title?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          removed_label_ids?: string[] | null;
          to_assignee_id?: string | null;
          to_due_date?: string | null;
          to_parent_id?: string | null;
          to_priority?: number | null;
          to_project_id?: string | null;
          to_state_id?: string | null;
          to_title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          updated_description?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "histories_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_assignee_id_fkey";
            columns: ["from_assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_parent_id_fkey";
            columns: ["from_parent_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_project_id_fkey";
            columns: ["from_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_state_id_fkey";
            columns: ["from_state_id"];
            isOneToOne: false;
            referencedRelation: "workflow_states";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_assignee_id_fkey";
            columns: ["to_assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_parent_id_fkey";
            columns: ["to_parent_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_project_id_fkey";
            columns: ["to_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_state_id_fkey";
            columns: ["to_state_id"];
            isOneToOne: false;
            referencedRelation: "workflow_states";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_histories_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      inbound_addresses: {
        Row: {
          created_at: string;
          email: string | null;
          id: number;
          org_id: string | null;
          project_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: number;
          org_id?: string | null;
          project_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: number;
          org_id?: string | null;
          project_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_inbound_addresses_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_inbound_addresses_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_inbound_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      issues: {
        Row: {
          assignee_id: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          duedate: string | null;
          email_id: string | null;
          estimate: number | null;
          id: string;
          identifier: string | null;
          label_ids: string[] | null;
          number: number | null;
          org_id: string | null;
          previous_identifiers: string[] | null;
          priority: number | null;
          priority_label: string | null;
          project_id: string | null;
          sort_order: number | null;
          state_id: string | null;
          subscriber_ids: string[] | null;
          title: string | null;
          trashed: boolean | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          assignee_id?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          duedate?: string | null;
          email_id?: string | null;
          estimate?: number | null;
          id?: string;
          identifier?: string | null;
          label_ids?: string[] | null;
          number?: number | null;
          org_id?: string | null;
          previous_identifiers?: string[] | null;
          priority?: number | null;
          priority_label?: string | null;
          project_id?: string | null;
          sort_order?: number | null;
          state_id?: string | null;
          subscriber_ids?: string[] | null;
          title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          assignee_id?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          duedate?: string | null;
          email_id?: string | null;
          estimate?: number | null;
          id?: string;
          identifier?: string | null;
          label_ids?: string[] | null;
          number?: number | null;
          org_id?: string | null;
          previous_identifiers?: string[] | null;
          priority?: number | null;
          priority_label?: string | null;
          project_id?: string | null;
          sort_order?: number | null;
          state_id?: string | null;
          subscriber_ids?: string[] | null;
          title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "issues_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_state_id_fkey";
            columns: ["state_id"];
            isOneToOne: false;
            referencedRelation: "workflow_states";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_issues_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_issues_email_id_fkey";
            columns: ["email_id"];
            isOneToOne: false;
            referencedRelation: "emails";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_issues_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      labels: {
        Row: {
          assistant_id: string | null;
          color: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          id: string;
          name: string | null;
          org_id: string | null;
          project_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          assistant_id?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          assistant_id?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "labels_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "labels_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "labels_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      openai_files: {
        Row: {
          active: boolean | null;
          assistant_id: string | null;
          created_at: string;
          display_name: string | null;
          file_name: string | null;
          id: string;
          ip: string | null;
          pdf_to_text: string | null;
        };
        Insert: {
          active?: boolean | null;
          assistant_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          file_name?: string | null;
          id: string;
          ip?: string | null;
          pdf_to_text?: string | null;
        };
        Update: {
          active?: boolean | null;
          assistant_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          file_name?: string | null;
          id?: string;
          ip?: string | null;
          pdf_to_text?: string | null;
        };
        Relationships: [];
      };
      openai_labels: {
        Row: {
          created_at: string;
          id: number;
          prompt: string | null;
          response: Json | null;
          version: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          prompt?: string | null;
          response?: Json | null;
          version?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          prompt?: string | null;
          response?: Json | null;
          version?: number | null;
        };
        Relationships: [];
      };
      org: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          id: string;
          logo_url: string | null;
          name: string | null;
          subscription_id: string | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      org_members: {
        Row: {
          org_id: string | null;
          user_id: string;
        };
        Insert: {
          org_id?: string | null;
          user_id: string;
        };
        Update: {
          org_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_organization_members_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          active: boolean | null;
          admin: boolean | null;
          created_at: string | null;
          created_issue_count: number | null;
          display_name: string | null;
          email: string | null;
          guest: boolean | null;
          id: string;
          invite_hash: string | null;
          last_seen: string | null;
          name: string | null;
          org_id: string | null;
          timezone: string | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          active?: boolean | null;
          admin?: boolean | null;
          created_at?: string | null;
          created_issue_count?: number | null;
          display_name?: string | null;
          email?: string | null;
          guest?: boolean | null;
          id: string;
          invite_hash?: string | null;
          last_seen?: string | null;
          name?: string | null;
          org_id?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          active?: boolean | null;
          admin?: boolean | null;
          created_at?: string | null;
          created_issue_count?: number | null;
          display_name?: string | null;
          email?: string | null;
          guest?: boolean | null;
          id?: string;
          invite_hash?: string | null;
          last_seen?: string | null;
          name?: string | null;
          org_id?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          member_ids: string[] | null;
          name: string | null;
          org_id: string | null;
          slug_id: string | null;
          sort_order: number | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          slug_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          slug_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          canceled_at: string | null;
          collection_method: string | null;
          created_at: string | null;
          creator_id: string | null;
          id: string;
          next_billing_at: string | null;
          org_id: string | null;
          seats: number | null;
          seats_maximum: number | null;
          seats_minimum: number | null;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          canceled_at?: string | null;
          collection_method?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          next_billing_at?: string | null;
          org_id?: string | null;
          seats?: number | null;
          seats_maximum?: number | null;
          seats_minimum?: number | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          canceled_at?: string | null;
          collection_method?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          next_billing_at?: string | null;
          org_id?: string | null;
          seats?: number | null;
          seats_maximum?: number | null;
          seats_minimum?: number | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      teams: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          member_ids: string[] | null;
          name: string | null;
          org_id: string | null;
          project_ids: string[] | null;
          sort_order: number | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          project_ids?: string[] | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          project_ids?: string[] | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_teams_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teams_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      workflow_states: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string | null;
          org_id: string | null;
          position: number | null;
          project_id: string | null;
          type: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          position?: number | null;
          project_id?: string | null;
          type?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          position?: number | null;
          project_id?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_workflow_states_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workflow_states_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workflow_states_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      zz_archived_comments: {
        Row: {
          created_at: string;
          id: number;
          message: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          message?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          message?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "z_archived_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      zz_archived_content_item: {
        Row: {
          comments: number[] | null;
          created_at: string;
          id: string;
          likes: number | null;
          list_id: string | null;
          post_id: string | null;
          post_type: string | null;
          published_at: string | null;
        };
        Insert: {
          comments?: number[] | null;
          created_at?: string;
          id?: string;
          likes?: number | null;
          list_id?: string | null;
          post_id?: string | null;
          post_type?: string | null;
          published_at?: string | null;
        };
        Update: {
          comments?: number[] | null;
          created_at?: string;
          id?: string;
          likes?: number | null;
          list_id?: string | null;
          post_id?: string | null;
          post_type?: string | null;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "z_archived_content_item_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "zz_archived_content_list";
            referencedColumns: ["id"];
          }
        ];
      };
      zz_archived_content_list: {
        Row: {
          created_at: string;
          elements: string[] | null;
          forked_from: string | null;
          hidden_mask: boolean[] | null;
          id: string;
          name: string | null;
          tags: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          elements?: string[] | null;
          forked_from?: string | null;
          hidden_mask?: boolean[] | null;
          id?: string;
          name?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          elements?: string[] | null;
          forked_from?: string | null;
          hidden_mask?: boolean[] | null;
          id?: string;
          name?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      zz_archived_image: {
        Row: {
          caption: string | null;
          created_at: string;
          id: string;
          tags: string[] | null;
          title: string | null;
          url: string | null;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title?: string | null;
          url?: string | null;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      zz_archived_place_post: {
        Row: {
          business_response: string | null;
          business_response_at: string | null;
          content_id: string;
          created_at: string;
          data_id: string | null;
          description: string | null;
          images: string[] | null;
          source_type: string | null;
          stars: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          business_response?: string | null;
          business_response_at?: string | null;
          content_id: string;
          created_at?: string;
          data_id?: string | null;
          description?: string | null;
          images?: string[] | null;
          source_type?: string | null;
          stars?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          business_response?: string | null;
          business_response_at?: string | null;
          content_id?: string;
          created_at?: string;
          data_id?: string | null;
          description?: string | null;
          images?: string[] | null;
          source_type?: string | null;
          stars?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "z_archived_place_post_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: true;
            referencedRelation: "zz_archived_content_item";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      entity_emojis: {
        Row: {
          emojis: string | null;
          res_name1: string | null;
        };
        Relationships: [];
      };
      questions_count: {
        Row: {
          assistant_id: string | null;
          count: number | null;
          ip: string | null;
        };
        Relationships: [];
      };
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

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
