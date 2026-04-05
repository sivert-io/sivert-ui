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
  members: LobbyMember[];
} | null;

export type LobbyPlayerSlot = {
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  rank: number | null;
  createdAt: string;
  ready?: boolean;
  connected?: boolean;
  connectedSockets?: number;
  connectedAt?: number | null;
  disconnectedAt?: number | null;
} | null;

export type UseLobbyProps = {
  user: {
    steamId: string;
    personaName: string | null;
    avatarSmall: string | null;
    avatarMedium: string | null;
    avatarLarge: string | null;
    rank: number | null;
  };
  lobbyId: string;
};
