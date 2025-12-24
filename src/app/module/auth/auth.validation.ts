import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
});
