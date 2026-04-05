// api/src/realtime/handlers/lobby.handler.ts
import type { Server, Socket } from "socket.io";
import { db } from "../../db.js";
import { lobbySessionManager } from "../../modules/lobbies/lobby-session-manager.js";
import { lobbyService } from "../../modules/lobbies/lobby.service.js";
import { rooms } from "../rooms.js";
import { SOCKET_EVENTS } from "../events.js";

export function registerLobbyHandlers(io: Server, socket: Socket) {
  const user = socket.data.user;
  if (!user) return;

  socket.on(SOCKET_EVENTS.LOBBY_JOIN, async ({ lobbyId }, ack) => {
    try {
      if (!lobbyId) {
        return ack?.({ ok: false, error: "lobbyId is required" });
      }

      const membershipResult = await db.query(
        `
        SELECT 1
        FROM lobby_members
        WHERE lobby_id = $1
          AND user_id = $2
          AND left_at IS NULL
          AND kicked_at IS NULL
        LIMIT 1
        `,
        [lobbyId, user.id],
      );

      if (!membershipResult.rowCount) {
        return ack?.({ ok: false, error: "Not a member of this lobby" });
      }

      socket.join(rooms.lobby(lobbyId));
      socket.data.currentLobbyId = lobbyId;

      lobbySessionManager.joinLobby(lobbyId, user, socket.id);

      const state = await lobbyService.getLobbyState(lobbyId);
      const presenceState = lobbySessionManager.serializeLobby(lobbyId);

      const mergedState = {
        ...state,
        members: state.members.map((member) => {
          const presenceMember = presenceState?.members.find(
            (item) => item.userId === member.userId,
          );

          return {
            ...member,
            connectedSockets: presenceMember?.connectedSockets ?? 0,
            connected: presenceMember?.connected ?? false,
          };
        }),
      };

      io.to(rooms.lobby(lobbyId)).emit(SOCKET_EVENTS.LOBBY_STATE, mergedState);
      ack?.({ ok: true, state: mergedState });
    } catch {
      ack?.({ ok: false, error: "Failed to join lobby" });
    }
  });

  socket.on(
    SOCKET_EVENTS.LOBBY_READY_UPDATED,
    async ({ lobbyId, ready }, ack) => {
      try {
        await db.query(
          `
        UPDATE lobby_members
        SET ready = $3
        WHERE lobby_id = $1
          AND user_id = $2
          AND left_at IS NULL
          AND kicked_at IS NULL
        `,
          [lobbyId, user.id, ready],
        );

        const presenceState = lobbySessionManager.setReady(
          lobbyId,
          user.id,
          ready,
        );
        const state = await lobbyService.getLobbyState(lobbyId);

        const mergedState = {
          ...state,
          members: state.members.map((member) => {
            const presenceMember = presenceState?.members.find(
              (item) => item.userId === member.userId,
            );

            return {
              ...member,
              connectedSockets: presenceMember?.connectedSockets ?? 0,
              connected: presenceMember?.connected ?? false,
            };
          }),
        };

        io.to(rooms.lobby(lobbyId)).emit(
          SOCKET_EVENTS.LOBBY_STATE,
          mergedState,
        );
        ack?.({ ok: true, state: mergedState });
      } catch {
        ack?.({ ok: false, error: "Failed to update ready state" });
      }
    },
  );

  socket.on("disconnect", async () => {
    const result = lobbySessionManager.disconnectSocket(socket.id, user.id);

    if (!result?.lobbyId) return;

    const state = await lobbyService.getLobbyState(result.lobbyId);
    const presenceState = lobbySessionManager.serializeLobby(result.lobbyId);

    const mergedState = {
      ...state,
      members: state.members.map((member) => {
        const presenceMember = presenceState?.members.find(
          (item) => item.userId === member.userId,
        );

        return {
          ...member,
          connectedSockets: presenceMember?.connectedSockets ?? 0,
          connected: presenceMember?.connected ?? false,
        };
      }),
    };

    io.to(rooms.lobby(result.lobbyId)).emit(
      SOCKET_EVENTS.LOBBY_STATE,
      mergedState,
    );
  });
}
