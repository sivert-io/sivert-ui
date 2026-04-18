import { useNavigate } from "react-router";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { HostBadge } from "../components/HostBadge";
import { useAuth } from "../auth/useAuth";

function RequirementItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-black/10 px-4 py-3 text-sm text-foreground-muted">
      {children}
    </div>
  );
}

function StepItem({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-black/10 px-4 py-4">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
        {index}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-foreground-muted">{children}</p>
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
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Card>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Community Hosting
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
                Apply to host a FLOW server
              </h1>
              <p className="max-w-2xl text-sm text-foreground-muted md:text-base">
                Keep it simple: approved hosts get a public badge, can register
                servers, and can verify ownership through the FLOW plugin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
              <span>Approved hosts receive:</span>
              <HostBadge />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={handlePrimaryCta} variant="solid">
                {!isSignedIn
                  ? "Sign in to apply"
                  : user?.hostStatus
                    ? "Open host dashboard"
                    : "Apply now"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-primary/15 bg-black/20 p-5">
            <div className="flex h-full flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                What you get
              </p>

              <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
                <p className="text-sm font-medium text-secondary">
                  Public host badge on your profile
                </p>
              </div>

              <div className="rounded-2xl border border-success/20 bg-success/10 p-4">
                <p className="text-sm font-medium text-success">
                  Verified server registration and ownership tools
                </p>
              </div>

              <div className="rounded-2xl border border-info/20 bg-info/10 p-4">
                <p className="text-sm font-medium text-info">
                  Access to your server dashboard and verification flow
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              Requirements
            </p>
            <h2 className="mt-1 text-2xl font-bold">Before you apply</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <RequirementItem>
              Stable server uptime and a reachable public address
            </RequirementItem>
            <RequirementItem>
              Willingness to install the FLOW plugin for verification
            </RequirementItem>
            <RequirementItem>
              A contact method in case the server needs attention
            </RequirementItem>
            <RequirementItem>
              Agreement to follow fairness and abuse-prevention rules
            </RequirementItem>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              How it works
            </p>
            <h2 className="mt-1 text-2xl font-bold">Three short steps</h2>
          </div>

          <div className="grid gap-3">
            <StepItem index={1} title="Confirm the requirements">
              Read the checklist and confirm that you understand what hosting
              requires.
            </StepItem>
            <StepItem index={2} title="Enter your server info">
              Add the public address, port, display name, and contact method.
            </StepItem>
            <StepItem index={3} title="Verify ownership">
              Copy your verification token into the FLOW plugin and finish the
              verification from your dashboard.
            </StepItem>
          </div>
        </div>
      </Card>
    </div>
  );
}
