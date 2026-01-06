/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errorHelpers/AppError";
import { isFutureDate, isValidDateRange } from "../../utils/DateUtils";
import { prisma } from "../../utils/prisma";
import {
  CreateTravelPlanInput,
  PaginationOptions,
  SearchTravelPlanFilters,
  UpdateTravelPlanInput,
} from "./travelPlan.interface";

/**
 * CREATE TRAVEL PLAN
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

  if (
    data.budgetMin !== undefined &&
    data.budgetMax !== undefined &&
    data.budgetMin > data.budgetMax
  ) {
    throw new AppError(400, "Minimum budget cannot exceed maximum budget");
  }

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
 * GET TRAVEL PLAN BY ID
 */
const getTravelPlanById = async (
  id: string,
  options?: { incrementView?: boolean }
) => {
  const travelPlan = await prisma.travelPlan.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          profile: {
            select: {
              fullName: true,
              profileImage: true,
              bio: true,
              currentLocation: true,
              travelInterests: {
                select: { interest: true },
              },
              visitedCountries: {
                select: { country: true },
              },
            },
          },
          subscriptions: {
            where: { isActive: true },
            select: { verifiedBadge: true },
          },
        },
      },
      matches: {
        select: {
          id: true,
          status: true,
          sender: {
            select: {
              id: true,
              name: true,
              profile: {
                select: { fullName: true, profileImage: true },
              },
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              profile: {
                select: { fullName: true, profileImage: true },
              },
            },
          },
        },
      },
    },
  });

  if (!travelPlan) {
    throw new AppError(404, "Travel plan not found");
  }

  if (options?.incrementView) {
    await prisma.travelPlan.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return travelPlan;
};

/**
 * UPDATE TRAVEL PLAN
 */
const updateTravelPlan = async (
  planId: string,
  userId: string,
  data: UpdateTravelPlanInput
) => {
  const existingPlan = await prisma.travelPlan.findUnique({
    where: { id: planId },
  });

  if (!existingPlan) {
    throw new AppError(404, "Travel plan not found");
  }

  if (existingPlan.userId !== userId) {
    throw new AppError(403, "Not authorized to update this travel plan");
  }

  if (data.startDate || data.endDate) {
    const startDate = data.startDate ?? existingPlan.startDate;
    const endDate = data.endDate ?? existingPlan.endDate;

    if (!isValidDateRange(startDate, endDate)) {
      throw new AppError(400, "End date must be after start date");
    }
  }

  if (data.budgetMin !== undefined || data.budgetMax !== undefined) {
    const min = data.budgetMin ?? existingPlan.budgetMin ?? 0;
    const max = data.budgetMax ?? existingPlan.budgetMax ?? Infinity;

    if (min > max) {
      throw new AppError(400, "Minimum budget cannot exceed maximum budget");
    }
  }

  const updatedPlan = await prisma.travelPlan.update({
    where: { id: planId },
    data,
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
            select: { verifiedBadge: true },
          },
        },
      },
    },
  });

  return updatedPlan;
};

/**
 * DELETE TRAVEL PLAN
 */
const deleteTravelPlan = async (id: string, userId: string) => {
  const travelPlan = await prisma.travelPlan.findUnique({ where: { id } });

  if (!travelPlan) throw new AppError(404, "Travel plan not found");
  if (travelPlan.userId !== userId)
    throw new AppError(403, "Not authorized to delete this travel plan");

  await prisma.travelPlan.delete({ where: { id } });

  return { message: "Travel plan deleted successfully" };
};

/**
 * SEARCH TRAVEL PLANS
 */
