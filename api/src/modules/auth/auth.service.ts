import { db } from "../../db.js";

type SteamProfile = {
  steamid: string;
  username?: string;
  profile?: {
    url?: string;
  };
  avatar?: {
    small?: string;
    medium?: string;
    large?: string;
  };
};

export async function upsertSteamUser(profile: SteamProfile) {
  const personaName = profile.username ?? null;
  const profileUrl = profile.profile?.url ?? null;
  const avatarSmall = profile.avatar?.small ?? null;
  const avatarMedium = profile.avatar?.medium ?? null;
  const avatarLarge = profile.avatar?.large ?? null;

  const result = await db.query(
    `
      INSERT INTO users (
        steam_id,
        persona_name,
        profile_url,
        avatar_small,
        avatar_medium,
        avatar_large
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (steam_id)
      DO UPDATE SET
        persona_name = EXCLUDED.persona_name,
        profile_url = EXCLUDED.profile_url,
        avatar_small = EXCLUDED.avatar_small,
        avatar_medium = EXCLUDED.avatar_medium,
        avatar_large = EXCLUDED.avatar_large,
        updated_at = NOW()
      RETURNING id, steam_id, persona_name, avatar_medium
    `,
    [
      profile.steamid,
      personaName,
      profileUrl,
      avatarSmall,
      avatarMedium,
      avatarLarge,
    ],
  );

  return result.rows[0];
}
