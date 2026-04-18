import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { HostBadge } from "../components/HostBadge";
import { Skeleton } from "../components/Skeleton";
import { Modal } from "../components/Modal";
import { InputField } from "../components/InputField/InputField";
import { useAuth } from "../auth/useAuth";
import {
  createHostApplication,
  getHostMe,
  getMyServers,
  removeServer,
  updateServer,
  type HostMeResponse,
  type ServerRecord,
} from "../lib/hosts";

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

function sanitizeAddressInput(value: string) {
  return value
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .split(/[/?#]/)[0]
    .trim();
}

function prettyHostStatus(
  status: HostMeResponse["profile"] extends infer P
    ? P extends { status: infer S }
      ? S | null
      : null
    : null,
) {
  if (status === "verified") return "Approved";
  if (status === "pending") return "Waiting for review";
  if (status === "rejected") return "Needs changes";
  if (status === "suspended") return "Suspended";
  return "Not applied";
}

function prettyServerStatus(server: ServerRecord) {
  if (server.status === "verified") return "Verified";
  if (server.status === "pending_verification") return "In progress";
  if (server.status === "needs_attention") return "Needs attention";
  if (server.status === "draining") return "Draining";
  if (server.status === "suspended") return "Suspended";
  return "Removed";
}

function statusChipClasses(status: ServerRecord["status"]) {
  if (status === "verified") {
    return "border-success/20 bg-success/10 text-success";
  }

  if (status === "pending_verification" || status === "draining") {
    return "border-secondary/20 bg-secondary/10 text-secondary";
  }

  return "border-danger/20 bg-danger/10 text-danger";
}

function StatusChip({ server }: { server: ServerRecord }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusChipClasses(server.status)}`}
    >
      {prettyServerStatus(server)}
    </span>
  );
}

function HostStatusChip({
  status,
}: {
  status: "pending" | "verified" | "rejected" | "suspended" | null;
}) {
  const classes =
    status === "verified"
      ? "border-success/20 bg-success/10 text-success"
      : status === "pending"
        ? "border-secondary/20 bg-secondary/10 text-secondary"
        : "border-danger/20 bg-danger/10 text-danger";

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {prettyHostStatus(status)}
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
              Apply once, then manage your submitted servers from one place.
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
            <h2 className="text-lg font-semibold">What you get</h2>
            <div className="flex flex-col gap-3 text-sm text-foreground-muted">
              <p>A public host badge once approved.</p>
              <p>Server verification and health management.</p>
              <p>One dashboard for pending and active servers.</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-40 rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}

function ServerManageModal({
  open,
  setOpen,
  server,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  server: ServerRecord | null;
  onSaved: (server: ServerRecord) => void;
  onDeleted: (serverId: string) => void;
}) {
  const [address, setAddress] = useState("");
  const [port, setPort] = useState("27015");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [contact, setContact] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!server) return;

    setAddress(server.hostInput ?? server.ipAddress);
    setPort(String(server.port));
    setDisplayName(server.displayName);
    setCountry(server.country ?? "");
    setRegion(server.region ?? "");
    setContact(server.contact ?? "");
  }, [server]);

  async function handleSave() {
    if (!server) return;

    try {
      setIsSaving(true);

      const result = await updateServer({
        serverId: server.id,
        address: sanitizeAddressInput(address),
        port: Number(port),
        displayName: displayName.trim(),
        country: country.trim() || undefined,
        region: region.trim() || undefined,
        contact: contact.trim() || undefined,
      });

      onSaved(result.server);
      setOpen(false);
      toast("Server updated");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to update server");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!server) return;

    try {
      setIsDeleting(true);
      await removeServer(server.id);
      onDeleted(server.id);
      setOpen(false);
      toast("Server removed");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to remove server");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal open={open} setOpen={setOpen} panelClassName="max-w-2xl">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Manage server</h2>
            <p className="text-sm text-foreground-muted">
              Update details or remove this application.
            </p>
          </div>
          {server ? <StatusChip server={server} /> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Server address *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123.123.123.123 or play.example.com"
          />
          <InputField
            label="Port *"
            value={port}
            onChange={(e) => setPort(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="27015"
          />
          <InputField
            label="Public server name *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="FLOW Oslo #1"
          />
          <InputField
            label="Contact method"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Discord, email, or Steam"
          />
          <InputField
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Norway"
          />
          <InputField
            label="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Innlandet"
          />
        </div>

        <div className="rounded-2xl border border-primary/15 bg-black/10 p-4 text-sm text-foreground-muted">
          Changing address or port will put the server back into verification
          and generate a new verification token.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            color="danger"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
          >
            {isDeleting ? "Removing..." : "Delete server"}
          </Button>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              color="black"
              onClick={() => setOpen(false)}
              disabled={isDeleting || isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isDeleting || isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ServerGrid({
  servers,
  onManage,
}: {
  servers: ServerRecord[];
  onManage: (server: ServerRecord) => void;
}) {
  if (servers.length === 0) {
    return (
      <div className="rounded-2xl border border-primary/15 bg-black/10 p-5 text-sm text-foreground-muted">
        No submitted servers yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {servers.map((server) => (
        <button
          key={server.id}
          type="button"
          onClick={() => onManage(server)}
          className="flex flex-col gap-4 rounded-3xl border border-primary/15 bg-black/10 p-5 text-left transition hover:border-primary/30 hover:bg-black/15"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {server.displayName}
              </p>
              <p className="mt-1 truncate text-sm text-foreground-muted">
                {server.hostInput ?? server.ipAddress}:{server.port}
              </p>
            </div>
            <StatusChip server={server} />
          </div>

          <div className="grid gap-3 text-sm text-foreground-muted">
            <div className="flex items-center justify-between gap-3">
              <span>Location</span>
              <span className="text-right text-foreground">
                {[server.country, server.region].filter(Boolean).join(" · ") ||
                  "Unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Last heartbeat</span>
              <span className="text-right text-foreground">
                {formatRelativeTime(server.lastHeartbeatAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Verification</span>
              <span className="text-right text-foreground">
                {server.verificationStatus === "passed"
                  ? "Passed"
                  : server.verificationStatus === "failed"
                    ? "Failed"
                    : "Pending"}
              </span>
            </div>
          </div>

          <div className="pt-1 text-sm text-primary">Manage</div>
        </button>
      ))}
    </div>
  );
}

function Dashboard({
  me,
  servers,
  onApply,
  isApplying,
  onManage,
}: {
  me: HostMeResponse;
  servers: ServerRecord[];
  onApply: () => void;
  isApplying: boolean;
  onManage: (server: ServerRecord) => void;
}) {
  const hostStatus = me.profile?.status ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">Your server applications</h1>
              <HostStatusChip status={hostStatus} />
              {me.profile?.badgeVariant ? (
                <HostBadge variant={me.profile.badgeVariant} />
              ) : null}
            </div>

            <p className="max-w-2xl text-sm text-foreground-muted">
              See every submitted server, track status, and open a server to
              update or remove it.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/servers/apply">Add server</Button>
            {hostStatus !== "verified" ? (
              <Button variant="ghost" onClick={onApply} disabled={isApplying}>
                {isApplying ? "Submitting..." : "Refresh application"}
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {hostStatus === "pending" ? (
        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary/80">
              Waiting for review
            </p>
            <p className="text-sm text-foreground-muted">
              Your host profile is pending. You can still add, edit, and verify
              servers while you wait.
            </p>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Submitted
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
              Verification or health issue
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">My servers</h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Click a card to update or delete it.
              </p>
            </div>
            <Button href="/servers/apply" size="sm" variant="ghost">
              Register another
            </Button>
          </div>

          <ServerGrid servers={servers} onManage={onManage} />
        </div>
      </Card>
    </div>
  );
}

export function ServersView() {
  const { user, refreshAuth } = useAuth();
  const [me, setMe] = useState<HostMeResponse | null>(null);
  const [servers, setServers] = useState<ServerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [managedServer, setManagedServer] = useState<ServerRecord | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  async function load() {
    try {
      setIsLoading(true);

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

  function handleOpenManage(server: ServerRecord) {
    setManagedServer(server);
    setIsManageModalOpen(true);
  }

  function handleSaved(updatedServer: ServerRecord) {
    setServers((current) =>
      current.map((server) =>
        server.id === updatedServer.id ? updatedServer : server,
      ),
    );
    setManagedServer(updatedServer);
  }

  function handleDeleted(serverId: string) {
    setServers((current) => current.filter((server) => server.id !== serverId));
    setManagedServer(null);
  }

  const effectiveStatus = useMemo<
    "pending" | "verified" | "rejected" | "suspended" | null
  >(() => {
    return me?.profile?.status ?? user?.hostStatus ?? null;
  }, [me, user?.hostStatus]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!effectiveStatus && servers.length === 0) {
    return <EmptyState isApplying={isApplying} onApply={handleApply} />;
  }

  return (
    <>
      <Dashboard
        me={
          me ?? {
            profile: null,
            summary: {
              totalServers: servers.length,
              verifiedServers: servers.filter((s) => s.status === "verified")
                .length,
              actionNeededServers: servers.filter(
                (s) => s.status === "needs_attention",
              ).length,
            },
          }
        }
        servers={servers}
        onApply={handleApply}
        isApplying={isApplying}
        onManage={handleOpenManage}
      />

      <ServerManageModal
        open={isManageModalOpen}
        setOpen={setIsManageModalOpen}
        server={managedServer}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  );
}
