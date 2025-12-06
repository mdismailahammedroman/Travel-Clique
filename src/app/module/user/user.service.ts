/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../utils/prisma";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/envVars";
import { createUserInput, updateUserInput } from "./user.interface";
import { IOptions } from "../../helpers/paginationHelper";
import { IJWTPayload } from "../../helpers/payload";

// CREATE USER
const createUser = async (data: createUserInput) => {
  const hashedPassword = await bcrypt.hash(data.password, Number(envVars.SALT_ROUNDS));

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || "USER",
      profile: {
        create: {
          fullName: data.fullName || data.name,
          profileImage: data.profileImage,
        },
      },
    },
    include: { profile: true },
  });

  return user;
};

// GET ALL USERS (ADMIN)
const getUsers = async (options: IOptions, filters: any) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

 const where: any = {};

// Example generic filter
if (filters.startDateTime) where.createdAt = { gte: new Date(filters.startDateTime) };
if (filters.endDateTime) where.createdAt = { ...where.createdAt, lte: new Date(filters.endDateTime) };

// Add searchTerm functionality (e.g., by name or email)
if (filters.searchTerm) {
  where.OR = [
    { name: { contains: filters.searchTerm, mode: "insensitive" } },
    { email: { contains: filters.searchTerm, mode: "insensitive" } },
  ];
}
  // Count total users for pagination
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
    total,                      // total matching records
    page,                       // current page
    limit,                      // limit per page
    totalPage: Math.ceil(total / limit), // total pages
  },
};

};



// GET SINGLE USER BY ID
const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
};

// UPDATE USER
const updateUser = async (id: string, data: updateUserInput) => {
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      profile: {
        update: {
          fullName: data.fullName,
          bio: data.bio,
          currentLocation: data.currentLocation,
          profileImage: data.profileImage,
        },
      },
    },
    include: { profile: true },
  });
};



// updateUserRole
const updateUserRole = async (id: string, data: updateUserInput) => {
  return prisma.user.update({
    where: { id },
    data: { role: data.role },
  });
};

// Service
const getCurrentUser = async (payload: IJWTPayload) => {
 const user = await prisma.user.findUnique({
  where: { id: payload.id },
  include: { profile: true },
});

  return user;
};


// DELETE USER
const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};

// BLOCK/UNBLOCK USER (Admin)
const blockUser = async (id: string, block: boolean) => {
  return prisma.user.update({
    where: { id },
    data: { isVerified: !block }, // example logic
  });
};

export const userService = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  updateUserRole,
  getCurrentUser
};
