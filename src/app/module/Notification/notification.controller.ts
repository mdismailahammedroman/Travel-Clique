import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { notificationService } from "./notification.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { NotificationType } from "@prisma/client";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; // Assuming JWT user id is in `req.user`
  if (!userId) throw new AppError(401, "User not authenticated");

  const { type, isRead, page, limit } = req.query;

  // Explicitly allow undefined for 'type'
  const filters: {
    type?: NotificationType | undefined; // Allow undefined
    isRead?: boolean | undefined; // Allow undefined for isRead
  } = {
    type: type ? (type as NotificationType) : undefined, // Filter by NotificationType
    isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
  };

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  };

  const result = await notificationService.getUserNotifications(
    userId,
    filters,
    options
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notifications fetched successfully",
    data: result,
  });
});

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await notificationService.getUnreadCount(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Unread count fetched successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id } = req.params;
  const notification = await notificationService.markAsRead(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notification marked as read",
    data: notification,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await notificationService.markAllAsRead(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: { count: result.count },
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id } = req.params;
  const result = await notificationService.deleteNotification(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

const deleteAllRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "User not authenticated");

  const result = await notificationService.deleteAllRead(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: { count: result.count },
  });
});

export const notificationController = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
};
