/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";

import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let error: any = null;

  // ✅ Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    error = { message };
  }

  // ✅ Prisma known errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;

      case "P2002":
        statusCode = 409;
        message = `Duplicate value for field: ${err.meta?.target}`;
        break;

      case "P3006":
        statusCode = 500;
        message = "Database migration failed";
        break;

      default:
        statusCode = 400;
        message = "Database error";
    }

    error = {
      code: err.code,
      message,
    };
  }

  // ✅ Fallback
  else {
    message = err.message || message;
    error = {
      message,
    };
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error,
  });
};
