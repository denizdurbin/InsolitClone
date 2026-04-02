-- Core schema for InsolitClone
-- Compatibility-oriented version:
-- normalized structure (partners + offers)
-- while preserving legacy display/location fields on offers
-- to avoid breaking the current frontend.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_category') THEN
    CREATE TYPE public.offer_category AS ENUM (
      'restaurant',
      'activite',
      'cadeau',
      'sport',
      'cinema'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
    CREATE TYPE public.offer_status AS ENUM (
      'activated',
      'redeemed',
      'expired',
      'cancelled'
    );
  END IF;
END
$$;

-- =========================================================
-- Generic updated_at trigger
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =========================================================
-- Users
-- =========================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT UNIQUE,
  password_hash TEXT,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  location TEXT NOT NULL DEFAULT 'Paris, Ile-de-France',
  city TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  savings_cents INTEGER NOT NULL DEFAULT 0 CHECK (savings_cents >= 0),
  offers_used INTEGER NOT NULL DEFAULT 0 CHECK (offers_used >= 0),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_phone_number_key'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);
  END IF;
END
$$;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- Partners
-- =========================================================

CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  website_url TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance TEXT NOT NULL DEFAULT '—',
  google_maps_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  why_subscribe_text TEXT,
  how_to_use_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_partners_updated_at ON public.partners;
CREATE TRIGGER set_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- Offers
-- Compatibility note:
-- keep legacy fields used by current frontend:
-- distance, address, latitude, longitude
-- =========================================================

CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  partner_id TEXT,
  sort_order INTEGER UNIQUE CHECK (sort_order > 0),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'promotion',
  category public.offer_category NOT NULL,
  category_label TEXT,
  emoji TEXT,
  gradient TEXT,
  rating INTEGER CHECK (rating BETWEEN 0 AND 5),
  distance TEXT NOT NULL DEFAULT '—',
  badge TEXT,
  price TEXT,
  address TEXT,
  details TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  terms_and_conditions TEXT,
  is_limited BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_subscription_required BOOLEAN NOT NULL DEFAULT FALSE,
  usage_limit_per_user INTEGER CHECK (usage_limit_per_user IS NULL OR usage_limit_per_user > 0),
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  popularity_score INTEGER NOT NULL DEFAULT 0 CHECK (popularity_score >= 0),
  cta_text TEXT,
  created_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS partner_id TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS offer_type TEXT NOT NULL DEFAULT 'promotion';
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS distance TEXT NOT NULL DEFAULT '—';
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_limited BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_subscription_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS stock INTEGER;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS popularity_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS cta_text TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP TRIGGER IF EXISTS set_offers_updated_at ON public.offers;
CREATE TRIGGER set_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'offers_partner_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'offers'
  ) THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_partner_id_fkey
      FOREIGN KEY (partner_id) REFERENCES public.partners (id) ON DELETE CASCADE;
  END IF;
END
$$;

-- =========================================================
-- Favorites
-- =========================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  partner_id TEXT NOT NULL REFERENCES public.partners (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, partner_id)
);

-- =========================================================
-- Offer redemptions
-- =========================================================

CREATE TABLE IF NOT EXISTS public.offer_redemptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL REFERENCES public.offers (id) ON DELETE CASCADE,
  qr_code_value TEXT,
  status public.offer_status NOT NULL DEFAULT 'activated',
  activated_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Partner reviews
-- =========================================================

