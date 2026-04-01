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
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL DEFAULT 'Argenteuil, Ile-de-France',
  savings_cents INTEGER NOT NULL DEFAULT 0 CHECK (savings_cents >= 0),
  offers_used INTEGER NOT NULL DEFAULT 0 CHECK (offers_used >= 0),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, prenom, nom, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'prenom', ''), 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    prenom = COALESCE(NULLIF(public.users.prenom, ''), EXCLUDED.prenom),
    nom = COALESCE(NULLIF(public.users.nom, ''), EXCLUDED.nom);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.users (id, prenom, nom, email)
SELECT
  au.id,
  COALESCE(NULLIF(au.raw_user_meta_data ->> 'prenom', ''), 'Utilisateur'),
  COALESCE(au.raw_user_meta_data ->> 'nom', ''),
  COALESCE(au.email, '')
FROM auth.users AS au
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  prenom = COALESCE(NULLIF(public.users.prenom, ''), EXCLUDED.prenom),
  nom = COALESCE(NULLIF(public.users.nom, ''), EXCLUDED.nom);

CREATE INDEX IF NOT EXISTS offers_category_idx ON public.offers (category);
CREATE INDEX IF NOT EXISTS offers_sort_order_idx ON public.offers (sort_order);
CREATE INDEX IF NOT EXISTS features_sort_order_idx ON public.features (sort_order);
CREATE INDEX IF NOT EXISTS steps_sort_order_idx ON public.steps (sort_order);
CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON public.testimonials (sort_order);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read offers" ON public.offers;
CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read features" ON public.features;
CREATE POLICY "Public read features" ON public.features FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read steps" ON public.steps;
CREATE POLICY "Public read steps" ON public.steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users read own profile" ON public.users;
CREATE POLICY "Users read own profile" ON public.users
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.users;
CREATE POLICY "Users insert own profile" ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.users;
CREATE POLICY "Users update own profile" ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

GRANT SELECT ON public.offers TO anon, authenticated;
GRANT SELECT ON public.features TO anon, authenticated;
GRANT SELECT ON public.steps TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
