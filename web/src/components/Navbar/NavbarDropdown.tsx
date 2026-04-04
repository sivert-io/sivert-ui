import { useEffect, useRef, useState } from "react";
import { Dropdown } from "../Dropdown";

interface NavbarDropdownProps {
  trigger: (args: {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
  }) => React.ReactNode;
  children: React.ReactNode;
  placement?: React.ComponentProps<typeof Dropdown>["placement"];
  hoverable?: boolean;
  closeDelay?: number;
}

export function NavbarDropdown({
  trigger,
  children,
  placement = "bottom-right",
  hoverable = true,
  closeDelay = 500,
}: NavbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  function clearCloseTimeout() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function openDropdown() {
    clearCloseTimeout();
    setIsOpen(true);
  }

  function scheduleClose() {
    clearCloseTimeout();

    if (isPinned) return;

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
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

  function close() {
    clearCloseTimeout();
    setIsPinned(false);
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;

      if (!rootRef.current.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearCloseTimeout();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={hoverable ? openDropdown : undefined}
      onMouseLeave={hoverable ? scheduleClose : undefined}
    >
      {trigger({ isOpen, toggle, close })}

      <Dropdown isOpen={isOpen} placement={placement}>
        {children}
      </Dropdown>
    </div>
  );
}
