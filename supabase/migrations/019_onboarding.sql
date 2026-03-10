-- Migration 019: Onboarding wizard tracking
-- Adds onboarding_completed flag to profiles
-- Adds calendly_url if not already present

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendly_url TEXT;

-- Mark ALL existing users as onboarded so they skip the wizard
UPDATE profiles SET onboarding_completed = true;
