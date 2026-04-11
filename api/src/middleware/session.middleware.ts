import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { getSessionWithUser } from "../lib/sessions.js";

export async function sessionMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const sessionId = req.cookies?.[config.SESSION_COOKIE_NAME];

    if (!sessionId) {
      return next();
    }

    const session = await getSessionWithUser(sessionId);

    if (!session) {
      return next();
    }

    req.sessionId = session.session_id;
    req.user = {
      id: session.user_id,
      steamId: session.steam_id,
      personaName: session.persona_name,
      avatarSmall: session.avatar_small,
      avatarMedium: session.avatar_medium,
      avatarLarge: session.avatar_large,
      rank: session.rank,
      role: session.role,
      hostStatus: session.host_status ?? null,
      hostBadgeVariant: session.host_badge_variant ?? null,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
