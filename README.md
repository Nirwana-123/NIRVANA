# Learning Club Website

Website workspace for the Learning Club. The main React/Vite application lives in `artifacts/learning-club`.

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer

## Setup

```bash
pnpm install
pnpm dev
```

The development server runs on port `5173` by default. To use a different port, set `PORT`; to serve the app from a subpath, set `BASE_PATH` (default `/`).

## Build

```bash
pnpm build
```

The production build is written to `artifacts/learning-club/dist/public`.

## Project layout

- `artifacts/learning-club/` — website UI and Vite configuration
- `artifacts/api-server/` — API server workspace
- `lib/` — shared API, validation, and database packages
- `scripts/` — workspace utilities

## Before deployment

- Verify club contact details, schedules, age groups, and any impact statistics before publishing.
- Configure any required database environment variables for API features.
- Never commit `.env` files, API keys, passwords, or other secrets.
- Run `pnpm build` and manually test navigation, forms, and responsive layouts before deployment.
