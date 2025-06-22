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
};
