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
  if (!payload.startDate || !payload.endDate)
    throw new AppError(400, "Start and end date are required");
  // 2️⃣ Create plan + group atomically
  const { plan, group } = await prisma.$transaction(async (tx) => {
    const plan = await tx.travelPlan.create({
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
    orderBy: { createdAt: "desc" },
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

/**
 * GET MY PLANS
 */
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

  if (filters.startDate) where.startDate = { gte: new Date(filters.startDate) };
  if (filters.endDate) where.endDate = { lte: new Date(filters.endDate) };

  const total = await prisma.travelPlan.count({ where });

  const data = await prisma.travelPlan.findMany({
    where,
    include: { user: { include: { profile: true } } },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

/**
 * UPDATE PLAN
 */
const updatePlan = async (userId: string, planId: string, payload: any) => {
  const plan = await prisma.travelPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError(404, "Plan not found");

  if (plan.userId !== userId)
    throw new AppError(403, "You are not allowed to update this plan");

  return prisma.travelPlan.update({
    where: { id: planId },
    data: payload,
  });
};

/**
 * DELETE PLAN
 */
const deletePlan = async (userId: string, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError(404, "Plan not found");

  if (plan.userId !== userId)
    throw new AppError(403, "You cannot delete this plan");

  await prisma.travelPlan.delete({ where: { id: planId } });

  return { message: "Deleted successfully" };
};

/**
 * JOIN PLAN (subscription protected)
 */
const joinPlan = async (userId: string, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError(404, "Travel plan not found");

  // 2️⃣ Check active subscription
  const subscription = await subscriptionService.checkActiveSubscription(userId);

  if (!subscription) {
    // No active subscription → create Stripe checkout session
    const session = await subscriptionService.createCheckoutSession({
      subscriptionType: "MONTHLY",
      userId,
    });

    return {
      requiresSubscription: true,
      message: "You need an active subscription to join this travel plan group",
      checkoutUrl: session.url,
    };
  }

  // 3️⃣ Find existing group or create a new one
  let group = await prisma.group.findFirst({
    where: { name: `Plan-${planId}` },
    include: { members: true },
  });

  if (!group) {
    group = await prisma.group.create({
      data: {
        name: `Plan-${plan.id}`,
        description: plan.description,
        destination: plan.destination,
        createdBy: plan.userId,
        members: { create: [{ userId: plan.userId, role: "OWNER" }] },
      },
      include: { members: true },
    });
  }

  // 4️⃣ Check if user already joined
  const alreadyJoined = group.members.some((m) => m.userId === userId);
  if (alreadyJoined) throw new AppError(400, "You already joined this travel plan");

  // 5️⃣ Add user to group
  await prisma.groupMember.create({
    data: { groupId: group.id, userId, role: "MEMBER" },
  });

  // 6️⃣ Return updated group
  const updatedGroup = await prisma.group.findUnique({
    where: { id: group.id },
    include: { members: { include: { user: true } } },
  });

  return {
    requiresSubscription: false,
    message: "Successfully joined the travel group",
    group: updatedGroup,
  };
};

// REMOVE MEMBER
const removeGroupMember = async (groupId: string, userId: string) => {
  const member = await prisma.groupMember.findFirst({ where: { groupId, userId } });
  if (!member) throw new AppError(404, "Member not found in this group");

  return prisma.groupMember.delete({ where: { id: member.id } });
};

export const travelPlanService = {
  createTravelPlan,
  getPublicPlans,
  getPlanById,
  getMyPlans,
  updatePlan,
  deletePlan,
  joinPlan,
  removeGroupMember,
};
