import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { reviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";

/**
 * CREATE REVIEW
 */
const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  if (!user?.id) throw new AppError(401, "User not authenticated");

  const reviewerId = user.id;
  const { reviewedId, rating, comment } = req.body;

  if (!reviewedId) throw new AppError(400, "Reviewed user ID is required");

  const result = await reviewService.createReview({
    reviewerId,
    reviewedId,
    rating,
    comment,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully",
    data: result,
  });
});

/**
 * UPDATE REVIEW
 */
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  if (!user?.id) throw new AppError(401, "User not authenticated");
  const reviewerId = user.id;

  const { id } = req.params;
  if (!id) throw new AppError(400, "Review ID is required");

  const { rating, comment } = req.body;

  const result = await reviewService.updateReview(id, reviewerId, {
    rating,
    comment,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

/**
 * DELETE REVIEW
 */
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  if (!user?.id) throw new AppError(401, "User not authenticated");
  const reviewerId = user.id;

  const { id } = req.params;
  if (!id) throw new AppError(400, "Review ID is required");

  const result = await reviewService.deleteReview(id, reviewerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

/**
 * GET REVIEWS FOR SPECIFIC USER
 */
const getUserReviews = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) throw new AppError(400, "User ID is required");

  const { page, limit, sortBy, sortOrder } = req.query;
  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as "asc" | "desc") || "desc",
  };

  const result = await reviewService.getUserReviews(userId, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User reviews fetched successfully",
    data: result,
  });
});

/**
 * GET MY REVIEWS (REVIEWS I GAVE)
 */
const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  if (!user?.id) throw new AppError(401, "User not authenticated");
  const reviewerId = user.id;

  const { page, limit, sortBy, sortOrder } = req.query;
  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as "asc" | "desc") || "desc",
  };

  const result = await reviewService.getMyReviews(reviewerId, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My reviews fetched successfully",
    data: result,
  });
});

/**
 * GET REVIEW BY ID
 */
const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new AppError(400, "Review ID is required");

  const result = await reviewService.getReviewById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review fetched successfully",
    data: result,
  });
});

/**
 * GET RATING DISTRIBUTION FOR A USER
 */
const getRatingDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) throw new AppError(400, "User ID is required");

    const result = await reviewService.getRatingDistribution(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rating distribution fetched successfully",
      data: result,
    });
  }
);

/**
 * CHECK IF LOGGED-IN USER CAN REVIEW ANOTHER USER
 */
const checkCanReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  if (!user?.id) throw new AppError(401, "User not authenticated");
  const reviewerId = user.id;

  const { reviewedId } = req.params;
  if (!reviewedId) throw new AppError(400, "Reviewed user ID is required");

  const result = await reviewService.canReviewUser(reviewerId, reviewedId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Check review eligibility completed",
    data: result,
  });
});

export const reviewController = {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getMyReviews,
  getReviewById,
  getRatingDistribution,
  checkCanReview,
};
