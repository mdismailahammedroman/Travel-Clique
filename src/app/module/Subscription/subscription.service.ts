import Stripe from "stripe";
import { prisma } from "../../utils/prisma";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/envVars";
import { ICreateCheckoutSession } from "./subscription.interface";
import { SubscriptionType } from "@prisma/client";
import { stripe } from "../../helpers/stripe";


const subscriptionService = {
  // CREATE STRIPE CHECKOUT SESSION
  createCheckoutSession: async ({ subscriptionType, userId }: ICreateCheckoutSession) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");

    const priceId =
      subscriptionType === SubscriptionType.MONTHLY
        ? envVars.price_monthly
        : envVars.price_yearly;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${envVars.FONT_END_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${envVars.FONT_END_URL}/subscriptions/cancel`,
      metadata: { userId, subscriptionType },
    });

    return session;
  },

  // HANDLE STRIPE WEBHOOK
  stripeWebhook: async (event: Stripe.Event) => {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionTypeStr = session.metadata?.subscriptionType;

        if (!userId || !subscriptionTypeStr) break;

        const subscriptionType: SubscriptionType =
          subscriptionTypeStr === "MONTHLY" ? SubscriptionType.MONTHLY : SubscriptionType.YEARLY;

        const startDate = new Date();
        const endDate =
          subscriptionType === SubscriptionType.MONTHLY
            ? new Date(new Date().setMonth(startDate.getMonth() + 1))
            : new Date(new Date().setFullYear(startDate.getFullYear() + 1));

        // Save Payment and Subscription atomically
        await prisma.$transaction(async (tx) => {
          const payment = await tx.payment.create({
            data: {
              userId,
              amount: (session.amount_total ?? 0) / 100, // Stripe amount is in cents
              currency: (session.currency ?? "USD").toUpperCase(),
              status: session.payment_status === "paid" ? "SUCCESS" : "FAILED",
              invoiceUrl: session.url,
            },
          });

          await tx.subscription.create({
            data: {
              userId,
              type: subscriptionType,
              startDate,
              endDate,
              isActive: true,
              verifiedBadge: true,
              paymentId: payment.id,
            },
          });
        });
        break;
      }

      default:
        break;
    }

    return { received: true };
  },

  // GET USER SUBSCRIPTIONS (History)
  getMySubscriptions: async (userId: string) => {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: { payment: true },
      orderBy: { createdAt: "desc" },
    });
    return subscriptions;
  },
};

export default subscriptionService;
