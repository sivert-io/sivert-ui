import { useEffect, useRef, useState } from "react";
import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import type { TooltipPlacement, TooltipProps } from "./types";

const placementStyles: Record<TooltipPlacement, string> = {
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

function getMotionOffset(placement: TooltipPlacement) {
  if (placement.startsWith("top")) return { opacity: 0, y: 8 };
  if (placement.startsWith("bottom")) return { opacity: 0, y: -8 };
  if (placement.startsWith("left")) return { opacity: 0, x: 8 };
  return { opacity: 0, x: -8, scale: 0.98 };
}

export function Tooltip({
  children,
  content,
  delay = 100,
  placement = "top-center",
  wrapperClassName = "",
  contentClassName = "",
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearShowTimeout = () => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const handleOpen = () => {
    clearShowTimeout();

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleClose = () => {
    clearShowTimeout();
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      clearShowTimeout();
    };
  }, []);

  const initial = getMotionOffset(placement);

  return (
    <span
      className={wrapperClassName}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
    >
      <div className="relative inline-flex">
        {children}

        <AnimatePresence>
          {isOpen ? (
            <div className={placementStyles[placement]}>
              <motion.div
                role="tooltip"
                initial={initial}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={initial}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className={cn(
                  "pointer-events-none z-400 w-max max-w-xs rounded-2xl border border-primary/20 bg-background/90 px-3 py-2 text-sm shadow-xl backdrop-blur-xs",
                  contentClassName,
                )}
              >
                {content}
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </span>
  );
}
