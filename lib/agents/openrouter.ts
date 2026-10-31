import { OpenAIProvider, setDefaultModelProvider } from "@openai/agents";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing OPENROUTER_API_KEY in .env — create one at https://openrouter.ai/keys",
  );
}

setDefaultModelProvider(
  new OpenAIProvider({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    useResponses: false,
  }),
);

export const OPENROUTER_MODEL = "openai/gpt-4.1-mini";
