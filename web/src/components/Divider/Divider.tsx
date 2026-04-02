import type { DividerProps } from "./types";

export function Divider({ className, ...props }: DividerProps) {
  return <div className={`w-full border-b h-0 my-2 ${className}`} {...props} />;
}
