import dotenv from "dotenv";
dotenv.config(); // Load env variables first

import { Server } from "node:http";
import { envVars } from "./app/config/envVars";
import app from "./app";
import seedSuperAdmin from "./app/utils/seedSuperAdmin";

let server: Server;
const PORT = envVars.PORT;

async function startServer() {
  try {
    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting the server:", err);
  }
}

(async () => {
  await seedSuperAdmin(); // Ensure super admin exists first
  await startServer();
})();

// ---------------- Global Error & Shutdown Handlers ----------------

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception! Server shutting down.", err);
  shutdown(1);
});

process.on("unhandledRejection", (error) => {
  console.error("⚠️ Unhandled Rejection! Server shutting down.", error);
  shutdown(1);
});

process.on("SIGTERM", (signal) => {
  console.log("🧩 SIGTERM received. Shutting down gracefully.", signal);
  shutdown(0);
});

process.on("SIGINT", (signal) => {
  console.log("🧩 SIGINT received (Ctrl+C). Shutting down.", signal);
  shutdown(0);
});

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
