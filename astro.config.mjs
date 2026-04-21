// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
// NOTE: Partytown removido 2026-04-22. Bloqueaba events de conversión de
// Google Ads (gtag no generaba network requests al collect endpoint).
// Volvemos a async scripts — más CPU main thread pero tracking 100% funcional.
// import partytown from '@astrojs/partytown';

// NOTE: astro-compressor removido. Cloudflare Pages comprime automáticamente
// en el edge (gzip + brotli) → la compresión local era redundante y causaba
// OOM kill en CI al procesar 650+ archivos con zstd/brotli.

// https://astro.build/config
export default defineConfig({
  site: 'https://hacecuentas.com',
  output: 'static',
  trailingSlash: 'never',

  build: {
    format: 'file',
    // Inline solo CSS crítico (chico). El CSS grande se externaliza con caché propio,
    // reduciendo HTML de 150KB → ~80KB (mejor LCP en mobile, 3G y de paso cachea entre pages).
    // 'auto' ~ 4KB threshold: Astro decide inline vs external.
    inlineStylesheets: 'auto',
  },

  compressHTML: true,
  integrations: [],

  // Prefetch on hover: acelera navegación entre calcs sin inflar el payload inicial.
  // "hover" = prefetch cuando el usuario hoverea un link interno (default en Astro v4+).
  // Para opt-in por link agregar data-astro-prefetch en <a>.
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  adapter: cloudflare(),
});