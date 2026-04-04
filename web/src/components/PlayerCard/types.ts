import type { AuthUser, PublicProfile } from "../../auth/types";

export interface PlayerCardProps {
  playerData?: PublicProfile | AuthUser;
  onClick?: () => unknown;
  disableInvite?: boolean;
  scale?: number;
}
