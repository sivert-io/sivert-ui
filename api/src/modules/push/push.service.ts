import webpush from "web-push";
import { db } from "../../db.js";
import { config } from "../../config.js";
import { matchFoundManager } from "../../realtime/match-found-manager.js";

export type FlowPushKind = "match_found" | "lobby_invite";

export type FlowPushPayload = {
  kind: FlowPushKind;
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
};

type PushSubscriptionInput = {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

class PushService {
  private configured = false;

  constructor() {
    if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        config.VAPID_SUBJECT,
        config.VAPID_PUBLIC_KEY,
        config.VAPID_PRIVATE_KEY,
      );

      this.configured = true;
    }
  }

  isConfigured() {
    return this.configured;
  }

  getPublicKey() {
    return config.VAPID_PUBLIC_KEY ?? null;
  }

  async saveSubscription({
    userId,
    subscription,
    userAgent,
  }: {
    userId: string;
    subscription: PushSubscriptionInput;
    userAgent?: string | null;
  }) {
    const endpoint = subscription.endpoint?.trim();
    const p256dh = subscription.keys?.p256dh?.trim();
    const auth = subscription.keys?.auth?.trim();

    if (!endpoint || !p256dh || !auth) {
      throw new Error("Invalid push subscription");
    }

    await db.query(
      `
      INSERT INTO push_subscriptions (
        user_id,
        endpoint,
        p256dh,
        auth,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (endpoint)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent,
        updated_at = NOW(),
        failure_count = 0
      `,
      [userId, endpoint, p256dh, auth, userAgent ?? null],
    );
  }

  async deleteSubscription({
    userId,
    endpoint,
  }: {
    userId: string;
    endpoint: string;
  }) {
    await db.query(
      `
      DELETE FROM push_subscriptions
      WHERE user_id = $1
        AND endpoint = $2
      `,
      [userId, endpoint],
    );
  }

  async sendToUser(userId: string, payload: FlowPushPayload) {
    if (!this.configured) {
      return;
    }

    const result = await db.query<PushSubscriptionRow>(
      `
      SELECT id::text, endpoint, p256dh, auth
      FROM push_subscriptions
      WHERE user_id = $1
      ORDER BY updated_at DESC
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return;
    }

    await Promise.allSettled(
      result.rows.map((subscription) =>
        this.sendToSubscription(subscription, payload),
      ),
    );
  }

  async sendLobbyInviteIfAllowed(userId: string, payload: FlowPushPayload) {
    const inMatch = await this.userIsInMatch(userId);

    if (inMatch) {
      return;
    }

    await this.sendToUser(userId, payload);
  }

  private async userIsInMatch(userId: string) {
    if (matchFoundManager.userHasPendingMatch(userId)) {
      return true;
    }

    const result = await db.query(
      `
    SELECT 1
    FROM matches m
    INNER JOIN match_lobbies ml ON ml.match_id = m.id
    INNER JOIN lobby_members lm ON lm.lobby_id = ml.lobby_id
    WHERE lm.user_id = $1
      AND lm.left_at IS NULL
      AND lm.kicked_at IS NULL
      AND m.status IN ('pending', 'ready', 'live')
      AND m.cancelled_at IS NULL
    LIMIT 1
    `,
      [userId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  private async sendToSubscription(
    subscription: PushSubscriptionRow,
    payload: FlowPushPayload,
  ) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify(payload),
      );

      await db.query(
        `
        UPDATE push_subscriptions
        SET last_success_at = NOW(),
            updated_at = NOW(),
            failure_count = 0
        WHERE id = $1
        `,
        [subscription.id],
      );
    } catch (error) {
      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof error.statusCode === "number"
          ? error.statusCode
          : null;

      if (statusCode === 404 || statusCode === 410) {
        await db.query(
          `
          DELETE FROM push_subscriptions
          WHERE id = $1
          `,
          [subscription.id],
        );

        return;
      }

      await db.query(
        `
        UPDATE push_subscriptions
        SET last_failure_at = NOW(),
            updated_at = NOW(),
            failure_count = failure_count + 1
        WHERE id = $1
        `,
        [subscription.id],
      );

      console.error("Failed to send push notification", error);
    }
  }
}

export const pushService = new PushService();
