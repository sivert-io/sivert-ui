import { Link } from "react-router";
import { Logo } from "../components/Logo";

export function LandingView() {
  return (
    <div className="fixed inset-0 justify-center flex flex-col items-center gap-12">
      <div className="flex flex-col gap-4 items-center">
        <p className="font-medium">Find your</p>
        <Logo solid />
      </div>

      <div className="w-full aspect-video max-w-6xl bg-black rounded-2xl" />

      <div className="flex items-center gap-12 w-full justify-center">
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link target="_blank" to="https://github.com">
          GitHub
        </Link>
      </div>
    </div>
  );
}
