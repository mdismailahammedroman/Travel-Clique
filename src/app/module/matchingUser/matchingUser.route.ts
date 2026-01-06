import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { matchingUserController } from "./matchingUser.controller";

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(checkAuth(...Object.values(Role)));

// Match routes
router.post("/send", matchingUserController.sendMatch);
router.post("/respond", matchingUserController.respondMatch);
router.get("/sent", matchingUserController.getSentMatches);
router.get("/received", matchingUserController.getReceivedMatches);
router.get("/:id", matchingUserController.getMatchById);
router.delete("/:id/cancel", matchingUserController.cancelMatchRequest);
router.get("/stats", matchingUserController.getMatchStats);
router.get("/matched-users", matchingUserController.getMatchedUsers);

export const matchRouter = router;
