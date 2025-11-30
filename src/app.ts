// src/app.ts
import express, { Application } from "express";
import { envVars } from "./app/config/envVars";
import cookieParser from "cookie-parser";
import cors from "cors"
const app: Application = express();

import dotenv from "dotenv";
import { golobalErrorHandler } from "./app/middleware/golobalErrorHandler";
import router from "./router";
dotenv.config();






// 🧩 Middleware
app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: envVars.FONT_END_URL || "*", 
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.send("✅ Doctor Appointment API is running!");
});
//   routers
app.use("/api/v1", router);

//golobal error handler
app.use(golobalErrorHandler)
 

export default app;
