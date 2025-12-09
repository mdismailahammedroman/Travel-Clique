import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { subscriptionController } from "./subscription.controller";


const router = Router();

// CREATE STRIPE CHECKOUT SESSION
router.post("/create-checkout-session", checkAuth(Role.USER), subscriptionController.createCheckoutSession);

// STRIPE WEBHOOK
router.post("/webhook", subscriptionController.stripeWebhook);

// GET MY SUBSCRIPTIONS
router.get("/my", checkAuth(Role.USER), subscriptionController.getMySubscriptions);

export default router;
