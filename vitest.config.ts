import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // `cloudflare:workers` es un módulo virtual del runtime del Worker (no
      // existe en node). Los tests que tocan src/lib/api-utils.ts lo resuelven
      // a un stub con un `env` mutable. NO afecta el build de astro.
      'cloudflare:workers': fileURLToPath(new URL('./tests/stubs/cloudflare-workers.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Formulas son puras y rápidas; timeout chico para fallar temprano.
    testTimeout: 3000,
    // Reporteo compacto para ver regressions en CI.
    reporters: process.env.CI ? ['default', 'github-actions'] : ['default'],
  },
});
