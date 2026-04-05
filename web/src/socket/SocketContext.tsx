// src/socket/SocketContext.tsx
import { createContext } from "react";
import type { Socket } from "socket.io-client";

type SocketContextValue = {
  socket: Socket;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextValue | null>(null);
