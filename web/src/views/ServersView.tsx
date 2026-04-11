import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { HostBadge } from "../components/HostBadge";
import { useAuth } from "../auth/useAuth";
import { Skeleton } from "../components/Skeleton";
import {
  createHostApplication,
  getHostMe,
  getMyServers,
  type HostMeResponse,
  type ServerRecord,
} from "../lib/hosts";
import { toast } from "sonner";

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

function prettyServerStatus(server: ServerRecord) {
  if (server.status === "verified") return "Verified";
  if (server.status === "pending_verification") return "Pending verification";
  if (server.status === "needs_attention") return "Needs attention";
  if (server.status === "draining") return "Draining";
  if (server.status === "suspended") return "Suspended";
  return "Removed";
}

function StatusChip({ server }: { server: ServerRecord }) {
  const label = prettyServerStatus(server);

  const classes =
    server.status === "verified"
      ? "border-success/20 bg-success/10 text-success"
      : server.status === "pending_verification" || server.status === "draining"
        ? "border-secondary/20 bg-secondary/10 text-secondary"
        : "border-danger/20 bg-danger/10 text-danger";

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

function EmptyState({
  isApplying,
  onApply,
}: {
  isApplying: boolean;
  onApply: () => void;
}) {
  return (
    <Card>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Community Servers
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Become a host</h1>
            <p className="max-w-2xl text-sm text-foreground-muted">
              Register and verify your CS2 server to help power the FLOW
              community. Approved hosts receive a public badge and access to
              server management tools.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onApply} variant="solid" disabled={isApplying}>
              {isApplying ? "Applying..." : "Apply to host"}
            </Button>
            <Button href="/host" variant="ghost">
              How hosting works
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-black/10 p-5">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Why host?</h2>
            <div className="flex flex-col gap-3 text-sm text-foreground-muted">
              <p>Support fair, community-first CS2 matchmaking.</p>
              <p>Keep control of your own hardware and setup.</p>
              <div className="flex items-center gap-2">
                <span>Earn the</span>
                <HostBadge />
                <span>badge.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PendingHostState({
  isApplying,
  onApply,
}: {
  isApplying: boolean;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Host application pending
          </div>
          <h1 className="text-3xl font-bold">
            Your host access is in progress
          </h1>
          <p className="max-w-2xl text-sm text-foreground-muted">
            You can continue registering and verifying servers while your host
            profile is pending. Your public badge will appear after verification
            and approval.
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Next step</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Add and verify your first server.
            </p>
          </div>

          <Button href="/servers/apply">Register server</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Need to re-submit?</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              You can refresh your application notes here.
            </p>
          </div>

          <Button onClick={onApply} variant="ghost" disabled={isApplying}>
            {isApplying ? "Submitting..." : "Update application"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function HostDashboard({
  me,
  servers,
}: {
  me: HostMeResponse;
  servers: ServerRecord[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">Your servers</h1>
              {me.profile?.badgeVariant ? (
                <HostBadge variant={me.profile.badgeVariant} />
              ) : null}
            </div>
            <p className="text-sm text-foreground-muted">
              Manage registered servers, verify plugin health, and review
              actions that need your attention.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/servers/apply" variant="solid">
              Add server
            </Button>
            <Button href="/host" variant="ghost">
              Host docs
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Registered
            </p>
            <p className="text-3xl font-bold">{me.summary.totalServers}</p>
            <p className="text-sm text-foreground-muted">
              Servers on your account
            </p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Verified
            </p>
            <p className="text-3xl font-bold">{me.summary.verifiedServers}</p>
            <p className="text-sm text-foreground-muted">
              Ready for production
            </p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Needs attention
            </p>
            <p className="text-3xl font-bold">
              {me.summary.actionNeededServers}
            </p>
            <p className="text-sm text-foreground-muted">
              Verification or connectivity issue
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">My servers</h2>
            <Button href="/servers/apply" size="sm" variant="ghost">
              Register another
            </Button>
          </div>

          {servers.length === 0 ? (
            <div className="rounded-2xl border border-primary/15 bg-black/10 p-5 text-sm text-foreground-muted">
              No servers registered yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {servers.map((server) => (
                <div
                  key={server.id}
                  className="grid gap-4 rounded-2xl border border-primary/15 bg-black/10 p-4 lg:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_auto]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{server.displayName}</p>
                    <p className="text-sm text-foreground-muted">
                      {[server.country, server.region]
                        .filter(Boolean)
                        .join(" · ") || `${server.ipAddress}:${server.port}`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                      Status
                    </p>
                    <StatusChip server={server} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                      Plugin
                    </p>
                    <p className="text-sm">
                      {server.pluginVersion ?? "Unknown"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                      Last heartbeat
                    </p>
                    <p className="text-sm">
                      {formatRelativeTime(server.lastHeartbeatAt)}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <Button
                      href={`/servers/${server.id}`}
                      size="sm"
                      variant="ghost"
                    >
                      Manage
                    </Button>
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

function LoadingState() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-40 rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}

export function ServersView() {
  const { user, refreshAuth } = useAuth();
  const [me, setMe] = useState<HostMeResponse | null>(null);
  const [servers, setServers] = useState<ServerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  async function load() {
    setIsLoading(true);

    try {
      const [meResult, serversResult] = await Promise.all([
        getHostMe(),
        getMyServers(),
      ]);

      setMe(meResult);
      setServers(serversResult.servers);
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to load hosts");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleApply() {
    setIsApplying(true);

    try {
      await createHostApplication({});
      await refreshAuth();
      await load();
      toast("Host application submitted");
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error ? error.message : "Failed to submit application",
      );
    } finally {
      setIsApplying(false);
    }
  }

  const effectiveStatus = useMemo(() => {
    return me?.profile?.status ?? user?.hostStatus ?? null;
  }, [me?.profile?.status, user?.hostStatus]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!effectiveStatus) {
    return <EmptyState isApplying={isApplying} onApply={handleApply} />;
  }

  if (effectiveStatus === "pending") {
    return <PendingHostState isApplying={isApplying} onApply={handleApply} />;
  }

  if (effectiveStatus === "verified" && me) {
    return <HostDashboard me={me} servers={servers} />;
  }

  return <EmptyState isApplying={isApplying} onApply={handleApply} />;
}
