-- Stripe subscription tracking on auth.users metadata is limited,
-- so we create a profiles table for billing data.
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'business')),
  subscription_id text,
  devis_used integer DEFAULT 0,
  devis_reset_at timestamptz DEFAULT date_trunc('month', now()) + interval '1 month',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (id = auth.uid());

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Monthly reset function (call via Supabase cron or pg_cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_devis()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET devis_used = 0,
      devis_reset_at = date_trunc('month', now()) + interval '1 month'
  WHERE devis_reset_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
