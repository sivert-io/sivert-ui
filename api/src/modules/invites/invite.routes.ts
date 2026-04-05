import { Router } from "express";
import { db } from "../../db.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { getIo } from "../../realtime/io.js";
import { rooms } from "../../realtime/rooms.js";
import { lobbyService } from "../lobbies/lobby.service.js";
import { lobbySessionManager } from "../lobbies/lobby-session-manager.js";

function mergeLobbyStateWithPresence(
  lobbyState: Awaited<ReturnType<typeof lobbyService.getLobbyState>>,
) {
  const presenceState = lobbySessionManager.serializeLobby(lobbyState.lobbyId);

  return {
    ...lobbyState,
    members: lobbyState.members.map((member) => {
      const presenceMember = presenceState?.members.find(
        (item) => item.userId === member.userId,
      );

      return {
        ...member,
        connectedSockets: presenceMember?.connectedSockets ?? 0,
        connected: presenceMember?.connected ?? false,
      };
    }),
  };
}

const router = Router();

router.post("/:inviteId/accept", requireAuth, async (req, res, next) => {
  const client = await db.connect();

  try {
    const { inviteId } = req.params;

    await client.query("BEGIN");

    const currentLobbyResult = await client.query<{ lobby_id: string }>(
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
      [req.user!.id],
    );

    const previousLobbyId = currentLobbyResult.rows[0]?.lobby_id ?? null;

    const inviteResult = await client.query<{
      id: string;
      lobby_id: string;
      invited_user_id: string;
      status: string;
    }>(
      `
      SELECT
        li.id,
        li.lobby_id,
        li.invited_user_id,
        li.status
      FROM lobby_invites li
      WHERE li.id = $1
      LIMIT 1
      `,
      [inviteId],
    );

    const invite = inviteResult.rows[0];

    if (!invite) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Invite not found" });
    }

    if (invite.invited_user_id !== req.user!.id) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Not your invite" });
    }

    if (invite.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invite is no longer pending" });
    }

    await client.query(
      `
      UPDATE lobby_invites
      SET status = 'accepted',
          responded_at = NOW()
      WHERE id = $1
      `,
      [inviteId],
    );

    await client.query(
      `
      UPDATE lobby_members
      SET left_at = NOW()
      WHERE user_id = $1
        AND left_at IS NULL
        AND kicked_at IS NULL
      `,
      [req.user!.id],
    );

    const existingMembershipResult = await client.query(
      `
      SELECT 1
      FROM lobby_members
      WHERE lobby_id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [invite.lobby_id, req.user!.id],
    );

    if (existingMembershipResult.rowCount) {
      await client.query(
        `
        UPDATE lobby_members
        SET left_at = NULL,
            kicked_at = NULL,
            ready = false,
            joined_at = NOW()
        WHERE lobby_id = $1
          AND user_id = $2
        `,
        [invite.lobby_id, req.user!.id],
      );
    } else {
      await client.query(
        `
        INSERT INTO lobby_members (lobby_id, user_id, member_role, ready)
        VALUES ($1, $2, 'member', false)
        `,
        [invite.lobby_id, req.user!.id],
      );
    }

    await client.query(
      `
      DELETE FROM notifications
      WHERE user_id = $1
        AND type = 'lobby_invite'
        AND (data->>'inviteId') = $2
      `,
      [req.user!.id, inviteId],
    );

    await client.query("COMMIT");

    const io = getIo();

    if (previousLobbyId) {
      const previousLobbyState =
        await lobbyService.getLobbyState(previousLobbyId);
      const mergedPreviousLobbyState =
        mergeLobbyStateWithPresence(previousLobbyState);

      io.to(rooms.lobby(previousLobbyId)).emit(
        "lobby:state",
        mergedPreviousLobbyState,
      );
    }

    const joinedLobbyState = await lobbyService.getLobbyState(invite.lobby_id);
    const mergedJoinedLobbyState =
      mergeLobbyStateWithPresence(joinedLobbyState);

    io.to(rooms.lobby(invite.lobby_id)).emit(
      "lobby:state",
      mergedJoinedLobbyState,
    );

    return res.status(200).json({
      ok: true,
      lobbyId: invite.lobby_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.post("/:inviteId/decline", requireAuth, async (req, res, next) => {
  const client = await db.connect();

  try {
    const { inviteId } = req.params;

    await client.query("BEGIN");

    const inviteResult = await client.query<{
      id: string;
      lobby_id: string;
      invited_user_id: string;
      invited_by_user_id: string;
      status: string;
    }>(
      `
      SELECT
        li.id,
        li.lobby_id,
        li.invited_user_id,
        li.invited_by_user_id,
        li.status
      FROM lobby_invites li
      WHERE li.id = $1
      LIMIT 1
      `,
      [inviteId],
    );

    const invite = inviteResult.rows[0];

    if (!invite) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Invite not found" });
    }

    if (invite.invited_user_id !== req.user!.id) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Not your invite" });
    }

    if (invite.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invite is no longer pending" });
    }

    await client.query(
      `
      UPDATE lobby_invites
      SET status = 'declined',
          responded_at = NOW()
      WHERE id = $1
      `,
      [inviteId],
    );

    await client.query(
      `
      DELETE FROM notifications
      WHERE user_id = $1
        AND type = 'lobby_invite'
        AND (data->>'inviteId') = $2
      `,
      [req.user!.id, inviteId],
    );

    await client.query("COMMIT");

    getIo()
      .to(rooms.user(invite.invited_by_user_id))
      .emit("lobby_invite:declined", {
        inviteId,
        lobbyId: invite.lobby_id,
        steamId: req.user!.steamId,
      });

    return res.status(200).json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { steamId } = req.body as {
      steamId?: string;
    };

    if (!steamId) {
      return res.status(400).json({ error: "steamId is required" });
    }

    if (steamId === req.user!.steamId) {
      return res.status(400).json({ error: "Cannot invite yourself" });
    }

    const lobbyId = await lobbyService.ensureActiveLobbyForUser(req.user!.id);

    const invitedUserResult = await db.query<{
      id: string;
      steam_id: string;
      persona_name: string | null;
    }>(
      `
      SELECT id, steam_id, persona_name
      FROM users
      WHERE steam_id = $1
      LIMIT 1
      `,
      [steamId],
    );

    const invitedUser = invitedUserResult.rows[0];

    if (!invitedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const membershipResult = await db.query(
      `
      SELECT 1
      FROM lobby_members
      WHERE lobby_id = $1
        AND user_id = $2
        AND left_at IS NULL
        AND kicked_at IS NULL
      LIMIT 1
  `,
      [lobbyId, invitedUser.id],
    );

    if (membershipResult.rowCount) {
      return res.status(400).json({
        error: "User is already in your lobby",
      });
    }

    const friendshipResult = await db.query(
      `
      SELECT 1
      FROM friendships
      WHERE user_id = $1
        AND friend_user_id = $2
      LIMIT 1
  `,
      [req.user!.id, invitedUser.id],
    );

    if (!friendshipResult.rowCount) {
      return res.status(403).json({
        error: "You can only invite friends",
      });
    }

    const existingPendingInviteResult = await db.query(
      `
      SELECT 1
      FROM lobby_invites
      WHERE lobby_id = $1
        AND invited_user_id = $2
        AND status = 'pending'
      LIMIT 1
  `,
      [lobbyId, invitedUser.id],
    );

    if (existingPendingInviteResult.rowCount) {
      return res.status(400).json({
        error: "User already has a pending invite to this lobby",
      });
    }

    const inviteInsertResult = await db.query<{ id: string }>(
      `
      INSERT INTO lobby_invites (
        lobby_id,
        invited_user_id,
        invited_by_user_id,
        status
      )
      VALUES ($1, $2, $3, 'pending')
      RETURNING id
      `,
      [lobbyId, invitedUser.id, req.user!.id],
    );

    const inviteId = inviteInsertResult.rows[0].id;

    const notificationResult = await db.query<{
      id: string;
      type: string;
      title: string;
      body: string | null;
      data: unknown;
      created_at: string;
    }>(
      `
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING id, type, title, body, data, created_at
      `,
      [
        invitedUser.id,
        "lobby_invite",
        "Lobby invite",
        `${req.user!.personaName ?? "A player"} invited you to join their lobby`,
        JSON.stringify({
          inviteId,
          lobbyId,
          fromUserId: req.user!.id,
          fromSteamId: req.user!.steamId,
        }),
      ],
    );

    const notification = notificationResult.rows[0];

    getIo().to(rooms.user(invitedUser.id)).emit("notification:new", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      createdAt: notification.created_at,
    });

    return res.status(200).json({ ok: true, lobbyId, inviteId });
  } catch (error) {
    return next(error);
  }
});

export default router;
