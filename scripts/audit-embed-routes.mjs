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

// Plugin WordPress 1.1+: los accesos rápidos apuntan a hubs canónicos con
// ?hc_embed=1. Si un hub se renombra, el build debe detectarlo antes de publicar
// un ZIP cuyos botones produzcan un iframe vacío.
const pluginBlock = readFileSync(
  join(process.cwd(), 'wordpress-plugin', 'hace-cuentas-calculadoras', 'block.js'),
  'utf8',
);
const pluginTargets = [...pluginBlock.matchAll(/\{\s*slug:\s*'([^']+)'\s*,\s*label:/g)]
  .map((match) => `/${match[1]}`);
const missingPluginTargets = pluginTargets.filter((target) => {
  const local = target.slice(1);
  return !existsSync(join(root, `${local}.html`)) && !existsSync(join(root, local, 'index.html'));
});

// El catálogo remoto promete todos estos hubs. Además de existir, cada HTML
// necesita un wrapper que HubEmbedMode pueda aislar; de lo contrario el iframe
// cargaría la página completa o quedaría en blanco para ese ítem del picker.
const currentTools = JSON.parse(readFileSync(
  join(process.cwd(), 'src', 'lib', 'current-tools-index.json'),
  'utf8',
));
const localePrefixes = new Set([
  'en', 'es', 'mx', 'co', 'cl', 'pe', 'ec', 've', 'py', 'uy', 'do', 'pt', 'pt-pt',
]);
const embeddableHubs = currentTools.filter(({ slug }) => {
  const parts = slug.split('/').filter(Boolean);
  return localePrefixes.has(parts[0]) ? parts.length >= 3 : parts.length >= 2;
});
const hubTargetPatterns = [
  /class="[^"]*\bapproved-mockup-page\b/,
  /class="[^"]*mockup-/,
  /class="[^"]*experience\b/,
  /class="[^"]*\bhc-hub\b/,
  /<section[^>]*class="[^"]*\bcalculator\b/,
  /<form[^>]*class="[^"]*\bcalc\b/,
  /class="[^"]*\bcalc-grid\b/,
  /class="[^"]*\bcalculator\b/,
  /class="[^"]*\bcalc\b/,
];
const untargetableHubs = embeddableHubs.filter(({ slug }) => {
  const file = join(root, `${slug}.html`);
  if (!existsSync(file)) return true;
  const html = readFileSync(file, 'utf8');
  return !hubTargetPatterns.some((pattern) => pattern.test(html));
});

if (missing.length || localizedOffers.length || missingPluginTargets.length || untargetableHubs.length) {
  if (missing.length) {
    console.error(`❌ ${missing.length} iframe(s) apuntan a embeds inexistentes:`);
    for (const target of missing.slice(0, 20)) console.error(`   ${target}`);
  }
  if (localizedOffers.length) {
    console.error(`❌ ${localizedOffers.length} oferta(s) de embed aparecen en páginas localizadas sin endpoint propio:`);
    for (const { page, target } of localizedOffers.slice(0, 20)) console.error(`   ${page} → ${target}`);
  }
  if (missingPluginTargets.length) {
    console.error(`❌ ${missingPluginTargets.length} acceso(s) rápido(s) del plugin apuntan a hubs inexistentes:`);
    for (const target of missingPluginTargets) console.error(`   ${target}`);
  }
  if (untargetableHubs.length) {
    console.error(`❌ ${untargetableHubs.length} hub(s) del catálogo no tienen un panel aislable para WordPress:`);
    for (const { slug } of untargetableHubs.slice(0, 20)) console.error(`   /${slug}`);
  }
  process.exit(1);
}

console.log(`✅ embed routes: ${uniqueTargets.length} destinos legacy + ${embeddableHubs.length} hubs aislables (${pluginTargets.length} accesos rápidos), 0 faltantes.`);
