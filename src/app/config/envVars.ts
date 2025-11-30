import dotenv from "dotenv";
dotenv.config(); // load .env first

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  FONT_END_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_ID: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "FRONT_END_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_ID",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: Number(process.env.PORT!),
    FONT_END_URL: process.env.FONT_END_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_ID: process.env.JWT_EXPIRES_ID!,
  };
};

export const envVars = loadEnvVariables();
