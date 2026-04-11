import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import {
  getServerDetails,
  rotateServerToken,
  setDrainMode,
  verifyServer,
  type HostServerDetailsResponse,
} from "../lib/hosts";
import { Skeleton } from "../components/Skeleton";

function StatusChip({
  children,
  tone = "success",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger";
}) {
  const classes =
    tone === "success"
      ? "border-success/20 bg-success/10 text-success"
      : tone === "warning"
        ? "border-secondary/20 bg-secondary/10 text-secondary"
        : "border-danger/20 bg-danger/10 text-danger";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {children}
    </span>
  );
}

function formatRelativeTime(value: string | null) {
  if (!value) return "Never";

  const then = new Date(value).getTime();
  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function statusTone(status: string) {
  if (status === "verified") return "success";
  if (status === "pending_verification" || status === "draining") {
    return "warning";
  }
  return "danger";
}

function prettyStatus(status: string) {
  if (status === "pending_verification") return "Pending verification";
  if (status === "verified") return "Verified";
  if (status === "needs_attention") return "Needs attention";
  if (status === "draining") return "Draining";
  if (status === "suspended") return "Suspended";
  return status;
}

function prettyHeartbeatStatus(status: string | undefined) {
  if (status === "in_match") return "In match";
  if (status === "idle") return "Idle";
  if (status === "offline") return "Offline";
  return "Online";
}

export function ServerDetailsView() {
  const { serverId } = useParams();
  const [data, setData] = useState<HostServerDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTogglingDrain, setIsTogglingDrain] = useState(false);

  async function load() {
    if (!serverId) return;

    setIsLoading(true);

    try {
      const result = await getServerDetails(serverId);
      setData(result);
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to load server");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [serverId]);

  const latestHeartbeat = useMemo(() => {
    return data?.heartbeats?.[0] ?? null;
  }, [data?.heartbeats]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-36 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!data?.server) {
    return (
      <Card>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Server not found</h1>
          <p className="text-sm text-foreground-muted">
            This server could not be loaded.
          </p>
        </div>
      </Card>
    );
  }

  const server = data.server;
  const drainEnabled = server.status === "draining";

  async function handleRotateToken() {
    if (!serverId) return;

    setIsRotating(true);

    try {
      await rotateServerToken(serverId);
      await load();
      toast("Verification token rotated");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to rotate token");
    } finally {
      setIsRotating(false);
    }
  }

  async function handleVerify() {
    if (!serverId || !server.verificationToken) return;

    setIsVerifying(true);

    try {
      await verifyServer({
        serverId,
        token: server.verificationToken,
        pluginVersion: server.pluginVersion ?? "1.0.0",
      });
      await load();
      toast("Server verified");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to verify server");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleToggleDrain() {
    if (!serverId) return;

    setIsTogglingDrain(true);

    try {
      await setDrainMode(serverId, !drainEnabled);
      await load();
      toast(drainEnabled ? "Drain mode disabled" : "Drain mode enabled");
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error ? error.message : "Failed to update drain mode",
      );
    } finally {
      setIsTogglingDrain(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Server Overview
            </p>
            <h1 className="text-3xl font-bold">{server.displayName}</h1>
            <p className="text-sm text-foreground-muted">
              {server.hostInput ?? server.ipAddress}:{server.port}
            </p>
            {server.hostInput && server.hostInput !== server.ipAddress ? (
              <p className="text-xs text-foreground-muted">
                Resolved IP: {server.ipAddress}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone={statusTone(server.status)}>
              {prettyStatus(server.status)}
            </StatusChip>
            <StatusChip
              tone={
                latestHeartbeat?.status === "offline" ? "danger" : "warning"
              }
            >
              {prettyHeartbeatStatus(latestHeartbeat?.status)}
            </StatusChip>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Region
            </p>
            <p className="text-xl font-bold">{server.country ?? "Unknown"}</p>
            <p className="text-sm text-foreground-muted">
              {server.region ?? "No routing region"}
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Last heartbeat
            </p>
            <p className="text-xl font-bold">
              {formatRelativeTime(server.lastHeartbeatAt)}
            </p>
            <p className="text-sm text-foreground-muted">
              {latestHeartbeat
                ? prettyHeartbeatStatus(latestHeartbeat.status)
                : "No heartbeat yet"}
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Plugin version
            </p>
            <p className="text-xl font-bold">
              {server.pluginVersion ?? "Unknown"}
            </p>
            <p className="text-sm text-foreground-muted">
              Verification {server.verificationStatus}
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Availability
            </p>
            <p className="text-xl font-bold">
              {drainEnabled ? "Draining" : "Available"}
            </p>
            <p className="text-sm text-foreground-muted">
              Abstract host-safe state only
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Verification token</h2>
          <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
            <p className="break-all font-mono text-sm">
              {server.verificationToken ?? "Unavailable"}
            </p>
          </div>
          <p className="text-sm text-foreground-muted">
            Add this token to your FLOW server plugin config before running
            verification or heartbeats.
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Host actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="ghost"
              onClick={handleRotateToken}
              disabled={isRotating}
            >
              {isRotating ? "Rotating..." : "Rotate token"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleVerify}
              disabled={isVerifying || !server.verificationToken}
            >
              {isVerifying ? "Verifying..." : "Run verification"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleToggleDrain}
              disabled={isTogglingDrain}
            >
              {isTogglingDrain
                ? "Updating..."
                : drainEnabled
                  ? "Disable drain mode"
                  : "Enable drain mode"}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Recent heartbeats</h2>

          {data.heartbeats.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No heartbeats received yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {data.heartbeats.map((heartbeat) => (
                <div
                  key={heartbeat.id}
                  className="rounded-2xl border border-primary/15 bg-black/10 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusChip
                        tone={
                          heartbeat.status === "offline" ? "danger" : "warning"
                        }
                      >
                        {prettyHeartbeatStatus(heartbeat.status)}
                      </StatusChip>
                      <span className="text-sm text-foreground-muted">
                        {formatRelativeTime(heartbeat.receivedAt)}
                      </span>
                    </div>

                    <span className="text-xs text-foreground-muted">
                      Plugin {heartbeat.pluginVersion ?? "Unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
