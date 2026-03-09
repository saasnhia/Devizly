-- Daily AI briefings storage
CREATE TABLE IF NOT EXISTS daily_briefings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  summary text NOT NULL,
  actions jsonb NOT NULL DEFAULT '[]',
  stats jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_briefings" ON daily_briefings
  FOR ALL USING (user_id = auth.uid());

-- Index for fast lookup of latest briefing per user
CREATE INDEX idx_daily_briefings_user_date
  ON daily_briefings(user_id, created_at DESC);
