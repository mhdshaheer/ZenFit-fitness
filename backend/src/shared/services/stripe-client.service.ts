import Stripe from "stripe";
import { env } from "../../config/env.config";

const stripe = new Stripe(env.stripe_secret_key as string, {
  apiVersion: "2025-09-30.clover",
});

export default stripe;
