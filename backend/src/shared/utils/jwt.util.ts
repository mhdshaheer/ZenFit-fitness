import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env.config";
import logger from "../services/logger";

interface TokenPayload {
  id: string;
  role: string;
}

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, env.jwt_secret!, { expiresIn: "1d" });
};

const ACCESS_TOKEN_SECRET = env.jwt_access!;
const REFRESH_TOKEN_SECRET = env.jwt_refresh!;

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwt_refresh!);
    if (typeof decoded === "object" && decoded !== null) {
      return decoded as JwtPayload;
    }
    return null;
  } catch (error) {
    logger.error("Invalid refresh token", error);
    return null;
  }
}
