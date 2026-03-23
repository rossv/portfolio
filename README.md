# Ross Volkwein Portfolio

Personal engineering and geospatial portfolio built with Astro, React, and Tailwind CSS.

## Stack

- Astro 4
- React 18
- Tailwind CSS 3
- Mapbox GL / react-map-gl

## Prerequisites

- Node.js 20+
- npm 10+

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env
```

3. Start the dev server:

```bash
npm run dev
```

Alternative start command:

```bash
npm run start
```

Default local URL: `http://localhost:4321`

## Environment Variables

The app uses the following variables:

- `PUBLIC_MAPBOX_ACCESS_TOKEN`: enables interactive map components.
- `PUBLIC_GOOGLE_ANALYTICS_ID`: enables Google Analytics in production builds.
- `SITE_URL`: canonical site URL used by Astro metadata/sitemap.
- `BASE_PATH`: base path for deployment (defaults to `/`).
- `GITHUB_REPOSITORY`: optional fallback used to infer `site` and `base` in CI contexts.

See [`/.env.example`](/.env.example) for local development values.

## Scripts

- `npm run dev`: run local dev server.
- `npm run start`: alias for local dev server.
- `npm run build`: production build.
- `npm run preview`: preview the production build locally.
- `npm run astro -- <args>`: run Astro CLI commands directly.

## Routes

- `/`: main portfolio page.
- `/portfolio`: redirect to `/#projects` (`noindex`).
- `/CV`: redirect to `/#timeline` (`noindex`).

## Deployment

Deploys via GitHub Actions workflow:

- Workflow file: [`/.github/workflows/deploy.yaml`](/.github/workflows/deploy.yaml)
- Trigger: push to `main`
- Build action: `withastro/action@v2`
- Publish action: `actions/deploy-pages@v4`

The workflow sets `SITE_URL` and `BASE_PATH=/` and expects `PUBLIC_MAPBOX_ACCESS_TOKEN` from GitHub Secrets.
