import mongoose from "mongoose";
import { env } from "./env.config";
const mongoDb_URL = env.mongo_url!;
export const mongoDb_connect = async () => {
  try {
    await mongoose.connect(mongoDb_URL);
    console.log("Database is connect successfully...");
  } catch (error) {
    console.error("Database connection is failed");
    process.exit(1);
  }
};
