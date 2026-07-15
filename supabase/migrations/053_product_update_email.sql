-- Migration 053: product update email tracking
-- Tracks the last time a one-shot "product update" marketing email
-- (src/app/api/emails/product-update/route.ts) was sent to a user, so a
-- second manual run of the endpoint doesn't double-send.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_product_update_at'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN last_product_update_at timestamptz;
    END IF;

  END IF;
END $$;
