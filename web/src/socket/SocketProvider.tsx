// src/socket/SocketProvider.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import { socket } from "./client";
import { SocketContext } from "./SocketContext";

type Props = {
  children: ReactNode;
};

export function SocketProvider({ children }: Props) {
  const { isSignedIn, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError(error: Error) {
      setIsConnected(false);
      console.error("Socket connection error:", error.message);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (isSignedIn) {
      if (!socket.connected) {
        socket.connect();
      }
      return;
    }

    socket.disconnect();
  }, [isSignedIn, isLoading]);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
    }),
    [isConnected],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
