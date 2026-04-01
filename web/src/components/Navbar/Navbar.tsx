import { useEffect, useRef, useState } from "react";
import { MdPerson2, MdBadge, MdSettings, MdLogout } from "react-icons/md";
import { Link } from "react-router";
import { Button } from "../Button";
import { Dropdown } from "../Dropdown";
import type { NavbarProps } from "./types";

function DropdownLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-lavender transition hover:bg-white/10"
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

export function Navbar({ Logo }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
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
    }, 1000);
  }

  function handleTriggerClick() {
    clearCloseTimeout();

    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
      return;
    }

    setIsPinned(true);
    setIsOpen(true);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target as Node)) {
        clearCloseTimeout();
        setIsPinned(false);
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearCloseTimeout();
    };
  }, []);

  return (
    <div className="grid w-full place-items-center p-6">
      <nav className="flex w-full max-w-lg justify-between rounded-full border border-lavender/20 bg-black/10 p-2 backdrop-blur-lg">
        <Link to="/">
          <Button variant="ghost">
            <Logo />
          </Button>
        </Link>

        <div
          ref={dropdownRef}
          className="relative"
          onMouseEnter={openDropdown}
          onMouseLeave={scheduleClose}
        >
          <Button square variant="ghost" onClick={handleTriggerClick}>
            <MdPerson2 />
          </Button>

          <Dropdown isOpen={isOpen}>
            <DropdownLink
              to="/profile"
              icon={<MdBadge />}
              onClick={() => {
                setIsPinned(false);
                setIsOpen(false);
              }}
            >
              My profile
            </DropdownLink>

            <DropdownLink
              to="/settings"
              icon={<MdSettings />}
              onClick={() => {
                setIsPinned(false);
                setIsOpen(false);
              }}
            >
              Settings
            </DropdownLink>

            <button
              onClick={() => {
                setIsPinned(false);
                setIsOpen(false);
                console.log("sign out");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-lavender transition hover:bg-white/10"
            >
              <span className="text-lg">
                <MdLogout />
              </span>
              <span>Sign out</span>
            </button>
          </Dropdown>
        </div>
      </nav>
    </div>
  );
}
