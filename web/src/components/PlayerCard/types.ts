import type { ReactNode } from "react";
import type { AuthUser, PublicProfile } from "../../auth/types";
import type { LobbyPlayerSlot } from "../../hooks/useLobby/types";

export type PlayerCardData =
  | AuthUser
  | PublicProfile
  | Exclude<LobbyPlayerSlot, null>;

export type PlayerCardProps = {
  playerData?: PlayerCardData | null;
  onClick?: () => void;
  disabled?: boolean;
  disableInvite?: boolean;
  statusLabel?: ReactNode;
  scale?: number;
  title?: string;
};
