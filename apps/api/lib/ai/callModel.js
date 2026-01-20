import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callModel(prompt: string): Promise<string> {
  const response = await client.responses.create({
    model: "gpt-4o-mini",   // ← EZ A CHATGPT MINI
    input: prompt,
  });

  // A Mini válasza itt van:
  return response.output_text;
}
