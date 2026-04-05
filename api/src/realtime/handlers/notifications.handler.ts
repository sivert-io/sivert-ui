import type { Server, Socket } from "socket.io";
import { rooms } from "../rooms.js";

export function registerNotificationHandlers(_io: Server, socket: Socket) {
  const user = socket.data.user;

  if (!user) {
    return;
  }

  socket.join(rooms.user(user.id));

  socket.emit("notification:connected", {
    ok: true,
    userId: user.id,
  });
}
