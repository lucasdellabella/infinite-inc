"use server"

import { cookies } from "next/headers"
import { createClient } from "@/util/supabase/server"
import Replicate from "replicate"

import { gamePrompt } from "@/lib/serverPrompts"

const supabase = createClient(cookies())
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

function superComplicatedNormalization(output: string): string | null {
  const s = output?.split(" ") || []

  const [res1, res2, res3] = s
    .slice(Math.max(s.length - 3, 0))
    .filter((n, i) => {
      console.log(n)
      const l = n.toLowerCase().replace(/\W/g, "")
      return (
        l !== "output" && (i !== 0 || n.charAt(0) === n.charAt(0).toUpperCase())
      )
    })

  const [nullCheck] = [res1, res2, res3].filter(
    (x) => x?.toLowerCase() === "null"
  )

  return !nullCheck
    ? [res1, res2, res3]
        .filter((x) => x)
        .join(" ")
        .replaceAll(" ", "_")
        .replace(/\W/g, "")
    : null
}

export default async function prompt(message: string): Promise<string> {
  const input = {
    debug: false,
    top_k: -1,
    top_p: 1,
    prompt: message,
    temperature: 0.75,
    system_prompt: gamePrompt,
    max_new_tokens: 800,
    min_new_tokens: -1,
    repetition_penalty: 1,
  }

  const names = message?.split(" combines ") || []

  const [name1, name2, name3, name4] =
    names
      ?.map((n) => n.replaceAll(" ", "_"))
      .map((n) => n.replace(/\W/g, "")) || []

  const res: string[] = (await replicate.run("meta/llama-2-7b-chat", {
    input,
  })) as string[]
  const output = res?.join("")

  const res_name1 = superComplicatedNormalization(output)

  if (supabase) {
    const { error } = await supabase
      ?.from("combos")
      .insert({ name1, name2, name3, name4, res_name1 })
    if (error) {
      console.log("insert failed", error)
    }
  }

  return output
}
