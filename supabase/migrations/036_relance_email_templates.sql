-- 036: Custom relance email templates per user (Pro+ feature)
-- Stores JSON with subject + body for each of the 3 relance steps

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'relance_email_templates'
    ) THEN
      ALTER TABLE public.profiles
        ADD COLUMN relance_email_templates JSONB DEFAULT NULL;
      -- NULL = use system defaults, non-null = custom templates
      -- Expected shape: { "j2": { "subject": "...", "body": "..." }, "j5": {...}, "j7": {...} }
    END IF;
  END IF;
END $$;
