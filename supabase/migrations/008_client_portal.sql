-- Client portal: each client gets a unique portal token for self-serve access
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_token uuid DEFAULT uuid_generate_v4();
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_portal_token ON clients(portal_token);
