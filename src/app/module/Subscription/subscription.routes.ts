import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { subscriptionController } from "./subscription.controller";


const router = Router();

// CREATE STRIPE CHECKOUT SESSION
router.post("/create-checkout-session", checkAuth(Role.USER), subscriptionController.createCheckoutSession);

// ❌ WEBHOOK ROUTE REMOVED: It is now handled directly in app.ts for middleware ordering reasons.

// GET MY SUBSCRIPTIONS
router.get("/my", checkAuth(Role.USER), subscriptionController.getMySubscriptions);

export const subscriptionRoute = router;