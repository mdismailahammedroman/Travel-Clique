/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { IOptions } from "../../helpers/paginationHelper";
import { IJWTPayload } from "../../helpers/payload";
import { prisma } from "../../utils/prisma";

// ----------------------------- CREATE -----------------------------
const createTravelPlan = async (userId: string, payload: any) => {
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

  return plan;
};

// ----------------------------- READ -----------------------------
const getPublicPlans = async (options: IOptions, filters: any) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { visibility: true };

  if (filters.destination) {
    where.destination = { contains: filters.destination, mode: "insensitive" };
  }

  if (filters.travelType) {
    where.travelType = filters.travelType;
  }

  if (filters.startDate) {
    where.startDate = { gte: new Date(filters.startDate) };
  }

  if (filters.endDate) {
    where.endDate = { lte: new Date(filters.endDate) };
  }

  const total = await prisma.travelPlan.count({ where });

  const plans = await prisma.travelPlan.findMany({
    where,
    include: { user: { include: { profile: true } } },
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: options.sortOrder || "desc" }
      : { createdAt: "desc" },
  });

  return {
    data: plans,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getPlanById = async (id: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id },
    include: { user: { include: { profile: true } } },
  });
  if (!plan) throw new AppError(404, "Travel plan not found");
  return plan;
};

const getMyPlans = async (
  jwt: IJWTPayload,
  options: IOptions,
  filters: any
) => {
  const userId = jwt.id;
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (filters.startDateTime)
    where.startDate = { gte: new Date(filters.startDateTime) };
  if (filters.endDateTime)
    where.endDate = { ...where.endDate, lte: new Date(filters.endDateTime) };

  const total = await prisma.travelPlan.count({ where });

  const plans = await prisma.travelPlan.findMany({
    where,
    include: { user: { include: { profile: true } } },
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: options.sortOrder || "desc" }
      : { createdAt: "desc" },
  });

  return {
    data: plans,
    meta: { total, page, limit, totalPage: Math.ceil(total / limit) },
  };
};

// ----------------------------- JOIN -----------------------------

// ----------------------------- UPDATE -----------------------------
const updatePlan = async (userId: string, planId: string, payload: any) => {
  const plan = await prisma.travelPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError(404, "Travel plan not found");

  if (plan.userId !== userId)
    throw new AppError(403, "You are not allowed to update this travel plan");

  const updatedPlan = await prisma.travelPlan.update({
    where: { id: planId },
    data: {
      destination: payload.destination ?? plan.destination,
      startDate: payload.startDate
        ? new Date(payload.startDate)
        : plan.startDate,
      endDate: payload.endDate ? new Date(payload.endDate) : plan.endDate,
      budgetMin: payload.budgetMin ?? plan.budgetMin,
      budgetMax: payload.budgetMax ?? plan.budgetMax,
      travelType: payload.travelType ?? plan.travelType,
      description: payload.description ?? plan.description,
      visibility: payload.visibility ?? plan.visibility,
    },
  });

  return updatedPlan;
};

// ----------------------------- DELETE -----------------------------

export const travelPlanService = {
  createTravelPlan,
  getPublicPlans,
  getPlanById,
  getMyPlans,
  updatePlan,
};
