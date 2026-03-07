-- Anti-abuse: track phone verification + IP for multi-account detection
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ip_created inet;

-- Track account creation IPs to detect multi-account abuse
CREATE TABLE IF NOT EXISTS signup_ips (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address inet NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_ips_address ON signup_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_signup_ips_created ON signup_ips(created_at);

ALTER TABLE signup_ips ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write signup_ips (no user access)
-- RLS blocks all user access by default (no policy = deny all)

-- Relance tracking for auto-reminders
CREATE TABLE IF NOT EXISTS quote_reminders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  sent_at timestamptz DEFAULT now(),
  reminder_number integer NOT NULL CHECK (reminder_number BETWEEN 1 AND 3),
  UNIQUE(quote_id, reminder_number, type)
);

ALTER TABLE quote_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_reminders" ON quote_reminders FOR ALL USING (user_id = auth.uid());
