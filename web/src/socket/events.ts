export const SOCKET_EVENTS = {
  CONNECTED: "connect",
  DISCONNECTED: "disconnect",
  CONNECT_ERROR: "connect_error",

  NOTIFICATION_CONNECTED: "notification:connected",
  NOTIFICATION_NEW: "notification:new",

  LOBBY_JOIN: "lobby:join",
  LOBBY_LEAVE: "lobby:leave",
  LOBBY_STATE: "lobby:state",
  LOBBY_READY_UPDATED: "lobby:ready_updated",
  LOBBY_MEMBER_KICK: "lobby:member_kick",
  LOBBY_KICKED: "lobby:kicked",

  LOBBY_QUEUE_START: "lobby:queue_start",
  LOBBY_QUEUE_STOP: "lobby:queue_stop",
  LOBBY_QUEUE_STATE: "lobby:queue_state",

  MATCH_FOUND_CREATE: "match:found_create",
  MATCH_FOUND: "match:found",
  MATCH_ACCEPT: "match:accept",
  MATCH_DECLINE: "match:decline",
  MATCH_STATE: "match:state",
  MATCH_CANCELLED: "match:cancelled",
  MATCH_READY: "match:ready",
} as const;
