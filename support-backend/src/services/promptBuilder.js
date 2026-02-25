// Prompt Builder - Constructs prompt with documentation and context

/**
 * Build a comprehensive prompt for the LLM
 * @param {string} userQuery - The user's question
 * @param {string} documentation - Relevant documentation content
 * @param {string} context - Previous conversation context
 * @returns {string} - The complete prompt
 */
export const buildPrompt = (userQuery, documentation, context = "") => {
  // Truncate documentation to first 2000 chars to reduce token usage
  const truncatedDocs =
    documentation.length > 2000
      ? documentation.substring(0, 2000) + "..."
      : documentation;

  const systemInstructions = `You are a helpful AI Support Assistant. Answer based ONLY on the provided documentation.

Rules:
1. Use ONLY the documentation to answer
2. If not in docs, say: "Sorry, I don't have information about that."
3. Be concise and helpful
4. Don't make up information

DOCUMENTATION:
${truncatedDocs}

${
  context
    ? `RECENT CONVERSATION:
${context}

`
    : ""
}QUESTION:
${userQuery}`;

  return systemInstructions;
};

/**
 * Extract key terms from a query for better doc matching
 * @param {string} query - User query
 * @returns {string[]} - Array of key terms
 */
export const extractKeyTerms = (query) => {
  // Remove common words
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "how",
    "what",
    "when",
    "where",
    "why",
    "which",
    "who",
    "whom",
    "whose",
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2 && !stopWords.has(term));
};

export default {
  buildPrompt,
  extractKeyTerms,
};
