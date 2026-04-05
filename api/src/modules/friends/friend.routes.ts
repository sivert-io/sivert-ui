import { Router } from "express";
import { db } from "../../db.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { getIo } from "../../realtime/io.js";
import { rooms } from "../../realtime/rooms.js";

const router = Router();

router.post("/requests", requireAuth, async (req, res, next) => {
  try {
    const { steamId } = req.body as { steamId?: string };

    if (!steamId) {
      return res.status(400).json({ error: "steamId is required" });
    }

    if (steamId === req.user!.steamId) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    const recipientResult = await db.query<{
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

    const recipient = recipientResult.rows[0];

    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyFriendsResult = await db.query(
      `
      SELECT 1
      FROM friendships
      WHERE user_id = $1
        AND friend_user_id = $2
      LIMIT 1
      `,
      [req.user!.id, recipient.id],
    );

    if (alreadyFriendsResult.rowCount) {
      return res.status(400).json({ error: "Already friends" });
    }

    const reversePendingResult = await db.query(
      `
      SELECT id
      FROM friend_requests
      WHERE requester_user_id = $1
        AND recipient_user_id = $2
        AND status = 'pending'
      LIMIT 1
      `,
      [recipient.id, req.user!.id],
    );

    if (reversePendingResult.rowCount) {
      return res.status(400).json({
        error: "That user already sent you a friend request",
      });
    }

    const pendingResult = await db.query(
      `
      SELECT id
      FROM friend_requests
      WHERE requester_user_id = $1
        AND recipient_user_id = $2
        AND status = 'pending'
      LIMIT 1
      `,
      [req.user!.id, recipient.id],
    );

    if (pendingResult.rowCount) {
      return res.status(400).json({
        error: "Friend request already pending",
      });
    }

    const requestResult = await db.query<{ id: string }>(
      `
      INSERT INTO friend_requests (
        requester_user_id,
        recipient_user_id,
        status
      )
      VALUES ($1, $2, 'pending')
      RETURNING id
      `,
      [req.user!.id, recipient.id],
    );

    const requestId = requestResult.rows[0].id;

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
        recipient.id,
        "friend_request",
        "Friend request",
        `${req.user!.personaName ?? "A player"} sent you a friend request`,
        JSON.stringify({
          requestId,
          fromUserId: req.user!.id,
          fromSteamId: req.user!.steamId,
        }),
      ],
    );

    const notification = notificationResult.rows[0];

    getIo().to(rooms.user(recipient.id)).emit("notification:new", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      createdAt: notification.created_at,
    });

    return res.status(200).json({ ok: true, requestId });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/requests/:requestId/accept",
  requireAuth,
  async (req, res, next) => {
    const client = await db.connect();

    try {
      const { requestId } = req.params;

      await client.query("BEGIN");

      const requestResult = await client.query<{
        id: string;
        requester_user_id: string;
        recipient_user_id: string;
        status: string;
      }>(
        `
        SELECT id, requester_user_id, recipient_user_id, status
        FROM friend_requests
        WHERE id = $1
        LIMIT 1
        `,
        [requestId],
      );

      const request = requestResult.rows[0];

      if (!request) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Friend request not found" });
      }

      if (request.recipient_user_id !== req.user!.id) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Not your friend request" });
      }

      if (request.status !== "pending") {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Friend request is no longer pending" });
      }

      await client.query(
        `
        UPDATE friend_requests
        SET status = 'accepted',
            responded_at = NOW()
        WHERE id = $1
        `,
        [requestId],
      );

      await client.query(
        `
        INSERT INTO friendships (user_id, friend_user_id, source)
        VALUES ($1, $2, 'app')
        ON CONFLICT (user_id, friend_user_id) DO NOTHING
        `,
        [request.requester_user_id, request.recipient_user_id],
      );

      await client.query(
        `
        INSERT INTO friendships (user_id, friend_user_id, source)
        VALUES ($1, $2, 'app')
        ON CONFLICT (user_id, friend_user_id) DO NOTHING
        `,
        [request.recipient_user_id, request.requester_user_id],
      );

      await client.query(
        `
        DELETE FROM notifications
        WHERE user_id = $1
          AND type = 'friend_request'
          AND (data->>'requestId') = $2
        `,
        [req.user!.id, requestId],
      );

      const requesterNotificationResult = await client.query<{
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
          request.requester_user_id,
          "friend_request_accepted",
          "Friend request accepted",
          `${req.user!.personaName ?? "A player"} accepted your friend request`,
          JSON.stringify({
            requestId,
            friendUserId: req.user!.id,
            friendSteamId: req.user!.steamId,
          }),
        ],
      );

      await client.query("COMMIT");

      const requesterNotification = requesterNotificationResult.rows[0];

      getIo()
        .to(rooms.user(request.requester_user_id))
        .emit("notification:new", {
          id: requesterNotification.id,
          type: requesterNotification.type,
          title: requesterNotification.title,
          body: requesterNotification.body,
          data: requesterNotification.data,
          createdAt: requesterNotification.created_at,
        });

      return res.status(200).json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      return next(error);
    } finally {
      client.release();
    }
  },
);

