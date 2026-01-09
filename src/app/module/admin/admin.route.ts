import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

// All admin routes require ADMIN role
const adminAuth = checkAuth(Role.ADMIN);

/**
 * ADMIN DASHBOARD ROUTES
 */

// Dashboard statistics
router.get("/dashboard/stats", adminAuth, adminController.getDashboardStats);

// Analytics
router.get("/analytics/users", adminAuth, adminController.getUserAnalytics);
router.get(
  "/analytics/revenue",
  adminAuth,
  adminController.getRevenueAnalytics
);
router.get(
  "/analytics/subscriptions",
  adminAuth,
  adminController.getSubscriptionAnalytics
);

// Top lists
router.get("/top/users", adminAuth, adminController.getTopUsers);
router.get("/top/destinations", adminAuth, adminController.getTopDestinations);

// Recent activities
router.get(
  "/activities/recent",
  adminAuth,
  adminController.getRecentActivities
);

/**
 * USER MANAGEMENT
 */

// Get user details
router.get("/users/:userId", adminAuth, adminController.getUserDetails);

// Suspend user
router.post("/users/:userId/suspend", adminAuth, adminController.suspendUser);

// Unsuspend user
router.post(
  "/users/:userId/unsuspend",
  adminAuth,
  adminController.unsuspendUser
);

// Delete user
router.delete("/users/:userId", adminAuth, adminController.deleteUser);

/**
 * DATA EXPORT
 */

// Export data (users, plans, groups, payments)
router.get("/export/:dataType", adminAuth, adminController.exportData);

export const adminRoute = router;
