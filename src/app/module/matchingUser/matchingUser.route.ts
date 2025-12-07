import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { matchingUserController } from "./matchingUser.controller";

const router = Router();

router.post("/", checkAuth(...Object.values(Role)), matchingUserController.sendMatch);
router.patch(
  "/",
  checkAuth(...Object.values(Role)),
  matchingUserController.updateMatchStatus
);
// router.get("/sent/:userId", checkAuth(...Object.values(Role)), matchingUserController.getSentMatches);
// router.get("/received/:userId", checkAuth(...Object.values(Role)), matchingUserController.getReceivedMatches);

export const matchRouter = router;
