-- Create a function to bypass RLS for testing
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION test_vehicle_insert(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT) TO authenticated;

-- Test the function
SELECT test_vehicle_insert('FUNCTEST123', 'Function Test', 'Function Model', 2023, 'dizel', 'active'); 