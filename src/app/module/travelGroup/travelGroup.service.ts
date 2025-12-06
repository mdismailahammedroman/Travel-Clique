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
  return prisma.groupMember.create({
    data: { groupId, userId },
  });
};

// REMOVE MEMBER
const removeGroupMember = async (groupId: string, userId: string) => {
  return prisma.groupMember.deleteMany({
    where: { groupId, userId },
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
