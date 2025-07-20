import mongoose from "mongoose";
import logger from "../utils/logger";
import { env } from "./env.config";
const mongoDb_URL = env.mongo_url as string;
export const mongoDb_connect = async () => {
  try {
    await mongoose.connect(mongoDb_URL);
    logger.info("Database is connect successfully...");
  } catch (error) {
    logger.error("Database connection is failed");
    process.exit(1);
  }
};
