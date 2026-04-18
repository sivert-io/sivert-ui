import { API_BASE_URL } from "./api";

export type HostProfileStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

export type HostBadgeVariant = "verified" | "founding";

export type HostProfile = {
  userId: string;
  status: HostProfileStatus;
  badgeVariant: HostBadgeVariant | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
};

export type HostSummary = {
  totalServers: number;
  verifiedServers: number;
  actionNeededServers: number;
};

export type HostMeResponse = {
  profile: HostProfile | null;
  summary: HostSummary;
};

export type ServerRecord = {
  id: string;
  ownerUserId: string;
  hostInput: string | null;
  displayName: string;
  ipAddress: string;
  port: number;
  country: string | null;
  region: string | null;
  contact: string | null;
  status:
    | "pending_verification"
    | "verified"
    | "needs_attention"
    | "draining"
    | "suspended"
    | "removed";
  verificationStatus: "pending" | "passed" | "failed";
  verificationToken: string | null;
  pluginVersion: string | null;
  lastHeartbeatAt: string | null;
  lastSeenAt: string | null;
  approvedAt: string | null;
  drainedAt: string | null;
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HostServerDetailsResponse = {
  server: ServerRecord;
  heartbeats: Array<{
    id: string;
    status: "online" | "offline" | "idle" | "in_match";
    pluginVersion: string | null;
    payload: unknown;
    receivedAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    actorUserId: string | null;
    action: string;
    details: unknown;
    createdAt: string;
  }>;
};

export type DiscoveredServerLocation = {
  resolvedIp: string;
  country: string | null;
  region: string | null;
  port: number | null;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      (data as { error?: string } | null)?.error ?? "Request failed",
    );
  }

  return data as T;
}

export async function getHostMe() {
  const response = await fetch(`${API_BASE_URL}/hosts/me`, {
    credentials: "include",
  });

  return readJson<HostMeResponse>(response);
}

export async function createHostApplication(input: { notes?: string }) {
  const response = await fetch(`${API_BASE_URL}/hosts/applications`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson<{ profile: HostProfile }>(response);
}

export async function discoverServerLocation(address: string) {
  const response = await fetch(`${API_BASE_URL}/hosts/discover`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  return readJson<{ location: DiscoveredServerLocation }>(response);
}

export async function getMyServers() {
  const response = await fetch(`${API_BASE_URL}/hosts/me/servers`, {
    credentials: "include",
  });

  return readJson<{ servers: ServerRecord[] }>(response);
}

export async function createServer(input: {
  address: string;
  port?: number;
  displayName: string;
  country?: string;
  region?: string;
  contact?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/hosts/servers`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson<{ server: ServerRecord }>(response);
}

export async function updateServer(input: {
  serverId: string;
  address: string;
  port?: number;
  displayName: string;
  country?: string;
  region?: string;
  contact?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/hosts/servers/${input.serverId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: input.address,
        port: input.port,
        displayName: input.displayName,
        country: input.country,
        region: input.region,
        contact: input.contact,
      }),
    },
  );

  return readJson<{ server: ServerRecord }>(response);
}

export async function removeServer(serverId: string) {
  const response = await fetch(`${API_BASE_URL}/hosts/servers/${serverId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return readJson<{ ok: true }>(response);
}

export async function getServerDetails(serverId: string) {
  const response = await fetch(`${API_BASE_URL}/hosts/servers/${serverId}`, {
    credentials: "include",
  });

  return readJson<HostServerDetailsResponse>(response);
}

export async function verifyServer(input: {
  serverId: string;
  token: string;
  pluginVersion?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/hosts/servers/${input.serverId}/verify`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: input.token,
        pluginVersion: input.pluginVersion,
      }),
    },
  );

  return readJson<{ server: ServerRecord }>(response);
}

export async function rotateServerToken(serverId: string) {
  const response = await fetch(
    `${API_BASE_URL}/hosts/servers/${serverId}/token`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return readJson<{ server: ServerRecord }>(response);
}

export async function setDrainMode(serverId: string, enabled: boolean) {
  const response = await fetch(
    `${API_BASE_URL}/hosts/servers/${serverId}/drain`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    },
  );

  return readJson<{ server: ServerRecord }>(response);
}
