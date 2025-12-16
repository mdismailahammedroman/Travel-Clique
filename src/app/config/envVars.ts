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

interface SmtpConfig {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMPT_USER: string;
  SMTP_PASSWORD: string;
  SMTP_FROM_EMAIL: string;
}

interface RedisConfig {
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_USERNAME: string;
  REDIS_PASSWORD: string;
}
interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  FRONT_END_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  SALT_ROUNDS?: string;
  CLOUDINARY: cloudinaryConfig;
  SUPER_ADMIN?: superAdminConfig;
  SMTP_CONFIG: SmtpConfig;
  REDIS: RedisConfig;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  price_monthly:string,
price_yearly:string,
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "FRONT_END_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",
    "JWT_REFRESH_SECRET",
    "SALT_ROUNDS",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "SUPER_ADMIN_PROFILE_IMAGE",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMPT_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL",
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "price_monthly",
"price_yearly",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: Number(process.env.PORT as string),
    FRONT_END_URL: process.env.FRONT_END_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
    SALT_ROUNDS: process.env.SALT_ROUNDS as string,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    SUPER_ADMIN: {
      SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
      SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
      SUPER_ADMIN_PROFILE_IMAGE: process.env
        .SUPER_ADMIN_PROFILE_IMAGE as string,
    },
    SMTP_CONFIG: {
      SMTP_HOST: process.env.SMTP_HOST as string,
      SMTP_PORT: process.env.SMTP_PORT as string,
      SMPT_USER: process.env.SMPT_USER as string,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL as string,
    },
    REDIS: {
      REDIS_HOST: process.env.REDIS_HOST as string,
      REDIS_PORT: process.env.REDIS_PORT as string,
      REDIS_USERNAME: process.env.REDIS_USERNAME as string,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
    },
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
    price_monthly:process.env.price_monthly as string,
price_yearly:process.env.price_yearly as string,
  };
};

export const envVars = loadEnvVariables();
