import dotenv from "dotenv";

dotenv.config();

const rawFrontendUrl = process.env.FRONTEND_URL ?? "";
const parsedFrontendUrls = rawFrontendUrl
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

export const env = {
  get port() {
    return process.env.PORT;
  },
  get mongo_url() {
    return process.env.MONGODB_URL;
  },

  get node() {
    return process.env.NODE;
  },

  get mail_user() {
    return process.env.MAIL_USER;
  },
  get mail_password() {
    return process.env.MAIL_PASSWORD;
  },
  get jwt_secret() {
    return process.env.JWT_SECRET;
  },
  get jwt_access() {
    return process.env.ACCESS_TOKEN_SECRET;
  },
  get jwt_refresh() {
    return process.env.REFRESH_TOKEN_SECRET;
  },
  get google_client_id() {
    return process.env.GOOGLE_CLIENT_ID;
  },
  get google_client_secret() {
    return process.env.GOOGLE_CLIENT_SECRET;
  },
  get google_callback_url() {
    return process.env.GOOGLE_CALLBACK_URL;
  },
  /**
   * Primary frontend base URL (first value from FRONTEND_URL env var).
   * Use this for redirects, webhooks, etc.
   */
  get frontend_url() {
    return parsedFrontendUrls[0] ?? rawFrontendUrl;
  },
  /**
   * All configured frontend origins (comma separated FRONTEND_URL env var).
   * Use this for CORS/socket configurations.
   */
  get frontend_urls() {
    return parsedFrontendUrls;
  },

  // AWS
  get aws_region() {
    return process.env.AWS_REGION;
  },
  get aws_access_key_id() {
    return process.env.AWS_ACCESS_KEY_ID;
  },
  get aws_secret_access_key() {
    return process.env.AWS_SECRET_ACCESS_KEY;
  },
  get aws_s3_bucket() {
    return process.env.AWS_S3_BUCKET;
  },

  // Stripe
  get stripe_secret_key() {
    return process.env.STRIPE_TEST_SECRET_KEY;
  },
  get stripe_web_hook() {
    return process.env.STRIPE_WEB_HOOK;
  },

  // Cookies
  get accessTokenMaxAge() {
    return process.env.ACCESS_TOKEN_MAX_AGE;
  },
  get refreshTokenMaxAge() {
    return process.env.REFRESH_TOKEN_MAX_AGE;
  },
};
