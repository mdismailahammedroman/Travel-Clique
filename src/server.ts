// src/index.ts
import { Server } from "node:http";

import dotenv from "dotenv";
import { envVars } from "./app/config/envVars";
import app from "./app";
import seedSuperAdmin from "./app/utils/seedSuperAdmin";

dotenv.config();

// Declare server variable for graceful shutdown
let server: Server;

// Port setup
const PORT = envVars.PORT;

/**
 * Start the server (and optionally connect to DB here)
 */
async function startServer() {
  try {
    // 🗄️ Example: connect to Prisma or MongoDB here
    // await prisma.$connect();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting the server:", err);
  }
}

// Run the server
(async () => {
  await startServer();
  await seedSuperAdmin();
})();

/* ---------------------------------------------------
   🔥 GLOBAL ERROR & SHUTDOWN HANDLERS
--------------------------------------------------- */

// 🧠 Handle uncaught synchronous exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception! Server shutting down.", err);
  shutdown(1);
});

// ⚡ Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("⚠️ Unhandled Rejection! Server shutting down.", error);
  shutdown(1);
});

// 🧹 Handle system termination signal (e.g., Docker, Kubernetes)
process.on("SIGTERM", (signal) => {
  console.log("🧩 SIGTERM received. Shutting down gracefully.", signal);
  shutdown(0);
});

// 🧹 Handle Ctrl+C (manual stop)
process.on("SIGINT", (signal) => {
  console.log("🧩 SIGINT received (Ctrl+C). Shutting down.", signal);
  shutdown(0);
});

// 🔒 Centralized shutdown handler
function shutdown(exitCode: number) {
  if (server) {
    server.close(() => {
      console.log("✅ Server closed.");
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
}
