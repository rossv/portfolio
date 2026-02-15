import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const site =
  process.env.SITE_URL ??
  (owner && repo ? `https://${owner}.github.io/${repo}/` : 'https://www.rossvolkwein.com');
const base = process.env.BASE_PATH ?? (repo ? `/${repo}/` : '/');

export default defineConfig({
  integrations: [react(), tailwind(), sitemap()],
  site,
  base,
  vite: {
    ssr: {
      noExternal: ['react-map-gl', 'mapbox-gl']
    }
  }
});
