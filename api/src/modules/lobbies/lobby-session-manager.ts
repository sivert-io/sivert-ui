// src/modules/lobbies/lobby-session-manager.ts
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

export class LobbySessionManager {
  private lobbies = new Map<string, LobbyRuntimeState>();
  private socketToLobby = new Map<string, string>();

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

    member.socketIds.add(socketId);
    member.connectedAt ??= Date.now();
    this.socketToLobby.set(socketId, lobbyId);

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
      member.connectedAt = null;
    }

    return { lobbyId, state: this.serializeLobby(lobbyId) };
  }

  explicitLeaveLobby(lobbyId: string, userId: string) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const member = lobby.members.get(userId);
    if (!member) return null;

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
        ready: m.ready,
      })),
    };
  }
}

export const lobbySessionManager = new LobbySessionManager();
