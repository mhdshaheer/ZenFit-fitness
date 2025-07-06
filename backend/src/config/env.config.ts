import dotenv from "dotenv";

dotenv.config();
export const env = {
  get port() {
    return process.env.PORT;
  },
  get mongo_url() {
    return process.env.MONGODB_URL;
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
};
