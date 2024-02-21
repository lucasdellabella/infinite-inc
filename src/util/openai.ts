import OpenAI from "openai"

import { infiniteCraftPrompt } from "@/lib/serverPrompts"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
})

export async function run(
  prompt: string,
  systemPrompt?: string
): Promise<string | null> {
  const systemPromptActual = systemPrompt || infiniteCraftPrompt
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPromptActual },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
  })

  const [choice] = chatCompletion?.choices || []
  const { message } = choice || {}
  const { content } = message || {}
  return content
}
