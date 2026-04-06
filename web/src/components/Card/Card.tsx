import type { CardProps } from "./types";

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={[
        "mx-auto w-full max-w-2xl rounded-2xl border border-primary/20 bg-black/10 p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
