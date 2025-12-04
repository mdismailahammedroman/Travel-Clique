import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { TravelPlanController } from "./travelPlan.controller";
import { Role } from "@prisma/client";


const router = Router();

router.post("/create-travelplan", checkAuth(...Object.values(Role)), TravelPlanController.createTravelPlan);
router.get("/", TravelPlanController.getPublicPlans);
// router.get("/my", checkAuth("USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"), TravelPlanController.getMyPlans);
router.get("/:id", TravelPlanController.getPlanById);
// router.patch("/:id", checkAuth("USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"), TravelPlanController.updatePlan);
// router.delete("/:id", checkAuth("USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"), TravelPlanController.deletePlan);

export const travelPlanRoute=router;
