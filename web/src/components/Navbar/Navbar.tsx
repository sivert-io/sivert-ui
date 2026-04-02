import { useEffect, useRef, useState } from "react";
import { MdBadge, MdSettings, MdLogout } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { Button } from "../Button";
import { Dropdown } from "../Dropdown";
import type { NavbarProps } from "./types";
import { useAuth } from "../../auth/useAuth";
import { Skeleton } from "../Skeleton";
import { Divider } from "../Divider/Divider";

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
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-primary transition hover:bg-white/10"
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

export function Navbar({ Logo, isInQueue }: NavbarProps) {
  const navigate = useNavigate();
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
    navigate("/");
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
      <div
        className={`relative w-full transition-all duration-100 ${isInQueue ? "max-w-xl" : "max-w-2xl"}`}
      >
        <nav className="flex justify-between rounded-full border border-primary/20 bg-black/10 p-2">
          <Button href="/" variant="ghost">
            <Logo />
          </Button>

          {isLoading ? (
            <div className="flex items-center gap-2 rounded-full px-4 py-2">
              <Skeleton circle className="h-7 w-7" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          ) : !isSignedIn ? (
            <Button variant="solid" onClick={signIn}>
              Sign in
            </Button>
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
                <>
                  {user?.avatarSmall ? (
                    <img
                      src={user.avatarSmall}
                      alt={user.personaName ?? "User avatar"}
                      className="h-7 w-7 rounded-full"
                    />
                  ) : null}
                  <span
                    className={`max-w-32 truncate text-sm " ${
                      user?.role === "admin" ? "text-secondary" : ""
                    }`}
                  >
                    {user?.personaName ?? "Account"}
                  </span>
                </>
              </Button>

              <div
                className={`absolute right-0 top-full z-50 mt-2 ${
                  isOpen ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
                <Dropdown isOpen={isOpen}>
                  <DropdownLink
                    to={user?.steamId ? `/profile/${user.steamId}` : "/profile"}
                    icon={<MdBadge size={16} />}
                    onClick={() => {
                      setIsPinned(false);
                      setIsOpen(false);
                    }}
                  >
                    My profile
                  </DropdownLink>

                  <DropdownLink
                    to="/settings"
                    icon={<MdSettings size={16} />}
                    onClick={() => {
                      setIsPinned(false);
                      setIsOpen(false);
                    }}
                  >
                    Settings
                  </DropdownLink>

                  <Divider className="border-primary/20" />

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-300 transition hover:bg-white/10"
                  >
                    <span>
                      <MdLogout size={16} />
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
