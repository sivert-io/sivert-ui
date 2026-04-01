import type { CardProps } from "./types";

export function Card({ children }: CardProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-lavender/20 bg-black/10 p-6">
      {children}
    </div>
  );
}
