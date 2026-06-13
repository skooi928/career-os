-- ── POSTS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dbo.posts (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           TEXT,
  post_type         VARCHAR(50) DEFAULT 'general',  -- general, achievement, project, learning, hiring
  include_in_cv     BOOLEAN DEFAULT FALSE,           -- user wants this included in CV via AI
  is_reshare        BOOLEAN DEFAULT FALSE,
  original_post_id  BIGINT REFERENCES dbo.posts(id) ON DELETE SET NULL,
  is_edited         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id    ON dbo.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON dbo.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type       ON dbo.posts(post_type);

-- ── POST MEDIA ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dbo.post_media (
  id           BIGSERIAL PRIMARY KEY,
  post_id      BIGINT NOT NULL REFERENCES dbo.posts(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,              -- Supabase Storage public URL
  media_type   VARCHAR(20) NOT NULL,       -- image, pdf, video
  file_name    VARCHAR(255),
  file_size    BIGINT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON dbo.post_media(post_id);

-- ── POST LIKES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dbo.post_likes (
  id         BIGSERIAL PRIMARY KEY,
  post_id    BIGINT NOT NULL REFERENCES dbo.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (post_id, user_id)   -- one like per user per post
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON dbo.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON dbo.post_likes(user_id);

-- ── POST COMMENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dbo.post_comments (
  id                BIGSERIAL PRIMARY KEY,
  post_id           BIGINT NOT NULL REFERENCES dbo.posts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  parent_comment_id BIGINT REFERENCES dbo.post_comments(id) ON DELETE CASCADE,  -- for replies
  is_edited         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON dbo.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON dbo.post_comments(user_id);

-- ── POST RESHARES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dbo.post_reshares (
  id                BIGSERIAL PRIMARY KEY,
  post_id           BIGINT NOT NULL REFERENCES dbo.posts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reshares_post_id ON dbo.post_reshares(post_id);

-- ── NETWORK (connections) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dbo.network (
  id               BIGSERIAL PRIMARY KEY,
  requester_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           VARCHAR(20) DEFAULT 'pending',  -- pending, accepted, declined
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_network_requester ON dbo.network(requester_id);
CREATE INDEX IF NOT EXISTS idx_network_addressee ON dbo.network(addressee_id);
CREATE INDEX IF NOT EXISTS idx_network_status    ON dbo.network(status);

-- ── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dbo.notifications (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- recipient
  actor_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,           -- who triggered it
  type         VARCHAR(50) NOT NULL,   -- like, comment, reshare, network_request, network_accepted
  post_id      BIGINT REFERENCES dbo.posts(id) ON DELETE CASCADE,
  comment_id   BIGINT REFERENCES dbo.post_comments(id) ON DELETE CASCADE,
  message      TEXT,                   -- human-readable e.g. "Ahmad liked your post"
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON dbo.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read  ON dbo.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON dbo.notifications(created_at DESC);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────────────
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON dbo.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON dbo.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_updated_at
  BEFORE UPDATE ON dbo.network
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
ALTER TABLE dbo.posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.post_media       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.post_likes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.post_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.post_reshares    ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.network          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.notifications    ENABLE ROW LEVEL SECURITY;