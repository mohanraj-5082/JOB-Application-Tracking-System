-- Job ownership migration, phase 1.
-- Back up the database before running this script.
-- This phase is intentionally nullable so existing jobs remain readable while
-- an operator chooses the correct owner for legacy data.

ALTER TABLE jobs
    ADD COLUMN user_id BIGINT NULL;

ALTER TABLE jobs
    ADD INDEX idx_jobs_user_id (user_id);

ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_owner
        FOREIGN KEY (user_id) REFERENCES app_users (id);

SELECT COUNT(*) AS legacy_jobs_needing_owner
FROM jobs
WHERE user_id IS NULL;
