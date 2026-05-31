# Carbon Risk Tracker

Carbon Risk Tracker is a full-stack climate intelligence app that connects personal carbon emissions to regional humanitarian risk. It combines a React analytics dashboard, an explainable scenario model, CSV import flows, interactive maps, and an Express/PostgreSQL backend.

The project is built as a resume-ready portfolio piece: it has product polish, strict TypeScript builds, backend tests, GitHub Actions CI, and a deployment workflow for GitHub Pages.

## Portfolio Highlights

- Built an explainable climate scenario engine that models emissions reduction, adaptation investment, regional vulnerability, exposure, and people-at-risk outcomes.
- Added an interactive Scenario Lab with mitigation sliders, horizon controls, risk projections, and methodology transparency.
- Hardened backend TypeScript, fixed a real emissions unit-conversion bug, and moved tests to a lightweight Node test runner.
- Improved production readiness with code-split Vite bundles, GitHub Actions build/test/deploy workflow, and environment variable hygiene.
- Preserved the original upstream repo as `upstream` so this copy can be published separately to your GitHub account as `origin`.

## Features

- Carbon footprint dashboard across transport, energy, food, shopping, and travel actions.
- Humanitarian risk cards for flooding, drought, heat, displacement, and food insecurity.
- Scenario Lab for mitigation and adaptation planning through 2030, 2040, and 2050.
- Interactive Leaflet map of vulnerable regions.
- CSV import UI and backend CSV parsing/calculation service.
- Supabase-powered frontend auth integration and Express/JWT backend auth implementation.
- Production Supabase schema for profiles, imports, footprints, regions, and user-scoped risk evaluations.
- Row Level Security policies that restrict private user data by `auth.uid()`.
- PostgreSQL schema, migrations, seed data, and demo backend server.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Leaflet
- Backend: Node.js, Express, TypeScript, PostgreSQL, JWT, Joi, Multer
- Tooling: GitHub Actions, Vercel config, GitHub Pages deployment, strict TypeScript builds

## Architecture

```text
src/
  components/ScenarioLab.tsx      Explainable scenario UI
  lib/climateScenario.ts          Scenario/risk model and regional data
  pages/                          Landing, demo, dashboard, regions, import
  integrations/supabase/          Supabase client and generated types

backend/
  src/services/                   Auth, emissions, footprint, risk services
  src/routes/                     Express API routes
  src/database/                   Schema, migration, and seed scripts
  src/test/                       Backend unit tests
```

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.

Create a local `.env` from `.env.example` if you want Supabase-backed auth:

```bash
cp .env.example .env
```

For production Supabase setup, database migrations, auth redirect URLs, and GitHub Pages secrets, follow [SUPABASE_PRODUCTION.md](SUPABASE_PRODUCTION.md).

## Backend

```bash
cd backend
npm install
npm run build
npm test
```

For full database mode, create a PostgreSQL database and copy `backend/env.example` to `backend/.env`.

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

For API demo mode without PostgreSQL:

```bash
npm run demo
```

## Verification

```bash
npm run typecheck
npm run build
cd backend
npm run build
npm test
```

## Publish To Your GitHub

This local checkout has the original project configured as `upstream`. Create an empty repository in your GitHub account, then run:

```bash
git remote add origin https://github.com/<your-username>/Climate.git
git push -u origin main
```

After that, GitHub Actions will build/test the frontend and backend, then deploy the frontend from `dist` on pushes to `main`.

## Resume Bullets

- Developed a full-stack climate risk intelligence platform with React, TypeScript, Express, PostgreSQL, Supabase, and Leaflet.
- Designed an explainable scenario engine translating emissions pathways and adaptation investment into regional humanitarian risk projections.
- Implemented CI/CD with GitHub Actions, strict TypeScript verification, backend unit tests, and production bundle optimization.
- Fixed emissions calculation accuracy by correcting unit normalization for kilometers, meters, kilograms, grams, and currency inputs.

## Disclaimer

This project uses simplified scenario estimates for education and portfolio demonstration. It should not be used for operational humanitarian, financial, or policy decisions without validated climate datasets and expert review.
