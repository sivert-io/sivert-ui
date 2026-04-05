export const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",

  LOBBY_JOIN: "lobby:join",
  LOBBY_LEAVE: "lobby:leave",
  LOBBY_STATE: "lobby:state",
  LOBBY_MEMBER_JOINED: "lobby:member_joined",
  LOBBY_MEMBER_LEFT: "lobby:member_left",
  LOBBY_READY_UPDATED: "lobby:ready_updated",

  MATCHMAKING_ENQUEUE: "matchmaking:enqueue",
  MATCHMAKING_DEQUEUE: "matchmaking:dequeue",
  MATCHMAKING_STATUS: "matchmaking:status",
  MATCH_FOUND: "match:found",
} as const;
