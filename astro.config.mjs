// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://un-kilo-mas.vercel.app',
  output: 'static',
  compressHTML: true,
  build: {
    format: 'directory',
  },
});
