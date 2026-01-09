/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../utils/prisma";
import { PaymentStatus, MatchStatus } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";

/**
 * GET DASHBOARD STATISTICS
 */
const getDashboardStats = async () => {
  const [
    totalUsers,
    totalActiveUsers,
    totalTravelPlans,
    totalGroups,
    totalMatches,
    totalReviews,
    activeSubscriptions,
    totalRevenue,
    revenueThisMonth,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Active users (last 30 days)
    prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Total travel plans
    prisma.travelPlan.count(),

    // Total groups
    prisma.group.count(),

    // Total matches
    prisma.match.count(),

    // Total reviews
    prisma.review.count(),

    // Active subscriptions
    prisma.subscription.count({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
    }),

    // Total revenue
    prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    }),

    // Revenue this month
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: totalActiveUsers,
    },
    content: {
      travelPlans: totalTravelPlans,
      groups: totalGroups,
      matches: totalMatches,
      reviews: totalReviews,
    },
    subscriptions: {
      active: activeSubscriptions,
    },
    revenue: {
      total: totalRevenue._sum.amount || 0,
      thisMonth: revenueThisMonth._sum.amount || 0,
    },
  };
};

/**
 * GET USER ANALYTICS
 */
const getUserAnalytics = async (
  period: "week" | "month" | "year" = "month"
) => {
  const startDate = getStartDate(period);

  const userGrowth = await prisma.user.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: { gte: startDate },
    },
    _count: true,
  });

  // Group by day/week/month depending on period
  const formattedData = formatTimeSeriesData(userGrowth, period);

  return {
    period,
    data: formattedData,
  };
};

/**
 * GET REVENUE ANALYTICS
 */
const getRevenueAnalytics = async (
  period: "week" | "month" | "year" = "month"
) => {
  const startDate = getStartDate(period);

  const [revenueData, subscriptionBreakdown] = await Promise.all([
    prisma.payment.groupBy({
      by: ["createdAt", "status"],
      where: {
        createdAt: { gte: startDate },
        status: PaymentStatus.SUCCESS,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.subscription.groupBy({
      by: ["type"],
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      _count: true,
    }),
  ]);

  return {
    period,
    revenue: formatTimeSeriesData(revenueData, period),
    subscriptionBreakdown,
  };
};

/**
 * GET TOP USERS
 */
const getTopUsers = async (limit = 10) => {
  const topUsers = await prisma.user.findMany({
    take: limit,
    orderBy: [{ travelPlans: { _count: "desc" } }],
    include: {
      profile: {
        select: {
          fullName: true,
          profileImage: true,
        },
      },
      _count: {
        select: {
          travelPlans: true,
          reviewsReceived: true,
          matchesSent: true,
        },
      },
      subscriptions: {
        where: { isActive: true },
        select: {
          type: true,
          verifiedBadge: true,
        },
      },
    },
  });

  return topUsers;
};

/**
 * GET TOP DESTINATIONS
 */
const getTopDestinations = async (limit = 10) => {
  const destinations = await prisma.travelPlan.groupBy({
    by: ["country"],
    _count: {
      country: true,
    },
    orderBy: {
      _count: {
        country: "desc",
      },
    },
    take: limit,
  });

  return destinations.map((d) => ({
    country: d.country,
    count: d._count.country,
  }));
};

/**
 * GET RECENT ACTIVITIES
 */
const getRecentActivities = async (limit = 20) => {
  const [users, plans, groups, matches, reviews] = await Promise.all([
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),

    prisma.travelPlan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        destination: true,
        createdAt: true,
        user: {
          select: { name: true },
        },
      },
    }),

    prisma.group.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        destination: true,
        createdAt: true,
      },
    }),

    prisma.match.findMany({
      take: 5,
      where: { status: MatchStatus.ACCEPTED },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
      },
    }),

    prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        reviewer: { select: { name: true } },
        reviewed: { select: { name: true } },
      },
    }),
  ]);

  // Combine and sort all activities
  const activities: any[] = [
    ...users.map((u) => ({
      type: "user_joined",
      data: u,
      timestamp: u.createdAt,
    })),
    ...plans.map((p) => ({
      type: "plan_created",
      data: p,
      timestamp: p.createdAt,
    })),
    ...groups.map((g) => ({
      type: "group_created",
      data: g,
      timestamp: g.createdAt,
    })),
    ...matches.map((m) => ({
      type: "match_accepted",
      data: m,
      timestamp: m.createdAt,
    })),
    ...reviews.map((r) => ({
      type: "review_posted",
      data: r,
      timestamp: r.createdAt,
    })),
  ];

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

/**
 * GET USER DETAILS (ADMIN VIEW)
 */
const getUserDetails = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      travelPlans: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      reviewsGiven: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          travelPlans: true,
          matchesSent: true,
          matchesReceived: true,
          reviewsGiven: true,
          reviewsReceived: true,
          // Count the number of groups the user is a member of
          members: true, // Use 'members' instead of 'groupMembers'
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

/**
 * SUSPEND USER
 */
const suspendUser = async (userId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: true,
    },
  });

  // TODO: Send notification to user
  // TODO: Cancel active subscriptions
  // TODO: Log admin action

  return user;
};

/**
 * UNSUSPEND USER
 */
const unsuspendUser = async (userId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: false,
    },
  });

  return user;
};

/**
 * DELETE USER (ADMIN)
 */
const deleteUser = async (userId: string) => {
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "User deleted successfully" };
};

/**
 * GET SUBSCRIPTION ANALYTICS
 */
const getSubscriptionAnalytics = async () => {
  const [byType, byStatus, churnRate] = await Promise.all([
    prisma.subscription.groupBy({
      by: ["type"],
      _count: true,
    }),

    prisma.subscription.groupBy({
      by: ["isActive"],
      _count: true,
    }),

    // Calculate churn (cancelled in last 30 days)
    prisma.subscription.count({
      where: {
        isActive: false,
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    byType,
    byStatus,
    churnRate,
  };
};

/**
 * EXPORT DATA (For admin download)
 */
const exportData = async (
  dataType: "users" | "plans" | "groups" | "payments"
) => {
  let data;

  switch (dataType) {
    case "users":
      data = await prisma.user.findMany({
        include: { profile: true },
      });
      break;
    case "plans":
      data = await prisma.travelPlan.findMany({
        include: { user: { select: { name: true, email: true } } },
      });
      break;
    case "groups":
      data = await prisma.group.findMany({
        include: { creator: { select: { name: true, email: true } } },
      });
      break;
    case "payments":
      data = await prisma.payment.findMany({
        include: { user: { select: { name: true, email: true } } },
      });
      break;
  }

  return data;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getStartDate = (period: "week" | "month" | "year"): Date => {
  const now = new Date();
  switch (period) {
    case "week":
      return new Date(now.setDate(now.getDate() - 7));
    case "month":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "year":
      return new Date(now.setFullYear(now.getFullYear() - 1));
  }
};

const formatTimeSeriesData = (data: any[], period: string) => {
  // Group data by day/week/month
  // Implementation depends on your needs
  return data;
};

export const adminService = {
  getDashboardStats,
  getUserAnalytics,
  getRevenueAnalytics,
  getTopUsers,
  getTopDestinations,
  getRecentActivities,
  getUserDetails,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getSubscriptionAnalytics,
  exportData,
};
