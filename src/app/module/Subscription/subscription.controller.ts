/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import subscriptionService from "./subscription.service";
import STATUS_CODES from "http-status";
import { IJWTPayload } from "../../helpers/payload";
import { stripe } from "../../helpers/stripe";
import Stripe from "stripe";

// CREATE CHECKOUT SESSION
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const session = await subscriptionService.createCheckoutSession({
    subscriptionType: req.body.subscriptionType,
    userId:( req.user as IJWTPayload).id,
  });

  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Stripe checkout session created",
    data: session,
  });
});


const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret as string);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const result = await subscriptionService.stripeWebhook(event);
 sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Stripe checkout session created",
    data: result,
  });
});

// GET USER SUBSCRIPTIONS
const getMySubscriptions = catchAsync(async (req: Request, res: Response) => {
  const subscriptions = await subscriptionService.getMySubscriptions((req.user as IJWTPayload).id);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Your subscriptions fetched",
    data: subscriptions,
  });
});

export const subscriptionController = {
  createCheckoutSession,
  stripeWebhook,
  getMySubscriptions,
};
