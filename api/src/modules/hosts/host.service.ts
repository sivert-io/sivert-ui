import crypto from "crypto";
import net from "node:net";
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

type CreateServerRegistrationKeyInput = {
  pluginVersion?: string | null;
  requestedIp?: string | null;
  userAgent?: string | null;
};

type ClaimServerRegistrationKeyInput = CreateServerInput & {
  registrationKey: string;
};

type GetServerRegistrationStatusInput = {
  registrationKey: string;
  pollToken: string;
};

type UpdateServerInput = {
  userId: string;
  serverId: string;
  address: string;
  port?: number | null;
  displayName: string;
  country?: string | null;
  region?: string | null;
  contact?: string | null;
};

type RemoveServerInput = {
  userId: string;
  serverId: string;
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

function generateRegistrationKey() {
  const value = crypto.randomBytes(12).toString("hex").toUpperCase();
  const groups = value.match(/.{1,4}/g) ?? [value];
  return `FLOW-${groups.join("-")}`;
}

function generatePollToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function hashSecret(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeRegistrationKey(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
}

function isPgUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

function normalizeIp(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
}

function isPublicIpv4(value: string) {
  const parts = value.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;
  if (first === undefined || second === undefined) return false;

  if (first === 10) return false;
  if (first === 127) return false;
  if (first === 169 && second === 254) return false;
  if (first === 172 && second >= 16 && second <= 31) return false;
  if (first === 192 && second === 168) return false;
  if (first === 0) return false;
  if (first >= 224) return false;

  return true;
}

function shouldEnforceRequestedIp(
  requestedIp: string | null,
  resolvedIp: string,
) {
  if (!requestedIp) return false;
  return net.isIPv4(requestedIp) && net.isIPv4(resolvedIp) && isPublicIpv4(requestedIp);
}

function hasPluginPolicyViolation(payload: unknown) {
  if (!payload || typeof payload !== "object") return true;

  const pluginInventory = (payload as { pluginInventory?: unknown })
    .pluginInventory;
  if (!pluginInventory || typeof pluginInventory !== "object") return true;

  const inventory = pluginInventory as {
    isCompliant?: unknown;
    disallowedPlugins?: unknown;
    disallowedPluginCount?: unknown;
  };

  if (inventory.isCompliant !== true) return true;

  if (Array.isArray(inventory.disallowedPlugins)) {
    return inventory.disallowedPlugins.length > 0;
  }

  return (
    typeof inventory.disallowedPluginCount === "number" &&
    inventory.disallowedPluginCount > 0
  );
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

function mapServerRegistrationKey(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    registrationKey: String(row.registration_key),
    pluginVersion: row.plugin_version ? String(row.plugin_version) : null,
    requestedIp: row.requested_ip ? String(row.requested_ip) : null,
    status: String(row.status),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
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

  async createServerRegistrationKey(input: CreateServerRegistrationKeyInput) {
    const registrationKey = generateRegistrationKey();
    const pollToken = generatePollToken();

    const result = await db.query(
      `
      INSERT INTO server_registration_keys (
        registration_key,
        poll_secret_hash,
        plugin_version,
        requested_ip,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        registration_key,
        plugin_version,
        requested_ip,
        status,
        created_at,
        expires_at
      `,
      [
        registrationKey,
        hashSecret(pollToken),
        normalizeOptionalText(input.pluginVersion),
        normalizeIp(input.requestedIp),
        normalizeOptionalText(input.userAgent),
      ],
    );

    return {
      ...mapServerRegistrationKey(result.rows[0]),
      pollToken,
    };
  }

  async getServerRegistrationStatus(input: GetServerRegistrationStatusInput) {
    const registrationKey = normalizeRegistrationKey(input.registrationKey);
    const pollSecretHash = hashSecret(input.pollToken);

    const result = await db.query(
      `
      SELECT
        rk.id,
        rk.registration_key,
        rk.status,
        rk.plugin_version,
        rk.created_at,
        rk.expires_at,
        s.id AS server_id,
        s.display_name,
        s.ip_address,
        s.port,
        s.verification_token
      FROM server_registration_keys rk
      LEFT JOIN servers s
        ON s.id = rk.server_id
      WHERE rk.registration_key = $1
        AND rk.poll_secret_hash = $2
      LIMIT 1
      `,
      [registrationKey, pollSecretHash],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    if (
      String(row.status) === "pending" &&
      new Date(row.expires_at).getTime() <= Date.now()
    ) {
      await db.query(
        `
        UPDATE server_registration_keys
        SET status = 'expired'
        WHERE id = $1
          AND status = 'pending'
        `,
        [row.id],
      );

      return {
        status: "expired" as const,
        expiresAt: row.expires_at,
      };
    }

    if (String(row.status) === "claimed" && row.server_id) {
      return {
        status: "claimed" as const,
        expiresAt: row.expires_at,
        server: {
          id: String(row.server_id),
          displayName: String(row.display_name),
          ipAddress: String(row.ip_address),
          port: Number(row.port),
          token: String(row.verification_token),
        },
      };
    }

    return {
      status: String(row.status) as "pending" | "expired",
      expiresAt: row.expires_at,
    };
  }

  async claimServerRegistrationKey(input: ClaimServerRegistrationKeyInput) {
    const registrationKey = normalizeRegistrationKey(input.registrationKey);
    const resolved = await resolveServerAddress(input.address);
    const inferred = await inferServerLocation(input.address);
    const verificationToken = generateVerificationToken();

    const finalPort = input.port ?? resolved.port ?? 27015;
    const country = normalizeOptionalText(input.country) ?? inferred.country;
    const region = normalizeOptionalText(input.region) ?? inferred.region;
    const contact = normalizeOptionalText(input.contact);

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const registrationKeyResult = await client.query(
        `
        SELECT
          id,
          registration_key,
          status,
          plugin_version,
          requested_ip,
          created_at,
          expires_at
        FROM server_registration_keys
        WHERE registration_key = $1
        LIMIT 1
        FOR UPDATE
        `,
        [registrationKey],
      );

      const registration = registrationKeyResult.rows[0];

      if (!registration) {
        await client.query("ROLLBACK");
        return {
          ok: false as const,
          error: "Registration key was not found",
        };
      }

      if (String(registration.status) === "claimed") {
        await client.query("ROLLBACK");
        return {
          ok: false as const,
          error: "Registration key has already been claimed",
        };
      }

      if (
        String(registration.status) === "expired" ||
        new Date(registration.expires_at).getTime() <= Date.now()
      ) {
        await client.query(
          `
          UPDATE server_registration_keys
          SET status = 'expired'
          WHERE id = $1
            AND status = 'pending'
          `,
          [registration.id],
        );

        await client.query("COMMIT");
        return {
          ok: false as const,
          error: "Registration key has expired",
        };
      }

      const requestedIp = normalizeIp(
        registration.requested_ip ? String(registration.requested_ip) : null,
      );

      if (
        shouldEnforceRequestedIp(requestedIp, resolved.resolvedIp) &&
        requestedIp !== normalizeIp(resolved.resolvedIp)
      ) {
        await client.query("ROLLBACK");
        return {
          ok: false as const,
          error:
            "Registration key was generated from a different public IP than this server address",
        };
      }

      await client.query(
        `
        INSERT INTO host_profiles (user_id, status)
        VALUES ($1, 'pending')
        ON CONFLICT (user_id)
        DO NOTHING
        `,
        [input.userId],
      );

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
          plugin_version,
          approved_at,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'verified', 'passed', $9, $10, NOW(), $11::jsonb)
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
          contact,
          verificationToken,
          registration.plugin_version ?? null,
          JSON.stringify({
            resolution: {
              originalInput: resolved.originalInput,
              resolvedIp: resolved.resolvedIp,
            },
            registrationKey: {
              id: registration.id,
              requestedIp: registration.requested_ip ?? null,
              createdAt: registration.created_at,
            },
          }),
        ],
      );

      const server = serverResult.rows[0];

      await client.query(
        `
        UPDATE server_registration_keys
        SET
          status = 'claimed',
          claimed_at = NOW(),
          claimed_by_user_id = $2,
          server_id = $3
        WHERE id = $1
        `,
        [registration.id, input.userId, server.id],
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
          'server_registered_with_plugin_key',
          jsonb_build_object(
            'displayName', to_jsonb($3::text),
            'hostInput', to_jsonb($4::text),
            'ipAddress', to_jsonb($5::text),
            'port', to_jsonb($6::int),
            'country', to_jsonb($7::text),
            'region', to_jsonb($8::text),
            'registrationKeyId', to_jsonb($9::text),
            'pluginVersion', to_jsonb($10::text)
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
          String(registration.id),
          registration.plugin_version ? String(registration.plugin_version) : null,
        ],
      );

      await client.query("COMMIT");

      return {
        ok: true as const,
        server: mapServer(server),
      };
    } catch (error) {
      await client.query("ROLLBACK");

      if (isPgUniqueViolation(error)) {
        return {
          ok: false as const,
          error: "A server with this address and port is already registered",
        };
      }

      throw error;
    } finally {
      client.release();
    }
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
            'displayName', to_jsonb($3::text),
            'hostInput', to_jsonb($4::text),
            'ipAddress', to_jsonb($5::text),
            'port', to_jsonb($6::int),
            'country', to_jsonb($7::text),
            'region', to_jsonb($8::text)
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

  async updateServer(input: UpdateServerInput) {
    const existingResult = await db.query(
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

    if (!existingResult.rows[0]) {
      return null;
    }

    const resolved = await resolveServerAddress(input.address);
    const inferred = await inferServerLocation(input.address);
    const verificationToken = generateVerificationToken();

    const finalPort = input.port ?? resolved.port ?? 27015;
    const country = normalizeOptionalText(input.country) ?? inferred.country;
    const region = normalizeOptionalText(input.region) ?? inferred.region;
    const contact = normalizeOptionalText(input.contact);

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const serverResult = await client.query(
        `
        UPDATE servers
        SET
          host_input = $3,
          display_name = $4,
          ip_address = $5,
          port = $6,
          country = $7,
          region = $8,
          contact = $9,
          verification_token = $10,
          verification_status = 'pending',
          status = 'pending_verification',
          plugin_version = NULL,
          last_heartbeat_at = NULL,
          last_seen_at = NULL,
          drained_at = NULL,
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
        [
          input.serverId,
          input.userId,
          resolved.hostInput,
          input.displayName,
          resolved.resolvedIp,
          finalPort,
          country,
          region,
          contact,
          verificationToken,
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
        [input.serverId, verificationToken],
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
          'server_updated',
          jsonb_build_object(
            'displayName', to_jsonb($3::text),
            'hostInput', to_jsonb($4::text),
            'ipAddress', to_jsonb($5::text),
            'port', to_jsonb($6::int),
            'country', to_jsonb($7::text),
            'region', to_jsonb($8::text),
            'contact', to_jsonb($9::text)
          )
        )
        `,
        [
          input.serverId,
          input.userId,
          input.displayName,
          resolved.hostInput,
          resolved.resolvedIp,
          finalPort,
          country,
          region,
          contact,
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

  async removeServer(input: RemoveServerInput) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        UPDATE servers
        SET
          status = 'removed',
          removed_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
          AND owner_user_id = $2
          AND removed_at IS NULL
        RETURNING id
        `,
        [input.serverId, input.userId],
      );

      if (!result.rows[0]) {
        await client.query("ROLLBACK");
        return null;
      }

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
          'server_removed',
          jsonb_build_object('removed', true)
        )
        `,
        [input.serverId, input.userId],
      );

      await client.query("COMMIT");

      return { id: input.serverId };
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
          ok: false as const,
          error: "Verification token did not match",
        };
      }

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

      const updatedServerResult = await client.query(
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
        ok: true as const,
        server: mapServer(updatedServerResult.rows[0]),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async rotateServerToken(input: RotateServerTokenInput) {
    const verificationToken = generateVerificationToken();

    const result = await db.query(
      `
      UPDATE servers
      SET verification_token = $3,
          verification_status = 'pending',
          status = CASE
            WHEN status = 'removed' THEN status
            WHEN status = 'suspended' THEN status
            ELSE 'pending_verification'
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
      [input.serverId, input.userId, verificationToken],
    );

    const server = result.rows[0];
    if (!server) return null;

    await db.query(
      `
      INSERT INTO server_verifications (
        server_id,
        verification_token,
        status
      )
      VALUES ($1, $2, 'pending')
      `,
      [input.serverId, verificationToken],
    );

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
        'server_token_rotated',
        jsonb_build_object('reason', 'manual')
      )
      `,
      [input.serverId, input.userId],
    );

    return mapServer(server);
  }

  async setDrainMode(input: SetDrainModeInput) {
    const result = await db.query(
      `
      UPDATE servers
      SET
        status = CASE
          WHEN removed_at IS NOT NULL THEN status
          WHEN $3 = true THEN 'draining'
          WHEN verification_status = 'passed' THEN 'verified'
          ELSE 'needs_attention'
        END,
        drained_at = CASE
          WHEN $3 = true THEN COALESCE(drained_at, NOW())
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

    const server = result.rows[0];
    if (!server) return null;

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
        'server_drain_mode_changed',
        jsonb_build_object('enabled', $3)
      )
      `,
      [input.serverId, input.userId, input.enabled],
    );

    return mapServer(server);
  }

  async recordHeartbeat(input: RecordHeartbeatInput) {
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
          AND removed_at IS NULL
        LIMIT 1
        `,
        [input.serverId],
      );

      const server = serverResult.rows[0];
      if (!server) {
        await client.query("ROLLBACK");
        return null;
      }

      if (String(server.verification_token) !== input.token) {
        await client.query("ROLLBACK");
        return {
          ok: false as const,
          error: "Invalid verification token",
        };
      }

      const pluginPolicyViolation = hasPluginPolicyViolation(input.payload);

      await client.query(
        `
        INSERT INTO server_heartbeats (
          server_id,
          status,
          plugin_version,
          payload
        )
        VALUES ($1, COALESCE($2, 'online'), $3, $4::jsonb)
        `,
        [
          input.serverId,
          input.status ?? "online",
          input.pluginVersion ?? null,
          JSON.stringify(input.payload ?? null),
        ],
      );

      await client.query(
        `
        UPDATE servers
        SET
          plugin_version = COALESCE($2, plugin_version),
          last_heartbeat_at = NOW(),
          last_seen_at = NOW(),
          updated_at = NOW(),
          status = CASE
            WHEN $3 = true THEN 'needs_attention'
            WHEN status = 'draining' THEN status
            WHEN verification_status = 'passed' THEN 'verified'
            ELSE status
          END
        WHERE id = $1
        `,
        [
          input.serverId,
          input.pluginVersion ?? null,
          pluginPolicyViolation,
        ],
      );

      const updatedServerResult = await client.query(
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
        ok: true as const,
        server: mapServer(updatedServerResult.rows[0]),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export const hostService = new HostService();
