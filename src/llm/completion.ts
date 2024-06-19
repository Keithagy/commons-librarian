import OpenAI from "openai";

const prefix = process.env.LLM_PROVIDER ?? "OPENAI";
const LLM_CONFIG = {
  API_BASE_URL:
    process.env[`${prefix}_BASE_URL`] ?? "https://api.openai.com/v1",
  API_KEY: process.env[`${prefix}_API_KEY`] ?? "no-key-specifed",
  API_MODEL: process.env[`${prefix}_API_MODEL`] ?? "gpt-3.5-turbo",
};

let openai: OpenAI;

type CNonStreaming =
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

type ChatCompletionCreateParamsNonStreaming = Omit<CNonStreaming, "model"> & {
  model?: CNonStreaming["model"];
};

export async function llmCompletion(
  args: ChatCompletionCreateParamsNonStreaming,
) {
  if (!openai) {
    openai = new OpenAI({
      baseURL: LLM_CONFIG.API_BASE_URL ?? "https://api.openai.com/v1",
      apiKey: LLM_CONFIG.API_KEY, // This is the default and can be omitted,
      defaultQuery: {
        model: LLM_CONFIG.API_MODEL ?? "gpt-3.5-turbo",
      },
    });
    console.info(
      `creating LLM client: ${LLM_CONFIG.API_MODEL} @ ${LLM_CONFIG.API_BASE_URL}`,
    );
  }

  const arg: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
    ...args,
    model: args.model ?? LLM_CONFIG.API_MODEL,
    temperature: args.temperature ?? 0,
    stream: true,
  };

  const chatCompletion = openai.beta.chat.completions.stream(arg);

  for await (const completion of chatCompletion) {
    console.log(completion.choices[0].delta.content);
  }

  const final = await chatCompletion.finalChatCompletion();

  return final;
}
