// Chat Controller

import { getDatabase } from "../config/db.js";
import { callLLM } from "../services/llmService.js";
import { buildPrompt } from "../services/promptBuilder.js";
import { findRelevantDocs } from "../services/similarity.js";
import { getDocumentation } from "../services/docService.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

/**
 * POST /api/chat/send - Send a message and get AI response
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;

  // Validate input
  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    throw new AppError(
      "sessionId is required and must be a non-empty string",
      400,
    );
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    throw new AppError(
      "message is required and must be a non-empty string",
      400,
    );
  }

  const db = getDatabase();

  // 1. Check if session exists, if not create it
  const session = await db.get("SELECT * FROM sessions WHERE id = ?", [
    sessionId,
  ]);
  if (!session) {
    await db.run(
      "INSERT INTO sessions (id, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))",
      [sessionId],
    );
  } else {
    // Update the session's updated_at timestamp
    await db.run(
      "UPDATE sessions SET updated_at = datetime('now') WHERE id = ?",
      [sessionId],
    );
  }

  // 2. Store user message
  await db.run(
    "INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, datetime('now'))",
    [sessionId, "user", message.trim()],
  );

  // 3. Fetch last 3 message pairs (up to 6 messages) for context - reduced from 10
  const contextMessages = await db.all(
    `SELECT role, content FROM messages 
     WHERE session_id = ? 
     ORDER BY created_at DESC LIMIT 6`,
    [sessionId],
  );

  // Reverse to get chronological order
  contextMessages.reverse();

  // Format context messages
  let contextStr = "";
  if (contextMessages.length > 0) {
    contextStr = "Previous conversation:\n";
    contextMessages.forEach((msg) => {
      contextStr += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    });
  }

  // 4. Get relevant documentation
  const docs = getDocumentation();
  const relevantDocs = findRelevantDocs(message, docs, 0.5); // Higher threshold = fewer, more relevant docs

  // Format documentation for the prompt
  const docStr =
    relevantDocs.length > 0
      ? relevantDocs.map((doc) => `${doc.title}: ${doc.content}`).join("\n\n")
      : "No specific documentation found for this query.";

  // 5. Build prompt with context and docs
  const prompt = buildPrompt(message, docStr, contextStr);

  // 6. Call LLM
  let aiResponse;
  let tokensUsed = 0;

  try {
    const llmResult = await callLLM(prompt);
    aiResponse = llmResult.reply;
    tokensUsed = llmResult.tokensUsed || 0;

    // Check if LLM couldn't find relevant information
    if (
      !aiResponse ||
      aiResponse.toLowerCase().includes("i don't have information") ||
      aiResponse.toLowerCase().includes("i don't have enough information")
    ) {
      aiResponse = "Sorry, I don't have information about that.";
    }
  } catch (llmError) {
    console.error("LLM Error:", llmError);
    throw new AppError(
      `Failed to get response from AI: ${llmError.message}`,
      503,
    );
  }

  // 7. Store assistant message
  await db.run(
    "INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, datetime('now'))",
    [sessionId, "assistant", aiResponse],
  );

  // 8. Return response
  res.status(200).json({
    success: true,
    reply: aiResponse,
    tokensUsed,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/chat/:sessionId - Get all messages for a session
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  // Validate input
  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    throw new AppError("Invalid sessionId", 400);
  }

  const db = getDatabase();

  // Check if session exists
  const session = await db.get("SELECT * FROM sessions WHERE id = ?", [
    sessionId,
  ]);
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  // Get messages for the session in chronological order
  const messages = await db.all(
    `SELECT id, session_id, role, content, created_at 
     FROM messages 
     WHERE session_id = ? 
     ORDER BY created_at ASC`,
    [sessionId],
  );

  res.status(200).json({
    success: true,
    sessionId,
    messages,
    total: messages.length,
  });
});
