import { Router } from "express";
import { TravelPlanController } from "./travelPlan.controller";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { requireActiveSubscription } from "../../helpers/requireActiveSubscription";

const router = Router();

// Only users with active subscriptions can create plans
router.post(
  "/create-travelplan",
  checkAuth(Role.USER),
  TravelPlanController.createTravelPlan
);

// Join plan route (later)
router.post(
  "/:id/join",
  checkAuth(Role.USER),
  requireActiveSubscription,
  TravelPlanController.joinPlanController
);

router.get("/", TravelPlanController.getPublicPlans);
router.get("/my", checkAuth(Role.USER), TravelPlanController.getMyPlans);
router.get("/:id", TravelPlanController.getPlanById);

export const travelPlanRoute = router;
