-- Job ownership migration, phase 3.
-- Run only after 002 reports remaining_jobs_without_owner = 0.
-- This statement fails safely if any orphan jobs remain.

SELECT COUNT(*) AS remaining_jobs_without_owner
FROM jobs
WHERE user_id IS NULL;

ALTER TABLE jobs
    MODIFY COLUMN user_id BIGINT NOT NULL;
