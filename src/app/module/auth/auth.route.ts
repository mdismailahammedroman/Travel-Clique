import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

// AUTH ROUTES
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);

export const authRoute = router;
