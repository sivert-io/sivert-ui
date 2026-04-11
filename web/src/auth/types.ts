export type HostStatus = "pending" | "verified" | "rejected" | "suspended";
export type HostBadgeVariant = "verified" | "founding";

export type AuthUser = {
  id: string;
  steamId: string;
  personaName: string | null;
  avatarSmall: string | null;
  avatarMedium: string | null;
  avatarLarge: string | null;
  rank: number | null;
  role: string;
  hostStatus: HostStatus | null;
  hostBadgeVariant: HostBadgeVariant | null;
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
  rank: number | null;
  createdAt: string;
  hostStatus: HostStatus | null;
  hostBadgeVariant: HostBadgeVariant | null;
};
