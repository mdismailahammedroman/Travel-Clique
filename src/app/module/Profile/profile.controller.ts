// src/modules/profile/profile.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import STATUS_CODES from "http-status";
import { profileService } from "./profile.service";
import AppError from "../../errorHelpers/AppError";
import { IJWTPayload } from "../../helpers/payload";


// GET PROFILE
const getProfile = catchAsync(async (req: Request, res: Response) => {
 
    
    if (!req.user) {
      throw new AppError(403, "User not authenticated");
    }
    const userId =  req.user ;
  const profile = await profileService.getProfileByUserId(userId as IJWTPayload);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Profile fetched successfully",
    data: profile,
  });
});

// UPDATE PROFILE
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user;
  const updatedProfile = await profileService.updateProfile(userId as IJWTPayload, req.body);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Profile updated successfully",
    data: updatedProfile,
  });
});

// ADD INTEREST
const addTravelInterest = catchAsync(async (req: Request, res: Response) => {
  const profileId = req.params.profileId;
  const interest = req.body.interest;
  const result = await profileService.addTravelInterest(profileId, interest);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "Interest added successfully",
    data: result,
  });
});

// REMOVE INTEREST
const removeTravelInterest = catchAsync(async (req: Request, res: Response) => {
  const interestId = req.params.interestId;
  const result = await profileService.removeTravelInterest(interestId);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Interest removed successfully",
    data: result,
  });
});

// ADD VISITED COUNTRY
const addVisitedCountry = catchAsync(async (req: Request, res: Response) => {
  const profileId = req.params.profileId;
  const country = req.body.country;
    console.log("Adding country", profileId, country); 
  const result = await profileService.addVisitedCountry(profileId, country);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "Visited country added successfully",
    data: result,
  });
});

// REMOVE VISITED COUNTRY
const removeVisitedCountry = catchAsync(async (req: Request, res: Response) => {
  const countryId = req.params.countryId;
  const result = await profileService.removeVisitedCountry(countryId);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Visited country removed successfully",
    data: result,
  });
});

export const profileController = {
  getProfile,
  updateProfile,
  addTravelInterest,
  removeTravelInterest,
  addVisitedCountry,
  removeVisitedCountry,
};
