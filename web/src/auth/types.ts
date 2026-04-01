export type AuthUser = {
  id: string;
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
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

export type PublicProfile = {
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  createdAt: string;
};
