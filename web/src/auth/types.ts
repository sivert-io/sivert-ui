export type AuthUser = {
  id: string;
  steamId: string;
  personaName: string | null;
  avatarMedium: string | null;
};

export type MeResponse =
  | {
      authenticated: true;
      user: AuthUser;
    }
  | {
      authenticated: false;
      user: null;
    };
