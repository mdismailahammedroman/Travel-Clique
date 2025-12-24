import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { userControllers } from "./user.controller";

const router = Router();

// =======================
// PUBLIC ROUTES
// =======================

// Register user with optional profile image upload
router.post(
  "/register",
  multerUpload.single("profileImage"),
  userControllers.registerUser
);

// =======================
// PROTECTED ROUTES (All authenticated users)
// =======================

// Get current logged-in user
router.get("/me", checkAuth(...Object.values(Role)), userControllers.getMe);

// Update own profile
router.patch(
  "/myprofile-update",
  checkAuth(...Object.values(Role)),
  multerUpload.single("profileImage"),
  userControllers.userUpdate
);

// =======================
// ADMIN ROUTES
// =======================

// Get all users
router.get("/", checkAuth(Role.ADMIN), userControllers.getAllUsers);

// Get user by ID
router.get("/:id", checkAuth(Role.ADMIN), userControllers.getProfile);

// Delete a user
router.delete("/:id", checkAuth(Role.ADMIN), userControllers.userDelete);

// Block / unblock a user
router.patch("/:id/block", checkAuth(Role.ADMIN), userControllers.blockUser);

// Update user role
router.patch(
  "/:id/role",
  checkAuth(Role.ADMIN),
  userControllers.updateUserRole
);

export const userRouter = router;
