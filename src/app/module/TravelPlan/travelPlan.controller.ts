import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { travelPlanService } from "./travelPlan.service";

/**
 * CREATE PLAN
 */
const createTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const result = await travelPlanService.createTravelPlan(req.body, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Travel plan created successfully",
    data: result,
  });
});

// /**
//  * GET PUBLIC PLANS
//  */
// const getPublicPlans = catchAsync(async (_req, res) => {
//   const result = await travelPlanService.getPublicPlans();

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Public travel plans fetched",
//     data: result,
//   });
// });

// /**
//  * GET SINGLE PLAN
//  */
// const getPlanById = catchAsync(async (req, res) => {
//   const { id } = req.params;

//   const result = await travelPlanService.getPlanById(id);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Travel plan fetched successfully",
//     data: result,
//   });
// });

export const TravelPlanController = {
  createTravelPlan,
  // getPublicPlans,
  // getPlanById,
};
