/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import AppError from "../../errorHelpers/AppError";
import { OTPService } from "../../otp/otp.service";
import {
  createUserInput,
  updateProfileInput,
  updateUserInput,
} from "./user.interface";
import { IOptions } from "../../helpers/paginationHelper";

// CREATE USER
const createUser = async (data: createUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) throw new AppError(400, "Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || "USER",
      isVerified: false,
      profile: {
        create: {
          fullName: data.fullName || data.name,
          profileImage: data.profileImage || null,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      profile: true,
    },
  });

  await OTPService.sendOTP(data.email);

  return user;
};

// GET ALL USERS (ADMIN)
const getUsers = async (options: IOptions, filters: any) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.startDateTime)
    where.createdAt = { gte: new Date(filters.startDateTime) };
  if (filters.endDateTime)
    where.createdAt = {
      ...where.createdAt,
      lte: new Date(filters.endDateTime),
    };

  if (filters.searchTerm) {
    where.OR = [
      { name: { contains: filters.searchTerm, mode: "insensitive" } },
      { email: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }

  const total = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    include: { profile: true },
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: options.sortOrder || "desc" }
      : { createdAt: "desc" },
  });

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

// GET USER BY ID
const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
};

// UPDATE USER
function removeUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

const updateUser = async (id: string, data: updateUserInput) => {
  const profileData = removeUndefined({
    fullName: data.fullName ?? data.name ?? null,
    bio: data.bio ?? null,
    currentLocation: data.currentLocation ?? null,
    profileImage: data.profileImage ?? null,
  });

  const userData = removeUndefined({
    name: data.name,
  });

  return prisma.user.update({
    where: { id },
    data: {
      ...userData,
      profile: {
        update: profileData,
      },
    },
    include: { profile: true },
  });
};

// DELETE USER
const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};

// BLOCK / UNBLOCK USER
const blockUser = async (id: string, block: boolean) => {
  return prisma.user.update({
    where: { id },
    data: { isBlocked: block },
  });
};

// GET CURRENT USER
const getCurrentUser = async (payload: { id: string }) => {
  return prisma.user.findUnique({
    where: { id: payload.id },
    include: { profile: true },
  });
};

export const userServices = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  getCurrentUser,
};
