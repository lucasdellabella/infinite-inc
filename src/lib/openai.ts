import OpenAI from "openai"


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
})

export default async function run(
  prompt: string,
  systemPrompt: string
): Promise<string | null> {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
  })

  const [choice] = chatCompletion?.choices || []
  const { message } = choice || {}
  const { content } = message || {}
  return content
}