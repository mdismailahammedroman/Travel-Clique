/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { IOptions } from "../../helpers/paginationHelper";
import { prisma } from "../../utils/prisma";

const createTravelPlan = async (userId: string, payload: any) => {
  if (!payload.destination) {
    throw new AppError(400, "Destination is required");
  }
  if (!payload.startDate || !payload.endDate) {
    throw new AppError(400, "Start date and end date are required");
  }
  const createPlan = await prisma.travelPlan.create({
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
  return createPlan;
};

const getPublicPlans = async (options: IOptions, filters: any) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { visibility: true };

  // Filtering by start/end date
  if (filters.startDateTime) where.startDate = { gte: new Date(filters.startDateTime) };
  if (filters.endDateTime) where.endDate = { ...where.endDate, lte: new Date(filters.endDateTime) };

  // Count total matching plans
  const total = await prisma.travelPlan.count({ where });

  const plans = await prisma.travelPlan.findMany({
    where,
    include: {
      user: {
        include: { profile: true },
      },
    },
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: (options.sortOrder as "asc" | "desc") || "desc" }
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



const getPlanById = async (id:string) => {
 const plan = await prisma.travelPlan.findUnique({
      where: { id },
      include: {
        user: {
          include: { profile: true },
        },
        group: true,
      },
    });

    if (!plan) throw new AppError(404, "Travel plan not found");

    return plan;
  };

export const travelPlanService = {
  createTravelPlan,
  getPublicPlans,
  getPlanById,
};
