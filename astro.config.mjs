// @ts-check
import { defineConfig } from 'astro/config';

// Sitio estático. No va atado a Netlify, Vercel ni Cloudflare.
export default defineConfig({
  output: 'static',
  compressHTML: true,
  build: {
    format: 'directory',
  },
});
