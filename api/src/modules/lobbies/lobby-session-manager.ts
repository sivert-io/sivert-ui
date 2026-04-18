type LobbyMemberSnapshot = {
  userId: string;
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  rank: number | null;
  role: string;
};

type LobbyMemberPresence = LobbyMemberSnapshot & {
  socketIds: Set<string>;
  connectedAt: number | null;
  disconnectedAt: number | null;
  ready: boolean;
};

type LobbyRuntimeState = {
  lobbyId: string;
  members: Map<string, LobbyMemberPresence>;
};

type JoinLobbyUser = {
  id: string;
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  rank: number | null;
  role: string;
};

type OfflineExpiredHandler = (params: {
  lobbyId: string;
  userId: string;
}) => Promise<void>;

export class LobbySessionManager {
  private static readonly OFFLINE_EVICTION_MS = 60_000;

  private lobbies = new Map<string, LobbyRuntimeState>();
  private socketToLobby = new Map<string, string>();
  private offlineTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private offlineExpiredHandler: OfflineExpiredHandler | null = null;

  setOfflineExpiredHandler(handler: OfflineExpiredHandler) {
    this.offlineExpiredHandler = handler;
  }

  private memberKey(lobbyId: string, userId: string) {
    return `${lobbyId}:${userId}`;
  }

  private clearOfflineTimer(lobbyId: string, userId: string) {
    const key = this.memberKey(lobbyId, userId);
    const timer = this.offlineTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      this.offlineTimers.delete(key);
    }
  }

  private scheduleOfflineTimer(lobbyId: string, userId: string) {
    this.clearOfflineTimer(lobbyId, userId);

    const key = this.memberKey(lobbyId, userId);

    const timer = setTimeout(async () => {
      this.offlineTimers.delete(key);

      const lobby = this.lobbies.get(lobbyId);
      const member = lobby?.members.get(userId);

      if (!lobby || !member) return;
      if (member.socketIds.size > 0) return;

      await this.offlineExpiredHandler?.({ lobbyId, userId });
    }, LobbySessionManager.OFFLINE_EVICTION_MS);

    this.offlineTimers.set(key, timer);
  }

  joinLobby(lobbyId: string, user: JoinLobbyUser, socketId: string) {
    let lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      lobby = {
        lobbyId,
        members: new Map(),
      };
      this.lobbies.set(lobbyId, lobby);
    }

    let member = lobby.members.get(user.id);

    if (!member) {
      member = {
        userId: user.id,
        steamId: user.steamId,
        personaName: user.personaName,
        avatarSmall: user.avatarSmall,
        avatarMedium: user.avatarMedium,
        avatarLarge: user.avatarLarge,
        rank: user.rank,
        role: user.role,
        socketIds: new Set(),
        connectedAt: null,
        disconnectedAt: null,
        ready: false,
      };
      lobby.members.set(user.id, member);
    } else {
      member.steamId = user.steamId;
      member.personaName = user.personaName;
      member.avatarSmall = user.avatarSmall;
      member.avatarMedium = user.avatarMedium;
      member.avatarLarge = user.avatarLarge;
      member.rank = user.rank;
      member.role = user.role;
    }

    const wasOffline = member.socketIds.size === 0;

    member.socketIds.add(socketId);
    this.socketToLobby.set(socketId, lobbyId);

    if (wasOffline) {
      member.connectedAt = Date.now();
      member.disconnectedAt = null;
      this.clearOfflineTimer(lobbyId, user.id);
    }

    return this.serializeLobby(lobbyId);
  }

  disconnectSocket(socketId: string, userId: string) {
    const lobbyId = this.socketToLobby.get(socketId);
    if (!lobbyId) return null;

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const member = lobby.members.get(userId);
    if (!member) return null;

    member.socketIds.delete(socketId);
    this.socketToLobby.delete(socketId);

    if (member.socketIds.size === 0) {
      member.disconnectedAt = Date.now();
      this.scheduleOfflineTimer(lobbyId, userId);
    }

    return { lobbyId, state: this.serializeLobby(lobbyId) };
  }

  getMemberSocketIds(lobbyId: string, userId: string) {
    const lobby = this.lobbies.get(lobbyId);
    const member = lobby?.members.get(userId);

    return member ? [...member.socketIds] : [];
  }

  explicitLeaveLobby(lobbyId: string, userId: string) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const member = lobby.members.get(userId);
    if (!member) return null;

    this.clearOfflineTimer(lobbyId, userId);

    for (const socketId of member.socketIds) {
      this.socketToLobby.delete(socketId);
    }

    lobby.members.delete(userId);

    if (lobby.members.size === 0) {
      this.lobbies.delete(lobbyId);
      return { lobbyId, state: null };
    }

    return { lobbyId, state: this.serializeLobby(lobbyId) };
  }

  setReady(lobbyId: string, userId: string, ready: boolean) {
    const lobby = this.lobbies.get(lobbyId);
    const member = lobby?.members.get(userId);
    if (!member) return null;

    member.ready = ready;
    return this.serializeLobby(lobbyId);
  }

  serializeLobby(lobbyId: string) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    return {
      lobbyId,
      members: [...lobby.members.values()].map((m) => ({
        userId: m.userId,
        steamId: m.steamId,
        personaName: m.personaName,
        avatarSmall: m.avatarSmall,
        avatarMedium: m.avatarMedium,
        avatarLarge: m.avatarLarge,
        rank: m.rank,
        role: m.role,
        connectedSockets: m.socketIds.size,
        connected: m.socketIds.size > 0,
        connectedAt: m.connectedAt,
        disconnectedAt: m.disconnectedAt,
        ready: m.ready,
      })),
    };
  }
}

export const lobbySessionManager = new LobbySessionManager();
