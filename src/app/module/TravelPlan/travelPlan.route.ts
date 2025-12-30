import { Router } from "express";
import { TravelPlanController } from "./travelPlan.controller";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

// Only users with active subscriptions can create plans
router.post(
  "/create-travelplan",
  checkAuth(...Object.values(Role)),
  TravelPlanController.createTravelPlan
);

// router.get("/", TravelPlanController.getPublicPlans);
// router.get("/my", checkAuth(Role.USER), TravelPlanController.getMyPlans);
// router.get("/:id", TravelPlanController.getPlanById);

export const travelPlanRoute = router;
