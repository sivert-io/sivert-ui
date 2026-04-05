import { Link } from "../components/Link";
import { Logo } from "../components/Logo";

export function LandingView() {
  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center gap-12 py-12">
      <div className="flex flex-col items-center gap-4">
        <p className="font-medium">Find your</p>
        <Logo solid />
      </div>

      <div className="aspect-video w-full max-w-6xl shrink-0 rounded-2xl bg-black" />

      <div className="flex w-full flex-wrap items-center justify-center gap-12">
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link target="_blank" to="https://github.com">
          GitHub
        </Link>
      </div>
    </div>
  );
}
