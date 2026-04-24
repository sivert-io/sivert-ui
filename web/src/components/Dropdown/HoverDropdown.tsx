import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import { AnimatePresence } from "motion/react";
import cn from "classnames";
import { Dropdown } from "./Dropdown";
import type { DropdownPlacement } from "./types";

interface HoverDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: DropdownPlacement;
  hoverable?: boolean;
  closeDelay?: number;
  className?: string;
  dropdownClassName?: string;
}

function toFloatingPlacement(placement: DropdownPlacement): Placement {
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
      return "bottom-start";
  }
}

export function HoverDropdown({
  trigger,
  children,
  placement = "bottom-right",
  hoverable = true,
  closeDelay = 150,
  className,
  dropdownClassName,
}: HoverDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const { refs, floatingStyles, update } = useFloating({
    open: isOpen,
    strategy: "fixed",
    placement: toFloatingPlacement(placement),
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });

  const setReference = useCallback(
    (node: HTMLDivElement | null) => {
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

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closeDropdown = useCallback(() => {
    clearCloseTimeout();
    setIsPinned(false);
    setIsOpen(false);
  }, [clearCloseTimeout]);

  const openDropdown = useCallback(() => {
    clearCloseTimeout();
    setIsOpen(true);
  }, [clearCloseTimeout]);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();

    if (isPinned) return;

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, closeDelay);
  }, [clearCloseTimeout, closeDelay, isPinned]);

  const toggle = useCallback(() => {
    clearCloseTimeout();

    setIsPinned((current) => {
      const nextPinned = !current;
      setIsOpen(nextPinned);
      return nextPinned;
    });
  }, [clearCloseTimeout]);

  useEffect(() => {
    if (!isOpen) return;

    update();
  }, [isOpen, update]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;

      if (!rootRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearCloseTimeout();
    };
  }, [clearCloseTimeout, closeDropdown]);

  function handleContentClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const clickable = target.closest("a, button");
    if (!clickable) return;

    if (clickable.hasAttribute("data-keep-dropdown-open")) return;

    closeDropdown();
  }

  function handleTriggerClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    toggle();
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative z-350 inline-flex", className)}
      onMouseEnter={hoverable ? openDropdown : undefined}
      onMouseLeave={hoverable ? scheduleClose : undefined}
    >
      <div
        ref={setReference}
        className="inline-flex"
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen ? (
          <div ref={setFloating} style={floatingStyles} className="z-400">
            <Dropdown placement={placement} className={dropdownClassName}>
              <div onClick={handleContentClick}>{children}</div>
            </Dropdown>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
