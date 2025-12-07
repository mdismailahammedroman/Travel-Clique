import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";

const sendMatch=async (senderId: string, receiverId: string) => {
    if (senderId === receiverId) throw new AppError(400, "Cannot match with yourself");

    const existingMatch = await prisma.match.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });
    if (existingMatch) throw new AppError(400, "Match request already exists");

    return prisma.match.create({
      data: { senderId, receiverId },
    });
  }

  export const matchService={
    sendMatch,
  }