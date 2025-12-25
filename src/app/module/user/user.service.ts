/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import AppError from "../../errorHelpers/AppError";
import { OTPService } from "../../otp/otp.service";
import { createUserInput, updateUserInput } from "./user.interface";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";
import { userSearchableFields } from "./user.constants";

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

export interface UserFilters {
  searchTerm?: string;
  role?: string;
  isVerified?: string;
  isBlocked?: string;
}

const getUsers = async (filters: UserFilters, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  // SEARCH
  if (searchTerm) {
    andConditions.push({
      OR: [
        { email: { contains: searchTerm, mode: "insensitive" } },
        { name: { contains: searchTerm, mode: "insensitive" } },
        {
          profile: { fullName: { contains: searchTerm, mode: "insensitive" } },
        },
      ],
    });
  }

  // FILTERS
  Object.keys(filterData).forEach((key) => {
    const value = (filterData as any)[key];
    if (value !== undefined) {
      if (key === "isVerified" || key === "isBlocked") {
        andConditions.push({ [key]: value === "true" });
      } else {
        andConditions.push({ [key]: value });
      }
    }
  });

  const where: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            profileImage: true,
            bio: true,
            currentLocation: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// GET USER BY ID
const getProfile = async (targetUserId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
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
  getProfile,
  updateUser,
  deleteUser,
  blockUser,
  getCurrentUser,
};
