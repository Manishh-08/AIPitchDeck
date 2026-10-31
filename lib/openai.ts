import OpenAI from "openai";

const IMAGE_MODEL = "gpt-image-1-mini";
const IMAGE_SIZE = "1024x1024";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY in .env — create one at https://openrouter.ai/keys",
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }

  return openaiClient;
}
