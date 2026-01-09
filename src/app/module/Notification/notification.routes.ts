import { Router } from "express";
import { notificationController } from "./notification.controller";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

const auth = checkAuth(Role.USER);

/**
 * NOTIFICATION ROUTES
 */

// Get my notifications
router.get("/", auth, notificationController.getMyNotifications);

// Get unread count
router.get("/unread-count", auth, notificationController.getUnreadCount);

// Mark as read
router.patch("/:id/read", auth, notificationController.markAsRead);

// Mark all as read
router.post("/mark-all-read", auth, notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", auth, notificationController.deleteNotification);

// Delete all read notifications
router.post("/delete-all-read", auth, notificationController.deleteAllRead);

export const notificationRoute = router;
