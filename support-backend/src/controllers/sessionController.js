// Session Controller - Manage chat sessions

import { getDatabase } from "../config/db.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

/**
 * POST /api/sessions - Create a new session
 */
export const createSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  // If sessionId is provided, use it; otherwise validate it's UUID-like
  if (sessionId && (typeof sessionId !== "string" || !sessionId.trim())) {
    throw new AppError("sessionId must be a non-empty string", 400);
  }

  const db = getDatabase();
  const finalSessionId = sessionId || generateSessionId();

  // Check if session already exists
  const existingSession = await db.get("SELECT id FROM sessions WHERE id = ?", [
    finalSessionId,
  ]);

  if (existingSession) {
    return res.status(200).json({
      success: true,
      sessionId: finalSessionId,
      message: "Session already exists",
    });
  }

  // Create new session
  await db.run(
    "INSERT INTO sessions (id, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))",
    [finalSessionId],
  );

  res.status(201).json({
    success: true,
    sessionId: finalSessionId,
    created_at: new Date().toISOString(),
  });
});

/**
 * GET /api/sessions - Get all sessions ordered by recent first
 */
export const getSessions = asyncHandler(async (req, res) => {
  const db = getDatabase();

  const sessions = await db.all(
    `SELECT id, created_at, updated_at,
            (SELECT COUNT(*) FROM messages WHERE session_id = sessions.id) as messageCount
     FROM sessions
     ORDER BY updated_at DESC`,
  );

  res.status(200).json({
    success: true,
    sessions,
    total: sessions.length,
  });
});

/**
 * GET /api/sessions/:sessionId - Get a specific session
 */
export const getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    throw new AppError("Invalid sessionId", 400);
  }

  const db = getDatabase();

  const session = await db.get(
    `SELECT id, created_at, updated_at,
            (SELECT COUNT(*) FROM messages WHERE session_id = sessions.id) as messageCount
     FROM sessions
     WHERE id = ?`,
    [sessionId],
  );

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  res.status(200).json({
    success: true,
    session,
  });
});

/**
 * DELETE /api/sessions/:sessionId - Delete a session and its messages
 */
export const deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    throw new AppError("Invalid sessionId", 400);
  }

  const db = getDatabase();

  // Check if session exists
  const session = await db.get("SELECT id FROM sessions WHERE id = ?", [
    sessionId,
  ]);
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  // Delete session (messages cascade delete due to foreign key)
  await db.run("DELETE FROM sessions WHERE id = ?", [sessionId]);

  res.status(200).json({
    success: true,
    message: "Session deleted successfully",
    deletedSessionId: sessionId,
  });
});

/**
 * POST /api/sessions/:sessionId/clear - Clear messages in a session but keep the session
 */
export const clearSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    throw new AppError("Invalid sessionId", 400);
  }

  const db = getDatabase();

  // Check if session exists
  const session = await db.get("SELECT id FROM sessions WHERE id = ?", [
    sessionId,
  ]);
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  // Clear messages but keep session
  await db.run("DELETE FROM messages WHERE session_id = ?", [sessionId]);

  // Update session's updated_at
  await db.run(
    "UPDATE sessions SET updated_at = datetime('now') WHERE id = ?",
    [sessionId],
  );

  res.status(200).json({
    success: true,
    message: "Session messages cleared successfully",
    sessionId,
  });
});

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
  // Use timestamp + random string for session ID
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  createSession,
  getSessions,
  getSession,
  deleteSession,
  clearSession,
};
