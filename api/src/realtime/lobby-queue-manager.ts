type LobbyQueueRuntimeState = {
  lobbyId: string;
  startedAt: number;
};

class LobbyQueueManager {
  private queues = new Map<string, LobbyQueueRuntimeState>();

  startQueue(lobbyId: string) {
    let queue = this.queues.get(lobbyId);

    if (!queue) {
      queue = {
        lobbyId,
        startedAt: Date.now(),
      };
      this.queues.set(lobbyId, queue);
    }

    return this.serializeLobbyQueue(lobbyId);
  }

  stopQueue(lobbyId: string) {
    this.queues.delete(lobbyId);
    return this.serializeLobbyQueue(lobbyId);
  }

  clearQueue(lobbyId: string) {
    this.queues.delete(lobbyId);
  }

  isSearching(lobbyId: string) {
    return this.queues.has(lobbyId);
  }

  serializeLobbyQueue(lobbyId: string) {
    const queue = this.queues.get(lobbyId);

    return {
      lobbyId,
      isSearching: !!queue,
      startedAt: queue ? new Date(queue.startedAt).toISOString() : null,
    };
  }
}

export const lobbyQueueManager = new LobbyQueueManager();
