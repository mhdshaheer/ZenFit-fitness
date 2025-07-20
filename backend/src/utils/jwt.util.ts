import jwt from "jsonwebtoken";
import { env } from "../config/env.config";

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
