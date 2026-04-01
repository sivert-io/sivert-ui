import { useEffect, useRef, useState } from "react";
import { MdBadge, MdSettings, MdLogout } from "react-icons/md";
import { Link } from "react-router";
import { Button } from "../Button";
import { Dropdown } from "../Dropdown";
import type { NavbarProps } from "./types";
import { useAuth } from "../../auth/useAuth";

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
  const { user, isSignedIn, isLoading, signIn, signOut } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const accountAreaRef = useRef<HTMLDivElement | null>(null);
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

  async function handleSignOut() {
    setIsPinned(false);
    setIsOpen(false);
    await signOut();
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!accountAreaRef.current) return;

      if (!accountAreaRef.current.contains(event.target as Node)) {
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
    <div className="fixed left-0 top-0 right-0 grid w-full place-items-center p-6">
      <div className="relative w-full max-w-lg">
        <nav className="flex justify-between rounded-full border border-lavender/20 bg-black/10 p-2">
          <Link to="/">
            <Button variant="ghost">
              <Logo />
            </Button>
          </Link>

          {isLoading ? (
            <Button disabled className="opacity-60">
              Loading...
            </Button>
          ) : !isSignedIn ? (
            <Button onClick={signIn}>Sign in with Steam</Button>
          ) : (
            <div
              ref={accountAreaRef}
              className="relative"
              onMouseEnter={openDropdown}
              onMouseLeave={scheduleClose}
            >
              <Button
                variant="ghost"
                onClick={handleTriggerClick}
                className="px-4"
              >
                <div className="flex items-center gap-2">
                  {user?.avatarMedium ? (
                    <img
                      src={user.avatarMedium}
                      alt={user.personaName ?? "User avatar"}
                      className="h-7 w-7 rounded-full"
                    />
                  ) : null}
                  <span className="max-w-32 truncate text-sm">
                    {user?.personaName ?? "Account"}
                  </span>
                </div>
              </Button>

              <div
                className={`absolute right-0 top-full z-50 mt-2 ${
                  isOpen ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
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
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-lavender transition hover:bg-white/10"
                  >
                    <span className="text-lg">
                      <MdLogout />
                    </span>
                    <span>Sign out</span>
                  </button>
                </Dropdown>
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
