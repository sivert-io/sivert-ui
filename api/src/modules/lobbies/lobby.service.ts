import { db } from "../../db.js";

type ActiveLobbyRow = {
  lobby_id: string;
};

type LobbyMemberRow = {
  user_id: string;
  steam_id: string;
  persona_name: string | null;
  avatar_small: string | null;
  avatar_medium: string | null;
  avatar_large: string | null;
  rank: number | null;
  role: string;
  ready: boolean;
};

export class LobbyService {
  async getActiveLobbyIdForUser(userId: string) {
    const result = await db.query<ActiveLobbyRow>(
      `
      SELECT lm.lobby_id
      FROM lobby_members lm
      INNER JOIN lobbies l ON l.id = lm.lobby_id
      WHERE lm.user_id = $1
        AND lm.left_at IS NULL
        AND lm.kicked_at IS NULL
        AND l.closed_at IS NULL
        AND l.status <> 'closed'
      ORDER BY lm.joined_at DESC
      LIMIT 1
      `,
      [userId],
    );

    return result.rows[0]?.lobby_id ?? null;
  }

  async createLobbyForUser(userId: string) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const lobbyResult = await client.query<{ id: string }>(
        `
        INSERT INTO lobbies (owner_user_id, status, visibility, title)
        VALUES ($1, 'open', 'private', NULL)
        RETURNING id
        `,
        [userId],
      );

      const lobbyId = lobbyResult.rows[0].id;

      await client.query(
        `
        INSERT INTO lobby_members (lobby_id, user_id, member_role, ready)
        VALUES ($1, $2, 'member', false)
        `,
        [lobbyId, userId],
      );

      await client.query("COMMIT");
      return lobbyId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async ensureActiveLobbyForUser(userId: string) {
    const existingLobbyId = await this.getActiveLobbyIdForUser(userId);

    if (existingLobbyId) {
      return existingLobbyId;
    }

    return this.createLobbyForUser(userId);
  }

  async getLobbyState(lobbyId: string) {
    const membersResult = await db.query<LobbyMemberRow>(
      `
      SELECT
        u.id AS user_id,
        u.steam_id,
        u.persona_name,
        u.avatar_small,
        u.avatar_medium,
        u.avatar_large,
        u.rank,
        u.role,
        lm.ready
      FROM lobby_members lm
      INNER JOIN users u ON u.id = lm.user_id
      WHERE lm.lobby_id = $1
        AND lm.left_at IS NULL
        AND lm.kicked_at IS NULL
      ORDER BY lm.joined_at ASC
      `,
      [lobbyId],
    );

    return {
      lobbyId,
      members: membersResult.rows.map((row) => ({
        userId: row.user_id,
        steamId: row.steam_id,
        personaName: row.persona_name,
        avatarSmall: row.avatar_small,
        avatarMedium: row.avatar_medium,
        avatarLarge: row.avatar_large,
        rank: row.rank,
        role: row.role,
        ready: row.ready,
      })),
    };
  }

  async leaveCurrentLobbyAndCreateNewLobby(userId: string) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const activeLobbyResult = await client.query<ActiveLobbyRow>(
        `
        SELECT lm.lobby_id
        FROM lobby_members lm
        INNER JOIN lobbies l ON l.id = lm.lobby_id
        WHERE lm.user_id = $1
          AND lm.left_at IS NULL
          AND lm.kicked_at IS NULL
          AND l.closed_at IS NULL
          AND l.status <> 'closed'
        ORDER BY lm.joined_at DESC
        LIMIT 1
        `,
        [userId],
      );

      const currentLobbyId = activeLobbyResult.rows[0]?.lobby_id ?? null;

      if (currentLobbyId) {
        await client.query(
          `
          UPDATE lobby_members
          SET left_at = NOW()
          WHERE user_id = $1
            AND lobby_id = $2
            AND left_at IS NULL
            AND kicked_at IS NULL
          `,
          [userId, currentLobbyId],
        );
      }

      const lobbyResult = await client.query<{ id: string }>(
        `
        INSERT INTO lobbies (owner_user_id, status, visibility, title)
        VALUES ($1, 'open', 'private', NULL)
        RETURNING id
        `,
        [userId],
      );

      const newLobbyId = lobbyResult.rows[0].id;

      await client.query(
        `
        INSERT INTO lobby_members (lobby_id, user_id, member_role, ready)
        VALUES ($1, $2, 'member', false)
        `,
        [newLobbyId, userId],
      );

      await client.query("COMMIT");

      return {
        previousLobbyId: currentLobbyId,
        newLobbyId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getInviteCandidates(userId: string, lobbyId: string) {
    const result = await db.query(
      `
    SELECT
      u.steam_id,
      u.persona_name,
      u.avatar_small,
      u.avatar_medium,
      u.avatar_large,
      u.rank,
      u.created_at
    FROM friendships f
    INNER JOIN users u
      ON u.id = f.friend_user_id
    WHERE f.user_id = $1
      AND NOT EXISTS (
        SELECT 1
        FROM lobby_members lm
        WHERE lm.lobby_id = $2
          AND lm.user_id = u.id
          AND lm.left_at IS NULL
          AND lm.kicked_at IS NULL
      )
      AND NOT EXISTS (
        SELECT 1
        FROM lobby_invites li
        WHERE li.lobby_id = $2
          AND li.invited_user_id = u.id
          AND li.status = 'pending'
      )
    ORDER BY u.persona_name NULLS LAST, u.steam_id
    `,
      [userId, lobbyId],
    );

    return result.rows.map((row) => ({
      steamId: row.steam_id,
      personaName: row.persona_name,
      avatarSmall: row.avatar_small,
      avatarMedium: row.avatar_medium,
      avatarLarge: row.avatar_large,
      rank: row.rank,
      createdAt: row.created_at,
    }));
  }

async getFriendsForLobby(userId: string, lobbyId: string) {
  const result = await db.query<{
    steam_id: string;
    persona_name: string | null;
    avatar_small: string | null;
    avatar_medium: string | null;
    avatar_large: string | null;
    rank: number | null;
    created_at: string;
    is_in_lobby: boolean;
    has_pending_invite: boolean;
  }>(
    `
    SELECT
      u.steam_id,
      u.persona_name,
      u.avatar_small,
      u.avatar_medium,
      u.avatar_large,
      u.rank,
      u.created_at,
      EXISTS (
        SELECT 1
        FROM lobby_members lm
        WHERE lm.lobby_id = $2
          AND lm.user_id = u.id
          AND lm.left_at IS NULL
          AND lm.kicked_at IS NULL
      ) AS is_in_lobby,
      EXISTS (
        SELECT 1
        FROM lobby_invites li
        WHERE li.lobby_id = $2
          AND li.invited_user_id = u.id
          AND li.status = 'pending'
      ) AS has_pending_invite
    FROM friendships f
    INNER JOIN users u ON u.id = f.friend_user_id
    WHERE f.user_id = $1
    ORDER BY u.persona_name NULLS LAST, u.steam_id
    `,
    [userId, lobbyId],
  );

  return result.rows.map((row) => ({
    profile: {
      steamId: row.steam_id,
      personaName: row.persona_name,
      avatarSmall: row.avatar_small,
      avatarMedium: row.avatar_medium,
      avatarLarge: row.avatar_large,
      rank: row.rank,
      createdAt: row.created_at,
    },
    status: row.is_in_lobby
      ? "in_lobby"
      : row.has_pending_invite
        ? "invited"
        : "available",
  }));
}

}

export const lobbyService = new LobbyService();
