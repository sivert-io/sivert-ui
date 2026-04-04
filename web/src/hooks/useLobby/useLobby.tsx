import { useState } from "react";
import type { AuthUser, PublicProfile } from "../../auth/types";

export function useLobby(user: AuthUser) {
  const [players, setPlayers] = useState<PublicProfile[] | AuthUser[]>([user]);

  return { players, setPlayers };
}
