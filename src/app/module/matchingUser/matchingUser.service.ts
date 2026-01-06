/* eslint-disable @typescript-eslint/no-explicit-any */
import { MatchStatus } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";
import { PaginationOptions } from "../TravelPlan/travelPlan.interface";

export interface CreateMatchInput {
  senderId: string;
  receiverId: string;
  travelPlanId: string;
  message?: string;
}

export interface MatchFilters {
  status?: MatchStatus;
  travelPlanId?: string;
}

const sendMatchRequest = async (data: CreateMatchInput) => {
  const { senderId, receiverId, travelPlanId } = data;

  if (senderId === receiverId)
    throw new AppError(400, "Cannot send match request to yourself");

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new AppError(404, "Receiver not found");
  if (receiver.isBlocked)
    throw new AppError(403, "Cannot send match request to blocked user");

  const travelPlan = await prisma.travelPlan.findUnique({
    where: { id: travelPlanId },
  });
  if (!travelPlan) throw new AppError(404, "Travel plan not found");
  if (!travelPlan.isActive)
    throw new AppError(400, "Travel plan is not active");

  const existingMatch = await prisma.match.findFirst({
    where: { senderId, receiverId, travelPlanId },
  });
  if (existingMatch)
    throw new AppError(400, "Match request already sent for this travel plan");

  const match = await prisma.match.create({
    data: { ...data, status: MatchStatus.PENDING },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profile: { select: { fullName: true, profileImage: true } },
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          profile: { select: { fullName: true, profileImage: true } },
        },
      },
      travelPlan: {
        select: {
          id: true,
          destination: true,
          country: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  return match;
};

const respondToMatchRequest = async (
  matchId: string,
  userId: string,
  status: MatchStatus
) => {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, "Match request not found");
  if (match.receiverId !== userId)
    throw new AppError(403, "Not authorized to respond to this match request");
  if (match.status !== MatchStatus.PENDING)
    throw new AppError(400, "Match request already responded to");
  const validStatuses = [MatchStatus.ACCEPTED, MatchStatus.DECLINED] as const;

  if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
    throw new AppError(400, "Invalid status. Must be ACCEPTED or DECLINED");
  }

  return prisma.match.update({
    where: { id: matchId },
    data: { status },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { fullName: true, profileImage: true } },
        },
      },
      travelPlan: {
        select: {
          id: true,
          destination: true,
          country: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });
};

const getSentMatches = async (
  userId: string,
  filters: MatchFilters,
  options: PaginationOptions
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;
  const skip = (page - 1) * limit;

  const where: any = { senderId: userId };
  if (filters.status) where.status = filters.status;
  if (filters.travelPlanId) where.travelPlanId = filters.travelPlanId;

  const [data, total] = await Promise.all([
    prisma.match.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            profile: {
              select: { fullName: true, profileImage: true, bio: true },
            },
            subscriptions: {
              where: { isActive: true },
              select: { verifiedBadge: true },
            },
          },
        },
        travelPlan: {
          select: {
            id: true,
            destination: true,
            country: true,
            city: true,
            startDate: true,
            endDate: true,
            travelType: true,
          },
        },
      },
    }),
    prisma.match.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getReceivedMatches = async (
  userId: string,
  filters: MatchFilters,
  options: PaginationOptions
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;
  const skip = (page - 1) * limit;

  const where: any = { receiverId: userId };
  if (filters.status) where.status = filters.status;
  if (filters.travelPlanId) where.travelPlanId = filters.travelPlanId;

  const [data, total] = await Promise.all([
    prisma.match.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
                bio: true,
                currentLocation: true,
                travelInterests: { select: { interest: true } },
              },
            },
            subscriptions: {
              where: { isActive: true },
              select: { verifiedBadge: true },
            },
            reviewsReceived: { select: { rating: true } },
          },
        },
        travelPlan: {
          select: {
            id: true,
            destination: true,
            country: true,
            city: true,
            startDate: true,
            endDate: true,
            travelType: true,
            description: true,
          },
        },
      },
    }),
    prisma.match.count({ where }),
  ]);

  // Compute average rating for each sender
  const dataWithRatings = data.map((match) => {
    const reviews = match.sender.reviewsReceived || [];
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    return {
      ...match,
      sender: {
        ...match.sender,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
        reviewsReceived: undefined,
      },
    };
  });

  return {
    data: dataWithRatings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getMatchById = async (matchId: string, userId: string) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              profileImage: true,
              bio: true,
              currentLocation: true,
              travelInterests: { select: { interest: true } },
              visitedCountries: { select: { country: true } },
            },
          },
          subscriptions: {
            where: { isActive: true },
            select: { verifiedBadge: true },
          },
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          profile: {
            select: { fullName: true, profileImage: true, bio: true },
          },
        },
      },
      travelPlan: true,
    },
  });

  if (!match) throw new AppError(404, "Match not found");
  if (match.senderId !== userId && match.receiverId !== userId)
    throw new AppError(403, "Not authorized to view this match");

  return match;
};

const cancelMatchRequest = async (matchId: string, userId: string) => {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, "Match request not found");
  if (match.senderId !== userId)
    throw new AppError(403, "Not authorized to cancel this match request");
  if (match.status !== MatchStatus.PENDING)
    throw new AppError(400, "Can only cancel pending match requests");

  await prisma.match.delete({ where: { id: matchId } });
  return { message: "Match request cancelled successfully" };
};

const getMatchStats = async (userId: string) => {
  const [sentTotal, receivedTotal, acceptedSent, acceptedReceived, pending] =
    await Promise.all([
      prisma.match.count({ where: { senderId: userId } }),
      prisma.match.count({ where: { receiverId: userId } }),
      prisma.match.count({
        where: { senderId: userId, status: MatchStatus.ACCEPTED },
      }),
      prisma.match.count({
        where: { receiverId: userId, status: MatchStatus.ACCEPTED },
      }),
      prisma.match.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: MatchStatus.PENDING,
        },
      }),
    ]);

  return {
    sent: {
      total: sentTotal,
      accepted: acceptedSent,
      pending: await prisma.match.count({
        where: { senderId: userId, status: MatchStatus.PENDING },
      }),
      declined: await prisma.match.count({
        where: { senderId: userId, status: MatchStatus.DECLINED },
      }),
    },
    received: {
      total: receivedTotal,
      accepted: acceptedReceived,
      pending: await prisma.match.count({
        where: { receiverId: userId, status: MatchStatus.PENDING },
      }),
      declined: await prisma.match.count({
        where: { receiverId: userId, status: MatchStatus.DECLINED },
      }),
    },
    totalMatches: acceptedSent + acceptedReceived,
    pendingActions: pending,
  };
};

const getMatchedUsers = async (userId: string, options: PaginationOptions) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const where = {
    status: MatchStatus.ACCEPTED,
    OR: [{ senderId: userId }, { receiverId: userId }],
  };

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
                currentLocation: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
                currentLocation: true,
              },
            },
          },
        },
        travelPlan: {
          select: { destination: true, startDate: true, endDate: true },
        },
      },
    }),
    prisma.match.count({ where }),
  ]);

  const formattedData = matches.map((match) => ({
    matchId: match.id,
    matchedUser: match.senderId === userId ? match.receiver : match.sender,
    travelPlan: match.travelPlan,
    matchedAt: match.updatedAt,
  }));

  return {
    data: formattedData,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const matchService = {
  sendMatchRequest,
  respondToMatchRequest,
  getSentMatches,
  getReceivedMatches,
  getMatchById,
  cancelMatchRequest,
  getMatchStats,
  getMatchedUsers,
};
