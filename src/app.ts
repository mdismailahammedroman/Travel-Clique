import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./app/router";
// ⚠️ Adjust path if needed
import { subscriptionController } from "./app/module/Subscription/subscription.controller";
import { globalErrorHandler } from "./app/middleware/golobalErrorHandler";

const app: Application = express();

/**
 * ✅ STRIPE WEBHOOK - MUST BE FIRST
 * Uses express.raw() to get the necessary raw body (Buffer) for signature verification.
 */
app.post(
  "/api/v1/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.stripeWebhook
);

/**
 * ✅ Normal middlewares AFTER webhook
 */
app.use(express.json()); // Global JSON parser is now safe
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.send("API Working...");
});
app.use(globalErrorHandler);
/**
 * ✅ API ROUTES
 */
app.use("/api/v1", router);

export default app;
