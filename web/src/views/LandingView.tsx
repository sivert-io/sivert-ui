import { Link } from "../components/Link";
import { Logo } from "../components/Logo";

export function LandingView() {
  return (
    <div className="fixed inset-0 overflow-y-auto py-24">
      <div className="min-h-full flex flex-col items-center justify-center gap-12 p-8">
        <div className="flex flex-col gap-4 items-center">
          <p className="font-medium">Find your</p>
          <Logo solid />
        </div>

        <div className="w-full aspect-video max-w-6xl bg-black rounded-2xl shrink-0" />

        <div className="flex items-center gap-12 w-full justify-center">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link target="_blank" to="https://github.com">
            GitHub
          </Link>
        </div>
      </div>
    </div>
  );
}
