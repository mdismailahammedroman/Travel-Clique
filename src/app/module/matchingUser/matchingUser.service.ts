/* eslint-disable @typescript-eslint/no-explicit-any */
import { MatchStatus, Prisma } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

// -----------------------
// SEND MATCH REQUEST
// -----------------------
const sendMatch = async (senderId: string, receiverId: string) => {
  if (senderId === receiverId) throw new AppError(400, "Cannot match with yourself");

  const existingMatch = await prisma.match.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } },
  });

  if (existingMatch) throw new AppError(400, "Match request already exists");

  return prisma.match.create({
    data: { senderId, receiverId, status: MatchStatus.PENDING },
  });
};

// -----------------------
// UPDATE MATCH STATUS
// -----------------------
const updateMatchStatus = async (
  matchId: string,
  receiverId: string,
  status: MatchStatus
) => {
  if (!matchId) throw new AppError(400, "matchId is required");
  if (!status) throw new AppError(400, "status is required");

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });


  if (!match) throw new AppError(404, "Match not found");

  // Only receiver can accept/reject the request
  if (match.receiverId !== receiverId) {
    throw new AppError(403, "You cannot update this match");
  }

  return prisma.match.update({
    where: { id: matchId },
    data: { status:MatchStatus.ACCEPTED },
  });
};

const getSentMatches = async (userId: string, filters: any, options: IOptions) => {
  const { limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const where: Prisma.MatchWhereInput = {
    senderId: userId,
    ...(filters.status && { status: filters.status }),
    ...(filters.createdAtFrom || filters.createdAtTo
      ? {
          createdAt: {
            gte: filters.createdAtFrom ? new Date(filters.createdAtFrom) : undefined,
            lte: filters.createdAtTo ? new Date(filters.createdAtTo) : undefined,
          },
        }
      : {}),
    ...(filters.receiverName
      ? {
          receiver: {
            name: { contains: filters.receiverName, mode: "insensitive" },
          },
        }
      : {}),
  };

  const matches = await prisma.match.findMany({
    where,
    skip,
    take: limit,
    include: { receiver: true },
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.match.count({ where });

  return { meta: { limit, total }, data: matches };
};

const getReceivedMatches = async (userId: string, filters: any, options: IOptions) => {
  const { limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const where: Prisma.MatchWhereInput = {
    receiverId: userId,
    ...(filters.status && { status: filters.status }),
    ...(filters.createdAtFrom || filters.createdAtTo
      ? {
          createdAt: {
            gte: filters.createdAtFrom ? new Date(filters.createdAtFrom) : undefined,
            lte: filters.createdAtTo ? new Date(filters.createdAtTo) : undefined,
          },
        }
      : {}),
    ...(filters.senderName
      ? {
          sender: {
            name: { contains: filters.senderName, mode: "insensitive" },
          },
        }
      : {}),
  };

  const matches = await prisma.match.findMany({
    where,
    skip,
    take: limit,
    include: { sender: true },
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.match.count({ where });

  return { meta: { limit, total }, data: matches };
};


export const matchService = {
  sendMatch,
  updateMatchStatus,
  getReceivedMatches,
  getSentMatches
};
