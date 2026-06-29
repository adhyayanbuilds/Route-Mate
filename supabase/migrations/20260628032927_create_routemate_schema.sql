/*
# RouteMate — Core Schema

## Overview
Creates the foundational tables for RouteMate, a companion app for delivery professionals.
The app has a sign-in screen, so all tables are owner-scoped to the authenticated user.

## New Tables
1. `profiles` — extends auth.users with delivery-specific metadata (name, vehicle, city, avatar url).
2. `delivery_logs` — daily delivery entries: deliveries count, earnings, distance, hours, date.
3. `favorites` — saved places (washrooms, meals, etc.) the rider wants quick access to.

## Security
- RLS enabled on every table.
- Owner-scoped CRUD policies using `auth.uid() = user_id`.
- `user_id` columns default to `auth.uid()` so inserts that omit the owner still satisfy WITH CHECK.
*/

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  vehicle_type text DEFAULT 'bike',
  city text DEFAULT '',
  avatar_url text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. DELIVERY LOGS
CREATE TABLE IF NOT EXISTS delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  deliveries int NOT NULL DEFAULT 0,
  earnings numeric(10,2) NOT NULL DEFAULT 0,
  distance_km numeric(8,2) NOT NULL DEFAULT 0,
  hours_worked numeric(5,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_logs" ON delivery_logs;
CREATE POLICY "select_own_logs" ON delivery_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_logs" ON delivery_logs;
CREATE POLICY "insert_own_logs" ON delivery_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_logs" ON delivery_logs;
CREATE POLICY "update_own_logs" ON delivery_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_logs" ON delivery_logs;
CREATE POLICY "delete_own_logs" ON delivery_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 3. FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  lat numeric(10,7) NOT NULL,
  lng numeric(10,7) NOT NULL,
  address text DEFAULT '',
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_delivery_logs_user_date ON delivery_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_cat ON favorites(user_id, category);
