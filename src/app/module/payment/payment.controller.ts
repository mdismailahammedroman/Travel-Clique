import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { paymentService } from "./payment.service";
import { IJWTPayload } from "../../helpers/payload";

/**
 * GET MY PAYMENTS
 */
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IJWTPayload | undefined;
  if (!user?.id) throw new AppError(401, "User not authenticated");

  const result = await paymentService.getMyPayments(user.id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My payments fetched successfully",
    data: result,
  });
});

/**
 * GET PAYMENT BY ID
 */
const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new AppError(400, "Payment ID is required");

  const user = req.user as IJWTPayload | undefined;

  const result = await paymentService.getPaymentById(id, user?.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment fetched successfully",
    data: result,
  });
});

/**
 * ADMIN: GET ALL PAYMENTS
 */
const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getAllPayments(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All payments fetched successfully",
    data: result,
  });
});

/**
 * GET PAYMENT STATS (USER)
 */
const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IJWTPayload | undefined;
  if (!user?.id) throw new AppError(401, "User not authenticated");

  const result = await paymentService.getPaymentStats(user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment statistics fetched successfully",
    data: result,
  });
});

export const paymentController = {
  getMyPayments,
  getPaymentById,
  getAllPayments,
  getPaymentStats,
};
