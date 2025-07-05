-- Add missing columns to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS capacity VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_maintenance DATE; 