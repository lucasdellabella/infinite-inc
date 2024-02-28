import { run as openaiRun } from "@/lib/openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { infiniteCraftPrompt } from "@/lib/serverPrompts";
import { Database } from "@/lib/supabase";

// https://vercel.com/docs/functions/quickstart#create-an-api-route

const supabase: SupabaseClient<Database> = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

// invoke this endpoint locally from localhost:3000/api/hello
// run a vercel dev server via `npx vercel dev`
// believe you can run the vite server and vercel server at the same time.
export async function GET(request: Request) {
  const { name1, name2 } = await request.json();

  const res = await prompt(name1, name2);

  return new Response(res);
}

export async function promptEmoji(label: string): Promise<string> {
  const output = await openaiRun(
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
  return output || "Not valid combo";
}

export async function prompt(name1: string, name2: string): Promise<string> {
  const prompt = [name1, name2, "?"].join("|");

  const output = await openaiRun(prompt, infiniteCraftPrompt);

  const s = output?.split("|");
  const [res_name1] = s?.slice(Math.max(s.length - 1, 0)) || [];

  const r1 = res_name1.replaceAll(" ", "_").replace(/\W/g, "").toLowerCase();

  const [n1, n2] =
    [name1, name2]
      .map((n) => n.replaceAll(" ", "_").replace(/\W/g, "").toLowerCase())
      .sort() || [];
  if (supabase) {
    const { error } = await supabase
      ?.from("combos")
      .insert({ name1: n1, name2: n2, res_name1: r1 });
    if (error) {
      console.log("insert failed", error);
    }
  }
  return output || "Not valid combo";
}
