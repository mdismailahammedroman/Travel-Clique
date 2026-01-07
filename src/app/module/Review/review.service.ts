import { prisma } from "../../utils/prisma";
import AppError from "../../errorHelpers/AppError";
import { CreateReviewInput, UpdateReviewInput } from "./review.interface";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

const createReview = async (data: CreateReviewInput) => {
  const { reviewerId, reviewedId, rating, comment } = data;

  if (reviewerId === reviewedId)
    throw new AppError(400, "Cannot review yourself");
  if (rating < 1 || rating > 5) throw new AppError(400, "Rating must be 1-5");

  const reviewedUser = await prisma.user.findUnique({
    where: { id: reviewedId },
  });
  if (!reviewedUser) throw new AppError(404, "User not found");

  const existing = await prisma.review.findUnique({
    where: { reviewerId_reviewedId: { reviewerId, reviewedId } },
  });
  if (existing) throw new AppError(400, "Review already exists");

  const review = await prisma.review.create({
    data: { reviewerId, reviewedId, rating, comment: comment || null },
    include: {
      reviewer: { select: { id: true, name: true } },
      reviewed: { select: { id: true, name: true } },
    },
  });

  return review;
};

const updateReview = async (
  reviewId: string,
  reviewerId: string,
  data: UpdateReviewInput
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, "Review not found");
  if (review.reviewerId !== reviewerId)
    throw new AppError(403, "Not authorized");

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data,
    include: { reviewer: { select: { id: true, name: true } } },
  });

  return updated;
};

const deleteReview = async (reviewId: string, reviewerId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, "Review not found");
  if (review.reviewerId !== reviewerId)
    throw new AppError(403, "Not authorized");

  await prisma.review.delete({ where: { id: reviewId } });
  return { message: "Review deleted successfully" };
};

const getUserReviews = async (userId: string, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { reviewedId: userId },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    }),
    prisma.review.count({ where: { reviewedId: userId } }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getMyReviews = async (reviewerId: string, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { reviewerId },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        reviewed: { select: { id: true, name: true } },
      },
    }),
    prisma.review.count({ where: { reviewerId } }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: { reviewer: true, reviewed: true },
  });
  if (!review) throw new AppError(404, "Review not found");
  return review;
};

const getRatingDistribution = async (userId: string) => {
  const reviews = await prisma.review.findMany({
    where: { reviewedId: userId },
    select: { rating: true },
  });
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => distribution[r.rating as keyof typeof distribution]++);
  return distribution;
};

const canReviewUser = async (reviewerId: string, reviewedId: string) => {
  const existing = await prisma.review.findUnique({
    where: { reviewerId_reviewedId: { reviewerId, reviewedId } },
  });
  return { canReview: !existing };
};

export const reviewService = {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getMyReviews,
  getReviewById,
  getRatingDistribution,
  canReviewUser,
};
