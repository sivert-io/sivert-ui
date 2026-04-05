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
} as const;
