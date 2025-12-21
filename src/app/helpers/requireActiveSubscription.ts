import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import AppError from "../errorHelpers/AppError";

export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId, isActive: true, endDate: { gte: new Date() } },
  });

  if (!activeSubscription) {
    throw new AppError(403, "You need an active subscription to perform this action");
  }

  next();
};
