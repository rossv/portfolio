# CLAUDE.md — AI Assistant Guide for rossv/portfolio

This file provides context for AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

Personal engineering and geospatial portfolio for Ross Volkwein, PE, GISP. Built with Astro 4, React 18, and Tailwind CSS. Deployed to GitHub Pages at [www.rossvolkwein.com](https://www.rossvolkwein.com).

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Production build
npm run preview      # Preview production build locally
npm run astro -- <args>  # Run Astro CLI directly
```

No lint, typecheck, or test scripts are currently configured in `package.json`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 4 (with React islands) |
| UI Components | React 18 (JSX) |
| Styling | Tailwind CSS 3 (dark mode via `class`) |
| Animation | Framer Motion |
| Mapping | Mapbox GL / react-map-gl, Leaflet / react-leaflet |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Syne (sans), Space Mono (mono) |
| Deployment | GitHub Actions → GitHub Pages |

---

## Repository Structure

```
portfolio/
├── src/
│   ├── assets/          # Images, icons, logos, videos (organized by category)
│   │   ├── badges/      # Recognition badges
│   │   ├── icons/       # Tool/skill icons (coding, data, eng-viz, gis, hero, hh)
│   │   ├── logos/       # Company logos
│   │   ├── projects/    # Project images (WebP preferred)
│   │   └── skylines/    # City skyline images
│   ├── components/      # React (.jsx/.tsx) and Astro (.astro) components
│   ├── constants/
│   │   └── tagHierarchy.js   # TAG_HIERARCHY — canonical tag categories for filtering
│   ├── data/
│   │   ├── projects.json     # Full project portfolio (~137KB)
│   │   ├── careerTimeline.json
│   │   └── news.json
│   ├── layouts/
│   │   └── Layout.astro      # Master layout (theme, fonts, OG meta, global UI)
│   ├── pages/
│   │   ├── index.astro       # Main landing page (all sections)
│   │   ├── portfolio.astro   # Redirects to /#projects (noindex)
│   │   └── CV.astro          # Redirects to /#timeline (noindex)
│   ├── styles/               # Global CSS
│   ├── utils/
│   │   └── companyColors.js  # Company name → color mapping
│   └── env.d.ts
├── public/                   # Static assets served as-is
├── astro.config.mjs          # Astro + Vite configuration
├── tailwind.config.mjs       # Tailwind theme (colors, fonts, patterns)
├── .env.example              # Environment variable template
├── .github/workflows/deploy.yaml
├── AGENTS.md                 # Workflow reference (keep in sync with this file)
└── CHANGELOG.md
```

---

## Component Architecture

Components are React `.jsx` files (with one `.tsx` exception). Astro uses React components as **islands** — client-side hydration is explicit via `client:load`, `client:visible`, etc.

### Component Index

| Component | Type | Purpose |
|-----------|------|---------|
| `Hero.jsx` | React | Hero section with animated intro |
| `FloatingIcons.jsx` | React | Animated floating skill icons |
| `StatsCounter.jsx` | React | Animated stat counters |
| `SkillsRadar.jsx` | React | Radar chart for skill categories |
| `HexGridSection.jsx` | React | Hexagonal grid skill tiles |
| `BadgeCollection.jsx` | React | Certification/recognition badges |
| `CareerTimeline.jsx` | React | Interactive career timeline |
| `LeadershipHighlights.jsx` | React | Leadership highlights section |
| `ProjectDashboard.jsx` | React | Main project grid/dashboard |
| `ProjectFilters.jsx` | React | Tag-based project filtering |
| `ProjectStats.jsx` | React | Project statistics summary |
| `ProjectPortfolio.jsx` | React | Project portfolio container |
| `ExperienceMap.jsx` | React | Mapbox map of project locations |
| `Achievements.jsx` | React | Achievements/recognition display |
| `ThemeToggle.jsx` | React | Dark/light mode toggle |
| `Cursor.jsx` | React | Custom cursor |
| `FluidBackground.jsx` | React | Animated fluid background |
| `WaterBanner.astro` | Astro | Static water-themed banner |
| `Footer.jsx` | React | Site footer |
| `LicenseBadge.jsx` | React | PE/GISP license badge |
| `NewsSection.tsx` | React | News tiles (only `.tsx` file) |
| `GoogleAnalytics.astro` | Astro | GA4 script injection |

---

## Data Conventions

### projects.json

Each project entry contains:
- `name`, `client`, `company`, `location` — identification
- `category` — primary category string
- `tags` — array of strings from `TAG_HIERARCHY` leaf values
- `description`, `role` — text content
- `image` — path or filename
- `dates` — project date range
- `coordinates` — `[lng, lat]` for map display

When adding projects, tags **must** come from the leaf values defined in `src/constants/tagHierarchy.js`. Do not invent new tags without updating `TAG_HIERARCHY`.

### tagHierarchy.js

Six top-level categories used for filtering:
1. **H&H Modeling** — hydraulic/hydrologic modeling tools and workflows
2. **Design** — CAD, civil design, permitting
3. **GIS** — Esri ecosystem, field data collection, spatial analysis
4. **Coding & Tools** — programming languages, automation, data science
5. **Project Management** — delivery, documentation, platforms
6. **Planning** — master planning, alternatives analysis, resiliency

---

## Styling Conventions

- **Dark mode** is toggled via the `dark` class on `<html>` (stored in `localStorage`).
- Custom Tailwind colors: `slate`, `sky`, `indigo`, `canvas` — use these over arbitrary hex values.
- Custom fonts: `font-sans` → Syne, `font-mono` → Space Mono.
- Background pattern: defined as `bg-grid-pattern` in tailwind config (SVG grid).
- Prefer Tailwind utility classes; avoid inline styles except for dynamic values (e.g., Framer Motion).

---

## Environment Variables

Defined in `.env.example`:

```
PUBLIC_MAPBOX_ACCESS_TOKEN=   # Required for ExperienceMap.jsx in production
PUBLIC_GOOGLE_ANALYTICS_ID=   # GA4 measurement ID
SITE_URL=                     # Full site URL (default: http://localhost:4321)
BASE_PATH=                    # Base path for deployment (default: /)
```

`SITE_URL` and `BASE_PATH` are consumed by `astro.config.mjs` to set `site` and `base`. In CI, `GITHUB_REPOSITORY` is used as a fallback to auto-derive these.

---

## Deployment

- **Branch to deploy from:** `main`
- **Trigger:** push to `main`
- **Pipeline:** `.github/workflows/deploy.yaml` → `withastro/action@v2` build → `actions/deploy-pages@v4`
- **Required GitHub secret:** `PUBLIC_MAPBOX_ACCESS_TOKEN`
- **Live URL:** https://www.rossvolkwein.com

Never push directly to `main` — create a feature branch and open a PR.

---

## Git Workflow

- Feature branches: descriptive names or `claude/<task-slug>` for AI-assisted work
- Commit messages: imperative mood, present tense (e.g., "Add featured project filter")
- PRs target `main`; squash-merge preferred
- `CHANGELOG.md` is updated manually to summarize significant PRs

---

## SSR / Vite Notes

`react-map-gl` and `mapbox-gl` are excluded from SSR bundling via:

```js
// astro.config.mjs
vite: { ssr: { noExternal: ['react-map-gl', 'mapbox-gl'] } }
```

Components using these libraries must use a client directive (`client:load`) and guard against SSR with `typeof window !== 'undefined'` checks where needed.

---

## Assets

- Project images: `src/assets/projects/` — use WebP format, keep files reasonably sized
- Icons are loaded with Vite's `import.meta.glob` in `ProjectDashboard.jsx`
- The `portrait.png` (~5.6MB) is intentionally high-resolution; do not compress without review

---

## What Not To Do

- Do not add new top-level pages without also updating the sitemap filter in `astro.config.mjs` if the page should be excluded from indexing.
- Do not introduce new npm packages for functionality already covered (e.g., no second animation library alongside Framer Motion).
- Do not add a test runner or linting config without discussing with the repository owner — the TODO in AGENTS.md is intentional.
- Do not commit `.env` files (only `.env.example` is tracked).
