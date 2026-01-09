import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import AppError from "../../errorHelpers/AppError";

/**
 * GET DASHBOARD STATISTICS
 */
const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard statistics fetched successfully",
    data: stats,
  });
});

/**
 * GET USER ANALYTICS
 */
const getUserAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { period } = req.query;

  const analytics = await adminService.getUserAnalytics(
    (period as "week" | "month" | "year") || "month"
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User analytics fetched successfully",
    data: analytics,
  });
});

/**
 * GET REVENUE ANALYTICS
 */
const getRevenueAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { period } = req.query;

  const analytics = await adminService.getRevenueAnalytics(
    (period as "week" | "month" | "year") || "month"
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Revenue analytics fetched successfully",
    data: analytics,
  });
});

/**
 * GET TOP USERS
 */
const getTopUsers = catchAsync(async (req: Request, res: Response) => {
  const { limit } = req.query;

  const users = await adminService.getTopUsers(Number(limit) || 10);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Top users fetched successfully",
    data: users,
  });
});

/**
 * GET TOP DESTINATIONS
 */
const getTopDestinations = catchAsync(async (req: Request, res: Response) => {
  const { limit } = req.query;

  const destinations = await adminService.getTopDestinations(
    Number(limit) || 10
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Top destinations fetched successfully",
    data: destinations,
  });
});

/**
 * GET RECENT ACTIVITIES
 */
const getRecentActivities = catchAsync(async (req: Request, res: Response) => {
  const { limit } = req.query;

  const activities = await adminService.getRecentActivities(
    Number(limit) || 20
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Recent activities fetched successfully",
    data: activities,
  });
});
/**
 * GET USER DETAILS
 */
const getUserDetails = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError(400, "User ID is required");
  }

  const user = await adminService.getUserDetails(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User details fetched successfully",
    data: user,
  });
});

/**
 * SUSPEND USER
 */
const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError(400, "User ID is required");
  }

  const user = await adminService.suspendUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User suspended successfully",
    data: user,
  });
});

/**
 * UNSUSPEND USER
 */
const unsuspendUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError(400, "User ID is required");
  }

  const user = await adminService.unsuspendUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User unsuspended successfully",
    data: user,
  });
});

/**
 * DELETE USER
 */
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError(400, "User ID is required");
  }

  const result = await adminService.deleteUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

/**
 * GET SUBSCRIPTION ANALYTICS
 */
const getSubscriptionAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const analytics = await adminService.getSubscriptionAnalytics();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Subscription analytics fetched successfully",
      data: analytics,
    });
  }
);

/**
 * EXPORT DATA
 */
const exportData = catchAsync(async (req: Request, res: Response) => {
  const { dataType } = req.params;

  const data = await adminService.exportData(
    dataType as "users" | "plans" | "groups" | "payments"
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Data exported successfully",
    data,
  });
});

export const adminController = {
  getDashboardStats,
  getUserAnalytics,
  getRevenueAnalytics,
  getTopUsers,
  getTopDestinations,
  getRecentActivities,
  getUserDetails,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getSubscriptionAnalytics,
  exportData,
};
