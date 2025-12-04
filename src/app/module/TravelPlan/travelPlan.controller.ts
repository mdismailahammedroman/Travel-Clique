import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { travelPlanService } from "./travelPlan.service";
import {  Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";

const createTravelPlan = catchAsync(async(req:Request, res:Response, )=>{
 const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const result = await travelPlanService.createTravelPlan(userId, req.body);

  sendResponse(res, {
    message: "Travel plan created successfully",
    statusCode: httpStatus.CREATED,
    success: true,
    data: result,
  });
});

export const TravelPlanController={
  createTravelPlan
}