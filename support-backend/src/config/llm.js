// LLM Configuration for Gemini/OpenAI

const llmConfig = {
  provider: process.env.LLM_PROVIDER || "gemini", // 'gemini' or 'openai'
  apiKey: process.env.LLM_API_KEY,
  model: process.env.LLM_MODEL || "gemini-pro",
  temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "1000"),
};

export default llmConfig;
