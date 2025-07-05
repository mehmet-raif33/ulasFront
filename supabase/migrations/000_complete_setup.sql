-- Complete Supabase Setup Script
-- This file runs all migrations in the correct order

-- 1. Initial Schema
\i 'supabase/migrations/001_initial_schema.sql'

-- 2. Functions
\i 'supabase/functions/update_updated_at_column.sql'

-- 3. Triggers
\i 'supabase/triggers/updated_at_triggers.sql'

-- 4. RLS Policies
\i 'supabase/policies/rls_policies.sql'

-- 5. Auth Setup
\i 'supabase/auth/auth_triggers.sql'
\i 'supabase/auth/google_provider.sql'

-- 6. Sample Data
\i 'supabase/seed-data/sample_data.sql' 