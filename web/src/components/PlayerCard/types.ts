import type { AuthUser, PublicProfile } from "../../auth/types";

export interface PlayerCardProps {
  playerData?: PublicProfile | AuthUser | null;
  onClick?: () => unknown;
  disabled?: boolean;
  disableInvite?: boolean;
  scale?: number;
  statusLabel?: string;
}
