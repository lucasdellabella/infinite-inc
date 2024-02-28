import * as openai from "../src/lib/openai.ts";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import querystring from "node:querystring";
import { infiniteCraftPrompt } from "../src/lib/serverPrompts.ts";
import { Database } from "../src/lib/supabase.ts";

// https://vercel.com/docs/functions/quickstart#create-an-api-route

const supabase: SupabaseClient<Database> = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE || ""
);

// invoke this endpoint locally from localhost:3000/api/hello
// run a vercel dev server via `npx vercel dev`
// believe you can run the vite server and vercel server at the same time.
export async function GET(request: Request) {
  const [, qs] = request.url.split("?") || [];
  const { name1, name2 } = querystring.parse(qs);

  if (typeof name1 === "string" && typeof name2 === "string") {
    const res = await prompt(name1, name2);

    return new Response(res);
  } else {
    const res = new Response("Bad request", {status: 400});
    return res;
  }
}



export async function prompt(name1: string, name2: string): Promise<string> {
  const prompt = [name1, name2, "?"].join("|");

  const output = await openai.run(prompt, infiniteCraftPrompt);

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
  return r1;
}
