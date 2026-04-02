import crypto from "crypto";
import { db } from "../db.js";
import { config } from "../config.js";

function sha256(value: string | undefined) {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createOpaqueSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

export function getSessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.SESSION_TTL_DAYS);
  return expiresAt;
}

export async function createSession(input: {
  userId: string;
  ip?: string;
  userAgent?: string;
}) {
  const sessionId = createOpaqueSessionId();
  const expiresAt = getSessionExpiryDate();

  await db.query(
    `
      INSERT INTO sessions (id, user_id, expires_at, ip_hash, user_agent_hash)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      sessionId,
      input.userId,
      expiresAt,
      sha256(input.ip),
      sha256(input.userAgent),
    ],
  );

  return {
    sessionId,
    expiresAt,
  };
}

export async function revokeSession(sessionId: string) {
  await db.query(
    `
      UPDATE sessions
      SET revoked_at = NOW()
      WHERE id = $1
    `,
    [sessionId],
  );
}

export async function getSessionWithUser(sessionId: string) {
  const result = await db.query(
    `
    SELECT
      s.id AS session_id,
      s.user_id,
      u.steam_id,
      u.persona_name,
      u.avatar_small,
      u.avatar_medium,
      u.avatar_large,
      u.rank,
      u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = $1
      AND s.expires_at > NOW()
      AND s.revoked_at IS NULL
    LIMIT 1
    `,
    [sessionId],
  );

  return result.rows[0] ?? null;
}
