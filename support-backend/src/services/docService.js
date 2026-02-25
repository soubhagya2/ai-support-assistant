// Documentation Service - Load and manage documentation

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsPath = path.join(__dirname, "../docs/docs.json");

let cachedDocs = null;

/**
 * Load documentation from docs.json
 */
export const getDocumentation = () => {
  if (cachedDocs) {
    return cachedDocs;
  }

  try {
    const docsContent = fs.readFileSync(docsPath, "utf-8");
    const docsData = JSON.parse(docsContent);

    // Support both formats
    cachedDocs = docsData.documentation || docsData;

    if (!Array.isArray(cachedDocs)) {
      throw new Error("Documentation must be an array");
    }

    return cachedDocs;
  } catch (error) {
    console.error("Error loading documentation:", error);
    // Return empty array if docs can't be loaded
    return [];
  }
};

/**
 * Reload documentation (useful for hot reloading)
 */
export const reloadDocumentation = () => {
  cachedDocs = null;
  return getDocumentation();
};

export default {
  getDocumentation,
  reloadDocumentation,
};
