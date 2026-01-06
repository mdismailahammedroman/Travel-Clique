import { Role } from "@prisma/client";
import { z } from "zod";

// CREATE USER
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
  profileImage: z.string().url().optional(),
  role: z.nativeEnum(Role).optional(),
});

// UPDATE USER
export const updateUserSchema = z.object({
  name: z.string().optional(),
  fullName: z.string().optional(),
  bio: z.string().optional(),
  currentLocation: z.string().optional(),
  profileImage: z.string().url().optional(),
  role: z.nativeEnum(Role).optional(),
});
