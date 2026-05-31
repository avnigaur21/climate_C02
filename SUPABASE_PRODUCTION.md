# Supabase Production Setup

This project now expects a real Supabase project in production. Demo auth should only be enabled for local testing.

## 1. Environment Variables

Set these values locally in `.env` and in your deployment platform.

```bash
VITE_SUPABASE_PROJECT_ID=qwxiewlsnalickilzehd
VITE_SUPABASE_URL=https://qwxiewlsnalickilzehd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your anon publishable key>
VITE_ENABLE_DEMO_AUTH_FALLBACK=false
```

For GitHub Pages, add the same values under:

`GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret`

Required secret names:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 2. Auth URL Configuration

In Supabase Dashboard, open:

`Authentication -> URL Configuration`

Use:

```text
Site URL:
https://avnigaur21.github.io/climate_C02/

Redirect URLs:
https://avnigaur21.github.io/climate_C02/
https://avnigaur21.github.io/climate_C02/login
http://localhost:8080
http://localhost:8080/login
http://127.0.0.1:8080
http://127.0.0.1:8080/login
```

The app passes the current `/login` URL during sign-up, so the deployed GitHub Pages base path is preserved.

## 3. Database Migration

Install or authenticate the Supabase CLI, then run:

```bash
supabase link --project-ref qwxiewlsnalickilzehd
supabase db push
```

The migration creates:

- `profiles`
- `imports`
- `footprints`
- `regions`
- `risk_evaluations`

It also seeds the initial climate regions and adds RLS policies so authenticated users can only read and write rows where `user_id` or `id` matches `auth.uid()`. Region rows are public read-only reference data for the frontend map.

## 4. Verify

```bash
npm run typecheck
npm run build
```

Then sign up with a real email, confirm the account if email confirmations are enabled, import a CSV from `/import`, and check that `/dashboard`, `/regions`, and `/profile` show live Supabase data badges.
