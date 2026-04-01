import type { DropdownProps } from "./types";

export function Dropdown({ children, isOpen }: DropdownProps) {
  return (
    <div
      className={`w-56 rounded-2xl border border-lavender/20 bg-black/20 p-2 shadow-lg backdrop-blur-xl transition-all duration-200 ${
        isOpen
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
