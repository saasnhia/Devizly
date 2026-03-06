-- Add share token and viewed_at to quotes
ALTER TABLE quotes ADD COLUMN share_token uuid UNIQUE DEFAULT uuid_generate_v4();
ALTER TABLE quotes ADD COLUMN viewed_at timestamptz;

-- Allow public read access by share_token (no auth required)
CREATE POLICY "public_view_by_token" ON quotes
  FOR SELECT
  USING (share_token IS NOT NULL);

-- Allow public read on quote_items for shared quotes
CREATE POLICY "public_view_items_by_token" ON quote_items
  FOR SELECT
  USING (quote_id IN (SELECT id FROM quotes WHERE share_token IS NOT NULL));

-- Allow public read on clients for shared quotes
CREATE POLICY "public_view_client_by_token" ON clients
  FOR SELECT
  USING (id IN (SELECT client_id FROM quotes WHERE share_token IS NOT NULL));
