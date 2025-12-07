// src/modules/profile/profile.routes.ts
import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { profileController } from "./profile.controller";

const router = Router();

router.get("/:userId", checkAuth(...Object.values(Role)), profileController.getProfile);
router.patch("/update", checkAuth(...Object.values(Role)), profileController.updateProfile);

router.post("/interests/:profileId", checkAuth(...Object.values(Role)), profileController.addTravelInterest);
router.delete("/interests/:interestId", checkAuth(...Object.values(Role)), profileController.removeTravelInterest);

router.post("/visited-countries/:profileId", checkAuth(...Object.values(Role)), profileController.addVisitedCountry);
router.delete("/visited-countries/:countryId", checkAuth(...Object.values(Role)), profileController.removeVisitedCountry);

export const profileRouter = router;
