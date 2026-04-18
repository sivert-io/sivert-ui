export type LobbyMember = {
  userId: string;
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  rank: number | null;
  role: string;
  ready: boolean;
  connected: boolean;
  connectedSockets: number;
  connectedAt?: number | null;
  disconnectedAt?: number | null;
};

export type LobbyState = {
  lobbyId: string;
  ownerUserId: string | null;
  members: LobbyMember[];
} | null;

export type LobbyQueueState = {
  lobbyId: string;
  isSearching: boolean;
  startedAt: string | null;
} | null;

export type LobbyPlayerSlot = {
  userId: string;
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  rank: number | null;
  role: string;
  createdAt: string;
  ready?: boolean;
  connected?: boolean;
  connectedSockets?: number;
  connectedAt?: number | null;
  disconnectedAt?: number | null;
} | null;

export type UseLobbyProps = {
  user: {
    id: string;
    steamId: string;
    personaName: string | null;
    avatarSmall: string | null;
    avatarMedium: string | null;
    avatarLarge: string | null;
    rank: number | null;
    role: string;
  };
  lobbyId: string;
};
