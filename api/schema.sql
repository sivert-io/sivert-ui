CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_id VARCHAR(32) NOT NULL UNIQUE,
  persona_name TEXT,
  profile_url TEXT,
  avatar_small TEXT,
  avatar_medium TEXT,
  avatar_large TEXT,
  rank INTEGER,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_hash TEXT,
  user_agent_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open',
  visibility TEXT NOT NULL DEFAULT 'public',
  game_mode TEXT,
  region TEXT,
  min_rank INTEGER,
  max_rank INTEGER,
  max_members INTEGER NOT NULL DEFAULT 5,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  CONSTRAINT lobbies_status_check CHECK (status IN ('open', 'queueing', 'matched', 'closed')),
  CONSTRAINT lobbies_visibility_check CHECK (visibility IN ('public', 'private'))
);

CREATE INDEX IF NOT EXISTS idx_lobbies_owner_user_id ON lobbies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);
CREATE INDEX IF NOT EXISTS idx_lobbies_region_status ON lobbies(region, status);

CREATE TABLE IF NOT EXISTS lobby_members (
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ready BOOLEAN NOT NULL DEFAULT FALSE,
  kicked_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  PRIMARY KEY (lobby_id, user_id),
  CONSTRAINT lobby_members_role_check CHECK (member_role IN ('owner', 'member'))
);

CREATE INDEX IF NOT EXISTS idx_lobby_members_user_id ON lobby_members(user_id);
CREATE INDEX IF NOT EXISTS idx_lobby_members_lobby_id ON lobby_members(lobby_id);

CREATE TABLE IF NOT EXISTS lobby_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 seconds'),
  CONSTRAINT lobby_invites_status_check
    CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_lobby_invites_invited_user_id ON lobby_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_lobby_invites_lobby_id ON lobby_invites(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_invites_status ON lobby_invites(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lobby_invites_one_pending_per_lobby_user
  ON lobby_invites(lobby_id, invited_user_id)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS matchmaking_queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL UNIQUE REFERENCES lobbies(id) ON DELETE CASCADE,
  enqueued_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  queue_type TEXT NOT NULL DEFAULT 'default',
  region TEXT,
  min_rank INTEGER,
  max_rank INTEGER,
  status TEXT NOT NULL DEFAULT 'queued',
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dequeued_at TIMESTAMPTZ,
  CONSTRAINT matchmaking_queue_entries_status_check CHECK (status IN ('queued', 'matched', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_entries_status ON matchmaking_queue_entries(status);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_entries_region_status ON matchmaking_queue_entries(region, status);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_queue_type TEXT NOT NULL DEFAULT 'default',
  region TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  CONSTRAINT matches_status_check CHECK (status IN ('pending', 'ready', 'live', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

CREATE TABLE IF NOT EXISTS match_lobbies (
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  team_number INTEGER,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (match_id, lobby_id)
);

CREATE INDEX IF NOT EXISTS idx_match_lobbies_lobby_id ON match_lobbies(lobby_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read_at
  ON notifications(user_id, read_at);

CREATE TABLE IF NOT EXISTS friendships (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'app',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_user_id),
  CONSTRAINT friendships_no_self CHECK (user_id <> friend_user_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_friend_user_id
  ON friendships(friend_user_id);

CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT friend_requests_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  CONSTRAINT friend_requests_no_self CHECK (requester_user_id <> recipient_user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_one_pending_pair
  ON friend_requests(requester_user_id, recipient_user_id)
  WHERE status = 'pending';

UPDATE lobby_invites
SET expires_at = created_at + INTERVAL '30 seconds'
WHERE expires_at IS NULL
  AND status = 'pending';
