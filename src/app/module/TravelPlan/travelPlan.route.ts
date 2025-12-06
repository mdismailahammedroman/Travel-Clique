import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { TravelPlanController } from "./travelPlan.controller";
import { Role } from "@prisma/client";


const router = Router();

router.post("/create-travelplan", checkAuth(Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN), TravelPlanController.createTravelPlan);
router.get("/", TravelPlanController.getPublicPlans);
router.get("/my", checkAuth(Role.USER), TravelPlanController.getMyPlans);
router.get("/:id", TravelPlanController.getPlanById);
// ----------------------------- JOIN & LEAVE -----------------------------
router.post("/join/:id", checkAuth(Role.USER), TravelPlanController.joinPlan);
router.post("/leave/:id", checkAuth(Role.USER), TravelPlanController.leavePlan);

// ----------------------------- UPDATE & DELETE (Optional) -----------------------------
router.patch("/:id", checkAuth(Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN), TravelPlanController.updatePlan);
router.delete("/:id", checkAuth(Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN), TravelPlanController.deletePlan);

export const travelPlanRoute=router;
