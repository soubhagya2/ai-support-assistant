import dotenv from "dotenv";
import app from "./app.js";
import { closeDatabase } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await closeDatabase();
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  server.close(async () => {
    await closeDatabase();
    console.log("✅ Server closed");
    process.exit(0);
  });
});

export default server;
