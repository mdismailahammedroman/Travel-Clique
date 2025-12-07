import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { travelPlanService } from "./travelPlan.service";
import { Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";
import pick from "../../helpers/pick";
import { IJWTPayload } from "../../helpers/payload";

// Create a travel plan
const createTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await travelPlanService.createTravelPlan(userId, req.body);
  sendResponse(res, {
    message: "Travel plan created successfully",
    statusCode: httpStatus.CREATED,
    success: true,
    data: result,
  });
});

// Get public travel plans
const getPublicPlans = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, ["startDateTime", "endDateTime"]);

  const result = await travelPlanService.getPublicPlans(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Public travel plans retrieved",
    data: result,
  });
});

// Get travel plan by ID
const getPlanById = catchAsync(async (req: Request, res: Response) => {
  const result = await travelPlanService.getPlanById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plan retrieved successfully",
    data: result,
  });
});

// Get user's own travel plans
const getMyPlans = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, ["startDateTime", "endDateTime"]);

  const result = await travelPlanService.getMyPlans(
    req.user as IJWTPayload,
    options,
    filters
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User travel plans retrieved successfully",
    data: result,
  });
});

// Update a travel plan
const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await travelPlanService.updatePlan(userId, req.params.id, req.body);

  sendResponse(res, {
    message: "Travel plan updated successfully",
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

// Delete a travel plan
const deletePlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await travelPlanService.deletePlan(userId, req.params.id);

  sendResponse(res, {
    message: "Travel plan deleted successfully",
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});


// ----------------------------- JOIN PLAN -----------------------------
const joinPlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const planId = req.params.id;
  const result = await travelPlanService.joinPlan(userId, planId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Joined travel plan successfully",
    data: result,
  });
});

// ----------------------------- LEAVE PLAN -----------------------------
const leavePlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const planId = req.params.id;
  const result = await travelPlanService.leavePlan(userId, planId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Left travel plan successfully",
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
  joinPlan,
  leavePlan,
};
