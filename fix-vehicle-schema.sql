-- Fix vehicles table schema
-- Add missing columns to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS capacity VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_maintenance DATE;

-- Refresh schema cache
SELECT pg_notify('schema_refresh', 'vehicles');

-- Verify the columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position; 