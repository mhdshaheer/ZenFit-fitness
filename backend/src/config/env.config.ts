import dotenv from "dotenv";

dotenv.config();
export const env = {
  get port() {
    return process.env.PORT;
  },
  get mongo_url() {
    return process.env.MONGODB_URL;
  },
};
