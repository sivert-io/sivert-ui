import crypto from "crypto";
import { db } from "../../db.js";
import { resolveServerAddress } from "../../lib/server-address.js";
import { inferServerLocation } from "../../lib/location-inference.js";

type CreateHostApplicationInput = {
  userId: string;
  notes?: string | null;
};

type CreateServerInput = {
  userId: string;
  address: string;
  port?: number | null;
  displayName: string;
  country?: string | null;
  region?: string | null;
  contact?: string | null;
};

type VerifyServerInput = {
  userId: string;
  serverId: string;
  token: string;
  pluginVersion?: string | null;
};

type RotateServerTokenInput = {
  userId: string;
  serverId: string;
};

type SetDrainModeInput = {
  userId: string;
  serverId: string;
  enabled: boolean;
};

type RecordHeartbeatInput = {
  serverId: string;
  token: string;
  pluginVersion?: string | null;
  status?: "online" | "offline" | "idle" | "in_match";
  payload?: unknown;
};

function generateVerificationToken() {
  return crypto.randomBytes(18).toString("hex");
}

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
}

function mapHostProfile(row: Record<string, unknown> | undefined) {
  if (!row) return null;

  return {
    userId: String(row.user_id),
    status: String(row.status),
    badgeVariant: row.badge_variant ? String(row.badge_variant) : null,
    notes: row.notes ? String(row.notes) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
  };
}

