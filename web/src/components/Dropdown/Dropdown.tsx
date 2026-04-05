import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import type { DropdownPlacement, DropdownProps } from "./types";

const placementStyles: Record<DropdownPlacement, string> = {
  "bottom-left": "absolute top-full left-0 mt-2",
  "bottom-center": "absolute top-full left-1/2 mt-2 -translate-x-1/2",
  "bottom-right": "absolute top-full right-0 mt-2",

  "top-left": "absolute bottom-full left-0 mb-2",
  "top-center": "absolute bottom-full left-1/2 mb-2 -translate-x-1/2",
  "top-right": "absolute bottom-full right-0 mb-2",

  "right-top": "absolute left-full top-0 ml-2",
  "right-center": "absolute left-full top-1/2 ml-2 -translate-y-1/2",
  "right-bottom": "absolute left-full bottom-0 ml-2",

  "left-top": "absolute right-full top-0 mr-2",
  "left-center": "absolute right-full top-1/2 mr-2 -translate-y-1/2",
  "left-bottom": "absolute right-full bottom-0 mr-2",
};

function getMotionOffset(placement: DropdownPlacement) {
  if (placement.startsWith("top")) return { opacity: 0, y: 8, scale: 0.98 };
  if (placement.startsWith("bottom")) return { opacity: 0, y: -8, scale: 0.98 };
  if (placement.startsWith("left")) return { opacity: 0, x: 8, scale: 0.98 };
  return { opacity: 0, x: -8, scale: 0.98 };
}

export function Dropdown({
  children,
  isOpen,
  placement = "bottom-left",
  className = "",
}: DropdownProps) {
  const initial = getMotionOffset(placement);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className={placementStyles[placement]}>
          <motion.div
            role="menu"
            initial={initial}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={initial}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "z-400 rounded-2xl border border-primary/20 bg-background p-2",
              className,
            )}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
