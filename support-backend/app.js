import express from "express";
import cors from "cors";
import rateLimiter from "./src/middleware/rateLimiter.js";
import errorHandler from "./src/middleware/errorHandler.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import sessionRoutes from "./src/routes/sessionRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      message: "Endpoint not found",
      path: req.url,
      method: req.method,
    },
  });
});

// Error handling
app.use(errorHandler);

export default app;