function mapServer(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    hostInput: row.host_input ? String(row.host_input) : null,
    displayName: String(row.display_name),
    ipAddress: String(row.ip_address),
    port: Number(row.port),
    country: row.country ? String(row.country) : null,
    region: row.region ? String(row.region) : null,
    contact: row.contact ? String(row.contact) : null,
    status: String(row.status),
    verificationStatus: String(row.verification_status),
    verificationToken: row.verification_token
      ? String(row.verification_token)
      : null,
    pluginVersion: row.plugin_version ? String(row.plugin_version) : null,
    lastHeartbeatAt: row.last_heartbeat_at,
    lastSeenAt: row.last_seen_at,
    approvedAt: row.approved_at,
    drainedAt: row.drained_at,
    removedAt: row.removed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class HostService {
  async getHostProfile(userId: string) {
    const profileResult = await db.query(
      `
      SELECT
        hp.user_id,
        hp.status,
        hp.badge_variant,
        hp.notes,
        hp.created_at,
        hp.updated_at,
        hp.reviewed_at
      FROM host_profiles hp
      WHERE hp.user_id = $1
      LIMIT 1
      `,
      [userId],
    );

    const summaryResult = await db.query(
      `
      SELECT
        COUNT(*)::int AS total_servers,
        COUNT(*) FILTER (WHERE status = 'verified')::int AS verified_servers,
        COUNT(*) FILTER (
          WHERE status IN ('pending_verification', 'needs_attention')
        )::int AS action_needed_servers
      FROM servers
      WHERE owner_user_id = $1
        AND removed_at IS NULL
      `,
      [userId],
    );

    return {
      profile: mapHostProfile(profileResult.rows[0]),
      summary: {
        totalServers: Number(summaryResult.rows[0]?.total_servers ?? 0),
        verifiedServers: Number(summaryResult.rows[0]?.verified_servers ?? 0),
        actionNeededServers: Number(
          summaryResult.rows[0]?.action_needed_servers ?? 0,
        ),
      },
    };
  }

  async createOrUpdateApplication(input: CreateHostApplicationInput) {
    const result = await db.query(
      `
      INSERT INTO host_profiles (
        user_id,
        status,
        badge_variant,
        notes
      )
      VALUES ($1, 'pending', NULL, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        status = CASE
          WHEN host_profiles.status IN ('rejected', 'suspended')
            THEN host_profiles.status
          ELSE 'pending'
        END,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING
        user_id,
        status,
        badge_variant,
        notes,
        created_at,
        updated_at,
        reviewed_at
      `,
      [input.userId, input.notes ?? null],
    );

    return mapHostProfile(result.rows[0]);
  }

  async discoverServerLocation(address: string) {
    return inferServerLocation(address);
  }

  async getServersForUser(userId: string) {
    const result = await db.query(
      `
      SELECT
        s.id,
        s.owner_user_id,
        s.host_input,
        s.display_name,
        s.ip_address,
        s.port,
        s.country,
        s.region,
        s.contact,
        s.status,
        s.verification_status,
        s.verification_token,
        s.plugin_version,
        s.last_heartbeat_at,
        s.last_seen_at,
        s.approved_at,
        s.drained_at,
        s.removed_at,
        s.created_at,
        s.updated_at
      FROM servers s
      WHERE s.owner_user_id = $1
        AND s.removed_at IS NULL
      ORDER BY s.created_at DESC
      `,
      [userId],
    );

    return result.rows.map(mapServer);
  }

  async createServer(input: CreateServerInput) {
    await db.query(
      `
      INSERT INTO host_profiles (user_id, status)
      VALUES ($1, 'pending')
      ON CONFLICT (user_id)
      DO NOTHING
      `,
      [input.userId],
    );

    const resolved = await resolveServerAddress(input.address);
    const inferred = await inferServerLocation(input.address);
    const verificationToken = generateVerificationToken();

    const finalPort = input.port ?? resolved.port ?? 27015;
    const country = normalizeOptionalText(input.country) ?? inferred.country;
    const region = normalizeOptionalText(input.region) ?? inferred.region;

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const serverResult = await client.query(
        `
        INSERT INTO servers (
          owner_user_id,
          host_input,
          display_name,
          ip_address,
          port,
          country,
          region,
          contact,
          status,
          verification_status,
          verification_token,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_verification', 'pending', $9, $10::jsonb)
        RETURNING
          id,
          owner_user_id,
          host_input,
          display_name,
          ip_address,
          port,
          country,
          region,
          contact,
          status,
          verification_status,
          verification_token,
          plugin_version,
          last_heartbeat_at,
          last_seen_at,
          approved_at,
          drained_at,
          removed_at,
          created_at,
          updated_at
        `,
        [
          input.userId,
          resolved.hostInput,
          input.displayName,
          resolved.resolvedIp,
          finalPort,
          country,
          region,
          normalizeOptionalText(input.contact),
          verificationToken,
          JSON.stringify({
            resolution: {
              originalInput: resolved.originalInput,
              resolvedIp: resolved.resolvedIp,
            },
          }),
        ],
      );

      const server = serverResult.rows[0];

      await client.query(
        `
        INSERT INTO server_verifications (
          server_id,
          verification_token,
          status
        )
        VALUES ($1, $2, 'pending')
        `,
        [server.id, verificationToken],
      );

      await client.query(
        `
        INSERT INTO server_audit_logs (
          server_id,
          actor_user_id,
          action,
          details
        )
        VALUES (
          $1,
          $2,
          'server_created',
          jsonb_build_object(
            'displayName', $3,
            'hostInput', $4,
            'ipAddress', $5,
            'port', $6,
            'country', $7,
            'region', $8
          )
        )
        `,
        [
          server.id,
          input.userId,
          input.displayName,
          resolved.hostInput,
          resolved.resolvedIp,
          finalPort,
          country,
          region,
        ],
      );

      await client.query("COMMIT");

      return mapServer(server);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getServerForUser(userId: string, serverId: string) {
    const serverResult = await db.query(
      `
      SELECT
        s.id,
        s.owner_user_id,
        s.host_input,
        s.display_name,
        s.ip_address,
        s.port,
        s.country,
        s.region,
        s.contact,
        s.status,
        s.verification_status,
        s.verification_token,
        s.plugin_version,
        s.last_heartbeat_at,
        s.last_seen_at,
        s.approved_at,
        s.drained_at,
        s.removed_at,
        s.created_at,
        s.updated_at
      FROM servers s
      WHERE s.id = $1
        AND s.owner_user_id = $2
        AND s.removed_at IS NULL
      LIMIT 1
      `,
      [serverId, userId],
    );

    const server = serverResult.rows[0];

    if (!server) {
      return null;
    }

    const heartbeatsResult = await db.query(
      `
      SELECT
        id,
        status,
        plugin_version,
        payload,
        received_at
      FROM server_heartbeats
      WHERE server_id = $1
      ORDER BY received_at DESC
      LIMIT 10
      `,
      [serverId],
    );

    const auditLogsResult = await db.query(
      `
      SELECT
        id,
        actor_user_id,
        action,
        details,
        created_at
      FROM server_audit_logs
      WHERE server_id = $1
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [serverId],
    );

    return {
      server: mapServer(server),
      heartbeats: heartbeatsResult.rows.map((row) => ({
        id: String(row.id),
        status: String(row.status),
        pluginVersion: row.plugin_version ? String(row.plugin_version) : null,
        payload: row.payload ?? null,
        receivedAt: row.received_at,
      })),
      auditLogs: auditLogsResult.rows.map((row) => ({
        id: String(row.id),
        actorUserId: row.actor_user_id ? String(row.actor_user_id) : null,
        action: String(row.action),
        details: row.details ?? null,
        createdAt: row.created_at,
      })),
    };
  }

  async verifyServer(input: VerifyServerInput) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const serverResult = await client.query(
        `
        SELECT
          id,
          owner_user_id,
          host_input,
          display_name,
          ip_address,
          port,
          country,
          region,
          contact,
          status,
          verification_status,
          verification_token,
          plugin_version,
          last_heartbeat_at,
          last_seen_at,
          approved_at,
          drained_at,
          removed_at,
          created_at,
          updated_at
        FROM servers
        WHERE id = $1
          AND owner_user_id = $2
          AND removed_at IS NULL
        LIMIT 1
        `,
        [input.serverId, input.userId],
      );

      const server = serverResult.rows[0];

      if (!server) {
        await client.query("ROLLBACK");
        return null;
      }

      if (String(server.verification_token) !== input.token) {
        await client.query(
          `
          INSERT INTO server_verifications (
            server_id,
            verification_token,
            status,
            completed_at,
            failure_reason
          )
          VALUES ($1, $2, 'failed', NOW(), 'Token mismatch')
          `,
          [input.serverId, input.token],
        );

        await client.query(
          `
          UPDATE servers
          SET verification_status = 'failed',
              status = 'needs_attention',
              updated_at = NOW()
          WHERE id = $1
          `,
          [input.serverId],
        );

        await client.query("COMMIT");

        return {
          ok: false,
          error: "Verification token mismatch",
        } as const;
      }

      await client.query(
        `
        UPDATE servers
        SET verification_status = 'passed',
            status = 'verified',
            plugin_version = COALESCE($2, plugin_version),
            approved_at = COALESCE(approved_at, NOW()),
            updated_at = NOW()
        WHERE id = $1
        `,
        [input.serverId, input.pluginVersion ?? null],
      );

      await client.query(
        `
        UPDATE host_profiles
        SET status = CASE
              WHEN status = 'suspended' THEN status
              ELSE 'verified'
            END,
            badge_variant = CASE
              WHEN badge_variant IS NULL THEN 'verified'
              ELSE badge_variant
            END,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
        `,
        [input.userId],
      );

      await client.query(
        `
        INSERT INTO server_verifications (
          server_id,
          verification_token,
          status,
          completed_at
        )
        VALUES ($1, $2, 'passed', NOW())
        `,
        [input.serverId, input.token],
      );

      await client.query(
        `
        INSERT INTO server_audit_logs (
          server_id,
          actor_user_id,
          action,
          details
        )
        VALUES (
          $1,
          $2,
          'server_verified',
          jsonb_build_object(
            'pluginVersion', $3
          )
        )
        `,
        [input.serverId, input.userId, input.pluginVersion ?? null],
      );

      const refreshedResult = await client.query(
        `
        SELECT
          id,
          owner_user_id,
          host_input,
          display_name,
          ip_address,
          port,
          country,
          region,
          contact,
          status,
          verification_status,
          verification_token,
          plugin_version,
          last_heartbeat_at,
          last_seen_at,
          approved_at,
          drained_at,
          removed_at,
          created_at,
          updated_at
        FROM servers
        WHERE id = $1
        LIMIT 1
        `,
        [input.serverId],
      );

      await client.query("COMMIT");

      return {
        ok: true,
        server: mapServer(refreshedResult.rows[0]),
      } as const;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async rotateServerToken(input: RotateServerTokenInput) {
    const serverResult = await db.query(
      `
      SELECT id
      FROM servers
      WHERE id = $1
        AND owner_user_id = $2
        AND removed_at IS NULL
      LIMIT 1
      `,
      [input.serverId, input.userId],
    );

    if (!serverResult.rows[0]) {
      return null;
    }

    const nextToken = generateVerificationToken();

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE servers
        SET verification_token = $2,
            verification_status = 'pending',
            status = CASE
              WHEN status = 'suspended' THEN status
              ELSE 'pending_verification'
            END,
            updated_at = NOW()
        WHERE id = $1
        `,
        [input.serverId, nextToken],
      );

      await client.query(
        `
        INSERT INTO server_verifications (
          server_id,
          verification_token,
          status
        )
        VALUES ($1, $2, 'rotated')
        `,
        [input.serverId, nextToken],
      );

      await client.query(
        `
        INSERT INTO server_audit_logs (
          server_id,
          actor_user_id,
          action,
          details
        )
        VALUES (
          $1,
          $2,
          'verification_token_rotated',
          jsonb_build_object('verificationToken', $3)
        )
        `,
        [input.serverId, input.userId, nextToken],
      );

      const refreshedResult = await client.query(
        `
        SELECT
          id,
          owner_user_id,
          host_input,
          display_name,
          ip_address,
          port,
          country,
          region,
          contact,
          status,
          verification_status,
          verification_token,
          plugin_version,
          last_heartbeat_at,
          last_seen_at,
          approved_at,
          drained_at,
          removed_at,
          created_at,
          updated_at
        FROM servers
        WHERE id = $1
        LIMIT 1
        `,
        [input.serverId],
      );

      await client.query("COMMIT");

      return mapServer(refreshedResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async setDrainMode(input: SetDrainModeInput) {
    const result = await db.query(
      `
      UPDATE servers
      SET status = CASE
            WHEN $3 = true THEN 'draining'
            WHEN verification_status = 'passed' THEN 'verified'
            ELSE 'needs_attention'
          END,
          drained_at = CASE
            WHEN $3 = true THEN NOW()
            ELSE NULL
          END,
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
        AND removed_at IS NULL
      RETURNING
        id,
        owner_user_id,
        host_input,
        display_name,
        ip_address,
        port,
        country,
        region,
        contact,
        status,
        verification_status,
        verification_token,
        plugin_version,
        last_heartbeat_at,
        last_seen_at,
        approved_at,
        drained_at,
        removed_at,
        created_at,
        updated_at
      `,
      [input.serverId, input.userId, input.enabled],
    );

    if (!result.rows[0]) {
      return null;
    }

    await db.query(
      `
      INSERT INTO server_audit_logs (
        server_id,
        actor_user_id,
        action,
        details
      )
      VALUES (
        $1,
        $2,
        'drain_mode_changed',
        jsonb_build_object('enabled', $3)
      )
      `,
      [input.serverId, input.userId, input.enabled],
    );

    return mapServer(result.rows[0]);
  }

  async recordHeartbeat(input: RecordHeartbeatInput) {
    const serverResult = await db.query(
      `
      SELECT id, verification_token
      FROM servers
      WHERE id = $1
        AND removed_at IS NULL
      LIMIT 1
      `,
      [input.serverId],
    );

    const server = serverResult.rows[0];

    if (!server) {
      return null;
    }

    if (String(server.verification_token) !== input.token) {
      return {
        ok: false,
        error: "Invalid server token",
      } as const;
    }

    const heartbeatStatus = input.status ?? "online";

    await db.query(
      `
      INSERT INTO server_heartbeats (
        server_id,
        status,
        plugin_version,
        payload
      )
      VALUES ($1, $2, $3, $4::jsonb)
      `,
      [
        input.serverId,
        heartbeatStatus,
        input.pluginVersion ?? null,
        JSON.stringify(input.payload ?? {}),
      ],
    );

    const updatedResult = await db.query(
      `
      UPDATE servers
      SET last_heartbeat_at = NOW(),
          last_seen_at = NOW(),
          plugin_version = COALESCE($2, plugin_version),
          status = CASE
            WHEN status = 'draining' THEN status
            WHEN verification_status = 'passed' THEN 'verified'
            ELSE status
          END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        owner_user_id,
        host_input,
        display_name,
        ip_address,
        port,
        country,
        region,
        contact,
        status,
        verification_status,
        verification_token,
        plugin_version,
        last_heartbeat_at,
        last_seen_at,
        approved_at,
        drained_at,
        removed_at,
        created_at,
        updated_at
      `,
      [input.serverId, input.pluginVersion ?? null],
    );

    return {
      ok: true,
      server: mapServer(updatedResult.rows[0]),
    } as const;
  }
}

export const hostService = new HostService();
