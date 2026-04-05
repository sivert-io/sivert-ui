// src/modules/notifications/notification.service.ts
import type { Server } from "socket.io";
import { rooms } from "../../realtime/rooms.js";

export class NotificationService {
  constructor(private io: Server) {}

  async notifyUser(
    userId: string,
    payload: {
      type: string;
      title: string;
      body?: string;
      data?: unknown;
    },
  ) {
    // optional: insert into notifications table first
    this.io.to(rooms.user(userId)).emit("notification:new", {
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }
}
