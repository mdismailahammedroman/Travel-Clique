import { prisma } from "../../utils/prisma";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/envVars";
import { createUserInput, updateUserInput } from "./user.interface";

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
const getUsers = async () => {
  return prisma.user.findMany({
    include: { profile: true },
  });
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

const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }, // include profile info
  });

  if (!user) {
    throw new Error("User not found");
  }

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
