import "express";

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      steamId: string;
      personaName: string | null;
      avatarMedium: string | null;
    }

    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

export {};
