// src/realtime/auth.ts
import type { Server } from "socket.io";
import cookie from "cookie";
import { config } from "../config.js";
import { getSessionWithUser } from "../lib/sessions.js";

export function attachSocketAuth(io: Server) {
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) {
        return next(new Error("Unauthorized"));
      }

      const cookies = cookie.parse(rawCookie);
      const sessionId = cookies[config.SESSION_COOKIE_NAME];

      if (!sessionId) {
        return next(new Error("Unauthorized"));
      }

      const session = await getSessionWithUser(sessionId);
      if (!session) {
        return next(new Error("Unauthorized"));
      }

      socket.data.sessionId = session.session_id;
      socket.data.user = {
        id: session.user_id,
        steamId: session.steam_id,
        personaName: session.persona_name,
        avatarSmall: session.avatar_small,
        avatarMedium: session.avatar_medium,
        avatarLarge: session.avatar_large,
        rank: session.rank,
        role: session.role,
      };

      next();
    } catch (err) {
      next(err as Error);
    }
  });
}
