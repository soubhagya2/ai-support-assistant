// LLM Service - Integration with different LLM providers
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Simple response cache to reduce API calls
const responseCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const getCacheKey = (prompt) => {
  return crypto.createHash("md5").update(prompt).digest("hex");
};

const getCachedResponse = (prompt) => {
  const cacheKey = getCacheKey(prompt);
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("📦 Using cached response");
    return cached.data;
  }
  responseCache.delete(cacheKey);
  return null;
};

const cacheResponse = (prompt, response) => {
  const cacheKey = getCacheKey(prompt);
  responseCache.set(cacheKey, {
    data: response,
    timestamp: Date.now(),
  });
};

const llmConfigs = {
  provider: process.env.LLM_PROVIDER || "gemini",
  apiKey: process.env.LLM_API_KEY,
  model: process.env.LLM_MODEL || "gemini-pro",
  temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "1000"),
};

if (!llmConfigs.apiKey) {
  throw new Error("LLM_API_KEY is not set. Please add it to your .env file.");
}

/**
 * Call LLM API based on provider
 * @param {string} prompt - The prompt to send to the LLM
 * @returns {object} - { reply, tokensUsed }
 */
export const callLLM = async (prompt) => {
  // Check cache first to reduce API calls
  const cached = getCachedResponse(prompt);
  if (cached) {
    return cached;
  }

  const provider = llmConfigs.provider.toLowerCase();
  let result;

  switch (provider) {
    case "gemini":
      result = await callGemini(prompt);
      break;
    case "openai":
      result = await callOpenAI(prompt);
      break;
    case "claude":
      result = await callClaude(prompt);
      break;
    case "mistral":
      result = await callMistral(prompt);
      break;
    case "groq":
      result = await callGroq(prompt);
      break;
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  // Cache successful response
  cacheResponse(prompt, result);
  return result;
};

/**
 * Call Google Gemini API
 */
const callGemini = async (prompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${llmConfigs.model}:generateContent?key=${llmConfigs.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: llmConfigs.temperature,
          maxOutputTokens: llmConfigs.maxTokens,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Gemini API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response from Gemini";

  return {
    reply,
    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
  };
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (prompt) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmConfigs.apiKey}`,
    },
    body: JSON.stringify({
      model: llmConfigs.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: llmConfigs.temperature,
      max_tokens: llmConfigs.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `OpenAI API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  const reply =
    data.choices?.[0]?.message?.content || "No response from OpenAI";

  return {
    reply,
    tokensUsed: data.usage?.total_tokens || 0,
  };
};

/**
 * Call Claude API
 */
const callClaude = async (prompt) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": llmConfigs.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: llmConfigs.model || "claude-3-sonnet-20240229",
      max_tokens: llmConfigs.maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Claude API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  const reply = data.content?.[0]?.text || "No response from Claude";

  return {
    reply,
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
  };
};

/**
 * Call Mistral API
 */
const callMistral = async (prompt) => {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmConfigs.apiKey}`,
    },
    body: JSON.stringify({
      model: llmConfigs.model || "mistral-small",
      messages: [{ role: "user", content: prompt }],
      temperature: llmConfigs.temperature,
      max_tokens: llmConfigs.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Mistral API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  const reply =
    data.choices?.[0]?.message?.content || "No response from Mistral";

  return {
    reply,
    tokensUsed: data.usage?.total_tokens || 0,
  };
};

/**
 * Call Groq API
 */
const callGroq = async (prompt) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llmConfigs.apiKey}`,
      },
      body: JSON.stringify({
        model: llmConfigs.model || "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: llmConfigs.temperature,
        max_tokens: llmConfigs.maxTokens,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Groq API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "No response from Groq";

  return {
    reply,
    tokensUsed: data.usage?.total_tokens || 0,
  };
};

export default llmConfigs;
