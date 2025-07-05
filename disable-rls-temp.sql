-- Temporarily disable RLS for testing
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE personnel DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Or create very permissive policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON vehicles;

CREATE POLICY "Allow all operations" ON vehicles FOR ALL USING (true) WITH CHECK (true); 