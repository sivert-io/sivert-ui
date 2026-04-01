import "express";

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      steamId: string;
      personaName: string | null;
      avatarSmall: string | null;
      avatarMedium: string | null;
      avatarLarge: string | null;
    }

    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

export {};
