import { NextFunction, Request, Response } from "express";
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
  (...allowedRoles: string[]) =>
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

          if (!user) throw new AppError(404, "User not found");

      if (!user.isVerified) {
        throw new AppError(403, "User is not verified");
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        throw new AppError(403, "Forbidden");
      }


      // Attach user info to request
      req.user = { id: user.id, role: user.role, email: user.email };
      next();
    } catch (error) {
      next(error);
    }
  };
