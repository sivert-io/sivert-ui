import { Link } from "../components/Link";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../auth/useAuth";

export function LandingView() {
  const { signIn } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="font-medium text-primary/80">Find your</p>
        <Logo solid />
        <p className="max-w-xl text-sm text-foreground-muted">
          Community-driven CS2 matchmaking with verified hosts, self-hosted
          servers, and a social-first queue experience.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            onClick={() => {
              signIn();
            }}
            variant="solid"
          >
            Start playing
          </Button>
          <Button href="/about" variant="ghost">
            About FLOW
          </Button>
        </div>
      </div>

      <div className="aspect-video w-full max-w-6xl shrink-0 rounded-2xl border border-primary/15 bg-black/30" />

      <div className="flex w-full flex-wrap items-center justify-center gap-12">
        <Link to="/about">About</Link>
        <Link to="/host">Host</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link target="_blank" to="https://github.com">
          GitHub
        </Link>
      </div>
    </div>
  );
}
