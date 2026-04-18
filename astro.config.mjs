// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

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
    // Inline CSS en el HTML para eliminar render-blocking (mobile FCP).
    // 'always' = todos los stylesheets de page van inline. Tradeoff: HTML pesa más
    // (+30-40 KB en home) pero 0 roundtrips extra en mobile 3G/4G.
    inlineStylesheets: 'always',
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