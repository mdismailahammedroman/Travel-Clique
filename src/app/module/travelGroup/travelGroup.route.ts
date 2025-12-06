import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { travelGroupController } from "./travelGroup.controller";

const router = Router();

router.post("/", checkAuth(...Object.values(Role)), travelGroupController.createTravelGroup);
router.get("/", checkAuth(...Object.values(Role)), travelGroupController.getTravelGroups);
router.get("/:id", checkAuth(...Object.values(Role)), travelGroupController.getTravelGroup);
router.patch("/:id", checkAuth(...Object.values(Role)), travelGroupController.updateTravelGroup);
router.delete("/:id", checkAuth(...Object.values(Role)), travelGroupController.deleteTravelGroup);

router.post("/members", checkAuth(...Object.values(Role)), travelGroupController.addMember);
router.delete("/members", checkAuth(...Object.values(Role)), travelGroupController.removeMember);

export const travelGroupRouter = router;
