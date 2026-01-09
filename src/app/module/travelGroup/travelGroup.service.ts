/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/group/group.service.ts

import { GroupRole } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";

export interface CreateGroupInput {
  name: string;
  description?: string;
  destination: string;
  coverImage?: string;
  maxMembers?: number;
  createdById: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  destination?: string;
  coverImage?: string;
  maxMembers?: number;
  isActive?: boolean;
}

export interface GroupFilters {
  destination?: string; // Optional property for destination
  isActive?: boolean; // Optional property for isActive (can be true, false, or undefined)
  searchTerm?: string; // Optional property for searchTerm
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * CREATE GROUP
 */

const createGroup = async (data: CreateGroupInput) => {
  // Ensure coverImage is defined or set a default value if undefined
  const coverImage = data.coverImage ?? ""; // Default to empty string if undefined

  // Handle undefined description by defaulting it to null
  const description = data.description ?? null; // Set description to null if undefined

  const group = await prisma.group.create({
    data: {
      name: data.name,
      description: description, // Now it's guaranteed to be string | null, not undefined
      destination: data.destination,
      coverImage: coverImage, // Now it's guaranteed to be a string
      maxMembers: data.maxMembers || 10,
      createdBy: data.createdById, // Correct the field name here
      members: {
        create: {
          userId: data.createdById,
          role: GroupRole.OWNER,
        },
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  fullName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  return group;
};

/**
 * GET GROUP BY ID
 */
const getGroupById = async (groupId: string) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              fullName: true,
              profileImage: true,
            },
          },
          subscriptions: {
            where: { isActive: true },
            select: { verifiedBadge: true },
          },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  fullName: true,
                  profileImage: true,
                  currentLocation: true,
                },
              },
              subscriptions: {
                where: { isActive: true },
                select: { verifiedBadge: true },
              },
            },
          },
        },
        orderBy: [
          { role: "asc" }, // OWNER first, then MODERATOR, then MEMBER
          { joinedAt: "asc" },
        ],
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!group) {
    throw new AppError(404, "Group not found");
  }

  return group;
};

/**
 * UPDATE GROUP
 */
const updateGroup = async (
  groupId: string,
  userId: string,
  data: UpdateGroupInput
) => {
  // Check if the user is the owner or a moderator
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      role: { in: [GroupRole.OWNER, GroupRole.MODERATOR] },
    },
  });

  if (!member) {
    throw new AppError(
      403,
      "Only group owner or moderator can update the group"
    );
  }

  // Update the group
  const group = await prisma.group.update({
    where: { id: groupId },
    data,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  return group;
};

/**
 * DELETE GROUP
 */
const deleteGroup = async (groupId: string, userId: string) => {
  // Check if the group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError(404, "Group not found");
  }

  // Check if the user is the owner of the group
  if (group.createdBy !== userId) {
    // Accessing 'createdBy' instead of 'createdById'
    throw new AppError(403, "Only group owner can delete the group");
  }

  // Delete the group
  await prisma.group.delete({
    where: { id: groupId },
  });

  return { message: "Group deleted successfully" };
};

/**
 * SEARCH GROUPS
 */
