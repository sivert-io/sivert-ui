import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../auth/useAuth";
import { API_BASE_URL } from "../../lib/api";
import { useSocket } from "../../socket/useSocket";
import { SOCKET_EVENTS } from "../../socket/events";
import { LobbyContext, type LobbyContextValue } from "./LobbyContext";
import { formatElapsed, toPlayer } from "./lobby-utils";
import type { LobbyPlayerSlot, LobbyState, LobbyQueueState } from "./types";

type CurrentLobbyResponse = {
  lobby: {
    lobbyId: string;
  };
};

export function LobbyProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useAuth();
  const { socket, isConnected } = useSocket();

  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [lobbyState, setLobbyState] = useState<LobbyState>(null);
  const [queueState, setQueueState] = useState<LobbyQueueState>(null);
  const [queueNow, setQueueNow] = useState(Date.now());

  const queueStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const queueStopAudioRef = useRef<HTMLAudioElement | null>(null);
  const wasSearchingRef = useRef(false);

  const refreshLobby = useCallback(async () => {
    if (!isSignedIn) {
      setLobbyId(null);
      setLobbyState(null);
      setQueueState(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/lobbies/current`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load current lobby");
      }

      const data: CurrentLobbyResponse = await response.json();
      setLobbyId(data.lobby.lobbyId);
    } catch (error) {
      console.error(error);
    }
  }, [isSignedIn]);

  useEffect(() => {
    queueStartAudioRef.current = new Audio("/sounds/search.mp3");
    queueStartAudioRef.current.preload = "auto";
    queueStartAudioRef.current.volume = 0.5;

    queueStopAudioRef.current = new Audio("/sounds/search-stop.mp3");
    queueStopAudioRef.current.preload = "auto";
    queueStopAudioRef.current.volume = 0.5;

    return () => {
      queueStartAudioRef.current = null;
      queueStopAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    void refreshLobby();
  }, [refreshLobby]);

  useEffect(() => {
    function onLobbyChanged(event: Event) {
      const customEvent = event as CustomEvent<{ lobbyId?: string }>;
      const nextLobbyId = customEvent.detail?.lobbyId;

      if (!nextLobbyId) return;

      setLobbyId(nextLobbyId);
    }

    window.addEventListener("lobby:changed", onLobbyChanged);

    return () => {
      window.removeEventListener("lobby:changed", onLobbyChanged);
    };
  }, []);

  useEffect(() => {
    const isSearching = !!queueState?.isSearching;

    if (isSearching && !wasSearchingRef.current) {
      const audio = queueStartAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    }

    if (!isSearching && wasSearchingRef.current) {
      const audio = queueStopAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    }

    wasSearchingRef.current = isSearching;
  }, [queueState?.isSearching]);

  useEffect(() => {
    if (!queueState?.isSearching || !queueState.startedAt) return;

    setQueueNow(Date.now());

    const interval = window.setInterval(() => {
      setQueueNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [queueState?.isSearching, queueState?.startedAt]);

  useEffect(() => {
    if (!socket || !isConnected || !lobbyId || !user) return;

    function onLobbyState(state: LobbyState) {
      if (state?.lobbyId === lobbyId || state === null) {
        setLobbyState(state);
      }
    }

    function onQueueState(state: LobbyQueueState) {
      if (state?.lobbyId === lobbyId) {
        setQueueState(state);
      }
    }

    function onLobbyKicked(payload: {
      previousLobbyId: string;
      lobby: LobbyState;
      queueState?: LobbyQueueState;
    }) {
      if (payload.previousLobbyId !== lobbyId || !payload.lobby?.lobbyId)
        return;

      setLobbyId(payload.lobby.lobbyId);
      setLobbyState(payload.lobby);
      setQueueState(payload.queueState ?? null);

      window.dispatchEvent(
        new CustomEvent("lobby:changed", {
          detail: { lobbyId: payload.lobby.lobbyId },
        }),
      );

      toast("You were kicked from the lobby");
    }

    socket.on(SOCKET_EVENTS.LOBBY_STATE, onLobbyState);
    socket.on(SOCKET_EVENTS.LOBBY_QUEUE_STATE, onQueueState);
    socket.on(SOCKET_EVENTS.LOBBY_KICKED, onLobbyKicked);

    socket.emit(
      SOCKET_EVENTS.LOBBY_JOIN,
      { lobbyId },
      (response: {
        ok: boolean;
        state?: LobbyState;
        queueState?: LobbyQueueState;
      }) => {
        if (response.ok) {
          if (response.state) {
            setLobbyState(response.state);
          }
          if (response.queueState) {
            setQueueState(response.queueState);
          }
        }
      },
    );

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_STATE, onLobbyState);
      socket.off(SOCKET_EVENTS.LOBBY_QUEUE_STATE, onQueueState);
      socket.off(SOCKET_EVENTS.LOBBY_KICKED, onLobbyKicked);
    };
  }, [socket, isConnected, lobbyId, user]);

  const players = useMemo<LobbyPlayerSlot[]>(() => {
    if (!user) return [null, null, null, null, null];

    let mapped: LobbyPlayerSlot[];

    if (!lobbyState?.members?.length) {
      mapped = [
        {
          userId: user.id,
          steamId: user.steamId,
          personaName: user.personaName,
          avatarSmall: user.avatarSmall,
          avatarMedium: user.avatarMedium,
          avatarLarge: user.avatarLarge,
          rank: user.rank,
          role: user.role,
          createdAt: new Date().toISOString(),
          connected: true,
          connectedSockets: 1,
          connectedAt: null,
          disconnectedAt: null,
        },
      ];
    } else {
      mapped = lobbyState.members.map(toPlayer);

      const selfIndex = mapped.findIndex((p) => p?.userId === user.id);
      if (selfIndex > 0) {
        const self = mapped[selfIndex];
        mapped.splice(selfIndex, 1);
        mapped.unshift(self);
      }
    }

    while (mapped.length < 5) {
      mapped.push(null);
    }

    return mapped.slice(0, 5);
  }, [lobbyState, user]);

  const queueElapsedLabel = useMemo(() => {
    if (!queueState?.isSearching || !queueState.startedAt) return null;

    return formatElapsed(queueNow - new Date(queueState.startedAt).getTime());
  }, [queueNow, queueState]);

  function setReady(ready: boolean) {
    if (!lobbyId) return;
    socket.emit(SOCKET_EVENTS.LOBBY_READY_UPDATED, { lobbyId, ready });
  }

  function startQueue() {
    if (!lobbyId) return;
    socket.emit(SOCKET_EVENTS.LOBBY_QUEUE_START, { lobbyId });
  }

  function stopQueue() {
    if (!lobbyId) return;
    socket.emit(SOCKET_EVENTS.LOBBY_QUEUE_STOP, { lobbyId });
  }

  function kickMember(targetUserId: string) {
    if (!lobbyId || !targetUserId) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      socket.emit(
        SOCKET_EVENTS.LOBBY_MEMBER_KICK,
        { lobbyId, targetUserId },
        (response: { ok: boolean; error?: string }) => {
          if (response?.ok) {
            resolve();
            return;
          }

          reject(new Error(response?.error ?? "Failed to kick player"));
        },
      );
    });
  }

  const value = useMemo<LobbyContextValue>(
    () => ({
      lobbyId,
      lobbyState,
      queueState,
      players,
      isConnected,
      isLobbyOwner: lobbyState?.ownerUserId === user?.id,
      queueElapsedLabel,
      setReady,
      startQueue,
      stopQueue,
      kickMember,
      refreshLobby,
    }),
    [
      lobbyId,
      lobbyState,
      queueState,
      players,
      isConnected,
      user?.id,
      queueElapsedLabel,
      refreshLobby,
    ],
  );

  return (
    <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
  );
}
