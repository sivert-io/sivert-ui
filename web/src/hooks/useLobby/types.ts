// src/hooks/useLobby/types.ts
import type { AuthUser, PublicProfile } from "../../auth/types";

export interface UseLobbyProps {
  user: AuthUser;
  lobbyId: string;
}

export type LobbyMember = {
  userId: string;
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  rank: number | null;
  role: string;
  connectedSockets: number;
  connected: boolean;
  ready: boolean;
};

export type LobbyState = {
  lobbyId: string;
  members: LobbyMember[];
} | null;

export type LobbyPlayerSlot = PublicProfile | AuthUser | null;
