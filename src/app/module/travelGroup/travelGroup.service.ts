import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";
import { subscriptionService } from "../Subscription/subscription.service";

// DELETE
const deleteTravelGroup = async (id: string) => {
  return prisma.group.delete({ where: { id } });
};

const joinPlan = async (userId: string, planId: string) => {
  // 1. Check if plan exists
  const plan = await prisma.travelPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError(404, "Travel plan not found");

  // 2. Check for active subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      isActive: true,
      endDate: { gte: new Date() },
    },
  });

  // If no subscription → create Stripe checkout session
  if (!activeSubscription) {
    const session = await subscriptionService.createCheckoutSession({
      subscriptionType: "MONTHLY",
      userId,
    });

    return {
      message: "You need an active subscription to join this travel plan group",
      checkoutUrl: session.url as string,
      requiresSubscription: true,
    };
  }

  // 3. Find or create group for this travel plan
  let group = await prisma.group.findFirst({
    where: { name: `Plan-${planId}` },
    include: { members: true },
  });

  if (!group) {
    group = await prisma.group.create({
      data: {
        name: `Plan-${plan.id}`,
        description: plan.description,
        destination: plan.destination,
        createdBy: plan.userId,
        members: { create: [{ userId: plan.userId, role: "OWNER" }] },
      },
      include: { members: true },
    });
  }

  // 4. Check if user already joined
  const alreadyJoined = group.members.find((m) => m.userId === userId);
  if (alreadyJoined) throw new AppError(400, "You already joined this travel plan");

  // 5. Add user as MEMBER
  const member = await prisma.groupMember.create({
    data: { groupId: group.id, userId, role: "MEMBER" },
  });

  // 6. Return updated group
  const updatedGroup = await prisma.group.findUnique({
    where: { id: group.id },
    include: { members: { include: { user: true } } },
  });

  return {
    message: "Successfully joined the travel group",
    group: updatedGroup,
    requiresSubscription: false,
    newMember: member,
  };
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

  deleteTravelGroup,
  joinPlan,
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
