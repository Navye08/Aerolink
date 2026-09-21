-- ==============================================================================
-- AeroLink Seed Data for Demo & Local Testing
-- Optional: Run in SQL editor if you want pre-populated links and click statistics
-- ==============================================================================

-- Insert demo URLs for the first registered user
DO $$
DECLARE
  v_user_id UUID;
  v_url1_id BIGINT;
  v_url2_id BIGINT;
BEGIN
  -- Get first user from auth.users or exit if none
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Link 1: Active production link
    INSERT INTO public.urls (title, original_url, short_url, custom_url, user_id, is_active, tags, notes)
    VALUES (
      'GitHub Repository',
      'https://github.com',
      'git-hub',
      'repo',
      v_user_id,
      true,
      ARRAY['code', 'open-source'],
      'Primary code repository link for developers.'
    )
    ON CONFLICT (short_url) DO NOTHING
    RETURNING id INTO v_url1_id;

    -- Link 2: Portfolio showcase link
    INSERT INTO public.urls (title, original_url, short_url, custom_url, user_id, is_active, tags, notes)
    VALUES (
      'Developer Portfolio',
      'https://portfolio.dev',
      'my-portfolio',
      'work',
      v_user_id,
      true,
      ARRAY['portfolio', 'career'],
      'Interactive showcase portfolio.'
    )
    ON CONFLICT (short_url) DO NOTHING
    RETURNING id INTO v_url2_id;

    -- Add demo clicks for Link 1 if inserted
    IF v_url1_id IS NOT NULL THEN
      INSERT INTO public.clicks (url_id, city, country, device, browser, os, referrer, created_at)
      VALUES
        (v_url1_id, 'San Francisco', 'United States', 'desktop', 'Chrome', 'macOS', 'https://twitter.com', NOW() - INTERVAL '1 day'),
        (v_url1_id, 'London', 'United Kingdom', 'mobile', 'Safari', 'iOS', 'https://linkedin.com', NOW() - INTERVAL '2 days'),
        (v_url1_id, 'Bengaluru', 'India', 'desktop', 'Firefox', 'Linux', 'Direct', NOW() - INTERVAL '3 days'),
        (v_url1_id, 'Toronto', 'Canada', 'tablet', 'Chrome', 'Android', 'https://reddit.com', NOW() - INTERVAL '4 days'),
        (v_url1_id, 'Berlin', 'Germany', 'desktop', 'Edge', 'Windows', 'https://github.com', NOW() - INTERVAL '5 days');
    END IF;
  END IF;
END $$;
