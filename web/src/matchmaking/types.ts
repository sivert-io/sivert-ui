export type MatchFoundPlayer = {
  userId: string;
  steamId: string;
  personaName: string | null;
  accepted: boolean;
};

export type MatchFoundState = {
  matchId: string;
  lobbyId: string;
  acceptBy: string;
  status: "pending" | "ready" | "cancelled";
  players: MatchFoundPlayer[];
} | null;
