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

## Certificate verification

The verification page queries Firestore directly from the browser. In Firebase Console, add this match to the existing Firestore rules:

```text
match /Volunteer_Data/{document} {
  allow read: if true;
}
```

This makes every field in every `Volunteer_Data` document publicly readable, not just the ID being checked. Use it only if all data in that collection is safe to expose. Merge the match into the existing rules rather than replacing rules for the rest of the project.

## Build

```bash
pnpm build
```

The production build is written to `artifacts/learning-club/dist/public`.

## Contact form

The contact form sends messages using EmailJS. Copy `artifacts/learning-club/.env.example` to `artifacts/learning-club/.env` and fill in the Service ID, Template ID, and Public Key from your EmailJS account. Configure the EmailJS template to use the form fields `{{name}}`, `{{email}}`, and `{{message}}`. The `.env` file is ignored by Git; never commit credentials.

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
