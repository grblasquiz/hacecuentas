#!/usr/bin/env node
/** Prepara fast pages como assets sin correr Astro. */
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const manifestPath = 'public/fast-pages.json';
if (!existsSync(manifestPath)) {
  console.log('[fast-pages] sin manifest; no hay páginas fast para preparar');
  process.exit(0);
}
const routes = JSON.parse(readFileSync(manifestPath, 'utf8'));
for (const [route, file] of Object.entries(routes)) {
  if (!/^\/[A-Za-z0-9-]+$/.test(route) || typeof file !== 'string' || !/^[A-Za-z0-9-]+\.html$/.test(file)) {
    throw new Error(`Ruta fast inválida: ${route} -> ${file}`);
  }
  const source = join('public', '_fast-pages', file);
  const target = join('dist', 'client', '_fast-pages', file);
  if (!existsSync(source)) throw new Error(`Falta ${source} para ${route}`);
  mkdirSync(join('dist', 'client', '_fast-pages'), { recursive: true });
  cpSync(source, target);
  console.log(`[fast-pages] ${route} → ${target}`);
}
