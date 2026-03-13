DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'quotes'
  ) THEN

    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'quotes' AND column_name = 'pipeline_status'
    ) THEN
      ALTER TABLE quotes ADD COLUMN pipeline_status TEXT DEFAULT 'prospect';
    END IF;

    ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
    ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_pipeline_status_check;

    ALTER TABLE quotes ADD CONSTRAINT quotes_pipeline_status_check
      CHECK (pipeline_status IN (
        'prospect', 'envoye', 'negociation', 'signe', 'paye', 'perdu'
      ));

  END IF;
END $$;
