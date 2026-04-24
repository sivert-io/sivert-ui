import { useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import type { TooltipPlacement, TooltipProps } from "./types";

function toFloatingPlacement(placement: TooltipPlacement): Placement {
  switch (placement) {
    case "bottom-left":
      return "bottom-start";
    case "bottom-center":
      return "bottom";
    case "bottom-right":
      return "bottom-end";

    case "top-left":
      return "top-start";
    case "top-center":
      return "top";
    case "top-right":
      return "top-end";

    case "right-top":
      return "right-start";
    case "right-center":
      return "right";
    case "right-bottom":
      return "right-end";

    case "left-top":
      return "left-start";
    case "left-center":
      return "left";
    case "left-bottom":
      return "left-end";

    default:
      return "top";
  }
}

function getMotionOffset(placement: TooltipPlacement) {
  if (placement.startsWith("top")) return { opacity: 0, y: 8 };
  if (placement.startsWith("bottom")) return { opacity: 0, y: -8 };
  if (placement.startsWith("left")) return { opacity: 0, x: 8 };
  return { opacity: 0, x: -8 };
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

  const { refs, floatingStyles, update } = useFloating({
    open: isOpen,
    strategy: "fixed",
    placement: toFloatingPlacement(placement),
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const setReference = useCallback(
    (node: HTMLSpanElement | null) => {
      refs.setReference(node);
    },
    [refs],
  );

  const setFloating = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node);
    },
    [refs],
  );

  const clearShowTimeout = useCallback(() => {
    if (!timeoutRef.current) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const handleOpen = useCallback(() => {
    clearShowTimeout();

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  }, [clearShowTimeout, delay]);

  const handleClose = useCallback(() => {
    clearShowTimeout();
    setIsOpen(false);
  }, [clearShowTimeout]);

  useEffect(() => {
    if (!isOpen) return;

    update();
  }, [isOpen, update]);

  useEffect(() => {
    return () => {
      clearShowTimeout();
    };
  }, [clearShowTimeout]);

  const initial = getMotionOffset(placement);

  return (
    <span
      ref={setReference}
      className={cn("inline-flex", wrapperClassName)}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
    >
      {children}

      <AnimatePresence>
        {isOpen ? (
          <div
            ref={setFloating}
            style={floatingStyles}
            className="pointer-events-none z-400"
          >
            <motion.div
              role="tooltip"
              initial={initial}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={initial}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className={cn(
                "pointer-events-none w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm shadow-xl",
                contentClassName,
              )}
            >
              {content}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
