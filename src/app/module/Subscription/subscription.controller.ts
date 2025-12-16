/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import STATUS_CODES from "http-status";
import { IJWTPayload } from "../../helpers/payload";
import Stripe from "stripe";
import { subscriptionService } from "./subscription.service";
import { stripe } from "../../helpers/stripe";
import { envVars } from "../../config/envVars";

// CREATE CHECKOUT SESSION
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  
  const session = await subscriptionService.createCheckoutSession({
    subscriptionType: req.body.subscriptionType,
    userId: (req.user as IJWTPayload).id,
  });

  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Stripe checkout session created",
    data: session,
  });
});

// STRIPE WEBHOOK
const stripeWebhook = async (req: Request, res: Response) => {
  // Signature is expected to be present if the body is raw
  console.log("Type of req.body:", typeof req.body);
  console.log("Is req.body a Buffer:", Buffer.isBuffer(req.body));
  const signature = req.headers["stripe-signature"] as string; 

  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;

  try {
    // req.body is a raw Buffer because express.raw() was used in app.ts
    event = stripe.webhooks.constructEvent( 
      req.body, 
      signature,
      envVars.STRIPE_WEBHOOK_SECRET,
    );
    console.log("App's Loaded Secret:", envVars.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("❌ Stripe signature error:", err.message);
    // This returns the 400 error you were seeing
    return res.status(400).send(`Webhook Error: ${err.message}`); 
  }

  console.log("✅ Stripe webhook received:", event.type);

  await subscriptionService.stripeWebhook(event);

  // Send 200 OK after processing
  return res.status(200).json({ received: true }); 
};


// GET USER SUBSCRIPTIONS
const getMySubscriptions = catchAsync(async (req: Request, res: Response) => {
  const subscriptions = await subscriptionService.getMySubscriptions(
    (req.user as IJWTPayload).id
  );

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