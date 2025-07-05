-- Completely disable RLS for all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE personnel DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "Allow read for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON users;

DROP POLICY IF EXISTS "Allow read for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow all operations" ON vehicles;
DROP POLICY IF EXISTS "Allow all operations on vehicles" ON vehicles;

DROP POLICY IF EXISTS "Allow read for authenticated users" ON personnel;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON personnel;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON personnel;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON personnel;

DROP POLICY IF EXISTS "Allow read for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON transactions; 