import express, { Application } from "express";
import { envVars } from "./app/config/envVars";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import router from "./app/router";
import { golobalErrorHandler } from "./app/middleware/golobalErrorHandler";
import { bodyTrimmer } from "./app/middleware/bodyTrimmer";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyTrimmer);
app.use(cookieParser());
app.use(
  cors({
    origin: envVars.FONT_END_URL || "*",
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.send("✅ Doctor Appointment API is running!");
});

// routes
app.use("/api/v1", router);

// global error handler
app.use(golobalErrorHandler);

export default app;
