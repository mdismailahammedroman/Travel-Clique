import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { authServices } from "./auth.services";

const isProd = process.env.NODE_ENV === "production";

// LOGIN
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);

  const { accessToken, refreshToken, user } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Logged in successfully",
    data: { user },
  });
});

// REFRESH TOKEN
const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;

  const result = await authServices.refreshTokenService(token);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    data: null,
    message: "Access token refreshed",
  });
});

// FORGOT PASSWORD
const forgotPassword = catchAsync(async (req, res) => {
  const result = await authServices.forgotPassword(req.body);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "OTP sent to email",
    data: result,
  });
});

// RESET PASSWORD
const resetPassword = catchAsync(async (req, res) => {
  const result = await authServices.resetPassword(req.body);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Password changed",
    data: result,
  });
});

// LOGOUT
const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    data: null,
    message: "Logged out successfully",
  });
});

export const authController = {
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
};
