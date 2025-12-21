/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { IOptions } from "../../helpers/paginationHelper";
import { prisma } from "../../utils/prisma";
import { ITravelPlanFilters } from "./travelPlan.interface";
import { IJWTPayload } from "../../helpers/payload";
import { subscriptionService } from "../Subscription/subscription.service";

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
  if (!payload.startDate || !payload.endDate) throw new AppError(400, "Start date and end date are required");

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

    const group = await tx.group.create({
      data: {
        name: `Trip to ${plan.destination}`,
        description: plan.description,
        destination: plan.destination,
        createdBy: userId,
        members: { create: [{ userId, role: "OWNER" }] },
      },
    });

    return { plan, group };
  });

  return { plan, group };
};

/**
 * GET PUBLIC PLANS
 */
const getPublicPlans = async (options: IOptions, filters: ITravelPlanFilters) => {
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
    orderBy: options.sortBy ? { [options.sortBy]: options.sortOrder || "desc" } : { createdAt: "desc" },
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

const getMyPlans = async (jwt: IJWTPayload, options: IOptions, filters: any) => {
  const userId = jwt.id;

  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (filters.startDateTime) where.startDate = { gte: new Date(filters.startDateTime) };
  if (filters.endDateTime) where.endDate = { ...where.endDate, lte: new Date(filters.endDateTime) };

  const total = await prisma.travelPlan.count({ where });

  const data = await prisma.travelPlan.findMany({
    where,
    include: { user: { include: { profile: true } } },
    skip,
    take: limit,
    orderBy: options.sortBy ? { [options.sortBy]: options.sortOrder || "desc" } : { createdAt: "desc" },
  });

  return { data: plans, meta: { total, page, limit, totalPage: Math.ceil(total / limit) } };
};

// ----------------------------- JOIN -----------------------------
const joinPlan = async (userId: string, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    include: { group: true },
  });
  if (!plan) throw new AppError(404, "Plan not found");

  if (plan.group) {
    const exists = await prisma.groupMember.findFirst({ where: { groupId: plan.group.id, userId } });
    if (!exists) {
      await prisma.groupMember.create({ data: { groupId: plan.group.id, userId } });
    }
  }
if (!plan.group) {
  throw new AppError(400, "This plan is not associated with any group yet");
}

  return plan;
};

// ----------------------------- LEAVE -----------------------------
const leavePlan = async (userId: string, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    include: { group: true },
  });
  if (!plan) throw new AppError(404, "Plan not found");

  if (plan.group) {
    await prisma.groupMember.updateMany({ where: { groupId: plan.group.id, userId }, data: { isActive: false } });
  }

  return { message: "Left travel plan successfully" };
};

/**
 * JOIN PLAN (subscription protected)
 */
const joinPlan = async (userId: string, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError(404, "Travel plan not found");

  if (plan.userId !== userId) throw new AppError(403, "You are not allowed to update this travel plan");

  const updatedPlan = await prisma.travelPlan.update({
    where: { id: planId },
    data: {
      destination: payload.destination ?? plan.destination,
      startDate: payload.startDate ? new Date(payload.startDate) : plan.startDate,
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
const deletePlan = async (userId: string, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    include: { group: true },
  });
  if (!plan) throw new AppError(404, "Travel plan not found");

  if (plan.userId !== userId) throw new AppError(403, "You are not allowed to delete this travel plan");

  if (plan.group) {
    await prisma.groupMember.deleteMany({ where: { groupId: plan.group.id } });
    await prisma.travelGroup.delete({ where: { id: plan.group.id } });
  }

  await prisma.travelPlan.delete({ where: { id: planId } });

  return { message: "Travel plan deleted successfully" };
};

export const travelPlanService = {
  createTravelPlan,
  getPublicPlans,
  getPlanById,
  getMyPlans,
  updatePlan,
  deletePlan,
};
