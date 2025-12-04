import { Role } from "@prisma/client";
import { envVars } from "../config/envVars";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const seedSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: envVars.SUPER_ADMIN?.SUPER_ADMIN_EMAIL as string },
    });

    if (existingSuperAdmin) {
      console.log("Super Admin Already Exists!");
      return;
    }

    console.log("Trying to create Super Admin...");

   const hashedPassword = await bcrypt.hash(
  envVars.SUPER_ADMIN?.SUPER_ADMIN_PASSWORD as string,
  Number(envVars.SALT_ROUNDS)
);



    // Create Super Admin with Prisma
    const superAdmin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: envVars.SUPER_ADMIN?.SUPER_ADMIN_EMAIL as string,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        profile: {
          create: {
            fullName: "Super Admin",
            profileImage: envVars.SUPER_ADMIN?.SUPER_ADMIN_PROFILE_IMAGE || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log("Super Admin Created Successfully!\n");
    console.log(superAdmin);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};
export default seedSuperAdmin;