#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(process.cwd(), 'dist', 'client');
if (!existsSync(root)) {
  console.error('❌ dist/client no existe; corré el build antes del gate de embeds.');
  process.exit(1);
}

const htmlFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) htmlFiles.push(file);
  }
};
walk(root);

const embedRefs = [];
const localizedOffers = [];
const localizedPath = /^(mx|es|cl|co|pe|ec|ve|py|uy|do|pt|pt-pt|en)\//;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = relative(root, file).replace(/\.html$/, '');
  for (const match of html.matchAll(/(?:src|href)=["']https:\/\/hacecuentas\.com(\/embed\/[^"'#?]+)["']/g)) {
    embedRefs.push({ page, target: match[1] });
    if (localizedPath.test(page)) localizedOffers.push({ page, target: match[1] });
  }
}

const uniqueTargets = [...new Set(embedRefs.map(({ target }) => target))];
const missing = uniqueTargets.filter((target) => {
  const local = target.slice(1);
  return !existsSync(join(root, `${local}.html`)) && !existsSync(join(root, local, 'index.html'));
});

if (missing.length || localizedOffers.length) {
  if (missing.length) {
    console.error(`❌ ${missing.length} iframe(s) apuntan a embeds inexistentes:`);
    for (const target of missing.slice(0, 20)) console.error(`   ${target}`);
  }
  if (localizedOffers.length) {
    console.error(`❌ ${localizedOffers.length} oferta(s) de embed aparecen en páginas localizadas sin endpoint propio:`);
    for (const { page, target } of localizedOffers.slice(0, 20)) console.error(`   ${page} → ${target}`);
  }
  process.exit(1);
}

console.log(`✅ embed routes: ${uniqueTargets.length} destinos referenciados, 0 faltantes, 0 ofertas localizadas rotas.`);
