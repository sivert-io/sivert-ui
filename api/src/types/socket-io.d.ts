import "socket.io";

declare module "socket.io" {
  interface SocketData {
    sessionId?: string;
    user?: {
      id: string;
      steamId: string;
      personaName: string | null;
      avatarSmall: string | null;
      avatarMedium: string | null;
      avatarLarge: string | null;
      rank: number | null;
      role: string;
    };
    currentLobbyId?: string;
  }
}
