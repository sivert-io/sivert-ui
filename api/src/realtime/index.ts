import type { Server } from "socket.io";
import { attachSocketAuth } from "./auth.js";
import { registerLobbyHandlers } from "./handlers/lobby.handler.js";
import { registerNotificationHandlers } from "./handlers/notifications.handler.js";
import { registerMatchHandlers } from "./handlers/match.handler.js";
import { setIo } from "./io.js";
import { userPresenceManager } from "./user-presence.js";

export function registerRealtime(io: Server) {
  setIo(io);
  attachSocketAuth(io);

  io.on("connection", (socket) => {
    const user = socket.data.user;
    if (user) {
      userPresenceManager.connect(user.id, socket.id);
    }

    socket.on("disconnect", () => {
      userPresenceManager.disconnect(socket.id);
    });

    registerNotificationHandlers(io, socket);
    registerLobbyHandlers(io, socket);
    registerMatchHandlers(io, socket);
  });
}
