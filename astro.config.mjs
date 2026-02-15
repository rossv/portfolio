import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const site =
  process.env.SITE_URL ??
  (owner && repo ? `https://${owner}.github.io/${repo}/` : 'http://localhost:4321');
const base = process.env.BASE_PATH ?? (repo ? `/${repo}/` : '/');

export default defineConfig({
  integrations: [react(), tailwind(), sitemap({
    filter: (page) => !['/portfolio', '/CV'].includes(new URL(page).pathname.replace(/\/$/, ''))
  })],
  site,
  base,
  vite: {
    ssr: {
      noExternal: ['react-map-gl', 'mapbox-gl']
    }
  }
});
