type UserPresenceEntry = {
  socketIds: Set<string>;
  lastSeenAt: number;
};

class UserPresenceManager {
  private users = new Map<string, UserPresenceEntry>();
  private socketToUser = new Map<string, string>();

  connect(userId: string, socketId: string) {
    let entry = this.users.get(userId);

    if (!entry) {
      entry = {
        socketIds: new Set(),
        lastSeenAt: Date.now(),
      };
      this.users.set(userId, entry);
    }

    entry.socketIds.add(socketId);
    entry.lastSeenAt = Date.now();
    this.socketToUser.set(socketId, userId);
  }

  disconnect(socketId: string) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return;

    const entry = this.users.get(userId);
    if (!entry) {
      this.socketToUser.delete(socketId);
      return;
    }

    entry.socketIds.delete(socketId);
    entry.lastSeenAt = Date.now();
    this.socketToUser.delete(socketId);

    if (entry.socketIds.size === 0) {
      this.users.delete(userId);
    }
  }

  isOnline(userId: string) {
    return (this.users.get(userId)?.socketIds.size ?? 0) > 0;
  }

  connectedSockets(userId: string) {
    return this.users.get(userId)?.socketIds.size ?? 0;
  }
}

export const userPresenceManager = new UserPresenceManager();
