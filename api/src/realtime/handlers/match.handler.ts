import type { Server, Socket } from "socket.io";
import { lobbyService } from "../../modules/lobbies/lobby.service.js";
import { rooms } from "../rooms.js";
import { SOCKET_EVENTS } from "../events.js";
import { matchFoundManager } from "../match-found-manager.js";

export function registerMatchHandlers(io: Server, socket: Socket) {
  const user = socket.data.user;
  if (!user) return;

  socket.on(SOCKET_EVENTS.MATCH_FOUND_CREATE, async ({ lobbyId }, ack) => {
    try {
      if (!lobbyId) {
        return ack?.({ ok: false, error: "lobbyId is required" });
      }

      const lobbyState = await lobbyService.getLobbyState(lobbyId);
      const isMember = lobbyState.members.some(
        (member) => member.userId === user.id,
      );

      if (!isMember) {
        return ack?.({ ok: false, error: "Not a member of this lobby" });
      }

      if (lobbyState.members.length < 2) {
        return ack?.({ ok: false, error: "Need at least 2 players" });
      }

      const state = matchFoundManager.create(
        lobbyId,
        lobbyState.members.map((member) => ({
          userId: member.userId,
          steamId: member.steamId,
          personaName: member.personaName,
        })),
      );

      const payload = matchFoundManager.serialize(state);

      io.to(rooms.lobby(lobbyId)).emit(SOCKET_EVENTS.MATCH_FOUND, payload);
      ack?.({ ok: true, state: payload });
    } catch {
      ack?.({ ok: false, error: "Failed to create match found state" });
    }
  });

  socket.on(SOCKET_EVENTS.MATCH_ACCEPT, ({ matchId }, ack) => {
    const state = matchFoundManager.accept(matchId, user.id);

    if (!state) {
      return ack?.({
        ok: false,
        error: "Match not found or no longer pending",
      });
    }

    const payload = matchFoundManager.serialize(state);

    if (state.status === "ready") {
      io.to(rooms.lobby(state.lobbyId)).emit(
        SOCKET_EVENTS.MATCH_READY,
        payload,
      );
      matchFoundManager.remove(state.matchId);
    } else if (state.status === "cancelled") {
      io.to(rooms.lobby(state.lobbyId)).emit(
        SOCKET_EVENTS.MATCH_CANCELLED,
        payload,
      );
      matchFoundManager.remove(state.matchId);
    } else {
      io.to(rooms.lobby(state.lobbyId)).emit(
        SOCKET_EVENTS.MATCH_STATE,
        payload,
      );
    }

    ack?.({ ok: true, state: payload });
  });

  socket.on(SOCKET_EVENTS.MATCH_DECLINE, ({ matchId }, ack) => {
    const state = matchFoundManager.decline(matchId, user.id);

    if (!state) {
      return ack?.({
        ok: false,
        error: "Match not found or no longer pending",
      });
    }

    const payload = matchFoundManager.serialize(state);
    io.to(rooms.lobby(state.lobbyId)).emit(
      SOCKET_EVENTS.MATCH_CANCELLED,
      payload,
    );
    matchFoundManager.remove(state.matchId);

    ack?.({ ok: true, state: payload });
  });
}
