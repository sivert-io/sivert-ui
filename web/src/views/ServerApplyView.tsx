import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button";
import { Accordion } from "../components/Accordion";
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
  const [resolvedPort, setResolvedPort] = useState<number | null>(null);

  const canGoToVerification = useMemo(() => {
    return address.trim() && port.trim() && serverName.trim() && contact.trim();
  }, [address, port, serverName, contact]);

  useEffect(() => {
    const trimmed = address.trim();

    if (!trimmed) {
      setDetectedCountry("");
      setDetectedRegion("");
      setResolvedIp("");
      setResolvedPort(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsDetectingLocation(true);

        const result = await discoverServerLocation(trimmed);

        setDetectedCountry(result.location.country ?? "");
        setDetectedRegion(result.location.region ?? "");
        setResolvedIp(result.location.resolvedIp ?? "");
        setResolvedPort(result.location.port ?? null);
      } catch {
        setDetectedCountry("");
        setDetectedRegion("");
        setResolvedIp("");
        setResolvedPort(null);
      } finally {
        setIsDetectingLocation(false);
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [address]);

  async function handleCreateApplicationAndServer() {
    if (!canGoToVerification) return;

    setIsSubmitting(true);

    try {
      await createHostApplication({
        notes: notes.trim() || undefined,
      });

      const created = await createServer({
        address: address.trim(),
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
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        <StepPill
          index={1}
          label="Eligibility"
          active={step === 1}
          complete={step > 1}
        />
        <StepPill
          index={2}
          label="Server details"
          active={step === 2}
          complete={step > 2}
        />
        <StepPill
          index={3}
          label="Verification"
          active={step === 3}
          complete={step > 3}
        />
        <StepPill index={4} label="Review" active={step === 4} />
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          {step === 1 ? (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Step 1
                </p>
                <h1 className="text-2xl font-bold">Host eligibility</h1>
                <p className="text-sm text-foreground-muted">
                  Hosting is lightweight to join, but approved servers still
                  need to meet basic trust and operational requirements.
                </p>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  Your server should have stable uptime and predictable
                  connectivity.
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  You must install the FLOW plugin to verify ownership and
                  exchange server health data.
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  Hosts are expected to follow platform rules and avoid
                  tampering, griefing, or manipulation.
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>Continue</Button>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Step 2
                </p>
                <h1 className="text-2xl font-bold">Server details</h1>
                <p className="text-sm text-foreground-muted">
                  You can enter an IP, domain, or domain with port.
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
                  onChange={(e) => setPort(e.target.value)}
                />
                <InputField
                  label="Server display name *"
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
                label="Application notes"
                placeholder="Optional notes about hardware, region coverage, or availability"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="grid gap-3 rounded-2xl border border-primary/15 bg-black/10 p-4 md:grid-cols-4">
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
                    Resolved port
                  </p>
                  <p className="mt-1 text-sm">
                    {isDetectingLocation
                      ? "Resolving..."
                      : (resolvedPort ?? Number(port))}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Detected country
                  </p>
                  <p className="mt-1 text-sm">
                    {isDetectingLocation
                      ? "Resolving..."
                      : detectedCountry || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Matchmaking region
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
                  disabled={!canGoToVerification || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Continue"}
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
                  Install the FLOW plugin on your server and add the token below
                  to the plugin configuration.
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
                  2. Add the token to your plugin config
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4 text-sm">
                  3. Restart or reload your server
                </div>
                <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4 text-sm text-secondary">
                  4. Open the server page and run verification when your plugin
                  is ready
                </div>
              </div>

              <Accordion label="Why do I need to verify ownership?">
                <p className="text-sm text-foreground-muted">
                  Verification prevents users from registering servers they do
                  not control and lets FLOW confirm that your plugin is working
                  correctly.
                </p>
              </Accordion>

              <div className="flex justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>Continue</Button>
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Step 4
                </p>
                <h1 className="text-2xl font-bold">Review submission</h1>
                <p className="text-sm text-foreground-muted">
                  Your host profile and server have been created. Continue to
                  the dashboard or open the server page to verify it.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Server
                  </p>
                  <p className="mt-1 text-sm">{serverName}</p>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Address input
                  </p>
                  <p className="mt-1 text-sm">{address}</p>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Resolved endpoint
                  </p>
                  <p className="mt-1 text-sm">
                    {resolvedIp || "Unknown"}:{resolvedPort ?? Number(port)}
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Location
                  </p>
                  <p className="mt-1 text-sm">
                    {[detectedCountry, detectedRegion]
                      .filter(Boolean)
                      .join(" · ") || "Unknown"}
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    Token issued
                  </p>
                  <p className="mt-1 break-all text-sm font-mono">
                    {createdToken ?? "Unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
                  <p className="text-sm font-medium text-secondary">
                    Verification is still required before the server becomes
                    fully approved
                  </p>
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
