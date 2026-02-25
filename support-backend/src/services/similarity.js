// Similarity Service - Find relevant documentation using similarity search

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1
 * @param {string} str2
 * @returns {number} - Edit distance
 */
const getEditDistance = (str1, str2) => {
  const costs = [];
  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[str2.length] = lastValue;
  }
  return costs[str2.length];
};

/**
 * Calculate similarity between two strings (0 to 1)
 * Uses normalized Levenshtein distance
 * @param {string} str1
 * @param {string} str2
 * @returns {number} - Similarity score 0-1
 */
export const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Check for exact match
  if (s1 === s2) return 1;

  // Check for substring matches (give high score)
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Find relevant documents based on query
 * @param {string} query - User query
 * @param {Array} documents - Array of documentation objects
 * @param {number} threshold - Minimum similarity score (0-1)
 * @returns {Array} - Sorted array of relevant documents
 */
export const findRelevantDocs = (query, documents, threshold = 0.3) => {
  if (!Array.isArray(documents)) {
    return [];
  }

  // Search both title and content
  return documents
    .map((doc) => {
      const titleSimilarity = calculateSimilarity(query, doc.title || "");
      const contentSimilarity = calculateSimilarity(query, doc.content || "");

      // Weight title matches higher
      const avgSimilarity = titleSimilarity * 0.6 + contentSimilarity * 0.4;

      return {
        ...doc,
        similarity: avgSimilarity,
      };
    })
    .filter((doc) => doc.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Return top 5 most relevant docs
};

/**
 * Score relevance based on keyword matches
 * @param {string} query - User query
 * @param {string} text - Text to score
 * @returns {number} - Relevance score
 */
export const scoreRelevance = (query, text) => {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();

  let matchCount = 0;
  queryWords.forEach((word) => {
    if (textLower.includes(word)) {
      matchCount++;
    }
  });

  return matchCount / queryWords.length;
};

export default {
  calculateSimilarity,
  findRelevantDocs,
  scoreRelevance,
};
