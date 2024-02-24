import Replicate from "replicate"

import { gamePrompt, infiniteCraftPrompt } from "@/lib/serverPrompts"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export function superComplicatedNormalization(output: string): string | null {
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

export async function run(prompt: string, systemPrompt?: string) {
  const input = { ...defaultInputs, prompt }
  if (systemPrompt) {
    input["system_prompt"] = systemPrompt
  }
  const outputRaw: string[] = (await replicate.run("meta/llama-2-7b-chat", {
    input,
  })) as string[]
  const output = outputRaw?.join("")

  return output
}
