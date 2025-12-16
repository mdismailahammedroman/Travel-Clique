import Stripe from "stripe";
import { envVars } from "../config/envVars";

export const stripe= new Stripe(envVars.STRIPE_SECRET_KEY as string)