const searchTravelPlans = async (
  filters: SearchTravelPlanFilters,
  options: PaginationOptions
) => {
  const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = options;
  const skip = (page - 1) * limit;

  const where: any = {
    isActive: filters.isActive ?? true,
  };

  if (filters.destination) {
    where.destination = {
      contains: filters.destination,
      mode: "insensitive",
    };
  }

  if (filters.country) {
    where.country = {
      contains: filters.country,
      mode: "insensitive",
    };
  }

  if (filters.city) {
    where.city = {
      contains: filters.city,
      mode: "insensitive",
    };
  }

  if (filters.startDate || filters.endDate) {
    where.AND = [];

    if (filters.startDate) {
      where.AND.push({ startDate: { gte: filters.startDate } });
    }

    if (filters.endDate) {
      where.AND.push({ endDate: { lte: filters.endDate } });
    }
  }

  if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
    where.OR = [];

    if (filters.minBudget !== undefined) {
      where.OR.push({ budgetMin: { gte: filters.minBudget } });
    }

    if (filters.maxBudget !== undefined) {
      where.OR.push({ budgetMax: { lte: filters.maxBudget } });
    }
  }

  if (filters.travelType) {
    where.travelType = filters.travelType;
  }

  if (filters.interests?.length) {
    where.interests = { hasSome: filters.interests };
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  const [data, total] = await Promise.all([
    prisma.travelPlan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            profile: {
              select: { fullName: true, profileImage: true },
            },
          },
        },
        _count: { select: { matches: true } },
      },
    }),
    prisma.travelPlan.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
/**
 * GET USER TRAVEL PLANS
 */
const getUserTravelPlans = async (
  userId: string,
  options: PaginationOptions,
  includeInactive = false
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (!includeInactive) where.isActive = true;

  const validSortFields = [
    "createdAt",
    "updatedAt",
    "startDate",
    "endDate",
    "viewCount",
  ];

  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [data, total] = await Promise.all([
    prisma.travelPlan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        _count: { select: { matches: true } },
      },
    }),
    prisma.travelPlan.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * UPCOMING PLANS
 */
const getUpcomingPlans = async (options: PaginationOptions) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const where = { isActive: true, startDate: { gte: new Date() } };

  const [data, total] = await Promise.all([
    prisma.travelPlan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: "asc" },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { fullName: true, profileImage: true } },
          },
        },
      },
    }),
    prisma.travelPlan.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * POPULAR PLANS
 */
const getPopularPlans = async (options: PaginationOptions) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const where = { isActive: true };

  const [data, total] = await Promise.all([
    prisma.travelPlan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { viewCount: "desc" },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { fullName: true, profileImage: true } },
          },
        },
      },
    }),
    prisma.travelPlan.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * TOGGLE PLAN STATUS
 */
const togglePlanStatus = async (id: string, userId: string) => {
  const travelPlan = await prisma.travelPlan.findUnique({ where: { id } });

  if (!travelPlan) throw new AppError(404, "Travel plan not found");
  if (travelPlan.userId !== userId) throw new AppError(403, "Not authorized");

  return prisma.travelPlan.update({
    where: { id },
    data: { isActive: !travelPlan.isActive },
  });
};

/**
 * TRAVEL PLAN STATS
 */
const getTravelPlanStats = async (userId: string) => {
  const [total, active, past, upcoming, views] = await Promise.all([
    prisma.travelPlan.count({ where: { userId } }),
    prisma.travelPlan.count({ where: { userId, isActive: true } }),
    prisma.travelPlan.count({ where: { userId, endDate: { lt: new Date() } } }),
    prisma.travelPlan.count({
      where: { userId, startDate: { gte: new Date() } },
    }),
    prisma.travelPlan.aggregate({
      where: { userId },
      _sum: { viewCount: true },
    }),
  ]);

  return {
    total,
    active,
    past,
    upcoming,
    totalViews: views._sum.viewCount || 0,
  };
};

export const travelPlanService = {
  createTravelPlan,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
  searchTravelPlans,
  getUserTravelPlans,
  getUpcomingPlans,
  getPopularPlans,
  togglePlanStatus,
  getTravelPlanStats,
};
