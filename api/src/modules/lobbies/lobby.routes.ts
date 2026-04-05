import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { lobbyService } from "./lobby.service.js";
import { getIo } from "../../realtime/io.js";
import { rooms } from "../../realtime/rooms.js";
import { lobbySessionManager } from "./lobby-session-manager.js";

const router = Router();

router.post("/bootstrap", requireAuth, async (req, res, next) => {
  try {
    const lobbyId = await lobbyService.ensureActiveLobbyForUser(req.user!.id);
    const state = await lobbyService.getLobbyState(lobbyId);

    return res.status(200).json({
      lobby: state,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/current", requireAuth, async (req, res, next) => {
  try {
    const lobbyId = await lobbyService.ensureActiveLobbyForUser(req.user!.id);
    const state = await lobbyService.getLobbyState(lobbyId);

    return res.status(200).json({
      lobby: state,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/current/leave", requireAuth, async (req, res, next) => {
  try {
    const { previousLobbyId, newLobbyId } =
      await lobbyService.leaveCurrentLobbyAndCreateNewLobby(req.user!.id);

    const newLobbyState = await lobbyService.getLobbyState(newLobbyId);
    const io = getIo();

    if (previousLobbyId) {
      const previousLobbyState =
        await lobbyService.getLobbyState(previousLobbyId);
      const previousPresenceState =
        lobbySessionManager.serializeLobby(previousLobbyId);

      const mergedPreviousLobbyState = {
        ...previousLobbyState,
        members: previousLobbyState.members.map((member) => {
          const presenceMember = previousPresenceState?.members.find(
            (item) => item.userId === member.userId,
          );

          return {
            ...member,
            connectedSockets: presenceMember?.connectedSockets ?? 0,
            connected: presenceMember?.connected ?? false,
          };
        }),
      };

      io.to(rooms.lobby(previousLobbyId)).emit(
        "lobby:state",
        mergedPreviousLobbyState,
      );
    }

    const newPresenceState = lobbySessionManager.serializeLobby(newLobbyId);
    const mergedNewLobbyState = {
      ...newLobbyState,
      members: newLobbyState.members.map((member) => {
        const presenceMember = newPresenceState?.members.find(
          (item) => item.userId === member.userId,
        );

        return {
          ...member,
          connectedSockets: presenceMember?.connectedSockets ?? 0,
          connected: presenceMember?.connected ?? false,
        };
      }),
    };

    io.to(rooms.lobby(newLobbyId)).emit("lobby:state", mergedNewLobbyState);

    return res.status(200).json({
      previousLobbyId,
      lobby: mergedNewLobbyState,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/current/friends", requireAuth, async (req, res, next) => {
  try {
    const lobbyId = await lobbyService.ensureActiveLobbyForUser(req.user!.id);
    const players = await lobbyService.getFriendsForLobby(
      req.user!.id,
      lobbyId,
    );

    return res.status(200).json({
      lobbyId,
      players,
    });
  } catch (error) {
    return next(error);
  }
});

router.get(
  "/current/invite-candidates",
  requireAuth,
  async (req, res, next) => {
    try {
      const lobbyId = await lobbyService.ensureActiveLobbyForUser(req.user!.id);
      const candidates = await lobbyService.getInviteCandidates(
        req.user!.id,
        lobbyId,
      );

      return res.status(200).json({
        lobbyId,
        players: candidates,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
