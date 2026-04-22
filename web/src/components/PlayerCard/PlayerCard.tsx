import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { MdAdd } from "react-icons/md";
import { Button } from "../Button";
import { Rank } from "../Rank";
import type { PlayerCardProps } from "./types";

const BASE_WIDTH = 144;
const BASE_HEIGHT = 192;

export function PlayerCard({
  playerData,
  onClick,
  disabled = false,
  disableInvite,
  statusLabel,
  scale = 1,
  title,
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
  className,
}: PlayerCardProps) {
  const resolvedWidth = typeof width === "number" ? width * scale : width;
  const resolvedHeight = typeof height === "number" ? height * scale : height;

  const slotStyle = {
    width: resolvedWidth,
    height: resolvedHeight,
  };

  const isOffline =
    !!playerData && "connected" in playerData && playerData.connected === false;

  const resolvedStatusLabel = isOffline ? "OFFLINE" : statusLabel;

  return (
    <div style={slotStyle} className={cn("relative shrink-0", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {!playerData ? (
          <motion.div
            key="empty"
            className="h-full w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Button
              disabled={disableInvite}
              square
              onClick={onClick}
              className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border border-primary/25 bg-primary/5 p-6"
            >
              <AnimatePresence>
                {!disableInvite && (
                  <motion.div
                    key="add-icon"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.15 }}
                    className="grid place-items-center rounded-full bg-primary/20 p-3 text-primary"
                  >
                    <MdAdd size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        ) : (
          <motion.button
            key={playerData.steamId}
            type="button"
            onClick={onClick}
            disabled={disabled || isOffline}
            title={title}
            className={cn(
              "relative flex h-full w-full flex-col items-center justify-between gap-4 rounded-lg border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
              isOffline
                ? "border-white/10 bg-white/5 text-primary/60 opacity-60 cursor-default!"
                : "border-primary/25 bg-primary/5 hover:bg-primary/10",
              resolvedStatusLabel === "invited" && "border-secondary",
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center">
                <img
                  className={cn(
                    "h-16 w-16 rounded-full bg-background",
                    isOffline
                      ? "border border-white/10 opacity-70"
                      : "border border-primary/25",
                  )}
                  src={playerData.avatarLarge || ""}
                  alt={playerData.personaName ?? "Player avatar"}
                />
                <p
                  className={cn(
                    "max-w-full truncate text-lg font-bold",
                    isOffline && "text-primary/60",
                  )}
                >
                  {playerData.personaName}
                </p>
              </div>

              <div className={cn(isOffline && "opacity-70")}>
                <Rank rank={playerData.rank} />
              </div>
            </div>

            {resolvedStatusLabel ? (
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wide",
                  resolvedStatusLabel === "invited"
                    ? "text-secondary"
                    : "text-primary/60",
                )}
              >
                {resolvedStatusLabel}
              </p>
            ) : null}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
