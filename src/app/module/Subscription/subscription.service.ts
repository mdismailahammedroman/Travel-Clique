/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../utils/prisma";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/envVars";
import { ICreateCheckoutSession } from "./subscription.interface";
import { SubscriptionType, PaymentStatus } from "@prisma/client";
import { stripe } from "../../helpers/stripe";

// CREATE CHECKOUT SESSION
const createCheckoutSession = async ({
  userId,
  subscriptionType,
}: ICreateCheckoutSession) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  // Choose Stripe recurring price ID
  const priceId =
    subscriptionType === SubscriptionType.MONTHLY
      ? envVars.price_monthly
      : envVars.price_yearly;

  // ⚠️ Make sure the Stripe price is a recurring subscription
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", // ✅ must be "subscription"
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${envVars.FRONT_END_URL}/subscription-success`,
    cancel_url: `${envVars.FRONT_END_URL}/subscription-cancel`,
    metadata: {
      userId,
      subscriptionType,
    },
  });

  return {
    id: session.id,
    url: session.url,
  };
};

// STRIPE WEBHOOK
const stripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const typeStr = session.metadata?.subscriptionType;

      if (!userId || !typeStr) {
        console.error("❌ METADATA MISSING IN CHECKOUT SESSION");
        return { received: true };
      }

      const subscriptionType =
        typeStr === "MONTHLY"
          ? SubscriptionType.MONTHLY
          : SubscriptionType.YEARLY;

      const stripeSubscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (!stripeSubscriptionId) {
        console.error("❌ Stripe subscription ID missing");
        return { received: true };
      }

      const startDate = new Date();
      const endDate =
        subscriptionType === SubscriptionType.MONTHLY
          ? new Date(new Date().setMonth(startDate.getMonth() + 1))
          : new Date(new Date().setFullYear(startDate.getFullYear() + 1));

      try {
        await prisma.$transaction(async (tx) => {
          // 1️⃣ Create payment record
          const payment = await tx.payment.create({
            data: {
              userId,
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency?.toUpperCase() ?? "USD",
              status:
                session.payment_status === "paid"
                  ? PaymentStatus.SUCCESS
                  : PaymentStatus.FAILED,
              invoiceUrl: session.invoice ? String(session.invoice) : null,
            },
          });

          // 2️⃣ Create subscription record
          await tx.subscription.create({
            data: {
              userId,
              type: subscriptionType,
              startDate,
              endDate,
              isActive: true,
              verifiedBadge: true,
              paymentId: payment.id,
              stripeSubscriptionId, // ⚡ important
            },
          });
        });

        console.log(`✔ Subscription created for user ${userId}`);
      } catch (err) {
        console.error("❌ Failed to store subscription:", err);
      }

      break;
    }

    default:
      console.log("Unhandled event:", event.type);
  }

  return { received: true };
};

// GET MY SUBSCRIPTIONS
const getMySubscriptions = async (userId: string) => {
  return prisma.subscription.findMany({
    where: { userId },
    include: { payment: true },
    orderBy: { createdAt: "desc" },
  });
};
const checkActiveSubscription = async (userId: string) => {
  return prisma.subscription.findFirst({
    where: { userId, isActive: true, endDate: { gte: new Date() } },
    orderBy: { endDate: "desc" },
  });
};

export const subscriptionService = {
  createCheckoutSession,
  stripeWebhook,
  getMySubscriptions,
  checkActiveSubscription,
};
