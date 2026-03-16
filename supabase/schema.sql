-- Mission Trip Fundraising Tracker — Database Schema
-- Run this in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  trip_name     TEXT NOT NULL DEFAULT 'Mission Trip 2026',
  goal_amount   NUMERIC(10,2) NOT NULL DEFAULT 3600.00,
  departure_date DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- ============================================================
-- DONORS
-- ============================================================
CREATE TABLE public.donors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own donors"
  ON public.donors FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_donors_user_id ON public.donors(user_id);

-- ============================================================
-- DONATIONS
-- ============================================================
CREATE TYPE public.donation_method AS ENUM (
  'cash', 'check', 'venmo', 'paypal', 'zelle', 'online', 'other'
);

CREATE TYPE public.donation_status AS ENUM (
  'pledged', 'received', 'processing', 'cancelled'
);

CREATE TABLE public.donations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donor_id        UUID REFERENCES public.donors(id) ON DELETE SET NULL,
  donor_name_override TEXT,
  amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  method          public.donation_method NOT NULL DEFAULT 'other',
  status          public.donation_status NOT NULL DEFAULT 'received',
  received_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  is_anonymous    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own donations"
  ON public.donations FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_donations_user_id    ON public.donations(user_id);
CREATE INDEX idx_donations_donor_id   ON public.donations(donor_id);
CREATE INDEX idx_donations_received_at ON public.donations(received_at DESC);

-- ============================================================
-- GIFT TIERS
-- ============================================================
CREATE TABLE public.gift_tiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  min_amount      NUMERIC(10,2) NOT NULL,
  max_amount      NUMERIC(10,2),
  description     TEXT,
  color           TEXT NOT NULL DEFAULT '#CD7F32',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gift_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gift tiers"
  ON public.gift_tiers FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- SUPPORTER GIFTS
-- ============================================================
CREATE TABLE public.supporter_gifts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donor_id        UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  gift_tier_id    UUID REFERENCES public.gift_tiers(id) ON DELETE SET NULL,
  custom_gift     TEXT,
  is_eligible     BOOLEAN NOT NULL DEFAULT TRUE,
  is_fulfilled    BOOLEAN NOT NULL DEFAULT FALSE,
  fulfilled_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.supporter_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own supporter gifts"
  ON public.supporter_gifts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_supporter_gifts_donor_id ON public.supporter_gifts(donor_id);

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TYPE public.milestone_type AS ENUM (
  'deadline', 'goal', 'event', 'reminder'
);

CREATE TABLE public.milestones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        DATE NOT NULL,
  type            public.milestone_type NOT NULL DEFAULT 'deadline',
  target_amount   NUMERIC(10,2),
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own milestones"
  ON public.milestones FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_milestones_user_id  ON public.milestones(user_id);
CREATE INDEX idx_milestones_due_date ON public.milestones(due_date ASC);

-- ============================================================
-- AI MESSAGES
-- ============================================================
CREATE TYPE public.ai_message_type AS ENUM (
  'solicitation', 'thank_you', 'newsletter', 'pace_report'
);

CREATE TABLE public.ai_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donor_id        UUID REFERENCES public.donors(id) ON DELETE SET NULL,
  type            public.ai_message_type NOT NULL,
  prompt_context  JSONB,
  generated_text  TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own AI messages"
  ON public.ai_messages FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- VIEWS
-- ============================================================
CREATE VIEW public.donor_totals AS
SELECT
  d.id              AS donor_id,
  d.user_id,
  d.full_name,
  d.email,
  d.phone,
  COALESCE(SUM(don.amount) FILTER (WHERE don.status = 'received'), 0) AS total_received,
  COALESCE(SUM(don.amount) FILTER (WHERE don.status = 'pledged'),  0) AS total_pledged,
  COUNT(don.id)     AS donation_count
FROM public.donors d
LEFT JOIN public.donations don ON don.donor_id = d.id AND don.user_id = d.user_id
GROUP BY d.id, d.user_id, d.full_name, d.email, d.phone;

CREATE VIEW public.fundraising_summary AS
SELECT
  user_id,
  COALESCE(SUM(amount) FILTER (WHERE status = 'received'),   0) AS total_received,
  COALESCE(SUM(amount) FILTER (WHERE status = 'pledged'),    0) AS total_pledged,
  COALESCE(SUM(amount) FILTER (WHERE status IN ('received','pledged')), 0) AS total_committed,
  COUNT(*)          AS donation_count,
  COUNT(DISTINCT donor_id) FILTER (WHERE donor_id IS NOT NULL) AS unique_donor_count,
  MAX(received_at)  AS last_donation_date,
  MIN(received_at)  AS first_donation_date
FROM public.donations
GROUP BY user_id;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_donors_updated_at BEFORE UPDATE ON public.donors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_supporter_gifts_updated_at BEFORE UPDATE ON public.supporter_gifts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
