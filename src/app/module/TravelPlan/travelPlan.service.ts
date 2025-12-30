/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { isFutureDate, isValidDateRange } from "../../utils/DateUtils";
import { prisma } from "../../utils/prisma";
import { CreateTravelPlanInput } from "./travelPlan.interface";

/**
 * CREATE TRAVEL PLAN (requires active subscription)
 */
const createTravelPlan = async (
  data: CreateTravelPlanInput,
  userId: string
) => {
  if (!isFutureDate(data.startDate)) {
    throw new AppError(400, "Start date must be in the future");
  }

  if (!isValidDateRange(data.startDate, data.endDate)) {
    throw new AppError(400, "End date must be after start date");
  }

  // Validate budget
  if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
    throw new AppError(400, "Minimum budget cannot exceed maximum budget");
  }

  // Create travel plan
  const travelPlan = await prisma.travelPlan.create({
    data: {
      userId,
      destination: data.destination,
      country: data.country ?? null,
      city: data.city ?? null,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      travelType: data.travelType,
      description: data.description ?? null,
      itinerary: data.itinerary ?? null,
      interests: data.interests ?? [],
    },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          profile: {
            select: {
              fullName: true,
              profileImage: true,
            },
          },
          subscriptions: {
            select: {
              verifiedBadge: true,
            },
          },
        },
      },
    },
  });

  return travelPlan;
};
/**
 * GET PUBLIC PLANS
 */
// ----------------------------- JOIN -----------------------------

// ----------------------------- LEAVE -----------------------------

/**
 * JOIN PLAN (subscription protected)
 */

// ----------------------------- DELETE -----------------------------

export const travelPlanService = {
  createTravelPlan,
};
