import { envVars } from "../../config/envVars";
import { prisma } from "../../utils/prisma";
import bcrypt from "bcryptjs";
import { createUserInput } from "./user.interface";




const createUser = async (data: createUserInput) => {
  const hashedPassword = await bcrypt.hash(data.password, Number(envVars.SALT_ROUNDS));

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      profile: {
        create: {
          fullName: data.fullName || data.name,
          profileImage: data.profileImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return user;
};

// const getusers=()=>{}


// const  getSingleUser=()=>{

// }
// const updateUser=()=>{

// }
// const deleteUser=()=>{}

export const userService ={
    createUser,
    // getusers,
    // getSingleUser,
    // updateUser,
    // deleteUser,

}