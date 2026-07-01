-- ============================================
-- ATTEMPT TO RECOVER DELETED PREDICTIONS
-- ============================================

-- 1. Check if table has ANY predictions at all (not just June 30)
SELECT COUNT(*) as total_predictions FROM predictions;

-- 2. Check if there's a soft-delete column (deleted_at, is_deleted, etc.)
SELECT * FROM predictions WHERE deleted_at IS NULL LIMIT 5;

-- 3. Check Supabase realtime logs (if enabled)
-- This might show recent DELETE operations
SELECT * FROM realtime.messages
WHERE table = 'predictions'
ORDER BY inserted_at DESC
LIMIT 20;

-- 4. Check if there's an audit/history table
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%prediction%';

-- 5. Check PostgreSQL WAL (Write-Ahead Log) - requires superuser
-- This is a long shot but might show recent deletions
SELECT * FROM pg_stat_statements
WHERE query LIKE '%DELETE%predictions%'
ORDER BY calls DESC
LIMIT 10;
