import { MdInventory } from "react-icons/md";
import { FaCoins, FaSteam } from "react-icons/fa";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../Button";
import { Skeleton } from "../Skeleton";
import { Logo } from "../Logo";
import { useAuth } from "../../auth/useAuth";
import { useLobby } from "../../hooks/useLobby";
import { springTransition } from "../../lib/transitions";
import { useIsMobileNavbar } from "./useIsMobileNavbar";
import { QueueBadge } from "./QueueBadge";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { AccountDropdown } from "./AccountDropdown";
import type { NavbarDropdownPlacement } from "./types";

export function Navbar() {
  const navigate = useNavigate();
  const isMobileNavbar = useIsMobileNavbar();

  const { isSignedIn, isLoading, signIn } = useAuth();
  const { queueState, queueElapsedLabel } = useLobby();

  const isInQueue = !!queueState?.isSearching;

  const dropdownPlacement: NavbarDropdownPlacement = isMobileNavbar
    ? "top-right"
    : "bottom-right";

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 z-[300] bg-background border-t ${
        isInQueue ? "border-secondary" : "border-border"
      } md:border-0 md:bg-transparent grid w-full place-items-center px-3 pt-3 pb-12 md:top-0 md:bottom-auto md:p-3`}
    >
      <motion.div
        className="relative w-full"
        animate={{ maxWidth: isInQueue ? 672 : 576 }}
        transition={springTransition}
      >
        <nav
          className={`flex items-center justify-between rounded-full md:border ${
            isInQueue ? "border-secondary" : "border-primary/20"
          } md:bg-background/70 md:p-1.5 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-background/50`}
        >
          <div className="flex w-[100px] items-center justify-center gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              {isInQueue ? (
                <motion.div
                  key="queue-badge"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={springTransition}
                >
                  <QueueBadge
                    isSearching={isInQueue}
                    elapsedLabel={queueElapsedLabel}
                    onClick={() => navigate("/")}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={springTransition}
                >
                  <Button href="/" variant="ghost" className="px-3">
                    <Logo solid className="h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isLoading ? (
            <div className="flex min-h-10 items-center gap-2 rounded-full px-3 py-1.5">
              <Skeleton circle className="h-6 w-6" />
              <Skeleton className="h-3.5 w-16 rounded-full" />
            </div>
          ) : !isSignedIn ? (
            <Button
              variant="solid"
              onClick={() => {
                signIn();
              }}
            >
              Sign in <FaSteam />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" onClick={() => navigate("/shop")}>
                <FaCoins /> 0
              </Button>

              <Button
                variant="ghost"
                aria-label="Open inventory"
                onClick={() => navigate("/inventory")}
              >
                <MdInventory size={18} />
              </Button>

              <NotificationsDropdown placement={dropdownPlacement} />

              <AccountDropdown placement={dropdownPlacement} />
            </div>
          )}
        </nav>
      </motion.div>
    </div>
  );
}

export default Navbar;
