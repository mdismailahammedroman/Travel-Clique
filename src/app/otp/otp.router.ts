
import { Router } from "express";
import { otpController } from "./otp.controller";


const router=Router()
router.post("/sendotp", otpController.sendOtpHandler)
router.post("/verifyotp", otpController.verifyOtpHandler)

export const otpRoutes=router