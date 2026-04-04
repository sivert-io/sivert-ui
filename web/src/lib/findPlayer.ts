import { API_BASE_URL } from "../lib/api";
import type { PublicProfile } from "../auth/types";

export async function findPlayer(
  steamId: string,
): Promise<PublicProfile | null> {
  if (!steamId) return null;

  const response = await fetch(`${API_BASE_URL}/auth/profiles/${steamId}`, {
    credentials: "include",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load player");
  }

  const data = await response.json();
  return data.profile;
}
