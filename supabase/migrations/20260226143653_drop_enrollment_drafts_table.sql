/*
  # Drop enrollment_drafts table and all related objects

  ## Why this migration exists
  - Enrollment form data is now held entirely in-memory via React state
  - Sensitive PII (credit card numbers, SSNs, routing/account numbers) must NOT be stored in the database
  - Step navigation works via client-side state only
  - The "resume after browser close" feature is intentionally removed as a security improvement

  ## Objects removed (in order)
  1. pg_cron scheduled job: `cleanup-expired-enrollment-drafts`
  2. Cleanup function: `cleanup_expired_enrollment_drafts()`
  3. Trigger function: `update_enrollment_draft_timestamp()` (CASCADE removes associated trigger)
  4. Table: `enrollment_drafts` (CASCADE removes all RLS policies, indexes, and remaining triggers)

  ## Security impact
  - Eliminates database storage of SSN, credit card, ACH routing/account numbers
  - All sensitive data now lives only in browser memory for the duration of the session
  - Data is cleared automatically on page unload
*/

-- 1. Unschedule pg_cron job (with safe error handling)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-expired-enrollment-drafts');
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_function THEN NULL;
  WHEN others THEN NULL;
END $$;

-- 2. Drop the cleanup function
DROP FUNCTION IF EXISTS cleanup_expired_enrollment_drafts();

-- 3. Drop the trigger function (CASCADE removes the trigger on enrollment_drafts)
DROP FUNCTION IF EXISTS update_enrollment_draft_timestamp() CASCADE;

-- 4. Drop the enrollment_drafts table (CASCADE removes RLS policies, indexes, triggers)
DROP TABLE IF EXISTS enrollment_drafts CASCADE;
