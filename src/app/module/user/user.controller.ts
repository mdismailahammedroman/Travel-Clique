import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import STATUS_CODES from "http-status";
import { userService } from "./user.service";
import pick from "../../helpers/pick";

// CREATE USER
const createUser = catchAsync(async (req: Request, res: Response) => {
  if (req.file) req.body.profileImage = req.file.path || req.file.filename;

  const result = await userService.createUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "User created successfully",
    data: result,
  });
});

// GET ALL USERS (ADMIN)
const getUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, ["startDateTime", "endDateTime"]);

  const users = await userService.getUsers(options, filters);

  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Users fetched successfully",
    data: users.data,
    meta:users.meta
  });
});


// GET SINGLE USER
const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "User fetched successfully",
    data: user,
  });
});

// UPDATE USER
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; // ID from JWT token
  if (!userId) throw new Error("User not found in request");

  // Handle uploaded profile image
  if (req.file) req.body.profileImage = req.file.path || req.file.filename;

  const updatedUser = await userService.updateUser(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// UPDATE USER ROLE (Admin only)
const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const updatedUser = await userService.updateUserRole(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "User role updated successfully",
    data: updatedUser,
  });
});

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  // req.user is set by checkAuth middleware
  if (!req.user?.id) {
    throw new Error("User ID not found in request");
  }

  const user = await userService.getCurrentUser(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Current user fetched successfully",
    data: user,
  });
});

// DELETE USER
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "User deleted successfully",
  });
});

// BLOCK/UNBLOCK USER
const blockUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.blockUser(req.params.id, req.body.block);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: `User ${req.body.block ? "blocked" : "unblocked"} successfully`,
    data: user,
  });
});

export const userController = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  updateUserRole,
  getCurrentUser
};
