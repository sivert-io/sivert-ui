import type { Server } from "socket.io";
import { attachSocketAuth } from "./auth.js";
import { registerLobbyHandlers } from "./handlers/lobby.handler.js";
import { registerNotificationHandlers } from "./handlers/notifications.handler.js";
import { setIo } from "./io.js";

export function registerRealtime(io: Server) {
  setIo(io);
  attachSocketAuth(io);

  io.on("connection", (socket) => {
    registerNotificationHandlers(io, socket);
    registerLobbyHandlers(io, socket);
  });
}
