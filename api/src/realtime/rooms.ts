export const rooms = {
  user: (userId: string) => `user:${userId}`,
  lobby: (lobbyId: string) => `lobby:${lobbyId}`,
  matchmakingQueue: (queueKey: string) => `queue:${queueKey}`,
  match: (matchId: string) => `match:${matchId}`,
};
