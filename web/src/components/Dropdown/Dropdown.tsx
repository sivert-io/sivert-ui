import cn from "classnames";
import { motion } from "motion/react";
import type { DropdownPlacement, DropdownProps } from "./types";

function getMotionOffset(placement: DropdownPlacement) {
  if (placement.startsWith("top")) {
    return { opacity: 0, y: 8, scale: 0.98 };
  }

  if (placement.startsWith("bottom")) {
    return { opacity: 0, y: -8, scale: 0.98 };
  }

  if (placement.startsWith("left")) {
    return { opacity: 0, x: 8, scale: 0.98 };
  }

  return { opacity: 0, x: -8, scale: 0.98 };
}

interface InternalDropdownProps extends DropdownProps {
  placement: DropdownPlacement;
}

export function Dropdown({
  children,
  placement,
  className = "",
}: InternalDropdownProps) {
  const initial = getMotionOffset(placement);

  return (
    <motion.div
      role="menu"
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={initial}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-primary/20 bg-background p-2 shadow-xl",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
