type MatchFoundPlayer = {
  userId: string;
  steamId: string;
  personaName: string | null;
  acceptedAt: number | null;
};

type MatchFoundState = {
  matchId: string;
  lobbyId: string;
  acceptBy: number;
  players: MatchFoundPlayer[];
  status: "pending" | "ready" | "cancelled";
};

class MatchFoundManager {
  private static readonly ACCEPT_WINDOW_MS = 20_000;

  private matches = new Map<string, MatchFoundState>();
  private lobbyToMatch = new Map<string, string>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  private clearTimer(matchId: string) {
    const timer = this.timers.get(matchId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(matchId);
    }
  }

  create(lobbyId: string, players: Omit<MatchFoundPlayer, "acceptedAt">[]) {
    const existingMatchId = this.lobbyToMatch.get(lobbyId);
    if (existingMatchId) {
      const existing = this.matches.get(existingMatchId);
      if (existing && existing.status === "pending") {
        return existing;
      }
    }

    const matchId = crypto.randomUUID();
    const state: MatchFoundState = {
      matchId,
      lobbyId,
      acceptBy: Date.now() + MatchFoundManager.ACCEPT_WINDOW_MS,
      players: players.map((player) => ({
        ...player,
        acceptedAt: null,
      })),
      status: "pending",
    };

    this.matches.set(matchId, state);
    this.lobbyToMatch.set(lobbyId, matchId);

    const timer = setTimeout(() => {
      const current = this.matches.get(matchId);
      if (!current || current.status !== "pending") return;
      current.status = "cancelled";
    }, MatchFoundManager.ACCEPT_WINDOW_MS);

    this.timers.set(matchId, timer);

    return state;
  }

  get(matchId: string) {
    return this.matches.get(matchId) ?? null;
  }

  getByLobbyId(lobbyId: string) {
    const matchId = this.lobbyToMatch.get(lobbyId);
    if (!matchId) return null;
    return this.matches.get(matchId) ?? null;
  }

  accept(matchId: string, userId: string) {
    const state = this.matches.get(matchId);
    if (!state || state.status !== "pending") return null;
    if (Date.now() > state.acceptBy) {
      state.status = "cancelled";
      this.clearTimer(matchId);
      return state;
    }

    const player = state.players.find((item) => item.userId === userId);
    if (!player) return null;

    player.acceptedAt = player.acceptedAt ?? Date.now();

    const allAccepted = state.players.every((item) => item.acceptedAt !== null);
    if (allAccepted) {
      state.status = "ready";
      this.clearTimer(matchId);
    }

    return state;
  }

  decline(matchId: string, userId: string) {
    const state = this.matches.get(matchId);
    if (!state || state.status !== "pending") return null;

    const player = state.players.find((item) => item.userId === userId);
    if (!player) return null;

    state.status = "cancelled";
    this.clearTimer(matchId);
    return state;
  }

  remove(matchId: string) {
    const state = this.matches.get(matchId);
    if (!state) return;
    this.clearTimer(matchId);
    this.matches.delete(matchId);
    this.lobbyToMatch.delete(state.lobbyId);
  }

  serialize(state: MatchFoundState) {
    return {
      matchId: state.matchId,
      lobbyId: state.lobbyId,
      acceptBy: new Date(state.acceptBy).toISOString(),
      status: state.status,
      players: state.players.map((player) => ({
        userId: player.userId,
        steamId: player.steamId,
        personaName: player.personaName,
        accepted: player.acceptedAt !== null,
      })),
    };
  }
}

export const matchFoundManager = new MatchFoundManager();
