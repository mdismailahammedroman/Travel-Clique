import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { travelGroupController } from "./travelGroup.controller";

const router = Router();

router.post("/members", checkAuth(...Object.values(Role)), travelGroupController.addMember);
router.delete("/members", checkAuth(...Object.values(Role)), travelGroupController.removeMember);

export const travelGroupRouter = router;
