import { useState } from "react";
import type { AccordionProps } from "./types";

export function Accordion({ children, label }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        interpolateSize: "allow-keywords",
      }}
      className={`transition-all duration-100 overflow-hidden flex flex-col gap-2 bg-black/20 border-lavender/20 border rounded-xl ${isOpen ? "h-auto" : "h-11"}`}
    >
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className="text-sm text-left font-medium p-3"
      >
        {label}
      </button>
      <span className="px-3 pb-3">{children}</span>
    </div>
  );
}
