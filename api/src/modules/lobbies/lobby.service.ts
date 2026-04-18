import { db } from "../../db.js";
import { userPresenceManager } from "../../realtime/user-presence.js";

type ActiveLobbyRow = {
  lobby_id: string;
};

type LobbyMemberRow = {
  owner_user_id: string;
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

type ExpiredInviteCleanupRow = {
  invite_id: string;
  invited_user_id: string;
  notification_id: string | null;
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
        l.owner_user_id::text AS owner_user_id,
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
      INNER JOIN lobbies l ON l.id = lm.lobby_id
      WHERE lm.lobby_id = $1
        AND lm.left_at IS NULL
        AND lm.kicked_at IS NULL
        AND l.closed_at IS NULL
      ORDER BY lm.joined_at ASC
      `,
      [lobbyId],
    );

    return {
      lobbyId,
      ownerUserId: membersResult.rows[0]?.owner_user_id ?? null,
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

  async expireStaleInvitesAndDeleteNotifications(
    lobbyId: string,
    invitedUserId?: string,
  ) {
    const params: string[] = [lobbyId];
    const invitedUserClause = invitedUserId
      ? `AND li.invited_user_id = $2`
      : "";

    if (invitedUserId) {
      params.push(invitedUserId);
    }

    const result = await db.query<ExpiredInviteCleanupRow>(
      `
      WITH expired_invites AS (
        UPDATE lobby_invites li
        SET status = 'expired',
            responded_at = COALESCE(li.responded_at, NOW())
        WHERE li.lobby_id = $1
          ${invitedUserClause}
          AND li.status = 'pending'
          AND li.expires_at IS NOT NULL
          AND li.expires_at <= NOW()
        RETURNING li.id::text AS invite_id, li.invited_user_id
      ),
      deleted_notifications AS (
        DELETE FROM notifications n
        USING expired_invites ei
        WHERE n.user_id = ei.invited_user_id
          AND n.type = 'lobby_invite'
          AND n.data->>'inviteId' = ei.invite_id
        RETURNING n.id::text AS notification_id, n.user_id
      )
      SELECT
        ei.invite_id,
        ei.invited_user_id::text,
        dn.notification_id
      FROM expired_invites ei
      LEFT JOIN deleted_notifications dn
        ON dn.user_id = ei.invited_user_id
      `,
      params,
    );

    return result.rows;
  }

  async leaveLobbyMember(lobbyId: string, userId: string) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const leaveResult = await client.query(
        `
        UPDATE lobby_members
        SET left_at = NOW()
        WHERE lobby_id = $1
          AND user_id = $2
          AND left_at IS NULL
          AND kicked_at IS NULL
        RETURNING user_id
        `,
        [lobbyId, userId],
      );

      if (!leaveResult.rowCount) {
        await client.query("ROLLBACK");
        return null;
      }

      const remainingMembersResult = await client.query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM lobby_members
        WHERE lobby_id = $1
          AND left_at IS NULL
          AND kicked_at IS NULL
        `,
        [lobbyId],
      );

      const remainingMembers = Number(
        remainingMembersResult.rows[0]?.count ?? "0",
      );

      if (remainingMembers === 0) {
        await client.query(
          `
          UPDATE lobbies
          SET status = 'closed',
              closed_at = NOW()
          WHERE id = $1
            AND closed_at IS NULL
          `,
          [lobbyId],
        );

        await client.query("COMMIT");

        return {
          lobbyId,
          state: null,
        };
      }

      await client.query("COMMIT");

      return {
        lobbyId,
        state: await this.getLobbyState(lobbyId),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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

        const remainingMembersResult = await client.query<{ count: string }>(
          `
          SELECT COUNT(*)::text AS count
          FROM lobby_members
          WHERE lobby_id = $1
            AND left_at IS NULL
            AND kicked_at IS NULL
          `,
          [currentLobbyId],
        );

        if (Number(remainingMembersResult.rows[0]?.count ?? "0") === 0) {
          await client.query(
            `
            UPDATE lobbies
            SET status = 'closed',
                closed_at = NOW()
            WHERE id = $1
              AND closed_at IS NULL
            `,
            [currentLobbyId],
          );
        }
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

  async kickLobbyMemberAndCreateNewLobby(params: {
    lobbyId: string;
    actorUserId: string;
    targetUserId: string;
  }) {
    const { lobbyId, actorUserId, targetUserId } = params;
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const lobbyResult = await client.query<{
        owner_user_id: string;
        closed_at: Date | null;
        status: string;
      }>(
        `
        SELECT owner_user_id::text AS owner_user_id, closed_at, status
        FROM lobbies
        WHERE id = $1
        LIMIT 1
        `,
        [lobbyId],
      );

      const lobby = lobbyResult.rows[0];

      if (!lobby || lobby.closed_at || lobby.status === "closed") {
        await client.query("ROLLBACK");
        return { ok: false as const, error: "Lobby not found" };
      }

      if (lobby.owner_user_id !== actorUserId) {
        await client.query("ROLLBACK");
        return {
          ok: false as const,
          error: "Only the lobby owner can kick players",
        };
      }

      if (targetUserId === actorUserId) {
        await client.query("ROLLBACK");
        return { ok: false as const, error: "You cannot kick yourself" };
      }

      const targetMembershipResult = await client.query(
        `
        SELECT 1
        FROM lobby_members
        WHERE lobby_id = $1
          AND user_id = $2
          AND left_at IS NULL
          AND kicked_at IS NULL
        LIMIT 1
        `,
        [lobbyId, targetUserId],
      );

      if (!targetMembershipResult.rowCount) {
        await client.query("ROLLBACK");
        return { ok: false as const, error: "Player is not in this lobby" };
      }

      await client.query(
        `
        UPDATE lobby_members
        SET kicked_at = NOW()
        WHERE lobby_id = $1
          AND user_id = $2
          AND left_at IS NULL
          AND kicked_at IS NULL
        `,
        [lobbyId, targetUserId],
      );

      const newLobbyResult = await client.query<{ id: string }>(
        `
        INSERT INTO lobbies (owner_user_id, status, visibility, title)
        VALUES ($1, 'open', 'private', NULL)
        RETURNING id
        `,
        [targetUserId],
      );

      const newLobbyId = newLobbyResult.rows[0].id;

      await client.query(
        `
        INSERT INTO lobby_members (lobby_id, user_id, member_role, ready)
        VALUES ($1, $2, 'member', false)
        `,
        [newLobbyId, targetUserId],
      );

      await client.query("COMMIT");

      return {
        ok: true as const,
        previousLobbyId: lobbyId,
        kickedUserId: targetUserId,
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
    await this.expireStaleInvitesAndDeleteNotifications(lobbyId);

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
            AND li.expires_at > NOW()
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
    await this.expireStaleInvitesAndDeleteNotifications(lobbyId);

    const result = await db.query<{
      user_id: string;
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
        u.id AS user_id,
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
            AND li.expires_at > NOW()
        ) AS has_pending_invite
      FROM friendships f
      INNER JOIN users u ON u.id = f.friend_user_id
      WHERE f.user_id = $1
      ORDER BY u.persona_name NULLS LAST, u.steam_id
      `,
      [userId, lobbyId],
    );

    return result.rows.map((row) => {
      const isOnline = userPresenceManager.isOnline(row.user_id);

      return {
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
            : isOnline
              ? "available"
              : "offline",
      };
    });
  }
}

export const lobbyService = new LobbyService();
