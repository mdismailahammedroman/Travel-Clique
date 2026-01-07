import { prisma } from "../../utils/prisma";
import AppError from "../../errorHelpers/AppError";
import { PaymentStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * GET MY PAYMENTS (USER)
 */
const getMyPayments = async (userId: string, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        subscription: true,
      },
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return {
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * GET PAYMENT BY ID
 */
const getPaymentById = async (paymentId: string, userId?: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      subscription: true,
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!payment) throw new AppError(404, "Payment not found");

  // Optional ownership check (for USER access)
  if (userId && payment.userId !== userId) {
    throw new AppError(403, "Not authorized to view this payment");
  }

  return payment;
};

/**
 * ADMIN: GET ALL PAYMENTS
 */
const getAllPayments = async (options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: { select: { id: true, email: true, name: true } },
        subscription: true,
      },
    }),
    prisma.payment.count(),
  ]);

  return {
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * GET PAYMENT STATS (USER)
 */
const getPaymentStats = async (userId: string) => {
  const [totalPayments, successPayments, totalSpent] = await Promise.all([
    prisma.payment.count({ where: { userId } }),
    prisma.payment.count({
      where: { userId, status: PaymentStatus.SUCCESS },
    }),
    prisma.payment.aggregate({
      where: { userId, status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalPayments,
    successfulPayments: successPayments,
    totalSpent: totalSpent._sum.amount || 0,
  };
};

export const paymentService = {
  getMyPayments,
  getPaymentById,
  getAllPayments,
  getPaymentStats,
};
