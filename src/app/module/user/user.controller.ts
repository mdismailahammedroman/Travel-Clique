/* eslint-disable @typescript-eslint/no-explicit-any */
import { userServices } from "./user.service";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { userFilterableFields } from "./user.constants";
import AppError from "../../errorHelpers/AppError";

const pick = (obj: Record<string, any>, keys: string[]) => {
  const result: Record<string, any> = {};
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

// =======================
// REGISTER USER
// =======================
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    profileImage: req.file?.path, // Cloudinary URL
  };
  const result = await userServices.createUser(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User created successfully!",
    data: result,
  });
});

// =======================
// GET CURRENT LOGGED-IN USER
// =======================
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await userServices.getCurrentUser({ id: user.id });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User fetched successfully!",
    data: result,
  });
});

// =======================
// GET ALL USERS (ADMIN)
// =======================
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query } as Record<string, any>;

  const filters = pick(query, userFilterableFields); // searching , filtering
  const options = pick(query, ["page", "limit", "sortBy", "sortOrder"]); // pagination and sorting

  const result = await userServices.getUsers(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users fetched successfully!",
    data: result,
  });
});
// =======================
// GET USER PROFILE BY ID
// =======================
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const targetUserId = req.params.id; // the user ID in the URL

  if (!targetUserId) {
    throw new AppError(400, "User ID is required");
  }
  const result = await userServices.getProfile(targetUserId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile fetched successfully!",
    data: result,
  });
});

// =======================
// UPDATE USER PROFILE
// =======================
const userUpdate = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params as JwtPayload;
  const body = req.body;

  const payload = {
    ...body,
    profileImage: req.file?.path, // if using file upload middleware
  };

  const result = await userServices.updateUser(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User updated successfully!",
    data: result,
  });
});

// =======================
// DELETE USER
// =======================
const userDelete = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params as JwtPayload;

  const result = await userServices.deleteUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User deleted successfully!",
    data: result,
  });
});

// BLOCK / UNBLOCK USER (Admin)
const blockUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { block } = req.body; // expects { block: true/false }

  const result = await userServices.blockUser(userId as string, block);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User ${block ? "blocked" : "unblocked"} successfully!`,
    data: result,
  });
});

// UPDATE USER ROLE (Admin)
const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const { role } = req.body; // expects { role: "USER" | "MODERATOR" | ... }

  const result = await userServices.updateUser(userId, { role });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User role updated successfully!",
    data: result,
  });
});

// =======================
// EXPORT ALL CONTROLLERS
// =======================
export const userControllers = {
  registerUser,
  getMe,
  getAllUsers,
  getProfile,
  userUpdate,
  userDelete,
  blockUser,
  updateUserRole,
};
