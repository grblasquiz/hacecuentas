// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';

// https://astro.build/config
export default defineConfig({
  site: 'https://hacecuentas.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  compressHTML: true,
  integrations: [
    sitemap(),
    compressor(), // gzip + brotli de HTML/CSS/JS en dist/
  ],
  // Prefetch on hover: acelera navegación entre calcs sin inflar el payload inicial.
  // "hover" = prefetch cuando el usuario hoverea un link interno (default en Astro v4+).
  // Para opt-in por link agregar data-astro-prefetch en <a>.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
