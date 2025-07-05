-- Row Level Security (RLS) policies - More permissive for development
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read all data
CREATE POLICY "Allow read for authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for authenticated users" ON vehicles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for authenticated users" ON personnel FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for authenticated users" ON transactions FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert/update/delete (for development)
CREATE POLICY "Allow insert for authenticated users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authenticated users" ON users FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authenticated users" ON users FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON vehicles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authenticated users" ON vehicles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authenticated users" ON vehicles FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON personnel FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authenticated users" ON personnel FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authenticated users" ON personnel FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authenticated users" ON transactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authenticated users" ON transactions FOR DELETE USING (auth.role() = 'authenticated'); 