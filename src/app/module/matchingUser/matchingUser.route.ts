import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { matchingUserController } from "./matchingUser.controller";

const router = Router();

// All routes require authentication
const auth = checkAuth(Role.USER);

/**
 * MATCH REQUEST ROUTES
 */

// Send match request
router.post("/", auth, matchingUserController.sendMatch);

// Get sent match requests
router.get("/sent", auth, matchingUserController.getSentMatches);

// Get received match requests
router.get("/received", auth, matchingUserController.getReceivedMatches);

// Get match statistics
router.get("/stats", auth, matchingUserController.getMatchStats);

// Get matched users (accepted connections)
router.get("/connections", auth, matchingUserController.getMatchedUsers);

// Get specific match by ID
router.get("/:id", auth, matchingUserController.getMatchById);

// Respond to match request (accept/decline)
router.patch("/:id/respond", auth, matchingUserController.respondMatch);

// Cancel match request
router.delete("/:id", auth, matchingUserController.cancelMatchRequest);

export const matchRoute = router;
