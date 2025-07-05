-- Fix RLS policies for vehicles table
-- First, disable RLS temporarily
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow read for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow all operations" ON vehicles;

-- Re-enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create very permissive policies for development
CREATE POLICY "Allow all operations on vehicles" ON vehicles 
FOR ALL USING (true) WITH CHECK (true);

-- Alternative: Create specific policies
-- CREATE POLICY "Allow read vehicles" ON vehicles FOR SELECT USING (true);
-- CREATE POLICY "Allow insert vehicles" ON vehicles FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow update vehicles" ON vehicles FOR UPDATE USING (true);
-- CREATE POLICY "Allow delete vehicles" ON vehicles FOR DELETE USING (true); 