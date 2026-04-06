import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useSocket } from "../socket/useSocket";
import { useAuth } from "../auth/useAuth";
import { MatchFoundContext } from "./MatchFoundContext";
import type { MatchFoundState } from "./types";
import { MatchFoundModal } from "../matchmaking/MatchFoundModal";

type Props = {
  children: ReactNode;
};

export function MatchFoundProvider({ children }: Props) {
  const { socket } = useSocket();
  const { isSignedIn } = useAuth();
  const [rawMatchFound, setRawMatchFound] = useState<MatchFoundState>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasOpenRef = useRef(false);

  const matchFound = isSignedIn ? rawMatchFound : null;

  useEffect(() => {
    audioRef.current = new Audio("/sounds/match-found-flute.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    const isOpen = !!matchFound;

    if (isOpen && !wasOpenRef.current) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    }

    wasOpenRef.current = isOpen;
  }, [matchFound]);

  useEffect(() => {
    function onMatchFound(payload: MatchFoundState) {
      setRawMatchFound(payload);
    }

    function onMatchState(payload: MatchFoundState) {
      setRawMatchFound(payload);
    }

    function onMatchCancelled() {
      setRawMatchFound(null);
      toast("Match cancelled");
    }

    function onMatchReady() {
      setRawMatchFound(null);
      toast("All players accepted");
    }

    socket.on("match:found", onMatchFound);
    socket.on("match:state", onMatchState);
    socket.on("match:cancelled", onMatchCancelled);
    socket.on("match:ready", onMatchReady);

    return () => {
      socket.off("match:found", onMatchFound);
      socket.off("match:state", onMatchState);
      socket.off("match:cancelled", onMatchCancelled);
      socket.off("match:ready", onMatchReady);
    };
  }, [socket]);

  const acceptMatch = useCallback(() => {
    if (!matchFound) return;
    socket.emit("match:accept", { matchId: matchFound.matchId });
  }, [socket, matchFound]);

  const declineMatch = useCallback(() => {
    if (!matchFound) return;
    socket.emit("match:decline", { matchId: matchFound.matchId });
  }, [socket, matchFound]);

  const value = useMemo(
    () => ({
      matchFound,
      acceptMatch,
      declineMatch,
    }),
    [matchFound, acceptMatch, declineMatch],
  );

  return (
    <MatchFoundContext.Provider value={value}>
      {children}
      <MatchFoundModal />
    </MatchFoundContext.Provider>
  );
}
