import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";
import { createTravelGroupInput, updateTravelGroupInput } from "./travelGroup.interface";

// CREATE
const createTravelGroup = async (creatorId: string, data: createTravelGroupInput) => {
  return prisma.travelGroup.create({
    data: {
      creatorId,
      name: data.name,
      destination: data.destination,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isPaidGroup: data.isPaidGroup ?? true,
    },
  });
};

// GET ALL
const getTravelGroups = async () => {
  return prisma.travelGroup.findMany({
    include: { members: { include: { user: true } }, travelPlan: true },
  });
};

// GET SINGLE
const getTravelGroupById = async (id: string) => {
  return prisma.travelGroup.findUnique({
    where: { id },
    include: { members: { include: { user: true } }, travelPlan: true },
  });
};

// UPDATE
const updateTravelGroup = async (id: string, data: updateTravelGroupInput) => {
  return prisma.travelGroup.update({
    where: { id },
    data: {
      name: data.name,
      destination: data.destination,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      isPaidGroup: data.isPaidGroup,
    },
  });
};

// DELETE
const deleteTravelGroup = async (id: string) => {
  return prisma.travelGroup.delete({ where: { id } });
};

// ADD MEMBER
const addGroupMember = async (groupId: string, userId: string) => {
  // Check if group exists
  const group = await prisma.travelGroup.findUnique({ where: { id: groupId } });
  if (!group) {
    throw new AppError(404, "Travel group not found");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Check if user is already a member
  const existingMember = await prisma.groupMember.findFirst({
    where: { groupId, userId },
  });
  if (existingMember) {
    throw new AppError(400, "User is already a member of this group");
  }

  // Add member
  return prisma.groupMember.create({
    data: { groupId, userId },
  });
};

// REMOVE MEMBER
const removeGroupMember = async (groupId: string, userId: string) => {
  const member = await prisma.groupMember.findFirst({
    where: { groupId, userId },
  });

  if (!member) {
    throw new AppError(404, "Member not found in this group");
  }

  return prisma.groupMember.delete({
    where: { id: member.id },
  });
};



export const travelGroupService = {
  createTravelGroup,
  getTravelGroups,
  getTravelGroupById,
  updateTravelGroup,
  deleteTravelGroup,
  addGroupMember,
  removeGroupMember,
};


// //{
//   "name": "Summer Adventure 2026",
//   "creatorId": "cmiuic35h000390uwfgemendy", 
//   "destination": "Italy",
//   "startDate": "2026-06-15T00:00:00.000Z",
//   "endDate": "2026-06-25T00:00:00.000Z",
//   "isPaidGroup": true
// }
