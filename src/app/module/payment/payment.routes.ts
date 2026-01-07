import { Router } from "express";
import { paymentController } from "./payment.controller";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

/**
 * USER ROUTES
 */
router.get("/my", checkAuth(Role.USER), paymentController.getMyPayments);

router.get("/stats", checkAuth(Role.USER), paymentController.getPaymentStats);

router.get("/:id", checkAuth(Role.USER), paymentController.getPaymentById);

/**
 * ADMIN ROUTES
 */
router.get("/", checkAuth(Role.ADMIN), paymentController.getAllPayments);

export const paymentRoute = router;
