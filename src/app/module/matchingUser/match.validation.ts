import { z } from "zod";
import { MatchStatus } from "@prisma/client";

export const sendMatchRequestSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
    travelPlanId: z.string().min(1, "Travel plan ID is required"),
  }),
});

export const respondToMatchSchema = z.object({
  body: z.object({
    status: z
      .nativeEnum(MatchStatus)
      .refine(
        (val) => val === MatchStatus.ACCEPTED || val === MatchStatus.DECLINED,
        {
          message: "Status must be ACCEPTED or DECLINED",
        }
      ),
  }),
  params: z.object({
    id: z.string().min(1, "Match ID is required"),
  }),
});
