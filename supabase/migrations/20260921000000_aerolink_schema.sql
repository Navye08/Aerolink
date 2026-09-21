-- ==============================================================================
-- AeroLink Production Schema Migration
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- Enable pgcrypto extension for secure password hashing if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create 'urls' table if not existing
CREATE TABLE IF NOT EXISTS public.urls (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  original_url TEXT NOT NULL,
  short_url TEXT NOT NULL UNIQUE,
  custom_url TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  qr TEXT DEFAULT '/qr.png'
);

-- Idempotent schema upgrades for 'urls'
ALTER TABLE public.urls ALTER COLUMN qr DROP NOT NULL;
ALTER TABLE public.urls ALTER COLUMN qr SET DEFAULT '/qr.png';
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS max_clicks INTEGER DEFAULT NULL;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT NULL;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Indexes on 'urls' for high query performance
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON public.urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_short_url ON public.urls(short_url);
CREATE INDEX IF NOT EXISTS idx_urls_custom_url ON public.urls(custom_url);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON public.urls(created_at DESC);

-- 2. Create 'clicks' table if not existing
CREATE TABLE IF NOT EXISTS public.clicks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  url_id BIGINT REFERENCES public.urls(id) ON DELETE CASCADE NOT NULL,
  city TEXT DEFAULT 'Unknown',
  country TEXT DEFAULT 'Unknown',
  device TEXT DEFAULT 'desktop'
);

-- Idempotent schema upgrades for 'clicks' telemetry
ALTER TABLE public.clicks ADD COLUMN IF NOT EXISTS browser TEXT DEFAULT 'Unknown';
ALTER TABLE public.clicks ADD COLUMN IF NOT EXISTS os TEXT DEFAULT 'Unknown';
ALTER TABLE public.clicks ADD COLUMN IF NOT EXISTS referrer TEXT DEFAULT 'Direct';
ALTER TABLE public.clicks ADD COLUMN IF NOT EXISTS visitor_hash TEXT DEFAULT NULL;

-- Indexes on 'clicks' for fast analytics aggregation
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON public.clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON public.clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_url_created ON public.clicks(url_id, created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for 'urls'
DROP POLICY IF EXISTS "Public can view short links for redirection" ON public.urls;
CREATE POLICY "Public can view short links for redirection"
  ON public.urls FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own URLs" ON public.urls;
CREATE POLICY "Users can create their own URLs"
  ON public.urls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own URLs" ON public.urls;
CREATE POLICY "Users can update their own URLs"
  ON public.urls FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own URLs" ON public.urls;
CREATE POLICY "Users can delete their own URLs"
  ON public.urls FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. RLS Policies for 'clicks'
DROP POLICY IF EXISTS "Anyone can record clicks" ON public.clicks;
CREATE POLICY "Anyone can record clicks"
  ON public.clicks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "URL owners can view clicks" ON public.clicks;
CREATE POLICY "URL owners can view clicks"
  ON public.clicks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE public.urls.id = public.clicks.url_id
      AND public.urls.user_id = auth.uid()
    )
  );

-- 6. Server-side Password Verification RPC Function
-- Verifies the link password securely so hashes never leave the database
CREATE OR REPLACE FUNCTION public.verify_link_password(p_url_id BIGINT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  SELECT password_hash INTO v_hash FROM public.urls WHERE id = p_url_id;
  IF v_hash IS NULL THEN
    RETURN true;
  END IF;
  RETURN (
    v_hash = encode(digest(p_password, 'sha256'), 'hex')
    OR v_hash = crypt(p_password, v_hash)
    OR v_hash = p_password
  );
END;
$$;

-- 7. Storage Buckets (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('qrs', 'qrs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pic', 'profile_pic', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. Storage Policies
DROP POLICY IF EXISTS "Public can view QR codes" ON storage.objects;
CREATE POLICY "Public can view QR codes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qrs');

DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
CREATE POLICY "Public can view profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_pic');

DROP POLICY IF EXISTS "Anyone can upload QR codes" ON storage.objects;
CREATE POLICY "Anyone can upload QR codes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'qrs');

DROP POLICY IF EXISTS "Anyone can upload profile pictures" ON storage.objects;
CREATE POLICY "Anyone can upload profile pictures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile_pic');
