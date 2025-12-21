import { z } from "zod";

export const createTravelPlanSchema = z.object({
  body: z.object({
    destination: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    travelType: z.enum(["SOLO", "FAMILY", "FRIENDS"]),
    description: z.string().optional(),
    visibility: z.boolean().optional(),
  }),
});

export const updateTravelPlanSchema = z.object({
  body: z.object({
    destination: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    travelType: z.enum(["SOLO", "FAMILY", "FRIENDS"]).optional(),
    description: z.string().optional(),
    visibility: z.boolean().optional(),
  }),
});
