-- Force disable RLS completely
-- First, drop all policies from all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Allow read for authenticated users" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Allow insert for authenticated users" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Allow update for authenticated users" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Allow delete for authenticated users" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on vehicles" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can read all data" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can read all vehicles" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can read all personnel" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can read all transactions" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can insert users" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can update users" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can delete users" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can insert vehicles" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can update vehicles" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can delete vehicles" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can insert personnel" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can update personnel" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can delete personnel" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can insert transactions" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can update transactions" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Only admins can delete transactions" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Now disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE personnel DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'vehicles', 'personnel', 'transactions'); 