CREATE TABLE IF NOT EXISTS public.partner_reviews (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  partner_id TEXT NOT NULL REFERENCES public.partners (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_partner_reviews_updated_at ON public.partner_reviews;
CREATE TRIGGER set_partner_reviews_updated_at
BEFORE UPDATE ON public.partner_reviews
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS partner_reviews_user_partner_unique
  ON public.partner_reviews (user_id, partner_id);

-- =========================================================
-- User sessions
-- =========================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Password reset tokens
-- =========================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Static content tables
-- =========================================================

CREATE TABLE IF NOT EXISTS public.features (
  id BIGSERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL UNIQUE CHECK (sort_order > 0),
  icon TEXT NOT NULL,
  gradient TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.steps (
  id INTEGER PRIMARY KEY,
  sort_order INTEGER NOT NULL UNIQUE CHECK (sort_order > 0),
  emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id INTEGER PRIMARY KEY,
  sort_order INTEGER NOT NULL UNIQUE CHECK (sort_order > 0),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL,
  gradient TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS partners_category_idx ON public.partners (category);
CREATE INDEX IF NOT EXISTS partners_city_idx ON public.partners (city);

CREATE INDEX IF NOT EXISTS offers_partner_id_idx ON public.offers (partner_id);
CREATE INDEX IF NOT EXISTS offers_category_idx ON public.offers (category);
CREATE INDEX IF NOT EXISTS offers_sort_order_idx ON public.offers (sort_order);
CREATE INDEX IF NOT EXISTS offers_is_active_idx ON public.offers (is_active);
CREATE INDEX IF NOT EXISTS offers_is_limited_idx ON public.offers (is_limited);

CREATE INDEX IF NOT EXISTS favorites_partner_id_idx ON public.favorites (partner_id);

CREATE INDEX IF NOT EXISTS offer_redemptions_user_id_idx ON public.offer_redemptions (user_id);
CREATE INDEX IF NOT EXISTS offer_redemptions_offer_id_idx ON public.offer_redemptions (offer_id);
CREATE INDEX IF NOT EXISTS offer_redemptions_status_idx ON public.offer_redemptions (status);

CREATE INDEX IF NOT EXISTS partner_reviews_partner_id_idx ON public.partner_reviews (partner_id);
CREATE INDEX IF NOT EXISTS partner_reviews_user_id_idx ON public.partner_reviews (user_id);

CREATE INDEX IF NOT EXISTS features_sort_order_idx ON public.features (sort_order);
CREATE INDEX IF NOT EXISTS steps_sort_order_idx ON public.steps (sort_order);
CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON public.testimonials (sort_order);

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions (user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON public.user_sessions (expires_at);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON public.password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON public.password_reset_tokens (expires_at);

-- =========================================================
-- Row Level Security
-- =========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read partners" ON public.partners;
CREATE POLICY "Public read partners" ON public.partners
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read offers" ON public.offers;
CREATE POLICY "Public read offers" ON public.offers
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read features" ON public.features;
CREATE POLICY "Public read features" ON public.features
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read steps" ON public.steps;
CREATE POLICY "Public read steps" ON public.steps
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials
FOR SELECT USING (true);

DROP POLICY IF EXISTS "No direct access users" ON public.users;
CREATE POLICY "No direct access users" ON public.users
FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct access favorites" ON public.favorites;
CREATE POLICY "No direct access favorites" ON public.favorites
FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct access offer_redemptions" ON public.offer_redemptions;
CREATE POLICY "No direct access offer_redemptions" ON public.offer_redemptions
FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct access partner_reviews" ON public.partner_reviews;
CREATE POLICY "No direct access partner_reviews" ON public.partner_reviews
FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct access user_sessions" ON public.user_sessions;
CREATE POLICY "No direct access user_sessions" ON public.user_sessions
FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct access password_reset_tokens" ON public.password_reset_tokens;
CREATE POLICY "No direct access password_reset_tokens" ON public.password_reset_tokens
FOR ALL USING (false) WITH CHECK (false);

-- =========================================================
-- Grants
-- =========================================================

GRANT SELECT ON public.partners TO anon, authenticated;
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT SELECT ON public.features TO anon, authenticated;
GRANT SELECT ON public.steps TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;

REVOKE ALL ON public.users FROM anon, authenticated;
REVOKE ALL ON public.favorites FROM anon, authenticated;
REVOKE ALL ON public.offer_redemptions FROM anon, authenticated;
REVOKE ALL ON public.partner_reviews FROM anon, authenticated;
REVOKE ALL ON public.user_sessions FROM anon, authenticated;
REVOKE ALL ON public.password_reset_tokens FROM anon, authenticated;