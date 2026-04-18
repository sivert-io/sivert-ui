import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button";
import {
  createHostApplication,
  createServer,
  discoverServerLocation,
} from "../lib/hosts";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";

function StepPill({
  active,
  complete,
  label,
  index,
}: {
  active?: boolean;
  complete?: boolean;
  label: string;
  index: number;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border px-4 py-3",
        active
          ? "border-primary/30 bg-primary/10"
          : complete
            ? "border-success/20 bg-success/10"
            : "border-primary/15 bg-black/10",
      ].join(" ")}
    >
      <div
        className={[
          "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
          active
            ? "bg-primary text-background"
            : complete
              ? "bg-success text-background"
              : "bg-white/10 text-primary",
        ].join(" ")}
      >
        {index}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function ChecklistItem({
  checked,
  title,
  children,
  onToggle,
}: {
  checked: boolean;
  title: string;
  children: React.ReactNode;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
        checked
          ? "border-success/25 bg-success/10"
          : "border-primary/15 bg-black/10 hover:border-primary/25",
      ].join(" ")}
    >
      <div
        className={[
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
          checked ? "bg-success text-background" : "bg-white/10 text-primary",
        ].join(" ")}
      >
        {checked ? "✓" : "•"}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-foreground-muted">{children}</p>
      </div>
    </button>
  );
}

function sanitizeAddressInput(value: string) {
  return value
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .split(/[/?#]/)[0]
    .trim();
}

export function ServerApplyView() {
  const { refreshAuth } = useAuth();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [port, setPort] = useState("27015");
  const [serverName, setServerName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [createdServerId, setCreatedServerId] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState("");
  const [detectedRegion, setDetectedRegion] = useState("");
  const [resolvedIp, setResolvedIp] = useState("");

  const [understandsBadge, setUnderstandsBadge] = useState(false);
  const [understandsPlugin, setUnderstandsPlugin] = useState(false);
  const [understandsRules, setUnderstandsRules] = useState(false);

  const sanitizedAddress = useMemo(
    () => sanitizeAddressInput(address),
    [address],
  );

  const canContinueFromChecklist =
    understandsBadge && understandsPlugin && understandsRules;

  const canCreateServer = useMemo(() => {
    return (
      sanitizedAddress.length > 0 &&
      port.trim().length > 0 &&
      serverName.trim().length > 0 &&
      contact.trim().length > 0
    );
  }, [sanitizedAddress, port, serverName, contact]);

  useEffect(() => {
    if (!sanitizedAddress) {
      setDetectedCountry("");
      setDetectedRegion("");
      setResolvedIp("");
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsDetectingLocation(true);

        const result = await discoverServerLocation(sanitizedAddress);

        setDetectedCountry(result.location.country ?? "");
        setDetectedRegion(result.location.region ?? "");
        setResolvedIp(result.location.resolvedIp ?? "");
      } catch {
        setDetectedCountry("");
        setDetectedRegion("");
        setResolvedIp("");
      } finally {
        setIsDetectingLocation(false);
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sanitizedAddress]);

  async function handleCreateApplicationAndServer() {
    if (!canCreateServer) return;

    setIsSubmitting(true);

    try {
      await createHostApplication({
        notes: notes.trim() || undefined,
      });

      const created = await createServer({
        address: sanitizedAddress,
        port: Number(port),
        displayName: serverName.trim(),
        country: detectedCountry || undefined,
        region: detectedRegion || undefined,
        contact: contact.trim() || undefined,
      });

      setCreatedServerId(created.server.id);
      setCreatedToken(created.server.verificationToken);
      await refreshAuth();
      setStep(3);
      toast("Server registered");
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error ? error.message : "Failed to register server",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        <StepPill
          index={1}
          label="Checklist"
          active={step === 1}
          complete={step > 1}
        />
        <StepPill
          index={2}
          label="Server info"
          active={step === 2}
          complete={step > 2}
        />
        <StepPill
          index={3}
          label="Verification"
          active={step === 3}
          complete={false}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          {step === 1 ? (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Step 1
                </p>
                <h1 className="text-2xl font-bold">Before you apply</h1>
                <p className="text-sm text-foreground-muted">
                  Confirm these three points before continuing.
                </p>
              </div>

              <div className="grid gap-3">
                <ChecklistItem
                  checked={understandsBadge}
                  onToggle={() => setUnderstandsBadge((value) => !value)}
                  title="I understand the host badge is public"
                >
                  Approved hosting status becomes part of your public profile.
                </ChecklistItem>

                <ChecklistItem
                  checked={understandsPlugin}
                  onToggle={() => setUnderstandsPlugin((value) => !value)}
                  title="I understand plugin verification is required"
                >
                  You must install the FLOW plugin and add a verification token
                  to prove server ownership.
                </ChecklistItem>

                <ChecklistItem
                  checked={understandsRules}
                  onToggle={() => setUnderstandsRules((value) => !value)}
                  title="I understand the server must be stable and fair"
                >
                  Your server should stay reachable, and you are expected to
                  follow platform rules and respond if issues come up.
                </ChecklistItem>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canContinueFromChecklist}
                >
                  I understand, continue
                </Button>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Step 2
                </p>
                <h1 className="text-2xl font-bold">Server info</h1>
                <p className="text-sm text-foreground-muted">
                  Add the public address and basic contact info. Keep it short.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Server address *"
                  placeholder="123.123.123.123 or play.example.com"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <InputField
                  label="Port *"
                  placeholder="27015"
                  value={port}
                  onChange={(e) =>
                    setPort(e.target.value.replace(/[^\d]/g, ""))
                  }
                />
                <InputField
                  label="Public server name *"
                  placeholder="FLOW Oslo #1"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                />
                <InputField
                  label="Contact method *"
                  placeholder="Discord, email, or Steam"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              <InputField
                label="Notes"
                placeholder="Optional details about region, hardware, or availability"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="grid gap-3 rounded-2xl border border-primary/15 bg-black/10 p-4 md:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Clean input
                  </p>
                  <p className="mt-1 break-all text-sm">
                    {sanitizedAddress || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Resolved IP
                  </p>
                  <p className="mt-1 break-all text-sm">
                    {isDetectingLocation
                      ? "Resolving..."
                      : resolvedIp || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Country
                  </p>
                  <p className="mt-1 text-sm">
                    {isDetectingLocation
                      ? "Resolving..."
                      : detectedCountry || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Region
                  </p>
                  <p className="mt-1 text-sm">
                    {isDetectingLocation
                      ? "Resolving..."
                      : detectedRegion || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleCreateApplicationAndServer}
                  disabled={!canCreateServer || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Create application"}
                </Button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Step 3
                </p>
                <h1 className="text-2xl font-bold">Verify ownership</h1>
                <p className="text-sm text-foreground-muted">
                  Add this token to the FLOW plugin on your server, then verify
                  from the server page.
                </p>
              </div>

              <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary/80">
                  Verification token
                </p>
                <p className="mt-2 break-all font-mono text-sm">
                  {createdToken ?? "No token created"}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4 text-sm">
                  1. Install the FLOW server plugin
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4 text-sm">
                  2. Paste in your verification token
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4 text-sm">
                  3. Restart or reload the server, then verify it in the
                  dashboard
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="ghost" href="/servers">
                  Go to dashboard
                </Button>
                <Button
                  href={
                    createdServerId ? `/servers/${createdServerId}` : "/servers"
                  }
                  variant="solid"
                >
                  Open server
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
