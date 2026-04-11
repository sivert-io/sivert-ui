import { useNavigate } from "react-router";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Link } from "../components/Link";
import { HostBadge } from "../components/HostBadge";
import { useAuth } from "../auth/useAuth";

function FeatureCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-primary/15 bg-black/10 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-sm text-foreground-muted">{children}</div>
    </div>
  );
}

function Step({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-primary/15 bg-black/10 p-5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
        {index}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="text-sm text-foreground-muted">{children}</div>
      </div>
    </div>
  );
}

export function HostView() {
  const { isSignedIn, user, signIn } = useAuth();
  const navigate = useNavigate();

  function handlePrimaryCta() {
    if (!isSignedIn) {
      signIn("/servers/apply");
      return;
    }

    if (user?.hostStatus) {
      navigate("/servers");
      return;
    }

    navigate("/servers/apply");
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-5">
            <div className="inline-flex w-fit rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Community Hosting
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
                Host community servers for FLOW
              </h1>
              <p className="max-w-2xl text-sm text-foreground-muted md:text-base">
                Help power fair, community-driven CS2 matches. Register your
                server, verify ownership through the FLOW plugin, and earn
                recognition as a trusted host.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handlePrimaryCta} variant="solid">
                {!isSignedIn
                  ? "Sign in to host"
                  : user?.hostStatus
                    ? "Open host dashboard"
                    : "Apply to host"}
              </Button>
              <Button href="/about" variant="ghost">
                Learn more about FLOW
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-foreground-muted">
              <span>Approved hosts receive a public badge:</span>
              <HostBadge />
            </div>
          </div>

          <div className="rounded-3xl border border-primary/15 bg-black/20 p-5">
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Host Program
                </p>
                <h2 className="text-xl font-semibold">What you get</h2>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-success/20 bg-success/10 p-4">
                  <p className="text-sm font-medium text-success">
                    Verified server status
                  </p>
                </div>
                <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
                  <p className="text-sm font-medium text-secondary">
                    Host badge on your profile
                  </p>
                </div>
                <div className="rounded-2xl border border-info/20 bg-info/10 p-4">
                  <p className="text-sm font-medium text-info">
                    Access to server health and registration tools
                  </p>
                </div>
              </div>

              <p className="text-xs text-foreground-muted">
                Hosting is intended for trusted community members who want to
                support healthy matchmaking infrastructure.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard title="Recognition">
          Verified hosts get a visible badge and become part of the public
          identity of the platform.
        </FeatureCard>

        <FeatureCard title="Simple onboarding">
          Start with your server IP and basic details, then verify ownership
          through the plugin.
        </FeatureCard>

        <FeatureCard title="Operational control">
          Manage registered servers, review verification state, and see health
          issues from one place.
        </FeatureCard>
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              How it works
            </p>
            <h2 className="text-2xl font-bold">
              Become a FLOW host in 4 steps
            </h2>
          </div>

          <div className="grid gap-4">
            <Step index={1} title="Submit your server details">
              Paste your server IP and port, choose a display name, and confirm
              your contact details.
            </Step>
            <Step index={2} title="Verify ownership">
              Install the FLOW plugin, add your verification token, and let the
              platform confirm that you control the server.
            </Step>
            <Step index={3} title="Pass automatic checks">
              FLOW validates that the server is reachable and assigns a routing
              region based on the server location.
            </Step>
            <Step index={4} title="Get approved and start hosting">
              Once approved, your account receives host status and your server
              appears in your host dashboard.
            </Step>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Requirements</h2>
          <div className="grid gap-3 text-sm text-foreground-muted md:grid-cols-2">
            <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
              Reasonable uptime and stable connectivity
            </div>
            <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
              Installation of the FLOW server plugin
            </div>
            <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
              Willingness to follow platform fairness and abuse-prevention rules
            </div>
            <div className="rounded-2xl border border-primary/15 bg-black/10 p-4">
              Responsiveness if your server needs re-verification or attention
            </div>
          </div>

          <div className="pt-2">
            <Link to={isSignedIn ? "/servers/apply" : "/host"}>
              {isSignedIn ? "Apply now" : "Sign in to apply"}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
