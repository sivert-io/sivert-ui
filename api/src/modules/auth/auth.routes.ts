import { Router } from "express";
import { steam } from "../../lib/steam.js";
import { createSession, revokeSession } from "../../lib/sessions.js";
import { clearSessionCookie, setSessionCookie } from "../../lib/cookies.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { upsertSteamUser } from "./auth.service.js";
import { config } from "../../config.js";
import { db } from "../../db.js";

const router = Router();

router.get("/steam", async (_req, res, next) => {
  try {
    const redirectUrl = await steam.getRedirectUrl();
    return res.redirect(redirectUrl);
  } catch (error) {
    return next(error);
  }
});

router.get("/steam/callback", async (req, res, next) => {
  try {
    const steamUser = await steam.authenticate(req);

    const user = await upsertSteamUser({
      steamid: steamUser.steamid,
      username: steamUser.username,
      profile: steamUser.profile,
      avatar: steamUser.avatar,
    });

    const { sessionId } = await createSession({
      userId: user.id,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });

    setSessionCookie(res, sessionId);

    return res.redirect(`${config.APP_ORIGIN}/`);
  } catch (error) {
    return next(error);
  }
});

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(200).json({
      authenticated: false,
      user: null,
    });
  }

  return res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT id, type, title, body, data, read_at, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [req.user!.id],
    );

    return res.status(200).json({
      notifications: result.rows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        data: row.data,
        readAt: row.read_at,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    if (req.sessionId) {
      await revokeSession(req.sessionId);
    }

    clearSessionCookie(res);

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/profiles/:steamId", async (req, res, next) => {
  try {
    const { steamId } = req.params;

    const result = await db.query(
      `
      SELECT
        steam_id,
        persona_name,
        avatar_small,
        avatar_medium,
        avatar_large,
        rank,
        created_at
      FROM users
      WHERE steam_id = $1
      LIMIT 1
      `,
      [steamId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    return res.status(200).json({
      profile: {
        steamId: user.steam_id,
        personaName: user.persona_name,
        avatarSmall: user.avatar_small,
        avatarMedium: user.avatar_medium,
        avatarLarge: user.avatar_large,
        rank: user.rank,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
