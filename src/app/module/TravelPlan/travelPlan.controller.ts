/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { travelPlanService } from "./travelPlan.service";
import {
  PaginationOptions,
  SearchTravelPlanFilters,
  UpdateTravelPlanInput,
} from "./travelPlan.interface";

/**
 * CREATE PLAN
 */
const createTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await travelPlanService.createTravelPlan(req.body, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Travel plan created successfully",
    data: result,
  });
});

/**
 * GET PLAN BY ID
 */
const getTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new AppError(400, "Travel plan id is required");

  const result = await travelPlanService.getTravelPlanById(id, {
    incrementView: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Travel plan fetched successfully",
    data: result,
  });
});

/**
 * UPDATE PLAN
 */
const updateTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const travelPlanId = req.params.id;
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const data: UpdateTravelPlanInput = req.body;

  const updatedPlan = await travelPlanService.updateTravelPlan(
    travelPlanId as string,
    userId.id,
    data
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Travel plan updated successfully",
    data: updatedPlan,
  });
});

/**
 * DELETE PLAN
 */
const deleteTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await travelPlanService.deleteTravelPlan(
    id as string,
    userId.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Travel plan deleted successfully",
    data: result,
  });
});

/**
 * SEARCH PLANS
 */
// travelPlan.controller.ts

/**
 * GET USER PLANS
 */
const getUserTravelPlans = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const includeInactive = req.query.includeInactive === "true";
  const pagination = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: String(req.query.sortBy) || "createdAt",
    sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
  };

  const result = await travelPlanService.getUserTravelPlans(
    userId.id,
    pagination,
    includeInactive
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User travel plans fetched successfully",
    data: result,
  });
});

/**
 * GET UPCOMING PLANS
 */
const getUpcomingPlans = catchAsync(async (req: Request, res: Response) => {
  const pagination = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  const result = await travelPlanService.getUpcomingPlans(pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Upcoming travel plans fetched successfully",
    data: result,
  });
});
/**
 * GET search PLANS
 */
const searchPlan = catchAsync(async (req: Request, res: Response) => {
  const {
    destination,
    country,
    city,
    travelType,
    userId,
    isActive,
    startDate,
    endDate,
    minBudget,
    maxBudget,
    interests,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filters: SearchTravelPlanFilters = {};

  if (destination) filters.destination = destination as string;
  if (country) filters.country = country as string;
  if (city) filters.city = city as string;
  if (travelType) filters.travelType = travelType as any;
  if (userId) filters.userId = userId as string;

  if (isActive !== undefined) {
    filters.isActive = isActive === "true";
  }

  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);

  if (minBudget) filters.minBudget = Number(minBudget);
  if (maxBudget) filters.maxBudget = Number(maxBudget);

  if (typeof interests === "string") {
    filters.interests = interests.split(",");
  } else if (Array.isArray(interests)) {
    filters.interests = interests as string[];
  }

  const options: PaginationOptions = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy as string,
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };

  const result = await travelPlanService.searchTravelPlans(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Travel plans fetched successfully",
    data: result,
  });
});

/**
 * GET POPULAR PLANS
 */
const getPopularPlans = catchAsync(async (req: Request, res: Response) => {
  const pagination = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  const result = await travelPlanService.getPopularPlans(pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Popular travel plans fetched successfully",
    data: result,
  });
});

/**
 * TOGGLE PLAN STATUS
 */
const togglePlanStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const updatedPlan = await travelPlanService.togglePlanStatus(
    id as string,
    userId.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Travel plan status toggled successfully",
    data: updatedPlan,
  });
});

/**
 * GET TRAVEL PLAN STATS
 */
const getTravelPlanStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const stats = await travelPlanService.getTravelPlanStats(userId.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Travel plan stats fetched successfully",
    data: stats,
  });
});

export const TravelPlanController = {
  createTravelPlan,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
  searchPlan,
  getUserTravelPlans,
  getUpcomingPlans,
  getPopularPlans,
  togglePlanStatus,
  getTravelPlanStats,
};
