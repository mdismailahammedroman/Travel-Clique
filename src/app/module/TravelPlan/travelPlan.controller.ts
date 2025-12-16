import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { travelPlanService } from "./travelPlan.service";
import { Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";
import pick from "../../helpers/pick";
import { IJWTPayload } from "../../helpers/payload";

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
  const filters = pick(req.query, ["destination", "travelType", "startDate", "endDate"]);

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
const getMyPlans = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit"]);
  const filters = pick(req.query, ["startDate", "endDate"]);

  const result = await travelPlanService.getMyPlans(
    req.user as IJWTPayload,
    options,
    filters
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My travel plans retrieved",
    data: result,
  });
});

/**
 * UPDATE
 */
const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await travelPlanService.updatePlan(
    req.user?.id as string,
    req.params.id,
    req.body
  );

  sendResponse(res, {
    message: "Travel plan updated",
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

/**
 * DELETE
 */
const deletePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await travelPlanService.deletePlan(
    req.user?.id as string,
    req.params.id
  );

  sendResponse(res, {
    message: "Travel plan deleted successfully",
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

/**
 * JOIN PLAN (Subscription Protected)
 */
const joinPlanController = catchAsync(async (req: Request, res: Response) => {
   const userId = (req.user as IJWTPayload).id;
  const planId = req.params.id;

  const result = await travelPlanService.joinPlan(userId, planId);


  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

export const TravelPlanController = {
  createTravelPlan,
  getPublicPlans,
  getPlanById,
  getMyPlans,
  updatePlan,
  deletePlan,
  joinPlanController,
};
