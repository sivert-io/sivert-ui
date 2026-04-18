import type { LobbyMember, LobbyPlayerSlot } from "./types";

export function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function toPlayer(member: LobbyMember): Exclude<LobbyPlayerSlot, null> {
  return {
    userId: member.userId,
    steamId: member.steamId,
    personaName: member.personaName,
    avatarSmall: member.avatarSmall,
    avatarMedium: member.avatarMedium,
    avatarLarge: member.avatarLarge,
    rank: member.rank,
    role: member.role,
    createdAt: new Date().toISOString(),
    ready: member.ready,
    connected: member.connected,
    connectedSockets: member.connectedSockets,
    connectedAt: member.connectedAt ?? null,
    disconnectedAt: member.disconnectedAt ?? null,
  };
}