const searchGroups = async (
  filters: GroupFilters,
  options: PaginationOptions
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;

  const where: any = {
    isActive: filters.isActive !== undefined ? filters.isActive : true, // Default to true if isActive is undefined
  };

  if (filters.destination) {
    where.destination = {
      contains: filters.destination,
      mode: "insensitive", // Case insensitive search
    };
  }

  if (filters.searchTerm) {
    where.OR = [
      { name: { contains: filters.searchTerm, mode: "insensitive" } },
      { description: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    }),
    prisma.group.count({ where }),
  ]);

  return {
    data: groups,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * JOIN GROUP
 */

const joinGroup = async (groupId: string, userId: string) => {
  // Check if the group exists and include the members count and maxMembers
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      description: true,
      destination: true,
      createdBy: true,
      createdAt: true,
      maxMembers: true, // Select maxMembers here
      _count: {
        select: {
          members: true, // Get the number of members in the group
        },
      },
    },
  });

  if (!group) {
    throw new AppError(404, "Group not found");
  }

  // Check if the group is active by looking up the related TravelPlan
  const travelPlan = await prisma.travelPlan.findFirst({
    where: {
      groupId: groupId, // Correctly filter by groupId
    },
  });

  if (!travelPlan || !travelPlan.isActive) {
    throw new AppError(400, "Group is not active");
  }

  // Check if the user is already a member of the group
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (existingMember) {
    throw new AppError(400, "Already a member of this group");
  }

  // Check if the group is full
  if (group.maxMembers !== null && group._count.members >= group.maxMembers) {
    throw new AppError(400, "Group is full");
  }

  // Add member to the group
  const member = await prisma.groupMember.create({
    data: {
      groupId,
      userId,
      role: GroupRole.MEMBER,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  return member;
};

/**
 * LEAVE GROUP
 */
const leaveGroup = async (groupId: string, userId: string) => {
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError(404, "Not a member of this group");
  }

  // Owner cannot leave, must transfer ownership or delete group
  if (member.role === GroupRole.OWNER) {
    throw new AppError(
      400,
      "Owner cannot leave group. Transfer ownership or delete group."
    );
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  return { message: "Left group successfully" };
};

/**
 * REMOVE MEMBER
 */
const removeMember = async (
  groupId: string,
  targetUserId: string,
  requestingUserId: string
) => {
  // Check if requesting user is owner or moderator
  const requestingMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: requestingUserId,
      role: { in: [GroupRole.OWNER, GroupRole.MODERATOR] },
    },
  });

  if (!requestingMember) {
    throw new AppError(403, "Only owner or moderator can remove members");
  }

  // Check target member
  const targetMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId,
      },
    },
  });

  if (!targetMember) {
    throw new AppError(404, "Member not found");
  }

  // Cannot remove owner
  if (targetMember.role === GroupRole.OWNER) {
    throw new AppError(400, "Cannot remove group owner");
  }

  // Moderator cannot remove another moderator
  if (
    requestingMember.role === GroupRole.MODERATOR &&
    targetMember.role === GroupRole.MODERATOR
  ) {
    throw new AppError(403, "Moderator cannot remove another moderator");
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId,
      },
    },
  });

  return { message: "Member removed successfully" };
};

/**
 * UPDATE MEMBER ROLE
 */
const updateMemberRole = async (
  groupId: string,
  targetUserId: string,
  newRole: GroupRole,
  requestingUserId: string
) => {
  // Only owner can change roles
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError(404, "Group not found");
  }

  // Use createdBy instead of createdById
  if (group.createdBy !== requestingUserId) {
    throw new AppError(403, "Only group owner can change member roles");
  }

  // Cannot change own role
  if (targetUserId === requestingUserId) {
    throw new AppError(400, "Cannot change your own role");
  }

  // Cannot assign OWNER role (must transfer ownership)
  if (newRole === GroupRole.OWNER) {
    throw new AppError(
      400,
      "Use transfer ownership endpoint to assign owner role"
    );
  }

  const member = await prisma.groupMember.update({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId,
      },
    },
    data: { role: newRole },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return member;
};

/**
 * TRANSFER OWNERSHIP
 */
const transferOwnership = async (
  groupId: string,
  newOwnerId: string,
  currentOwnerId: string
) => {
  // Verify current owner
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError(404, "Group not found");
  }

  if (group.createdBy !== currentOwnerId) {
    throw new AppError(403, "Only current owner can transfer ownership");
  }

  // Check if new owner is a member
  const newOwnerMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: newOwnerId,
      },
    },
  });

  if (!newOwnerMember) {
    throw new AppError(404, "New owner must be a member of the group");
  }

  // Transfer ownership
  await prisma.$transaction([
    // Update current owner to moderator
    prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: currentOwnerId,
        },
      },
      data: { role: GroupRole.MODERATOR },
    }),
    // Update new owner
    prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: newOwnerId,
        },
      },
      data: { role: GroupRole.OWNER },
    }),
    // Update group creator
    prisma.group.update({
      where: { id: groupId },
      data: { createdBy: newOwnerId },
    }),
  ]);

  return { message: "Ownership transferred successfully" };
};

/**
 * GET MY GROUPS
 */
const getMyGroups = async (userId: string, options: PaginationOptions) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const [groups, total] = await Promise.all([
    prisma.groupMember.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        group: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.groupMember.count({ where: { userId } }),
  ]);

  return {
    data: groups.map((gm) => ({
      ...gm.group,
      myRole: gm.role,
      joinedAt: gm.joinedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * GET GROUP MEMBERS
 */
const getGroupMembers = async (groupId: string, options: PaginationOptions) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
                currentLocation: true,
              },
            },
            subscriptions: {
              where: { isActive: true },
              select: { verifiedBadge: true },
            },
          },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    }),
    prisma.groupMember.count({ where: { groupId } }),
  ]);

  return {
    data: members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const groupService = {
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  searchGroups,
  joinGroup,
  leaveGroup,
  removeMember,
  updateMemberRole,
  transferOwnership,
  getMyGroups,
  getGroupMembers,
};
