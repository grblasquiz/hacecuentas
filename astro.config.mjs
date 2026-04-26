// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sentry from '@sentry/astro';

// Sentry: DSN se lee de env (SENTRY_DSN). Si está vacío, init es no-op.
// Source maps se uploadean SOLO en CI/prod cuando SENTRY_AUTH_TOKEN está seteado;
// en dev no queremos subir source maps a Sentry.
const SENTRY_DSN = process.env.SENTRY_DSN || '';
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || '';
const SENTRY_ENABLED = Boolean(SENTRY_DSN);
const IS_PROD_BUILD = process.env.NODE_ENV !== 'development' && Boolean(SENTRY_AUTH_TOKEN);
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
  // output: 'server' permite mixed mode — las pages con `prerender: true` (o con
  // getStaticPaths) se prerenderizan; las demás (como /api/* con prerender:false)
  // quedan como SSR ejecutándose en el Worker generado por el adapter CF.
  // Nota: si tocás esto, asegurate que TODAS las pages estáticas tengan
  // `export const prerender = true` o un getStaticPaths. Sin eso se renderean
  // dinámicamente cada request, ahorrando cache.
  output: 'server',
  trailingSlash: 'never',

  build: {
    format: 'file',
    // Inline solo CSS crítico (chico). El CSS grande se externaliza con caché propio,
    // reduciendo HTML de 150KB → ~80KB (mejor LCP en mobile, 3G y de paso cachea entre pages).
    // 'auto' ~ 4KB threshold: Astro decide inline vs external.
    inlineStylesheets: 'auto',
  },

  compressHTML: true,
  integrations: [
    // Sentry — solo se inicializa si hay DSN. Sin DSN, queda como no-op total.
    // - Track errors client-side (autoInstrumentation: true). Server-side OFF
    //   porque Workers ya tiene su propio logging (CF Workers Observability).
    // - Source maps upload solo en build de prod con SENTRY_AUTH_TOKEN seteado.
    ...(SENTRY_ENABLED ? [sentry({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
      // Skip server-side init: Workers usan su propio observability.
      autoInstrumentation: { requestHandler: false },
      sourceMapsUploadOptions: IS_PROD_BUILD ? {
        project: process.env.SENTRY_PROJECT || 'hacecuentas',
        org: process.env.SENTRY_ORG || '',
        authToken: SENTRY_AUTH_TOKEN,
      } : { enabled: false },
    })] : []),
  ],

  // Prefetch on hover: acelera navegación entre calcs sin inflar el payload inicial.
  // "hover" = prefetch cuando el usuario hoverea un link interno (default en Astro v4+).
  // Para opt-in por link agregar data-astro-prefetch en <a>.
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  adapter: cloudflare(),
});