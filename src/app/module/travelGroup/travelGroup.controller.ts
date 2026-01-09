import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { GroupRole } from "@prisma/client";
import { GroupFilters, groupService } from "./travelGroup.service";

/**
 * CREATE GROUP
 */
const createGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const group = await groupService.createGroup({
    ...req.body,
    createdById: userId.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Group created successfully",
    data: group,
  });
});

/**
 * GET GROUP BY ID
 */
const getGroupById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  const group = await groupService.getGroupById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Group fetched successfully",
    data: group,
  });
});

/**
 * UPDATE GROUP
 */
const updateGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id } = req.params; // Extract groupId from params

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }

  const data = req.body; // The data to update the group

  // Call the service function with groupId, userId, and data
  const group = await groupService.updateGroup(id, userId.id, data);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Group updated successfully",
    data: group,
  });
});

/**
 * DELETE GROUP
 */
const deleteGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id } = req.params;
  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  const result = await groupService.deleteGroup(id, userId.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

/**
 * SEARCH GROUPS
 */
const searchGroups = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder, destination, isActive, searchTerm } =
    req.query;

  const filters: GroupFilters = {};

  if (typeof destination === "string") {
    filters.destination = destination;
  }

  if (typeof isActive === "string") {
    filters.isActive = isActive === "true";
  }

  if (typeof searchTerm === "string") {
    filters.searchTerm = searchTerm;
  }

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as "asc" | "desc") || "desc",
  };

  const result = await groupService.searchGroups(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Groups fetched successfully",
    data: result,
  });
});

/**
 * JOIN GROUP
 */
const joinGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id } = req.params;

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  const member = await groupService.joinGroup(id, userId.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Joined group successfully",
    data: member,
  });
});

/**
 * LEAVE GROUP
 */
const leaveGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id } = req.params;

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  const result = await groupService.leaveGroup(id, userId.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

/**
 * REMOVE MEMBER
 */
const removeMember = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id, memberId } = req.params;

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  if (!memberId) {
    throw new AppError(400, "Group ID is required");
  }
  const result = await groupService.removeMember(id, memberId, userId.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

/**
 * UPDATE MEMBER ROLE
 */
const updateMemberRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id, memberId } = req.params;
  const { role } = req.body;

  if (!["MEMBER", "MODERATOR"].includes(role)) {
    throw new AppError(400, "Invalid role. Must be MEMBER or MODERATOR");
  }

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  if (!memberId) {
    throw new AppError(400, "Group ID is required");
  }
  const member = await groupService.updateMemberRole(
    id,
    memberId,
    role as GroupRole,
    userId.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Member role updated successfully",
    data: member,
  });
});

/**
 * TRANSFER OWNERSHIP
 */
const transferOwnership = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { id } = req.params;
  const { newOwnerId } = req.body;

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  const result = await groupService.transferOwnership(
    id,
    newOwnerId,
    userId.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

/**
 * GET MY GROUPS
 */
const getMyGroups = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as JwtPayload;
  if (!userId) throw new AppError(401, "User not authenticated");

  const { page, limit } = req.query;

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  };

  const result = await groupService.getMyGroups(userId.id, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your groups fetched successfully",
    data: result,
  });
});

/**
 * GET GROUP MEMBERS
 */
const getGroupMembers = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page, limit } = req.query;

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  };

  if (!id) {
    throw new AppError(400, "Group ID is required");
  }
  const result = await groupService.getGroupMembers(id, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Group members fetched successfully",
    data: result,
  });
});

export const groupController = {
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
