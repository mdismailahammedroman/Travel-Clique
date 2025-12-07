import { MatchStatus } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";

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
console.log("match",match);

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

export const matchService = {
  sendMatch,
  updateMatchStatus,
};
