-- ============================================
-- ADD SOFT DELETE TO PREDICTIONS TABLE
-- ============================================
-- This prevents accidental permanent deletion

-- 1. Add deleted_at column
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_predictions_deleted_at
ON predictions(deleted_at)
WHERE deleted_at IS NULL;

-- 3. Create a safe delete function (use this instead of DELETE)
CREATE OR REPLACE FUNCTION soft_delete_prediction(prediction_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE predictions
  SET deleted_at = NOW()
  WHERE id = prediction_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a restore function (in case of mistakes)
CREATE OR REPLACE FUNCTION restore_prediction(prediction_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE predictions
  SET deleted_at = NULL
  WHERE id = prediction_id;
END;
$$ LANGUAGE plpgsql;

-- USAGE EXAMPLES:

-- To "delete" a prediction (soft delete):
-- SELECT soft_delete_prediction('prediction-id-here');

-- To restore a deleted prediction:
-- SELECT restore_prediction('prediction-id-here');

-- To see only active (not deleted) predictions:
-- SELECT * FROM predictions WHERE deleted_at IS NULL;

-- To see deleted predictions:
-- SELECT * FROM predictions WHERE deleted_at IS NOT NULL;

-- To permanently delete old soft-deleted records (run monthly):
-- DELETE FROM predictions
-- WHERE deleted_at IS NOT NULL
--   AND deleted_at < NOW() - INTERVAL '90 days';