router.post(
  "/requests/:requestId/decline",
  requireAuth,
  async (req, res, next) => {
    const client = await db.connect();

    try {
      const { requestId } = req.params;

      await client.query("BEGIN");

      const requestResult = await client.query<{
        id: string;
        recipient_user_id: string;
        status: string;
      }>(
        `
        SELECT id, recipient_user_id, status
        FROM friend_requests
        WHERE id = $1
        LIMIT 1
        `,
        [requestId],
      );

      const request = requestResult.rows[0];

      if (!request) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Friend request not found" });
      }

      if (request.recipient_user_id !== req.user!.id) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Not your friend request" });
      }

      if (request.status !== "pending") {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Friend request is no longer pending" });
      }

      await client.query(
        `
        UPDATE friend_requests
        SET status = 'declined',
            responded_at = NOW()
        WHERE id = $1
        `,
        [requestId],
      );

      await client.query(
        `
        DELETE FROM notifications
        WHERE user_id = $1
          AND type = 'friend_request'
          AND (data->>'requestId') = $2
        `,
        [req.user!.id, requestId],
      );

      await client.query("COMMIT");

      return res.status(200).json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      return next(error);
    } finally {
      client.release();
    }
  },
);

router.get("/status/:steamId", requireAuth, async (req, res, next) => {
  try {
    const { steamId } = req.params;

    const otherUserResult = await db.query<{ id: string }>(
      `
      SELECT id
      FROM users
      WHERE steam_id = $1
      LIMIT 1
      `,
      [steamId],
    );

    const otherUser = otherUserResult.rows[0];

    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (otherUser.id === req.user!.id) {
      return res.status(200).json({ status: "self" });
    }

    const friendshipResult = await db.query(
      `
      SELECT 1
      FROM friendships
      WHERE user_id = $1
        AND friend_user_id = $2
      LIMIT 1
      `,
      [req.user!.id, otherUser.id],
    );

    if (friendshipResult.rowCount) {
      return res.status(200).json({ status: "friends" });
    }

    const outgoingResult = await db.query(
      `
      SELECT 1
      FROM friend_requests
      WHERE requester_user_id = $1
        AND recipient_user_id = $2
        AND status = 'pending'
      LIMIT 1
      `,
      [req.user!.id, otherUser.id],
    );

    if (outgoingResult.rowCount) {
      return res.status(200).json({ status: "pending_outgoing" });
    }

    const incomingResult = await db.query(
      `
      SELECT 1
      FROM friend_requests
      WHERE requester_user_id = $1
        AND recipient_user_id = $2
        AND status = 'pending'
      LIMIT 1
      `,
      [otherUser.id, req.user!.id],
    );

    if (incomingResult.rowCount) {
      return res.status(200).json({ status: "pending_incoming" });
    }

    return res.status(200).json({ status: "none" });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:steamId", requireAuth, async (req, res, next) => {
  const client = await db.connect();

  try {
    const { steamId } = req.params;

    await client.query("BEGIN");

    const otherUserResult = await client.query<{
      id: string;
      steam_id: string;
    }>(
      `
      SELECT id, steam_id
      FROM users
      WHERE steam_id = $1
      LIMIT 1
      `,
      [steamId],
    );

    const otherUser = otherUserResult.rows[0];

    if (!otherUser) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User not found" });
    }

    await client.query(
      `
      DELETE FROM friendships
      WHERE (user_id = $1 AND friend_user_id = $2)
         OR (user_id = $2 AND friend_user_id = $1)
      `,
      [req.user!.id, otherUser.id],
    );

    await client.query(
      `
      DELETE FROM friend_requests
      WHERE (requester_user_id = $1 AND recipient_user_id = $2)
         OR (requester_user_id = $2 AND recipient_user_id = $1)
      `,
      [req.user!.id, otherUser.id],
    );

    await client.query("COMMIT");

    const io = getIo();

    io.to(rooms.user(req.user!.id)).emit("friend:removed", {
      steamId: otherUser.steam_id,
    });

    io.to(rooms.user(otherUser.id)).emit("friend:removed", {
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

export default router;
