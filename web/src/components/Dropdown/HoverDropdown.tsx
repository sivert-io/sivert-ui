import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Dropdown } from ".";

interface HoverDropdownProps {
  trigger: (args: { isOpen: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode;
  placement?: React.ComponentProps<typeof Dropdown>["placement"];
  hoverable?: boolean;
  closeDelay?: number;
  className?: string;
}

export function HoverDropdown({
  trigger,
  children,
  placement = "bottom-right",
  hoverable = true,
  closeDelay = 150,
  className,
}: HoverDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [closeTimeoutId, setCloseTimeoutId] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  function clearCloseTimeout() {
    setCloseTimeoutId((current) => {
      if (current !== null) {
        window.clearTimeout(current);
      }
      return null;
    });
  }

  function openDropdown() {
    clearCloseTimeout();
    setIsOpen(true);
  }

  function scheduleClose() {
    clearCloseTimeout();

    if (isPinned) return;

    const timeoutId = window.setTimeout(() => {
      setIsOpen(false);
      setCloseTimeoutId(null);
    }, closeDelay);

    setCloseTimeoutId(timeoutId);
  }

  function toggle() {
    clearCloseTimeout();

    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
      return;
    }

    setIsPinned(true);
    setIsOpen(true);
  }

  function closeDropdown() {
    clearCloseTimeout();
    setIsPinned(false);
    setIsOpen(false);
  }

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
      if (closeTimeoutId !== null) {
        window.clearTimeout(closeTimeoutId);
      }
    };
  }, [closeTimeoutId]);

  function handleContentClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const clickable = target.closest("a, button");
    if (!clickable) return;

    if (clickable.hasAttribute("data-keep-dropdown-open")) return;

    closeDropdown();
  }

  return (
    <div
      ref={rootRef}
      className={`${className ?? "relative"} z-350 relative`}
      onMouseEnter={hoverable ? openDropdown : undefined}
      onMouseLeave={hoverable ? scheduleClose : undefined}
    >
      {trigger({ isOpen, toggle })}

      <Dropdown isOpen={isOpen} placement={placement}>
        <div onClick={handleContentClick}>{children}</div>
      </Dropdown>
    </div>
  );
}
