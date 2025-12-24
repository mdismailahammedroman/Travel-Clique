import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { travelPlanService } from "./travelPlan.service";
import { Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";
import pick from "../../helpers/pick";

/**
 * CREATE PLAN
 */
const createTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await travelPlanService.createTravelPlan(userId, req.body);

  if ("checkoutUrl" in result) {
    return sendResponse(res, {
      success: false,
      statusCode: 402,
      message: result.message,
      data: { checkoutUrl: result.checkoutUrl },
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Travel plan created successfully",
    data: result,
  });
});

/**
 * PUBLIC PLANS
 */
const getPublicPlans = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit"]);
  const filters = pick(req.query, [
    "destination",
    "travelType",
    "startDate",
    "endDate",
  ]);

  const result = await travelPlanService.getPublicPlans(options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Public travel plans retrieved",
    data: result,
  });
});

/**
 * GET BY ID
 */
const getPlanById = catchAsync(async (req: Request, res: Response) => {
  const result = await travelPlanService.getPlanById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plan retrieved",
    data: result,
  });
});

/**
 * MY PLANS
 */

export const TravelPlanController = {
  createTravelPlan,
  getPublicPlans,
  getPlanById,
};
