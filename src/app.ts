import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { envVars } from "./app/config/envVars";
import router from "./app/router";
// ⚠️ Adjust path if needed
import { subscriptionController } from "./app/module/Subscription/subscription.controller"; 

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
app.use(
  cors({
    origin: envVars.FRONT_END_URL || "*",
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.send("API Working...");
});

/**
 * ✅ API ROUTES
 */
app.use("/api/v1", router);

export default app;