import type { CookieOptions, Response } from "express";
import { config, isProd } from "../config.js";

export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: config.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(config.SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(config.SESSION_COOKIE_NAME, {
    ...getSessionCookieOptions(),
    maxAge: undefined,
  });
}
