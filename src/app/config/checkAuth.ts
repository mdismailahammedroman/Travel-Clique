import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/envVars";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../utils/prisma";

// Extend Express Request to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string; role: string };
    }
  }
}

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ONLY read token from cookies
      const accessToken = req.cookies?.accessToken;

      if (!accessToken) {
        throw new AppError(403, "No token provided in cookies");
      }

      // Verify JWT
      const verifiedToken = verifyToken(accessToken, envVars.JWT_SECRET) as JwtPayload & {
        id: string;
        role: string;
      };

      if (!verifiedToken?.id) {
        throw new AppError(403, "Invalid token");
      }

      // Fetch user from DB
      const user = await prisma.user.findUnique({
        where: { id: verifiedToken.id },
      });

      if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }

      if (!user.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
      }

      // Optional: isActive / isDeleted logic if added in future

      // Check role permissions
      if (authRoles.length && !authRoles.includes(user.role)) {
        throw new AppError(403, "You are not permitted to access this route");
      }

      // Attach user info to request
      req.user = { id: user.id, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };
