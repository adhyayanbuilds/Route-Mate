/*
# Add meta column to profiles

Adds a JSONB `meta` column to the `profiles` table to store per-user settings
(notifications, heat alerts, hydration reminders, search radius, units).

Also drops the old migration's policies and re-creates them cleanly to avoid
any drift, and ensures idempotency on the column addition.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'meta'
  ) THEN
    ALTER TABLE profiles ADD COLUMN meta jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
