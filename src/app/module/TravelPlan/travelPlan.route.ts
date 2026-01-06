import { Router } from "express";
import { TravelPlanController } from "./travelPlan.controller";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

// PUBLIC
router.get("/search", TravelPlanController.searchPlan);

router.get("/popular", TravelPlanController.getPopularPlans);
router.get("/upcoming", TravelPlanController.getUpcomingPlans);
router.get("/:id", TravelPlanController.getTravelPlanById);

// AUTHENTICATED USER
router.post("/", checkAuth(Role.USER), TravelPlanController.createTravelPlan);

router.get(
  "/my",
  checkAuth(Role.USER),
  TravelPlanController.getUserTravelPlans
);

router.patch(
  "/:id",
  checkAuth(Role.USER),
  TravelPlanController.updateTravelPlan
);

router.delete(
  "/:id",
  checkAuth(Role.USER),
  TravelPlanController.deleteTravelPlan
);

export const travelPlanRoute = router;
