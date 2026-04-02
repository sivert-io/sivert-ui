import type { CardProps } from "./types";

export function Card({ children }: CardProps) {
  return (
    <div className="mx-auto max-w-2xl w-full rounded-3xl border border-primary/20 bg-black/10 p-6">
      {children}
    </div>
  );
}
