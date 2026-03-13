-- Migration 032: SMS reminder tracking
-- Enables Twilio SMS relances with plan-based gating

DO $$ BEGIN
  -- SMS reminders toggle (opt-in)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sms_reminders_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sms_reminders_enabled boolean DEFAULT false;
  END IF;

  -- SMS usage counter (reset monthly)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sms_used'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sms_used integer DEFAULT 0;
  END IF;

  -- SMS reset date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sms_reset_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sms_reset_at timestamptz;
  END IF;

  -- Add SMS type to quote_reminders if type column exists
  -- (No constraint change needed — type is already a text field)
END $$;
