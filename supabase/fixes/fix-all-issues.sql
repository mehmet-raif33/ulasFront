-- 1. Önce tüm RLS politikalarını silelim
DROP POLICY IF EXISTS "Allow read for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow all operations" ON vehicles;
DROP POLICY IF EXISTS "Allow all operations on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can read all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Only admins can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Only admins can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Only admins can delete vehicles" ON vehicles;

-- 2. RLS'yi tamamen devre dışı bırakalım
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- 3. Test function'ını oluşturalım
CREATE OR REPLACE FUNCTION test_vehicle_insert(
  test_plate TEXT,
  test_brand TEXT,
  test_model TEXT,
  test_year INTEGER,
  test_fuel TEXT,
  test_status TEXT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert vehicle directly without RLS
  INSERT INTO vehicles (plate, brand, model, year, fuel_type, status)
  VALUES (test_plate, test_brand, test_model, test_year, test_fuel, test_status::vehicles_status_enum)
  RETURNING to_json(vehicles.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function'a execute permission verelim
GRANT EXECUTE ON FUNCTION test_vehicle_insert(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION test_vehicle_insert(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT) TO anon;

-- 5. RLS durumunu kontrol edelim
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS AKTİF' 
    ELSE 'RLS DEVRE DIŞI' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'vehicles';

-- 6. Function'ın oluşturulduğunu kontrol edelim
SELECT 
  proname as function_name,
  proargtypes::regtype[] as argument_types
FROM pg_proc 
WHERE proname = 'test_vehicle_insert';

-- 7. Test insert yapalım
INSERT INTO vehicles (plate, brand, model, year, fuel_type, status)
VALUES ('TEST123', 'Test Brand', 'Test Model', 2023, 'dizel', 'active')
ON CONFLICT (plate) DO NOTHING;

-- 8. Test function'ını çağıralım
SELECT test_vehicle_insert('FUNCTEST123', 'Function Test', 'Function Model', 2023, 'dizel', 'active'); 