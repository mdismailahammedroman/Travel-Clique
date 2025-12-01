
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma"
import status from "http-status"
import bcrypt from "bcryptjs"
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/envVars";


const loginUser=async(payload: { email: string, password: string })=>{
    const user= await prisma.user.findFirstOrThrow({
    where: {
      email:payload.email,
    },
  });

  // Check password
  const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
  if (!isCorrectPassword) {
throw new AppError(status.UNAUTHORIZED, "Password is incorrect"); 
  }


  // Generate tokens
  const accessToken = generateToken(
    { email: user.email, role: user.role },
    envVars.JWT_SECRET,
    envVars.JWT_EXPIRES_ID
  );

  const refreshToken = generateToken(
    { email: user.email, role: user.role },
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_EXPIRES_ID,
  );

  // Return user info along with tokens
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,

    },

  };
};
export const authServices={
    loginUser,
}