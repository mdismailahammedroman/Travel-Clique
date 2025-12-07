import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { TravelGroupController } from "./travelGroup.controller";
import { Role } from "@prisma/client";

const router = Router();

// Paid feature: Only authenticated users
router.post("/", checkAuth(Role.USER), TravelGroupController.createGroup);

// Public
router.get("/", TravelGroupController.getGroups);
router.get("/:id", TravelGroupController.getGroupById);

// Membership
router.post("/:id/join", checkAuth(Role.USER), TravelGroupController.joinGroup);
router.patch("/:id/leave", checkAuth(Role.USER), TravelGroupController.leaveGroup);
router.get("/:id/members", TravelGroupController.getGroupMembers);

export const travelGroupRoute = router;
