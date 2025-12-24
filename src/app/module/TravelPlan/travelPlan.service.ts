/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { IOptions } from "../../helpers/paginationHelper";
import { prisma } from "../../utils/prisma";
import { ITravelPlanFilters } from "./travelPlan.interface";

// RESULT TYPES
type TravelPlanResult =
  | { plan: any; group: any }
  | { message: string; checkoutUrl: string };

/**
 * CREATE TRAVEL PLAN (requires active subscription)
 */
const createTravelPlan = async (
  userId: string,
  payload: any
): Promise<TravelPlanResult> => {
  if (!payload.destination) throw new AppError(400, "Destination is required");
  if (!payload.startDate || !payload.endDate)
    throw new AppError(400, "Start date and end date are required");

  const plan = await prisma.travelPlan.create({
    data: {
      userId,
      destination: payload.destination,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      travelType: payload.travelType,
      description: payload.description,
      visibility: payload.visibility ?? true,
    },
  });

  return { plan, group: null };
};

/**
 * GET PUBLIC PLANS
 */
const getPublicPlans = async (
  options: IOptions,
  filters: ITravelPlanFilters
) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { visibility: true };

  if (filters.destination)
    where.destination = { contains: filters.destination, mode: "insensitive" };

  if (filters.travelType) where.travelType = filters.travelType;

  if (filters.startDate) where.startDate = { gte: new Date(filters.startDate) };
  if (filters.endDate) where.endDate = { lte: new Date(filters.endDate) };

  const total = await prisma.travelPlan.count({ where });

  const data = await prisma.travelPlan.findMany({
    where,
    include: { user: { include: { profile: true } } },
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: options.sortOrder || "desc" }
      : { createdAt: "desc" },
  });

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * GET SINGLE PLAN
 */
const getPlanById = async (id: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id },
    include: { user: { include: { profile: true } } },
  });

  if (!plan) throw new AppError(404, "Travel plan not found");

  return plan;
};

// ----------------------------- JOIN -----------------------------

// ----------------------------- LEAVE -----------------------------

/**
 * JOIN PLAN (subscription protected)
 */

// ----------------------------- DELETE -----------------------------

export const travelPlanService = {
  createTravelPlan,
  getPublicPlans,
  getPlanById,
};
