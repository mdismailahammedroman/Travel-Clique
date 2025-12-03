import crypto from "crypto";
import { prisma } from "../utils/prisma";
import AppError from "../errorHelpers/AppError";
import { redisClient } from "../config/redis.config";
import { sendEmail } from "../utils/sendEmail";






const OTP_EXPIRATION = 2 * 60 // 2minute

const generateOtp = (length = 6) => {
    //6 digit otp
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

    // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000

    return otp
}

const sendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(404, "User not found");

  if (user.isVerified) throw new AppError(400, "User is already verified");

  const otp = generateOtp();
  const redisKey = `otp:${email}`;

  // Store OTP in Redis for 2 minutes
  await redisClient.set(redisKey, otp, { EX: OTP_EXPIRATION });

  const html = `
    <h1>Your OTP Code</h1>
    <p>Hello ${user.name},</p>
    <p>Your OTP code is: <strong>${otp}</strong></p>
    <p>This code will expire in 2 minutes.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    html,
  });
};


const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(404, "User not found");

  const redisKey = `otp:${email}`;
  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp || savedOtp !== otp) {
    throw new AppError(401, "Invalid or expired OTP");
  }

  // Update user as verified
  await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,// adjust according to your enum
    },
  });

  await redisClient.del(redisKey);
  return true;
};



export const OTPService = {
    sendOTP,
    verifyOTP
}