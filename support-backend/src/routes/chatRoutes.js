import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat - Send a message
router.post("/", sendMessage);

// GET /api/chat/:sessionId - Get all messages for a session
router.get("/:sessionId", getMessages);

export default router;
