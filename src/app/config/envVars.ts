import dotenv from "dotenv";
dotenv.config(); // load .env first

interface cloudinaryConfig {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

interface superAdminConfig {
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  SUPER_ADMIN_PROFILE_IMAGE: string;
}
interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  FONT_END_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_ID: string;
  JWT_REFRESH_SECRET: string;
  SALT_ROUNDS?: string;
  CLOUDINARY: cloudinaryConfig;
  SUPER_ADMIN?: superAdminConfig;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "FRONT_END_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_ID",
    "JWT_REFRESH_SECRET",
    "SALT_ROUNDS",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "SUPER_ADMIN_PROFILE_IMAGE",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: Number(process.env.PORT as string),
    FONT_END_URL: process.env.FRONT_END_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_ID: process.env.JWT_EXPIRES_ID as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    SALT_ROUNDS: process.env.SALT_ROUNDS as string,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    }, 
    SUPER_ADMIN:{
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
         SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
         SUPER_ADMIN_PROFILE_IMAGE: process.env.SUPER_ADMIN_PROFILE_IMAGE as string,
         }
  };
};

export const envVars = loadEnvVariables();
