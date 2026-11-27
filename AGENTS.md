# Repository Workflows

## Local Commands
- Requires Node.js 22.23.4+ (Node.js 24 LTS recommended; CI uses Node.js 24) and npm 10+.
- `npm install` - install dependencies.
- `npm run dev` (or `npm run start`) - start Astro dev server.
- `npm run build` - build production output.
- `npm run preview` - preview the built site locally.
- `npm run astro -- <args>` - run Astro CLI commands directly.

## Deployment Workflow
- GitHub Actions workflow: `.github/workflows/deploy.yaml`.
- Trigger: push to `main`.
- Build/upload action: `withastro/action@v2`.
- Build runtime: Node.js 24.
- Deploy action: `actions/deploy-pages@v4`.
- Required secret for production map features: `PUBLIC_MAPBOX_ACCESS_TOKEN`.

## TODO
- Add explicit lint/typecheck/test commands once they are defined in `package.json`.
