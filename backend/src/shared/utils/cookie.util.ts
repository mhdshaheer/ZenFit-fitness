import { Response } from "express";
import { env } from "../../config/env.config";

/**
 * Cookie configuration constants
 */
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: false, 
  sameSite: "lax" as const,
  path: "/",
};

const TOKEN_EXPIRY = {
  ACCESS_TOKEN: parseInt(env.accessTokenMaxAge!),
  REFRESH_TOKEN: parseInt(env.refreshTokenMaxAge!),
};

/**
 * Sets access token cookie with standard configuration
 * @param res Express Response object
 * @param token Access token string
 */
export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, {
    ...COOKIE_CONFIG,
    maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
  });
};

/**
 * Sets refresh token cookie with standard configuration
 * @param res Express Response object
 * @param token Refresh token string
 */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    ...COOKIE_CONFIG,
    maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
  });
};

/**
 * Sets both access and refresh token cookies
 * @param res Express Response object
 * @param accessToken Access token string
 * @param refreshToken Refresh token string
 */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
};

/**
 * Clears access token cookie
 * @param res Express Response object
 */
export const clearAccessTokenCookie = (res: Response): void => {
  res.clearCookie("accessToken", COOKIE_CONFIG);
};

/**
 * Clears refresh token cookie
 * @param res Express Response object
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", COOKIE_CONFIG);
};

/**
 * Clears both access and refresh token cookies
 * @param res Express Response object
 */
export const clearAuthCookies = (res: Response): void => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
};

/**
 * Updates cookie configuration for production environment
 * Call this in production to enable secure cookies
 */
export const enableSecureCookies = (): void => {
  (COOKIE_CONFIG as any).secure = true;
};
