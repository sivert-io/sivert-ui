import type React from "react";
import { Link } from "../Link";

interface DropdownLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

export function DropdownLink({
  to,
  icon,
  children,
  onClick,
}: DropdownLinkProps) {
  return (
    <Link
      underline={false}
      to={to}
      onClick={onClick}
      className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm whitespace-nowrap transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="grid size-5 place-items-center">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
