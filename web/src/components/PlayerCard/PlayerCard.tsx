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
  disableInvite,
  scale = 1,
}: PlayerCardProps) {
  const slotStyle = {
    width: BASE_WIDTH * scale,
    height: BASE_HEIGHT * scale,
  };

  const positionedStyle = {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    transform: "translate(-50%, -50%)",
    transformOrigin: "center",
  } as const;

  return (
    <div style={slotStyle} className="relative shrink-0">
      <div style={positionedStyle} className="absolute left-1/2 top-1/2">
        <AnimatePresence mode="wait" initial={false}>
          {!playerData ? (
            <motion.div
              key="empty"
              className="h-full w-full"
              initial={{ opacity: 0, scale: scale * 0.9 }}
              animate={{ opacity: 1, scale }}
              exit={{ opacity: 0, scale: scale * 0.9 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Button
                disabled={disableInvite}
                square
                onClick={onClick}
                className="flex h-48 w-36 flex-col items-center justify-center gap-4 rounded-lg border border-primary/25 bg-primary/5 p-6"
              >
                <AnimatePresence>
                  {!disableInvite && (
                    <motion.div
                      key="add-icon"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
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
            <motion.div
              key="player"
              className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border border-primary/25 bg-primary/5 p-6"
              initial={{ opacity: 0, scale: scale * 0.9 }}
              animate={{ opacity: 1, scale }}
              exit={{ opacity: 0, scale: scale * 0.9 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="flex flex-col items-center gap-2">
                <img
                  className="h-16 w-16 rounded-full border border-primary/25 bg-background"
                  src={playerData.avatarLarge || ""}
                />
                <p className="text-lg font-bold truncate">
                  {playerData.personaName}
                </p>
              </div>
              <Rank rank={playerData.rank} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
