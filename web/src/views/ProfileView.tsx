import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { useAuth } from "../auth/useAuth";
import { Card } from "../components/Card";
import type { PublicProfile } from "../auth/types";
import { Skeleton } from "../components/Skeleton";
import { Rank, RankProgressBar } from "../components/Rank";
import { findPlayer } from "../lib/findPlayer";

export function ProfileView() {
  const { user, isSignedIn, isLoading } = useAuth();
  const { steamId } = useParams();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!steamId) return;

    const currentSteamId = steamId;
    let cancelled = false;

    async function loadProfile() {
      setIsProfileLoading(true);
      setNotFound(false);
      setHasError(false);

      try {
        const foundProfile = await findPlayer(currentSteamId);

        if (!cancelled) {
          if (!foundProfile) {
            setProfile(null);
            setNotFound(true);
            return;
          }

          setProfile(foundProfile);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [steamId]);

  if (!steamId) {
    if (isLoading) {
      return (
        <Card>
          <div className="flex items-center gap-4">
            <Skeleton circle className="h-20 w-20" />

            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </Card>
      );
    }

    if (!isSignedIn || !user?.steamId) {
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={`/profile/${user.steamId}`} replace />;
  }

  if (isProfileLoading) {
    return (
      <Card>
        <div className="flex items-center gap-4">
          <Skeleton circle className="h-20 w-20" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      </Card>
    );
  }

  if (notFound) {
    return (
      <Card>
        <h1 className="mb-4 text-2xl font-bold">Player not found</h1>
        <p className="text-primary/70">
          No player exists with Steam ID{" "}
          <span className="font-mono">{steamId}</span>.
        </p>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
        <p className="text-primary/70">
          We could not load this profile right now.
        </p>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card>
        <div className="flex items-center gap-4 w-full">
          {profile.avatarLarge ? (
            <img
              src={profile.avatarLarge}
              alt={profile.personaName ?? "Player avatar"}
              className="h-20 w-20 rounded-full bg-black/20"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-white/10" />
          )}

          <div className="w-full flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {profile.personaName ?? "Unnamed player"}
              </h1>
              <Rank rank={profile.rank} />
            </div>
            <p className="text-xs font-medium text-primary/70">
              Joined:{" "}
              {new Date(profile.createdAt).toLocaleString("en-GB", {
                dateStyle: "long",
              })}
            </p>

            <RankProgressBar rank={profile.rank} />
          </div>
        </div>
      </Card>
      <Card>
        <h1 className="font-bold text-lg">Match History</h1>
      </Card>
    </div>
  );
}
