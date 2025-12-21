/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";

const createGroup = async (creatorId: string, payload: any) => {
  const { name, destination, startDate, endDate, isPaidGroup, planId } =
    payload;

  const data: any = {
    name,
    destination,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isPaidGroup: Boolean(isPaidGroup),
    creator: { connect: { id: creatorId } }, // proper relation
  };

  // If group is created from a travel plan → connect plan
  if (planId) {
    data.travelPlan = { connect: { id: planId } };
  }

  const group = await prisma.travelGroup.create({
    data,
  });

  return group;
};

const getGroups = async () => {
  return prisma.travelGroup.findMany({
    include: {
      creator: { include: { profile: true } },
      members: { include: { user: true } },
      travelPlan: true,
    },
  });
};

const getGroupById = async (groupId: string) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      creator: true,
      members: { include: { user: true } },
      travelPlan: true,
    },
  });

  if (!group) throw new AppError(404, "Group not found");

  return group;
};

const leaveGroup = async (userId: string, groupId: string) => {
  const exists = await prisma.groupMember.findFirst({
    where: { userId, groupId },
  });

  if (!exists) throw new AppError(400, "You are not a member of this group");

  await prisma.groupMember.delete({
    where: { id: exists.id },
  });

  return { message: "Left group successfully" };
};

const getGroupMembers = async (groupId: string) => {
  return prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: { include: { profile: true } },
    },
  });
};

export const travelGroupService = {
  createGroup,
  getGroups,
  getGroupById,
  leaveGroup,
  getGroupMembers,
};
