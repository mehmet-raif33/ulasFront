-- Test Setup Script
-- Bu dosya yeni organize edilmiş Supabase yapısını test eder

-- Test 1: Şema kontrolü
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'vehicles', 'personnel', 'transactions')
ORDER BY table_name, ordinal_position;

-- Test 2: Trigger kontrolü
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Test 3: RLS kontrolü
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'vehicles', 'personnel', 'transactions');

-- Test 4: Fonksiyon kontrolü
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Test 5: Örnek veri kontrolü
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'vehicles' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'personnel' as table_name, COUNT(*) as count FROM personnel
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as count FROM transactions; 