import { defineConfig } from 'vitest/config';

export default defineConfig({
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
