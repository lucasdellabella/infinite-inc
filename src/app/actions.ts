"use server"

import { cookies } from "next/headers"
import { createClient } from "@/util/supabase/server"
import Replicate from "replicate"

import { gamePrompt, infiniteCraftPrompt } from "@/lib/serverPrompts"

const defaultInputs = {
  debug: false,
  top_k: -1,
  top_p: 1,
  temperature: 0.75,
  system_prompt: gamePrompt,
  max_new_tokens: 800,
  min_new_tokens: -1,
  repetition_penalty: 1,
}

const supabase = createClient(cookies())
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

function superComplicatedNormalization(output: string): string | null {
  const s = output?.split(" ") || []

  const [res1, res2] = s.slice(Math.max(s.length - 3, 0)).filter((n, i) => {
    const l = n.toLowerCase().replace(/\W/g, "")
    return (
      l !== "output" && (i !== 0 || n.charAt(0) === n.charAt(0).toUpperCase())
    )
  })

  const [nullCheck] = [res1, res2].filter((x) => x?.toLowerCase() === "null")

  return !nullCheck
    ? [res1, res2]
        .filter((x) => x)
        .join(" ")
        .replaceAll(" ", "_")
        .replace(/\W/g, "")
    : null
}

export async function prompt(name1: string, name2: string): Promise<string> {
  const prompt = [name1, name2, "?"].join("|")
  const input = { ...defaultInputs, system_prompt: infiniteCraftPrompt, prompt }
  const res: string[] = (await replicate.run("meta/llama-2-7b-chat", {
    input,
  })) as string[]
  const output = res?.join("")

  const s = output?.split("|")
  const [res_name1] = s?.slice(Math.max(s.length - 1, 0))

  const [n1, n2, r1] =
    [name1, name2, res_name1]
      .map((n) => n.replaceAll(" ", "_"))
      .map((n) => n.replace(/\W/g, "")) || []

  if (supabase) {
    const { error } = await supabase
      ?.from("combos")
      .insert({ name1: n1, name2: n2, res_name1: r1 })
    if (error) {
      console.log("insert failed", error)
    }
  }
  return output
}

export async function prompt1(message: string): Promise<string> {
  const [subject, objects] = message?.split(" combines ") || []

  const ands = objects.split(" and ")

  const [name1, name2, name3, name4] =
    [subject, ...ands]
      ?.map((n) => n.replaceAll(" ", "_"))
      .map((n) => n.replace(/\W/g, "")) || []

  const input = { ...defaultInputs, prompt: message }

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
