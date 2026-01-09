/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../utils/prisma";
import AppError from "../../errorHelpers/AppError";

export const notificationService = {
  getUserNotifications: async (userId: string, filters: any, options: any) => {
    const { type, isRead } = filters;
    const { page, limit } = options;

    const where: any = { userId };

    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const notifications = await prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.notification.count({ where });

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getUnreadCount: async (userId: string) => {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  markAsRead: async (id: string, userId: string) => {
    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId,
        isRead: false, // Ensure it's not already marked as read
      },
      data: { isRead: true },
    });

    if (!notification.count) {
      throw new AppError(404, "Notification not found or already read");
    }

    return notification;
  },

  markAllAsRead: async (userId: string) => {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      message: "All notifications marked as read",
      count: result.count,
    };
  },

  deleteNotification: async (id: string, userId: string) => {
    const notification = await prisma.notification.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (!notification.count) {
      throw new AppError(404, "Notification not found");
    }

    return {
      message: "Notification deleted successfully",
    };
  },

  deleteAllRead: async (userId: string) => {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return {
      message: "All read notifications deleted",
      count: result.count,
    };
  },
};
