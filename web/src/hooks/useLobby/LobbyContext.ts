import { createContext } from "react";
import type { LobbyPlayerSlot, LobbyQueueState, LobbyState } from "./types";

export type LobbyContextValue = {
  lobbyId: string | null;
  lobbyState: LobbyState;
  queueState: LobbyQueueState;
  players: LobbyPlayerSlot[];
  isConnected: boolean;
  isLobbyOwner: boolean;
  queueElapsedLabel: string | null;
  setReady: (ready: boolean) => void;
  startQueue: () => void;
  stopQueue: () => void;
  kickMember: (targetUserId: string) => Promise<void>;
  refreshLobby: () => Promise<void>;
};

export const LobbyContext = createContext<LobbyContextValue | null>(null);
