/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma";
import status from "http-status";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/envVars";
import { sendEmail } from "../../utils/sendEmail";
import { generateOtp } from "../../otp/otp.service";

// LOGIN
const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found with this email");
  }

  if (!user.isVerified) {
    throw new AppError(status.FORBIDDEN, "Account is not verified");
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isCorrectPassword) {
    throw new AppError(status.UNAUTHORIZED, "Password is incorrect!");
  }

  const tokenPayload = { id: user.id, role: user.role };
  const accessToken = generateToken(
    tokenPayload,
    envVars.JWT_SECRET,
    envVars.JWT_EXPIRES_IN
  );
  const refreshToken = generateToken(
    tokenPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES_IN
  );

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

// REFRESH TOKEN
const refreshTokenService = async (token: string) => {
  if (!token) throw new AppError(status.UNAUTHORIZED, "No token provided");

  let decoded: any;

  try {
    decoded = verifyToken(token, envVars.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const newAccessToken = generateToken(
    { id: decoded.id, email: decoded.email, role: decoded.role },
    envVars.JWT_SECRET,
    envVars.JWT_EXPIRES_IN
  );

  return { accessToken: newAccessToken };
};

// FORGOT PASSWORD
const forgotPassword = async ({ email }: { email: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");

  const otp = generateOtp();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationOtp: otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendEmail({
    to: email,
    subject: "Reset Password OTP",
    html: `<p>Your OTP is <strong>${otp}</strong></p>`,
  });

  return { message: "Reset OTP sent to email" };
};

// RESET PASSWORD
const resetPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) throw new AppError(status.NOT_FOUND, "User not found");
  if (user.verificationOtp !== payload.otp)
    throw new AppError(status.BAD_REQUEST, "Invalid OTP");

  const hashed = await bcrypt.hash(payload.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      verificationOtp: null,
      otpExpiresAt: null,
    },
  });

  return { message: "Password changed successfully" };
};

export const authServices = {
  loginUser,
  refreshTokenService,
  forgotPassword,
  resetPassword,
};
