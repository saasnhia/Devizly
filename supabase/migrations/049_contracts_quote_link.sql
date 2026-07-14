-- Migration 049: Lien devis -> contrat (contracts.quote_id)
-- Permet de savoir si un devis a deja un contrat lie, de naviguer dans les
-- deux sens, et d'empecher la creation de plusieurs contrats pour un meme
-- devis (index unique partiel, les contrats "from scratch" avec
-- quote_id = NULL restent illimites).

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contracts')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contracts' AND column_name = 'quote_id'
    ) THEN
      ALTER TABLE public.contracts
        ADD COLUMN quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL;
    END IF;

    CREATE INDEX IF NOT EXISTS idx_contracts_quote_id
      ON public.contracts(quote_id);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_quote_id_unique
      ON public.contracts(quote_id) WHERE quote_id IS NOT NULL;

  END IF;
END $$;
