// src/modules/profile/profile.service.ts
import { IJWTPayload } from "../../helpers/payload";
import { prisma } from "../../utils/prisma";
import {  updateProfileInput } from "./profile.interface";

// GET PROFILE BY USER ID
const getProfileByUserId = async (payload: IJWTPayload) => {
  return prisma.profile.findUnique({
    where: { userId: payload.id },
    include: {
      travelInterests: true,
      visitedCountries: true,
      user: true,
    },
  });
};

// UPDATE PROFILE
const updateProfile = async (payload: IJWTPayload, data: updateProfileInput) => {
  const { travelInterests, visitedCountries, ...profileData } = data;

  // Update main profile
  const updatedProfile = await prisma.profile.update({
    where: { userId:payload.id },
    data: profileData,
  });

  // Update travel interests
  if (travelInterests) {
    // Delete old and insert new
    await prisma.travelInterest.deleteMany({ where: { profileId: updatedProfile.id } });
    const interests = travelInterests.map((interest) => ({
      profileId: updatedProfile.id,
      interest,
    }));
    await prisma.travelInterest.createMany({ data: interests });
  }

  // Update visited countries
  if (visitedCountries) {
    await prisma.visitedCountry.deleteMany({ where: { profileId: updatedProfile.id } });
    const countries = visitedCountries.map((country) => ({
      profileId: updatedProfile.id,
      country,
    }));
    await prisma.visitedCountry.createMany({ data: countries });
  }

  return updatedProfile;
};

// ADD SINGLE INTEREST
const addTravelInterest = async (profileId: string, interest: string) => {
  // Check if profile exists
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) {
    throw new Error("Profile not found for this ID");
  }

  return prisma.travelInterest.create({
    data: { profileId, interest },
  });
};


// REMOVE SINGLE INTEREST
const removeTravelInterest = async (interestId: string) => {
  return prisma.travelInterest.delete({ where: { id: interestId } });
};

// ADD VISITED COUNTRY
const addVisitedCountry = async (profileId: string, country: string) => {
   
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) throw new Error("Profile not found");

  return prisma.visitedCountry.create({
    data: { profileId, country },
  });
};


// REMOVE VISITED COUNTRY
const removeVisitedCountry = async (countryId: string) => {
  return prisma.visitedCountry.delete({ where: { id: countryId } });
};

export const profileService = {
  getProfileByUserId,
  updateProfile,
  addTravelInterest,
  removeTravelInterest,
  addVisitedCountry,
  removeVisitedCountry,
};
