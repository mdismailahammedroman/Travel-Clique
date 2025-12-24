import crypto from "crypto";
import { prisma } from "../utils/prisma";
import AppError from "../errorHelpers/AppError";
import { redisClient } from "../config/redis.config";
import { sendEmail } from "../utils/sendEmail";

const OTP_EXPIRATION = 2 * 60; // 2 minutes

const generateOtp = (length = 6) => {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
};

const sendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new AppError(404, "User not found");
  if (user.isVerified) throw new AppError(400, "User already verified");

  const otp = generateOtp();
  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, { EX: OTP_EXPIRATION });

  const html = `
    <h1>Email Verification</h1>
    <p>Hello ${user.fullName},</p>
    <p>Your OTP code is: <strong>${otp}</strong></p>
    <p>This code will expire in 2 minutes.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    html,
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const redisKey = `otp:${email}`;
  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp || savedOtp !== otp) {
    throw new AppError(401, "Invalid or expired OTP");
  }

  await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });

  await redisClient.del(redisKey);
};

export const OTPService = { sendOTP, verifyOTP };
