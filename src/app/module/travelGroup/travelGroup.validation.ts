import { z } from "zod";
import { GroupRole } from "@prisma/client";

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100),
    description: z.string().max(500).optional(),
    destination: z.string().min(2, "Destination is required"),
    coverImage: z.string().url().optional(),
    maxMembers: z.number().int().min(2).max(100).optional(),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
    destination: z.string().min(2).optional(),
    coverImage: z.string().url().optional(),
    maxMembers: z.number().int().min(2).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z
      .nativeEnum(GroupRole)
      .refine(
        (val) => val === GroupRole.MEMBER || val === GroupRole.MODERATOR,
        { message: "Role must be MEMBER or MODERATOR" }
      ),
  }),
});

export const transferOwnershipSchema = z.object({
  body: z.object({
    newOwnerId: z.string().min(1, "New owner ID is required"),
  }),
});
