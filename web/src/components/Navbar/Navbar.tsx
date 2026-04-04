import { MdBadge, MdSettings, MdLogout, MdNotifications } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { Button } from "../Button";
import type { NavbarProps } from "./types";
import { useAuth } from "../../auth/useAuth";
import { Skeleton } from "../Skeleton";
import { Divider } from "../Divider/Divider";
import { NavbarDropdown } from "./NavbarDropdown";

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

  async function handleSignOut() {
    navigate("/");
    await signOut();
  }

  return (
    <div className="fixed left-0 top-0 right-0 z-300 grid w-full place-items-center p-6">
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
            <div className="flex items-center gap-2">
              <NavbarDropdown
                placement="bottom-center"
                trigger={({ isOpen, toggle }) => (
                  <Button
                    className="h-8! w-8! p-0!"
                    onClick={toggle}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    variant="ghost"
                  >
                    <MdNotifications />
                  </Button>
                )}
              >
                <div className="px-3 py-2 text-sm text-primary">
                  No notifications yet
                </div>
              </NavbarDropdown>

              <NavbarDropdown
                placement="bottom-right"
                trigger={({ isOpen, toggle }) => (
                  <Button
                    variant="ghost"
                    onClick={toggle}
                    className="px-4"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
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
                        className={`max-w-32 truncate text-sm ${
                          user?.role === "admin" ? "text-secondary" : ""
                        }`}
                      >
                        {user?.personaName ?? "Account"}
                      </span>
                    </>
                  </Button>
                )}
              >
                <DropdownLink
                  to={user?.steamId ? `/profile/${user.steamId}` : "/profile"}
                  icon={<MdBadge size={16} />}
                >
                  My profile
                </DropdownLink>

                <DropdownLink to="/settings" icon={<MdSettings size={16} />}>
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
              </NavbarDropdown>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
