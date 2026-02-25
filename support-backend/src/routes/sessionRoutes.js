import express from "express";
import {
  createSession,
  getSessions,
  getSession,
  deleteSession,
  clearSession,
} from "../controllers/sessionController.js";

const router = express.Router();

// POST /api/sessions - Create a new session
router.post("/", createSession);

// GET /api/sessions - Get all sessions
router.get("/", getSessions);

// GET /api/sessions/:sessionId - Get a specific session
router.get("/:sessionId", getSession);

// POST /api/sessions/:sessionId/clear - Clear messages in session
router.post("/:sessionId/clear", clearSession);

// DELETE /api/sessions/:sessionId - Delete a session
router.delete("/:sessionId", deleteSession);

export default router;
