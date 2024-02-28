import * as openai from "../src/lib/openai.ts";
import querystring from "node:querystring";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../src/lib/supabase.ts";

// https://vercel.com/docs/functions/quickstart#create-an-api-route

const supabase: SupabaseClient<Database> = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE || ""
);


export async function GET(request: Request) {
    const [, qs] = request.url.split("?") || [];
    const { label } = querystring.parse(qs);
  
    if (typeof label === "string") {
      const res = await promptEmoji(label);
  
      return new Response(res);
    } else {
      const res = new Response("Bad request", {status: 400});
      return res;
    }
  }

export async function promptEmoji(label: string): Promise<string | null> {
    const output = await openai.run(
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