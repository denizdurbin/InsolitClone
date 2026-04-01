-- Core schema for moving static app data into Supabase.

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
END
$$;

CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL UNIQUE CHECK (sort_order > 0),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category public.offer_category NOT NULL,
  category_label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  gradient TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
  distance TEXT NOT NULL DEFAULT '—',
  badge TEXT,
  price TEXT,
  address TEXT,
  details TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  location TEXT NOT NULL DEFAULT 'Paris, Ile-de-France',
  savings_cents INTEGER NOT NULL DEFAULT 0 CHECK (savings_cents >= 0),
  offers_used INTEGER NOT NULL DEFAULT 0 CHECK (offers_used >= 0),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE IF NOT EXISTS public.user_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP TRIGGER IF EXISTS on_profile_deleted ON public.users;
DROP FUNCTION IF EXISTS public.delete_auth_user_on_profile_delete();

CREATE INDEX IF NOT EXISTS offers_category_idx ON public.offers (category);
CREATE INDEX IF NOT EXISTS offers_sort_order_idx ON public.offers (sort_order);
CREATE INDEX IF NOT EXISTS features_sort_order_idx ON public.features (sort_order);
CREATE INDEX IF NOT EXISTS steps_sort_order_idx ON public.steps (sort_order);
CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON public.testimonials (sort_order);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions (user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON public.user_sessions (expires_at);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read offers" ON public.offers;
CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read features" ON public.features;
CREATE POLICY "Public read features" ON public.features FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read steps" ON public.steps;
CREATE POLICY "Public read steps" ON public.steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users read own profile" ON public.users;
DROP POLICY IF EXISTS "Users insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Users delete own profile" ON public.users;
DROP POLICY IF EXISTS "Users read own profile" ON public.user_sessions;
DROP POLICY IF EXISTS "Users insert own profile" ON public.user_sessions;
DROP POLICY IF EXISTS "Users update own profile" ON public.user_sessions;
DROP POLICY IF EXISTS "Users delete own profile" ON public.user_sessions;

GRANT SELECT ON public.offers TO anon, authenticated;
GRANT SELECT ON public.features TO anon, authenticated;
GRANT SELECT ON public.steps TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;
REVOKE ALL ON public.users FROM anon, authenticated;
REVOKE ALL ON public.user_sessions FROM anon, authenticated;
