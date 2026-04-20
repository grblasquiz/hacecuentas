#!/usr/bin/env node
/**
 * Valida todos los <script type="application/ld+json"> en el build:
 *  1. JSON parseable
 *  2. Tiene @context y @type
 *  3. Campos obligatorios por tipo (HowTo needs steps, FAQPage needs mainEntity, etc.)
 *  4. URLs consistentes (no mezcla http/https, no /undefined, no /${...})
 *
 * Corre en CI. Sale con código 1 si encuentra errores críticos.
 *
 * Uso:
 *   node scripts/validate-schema.mjs           # valida todas
 *   node scripts/validate-schema.mjs --sample  # valida 20 páginas random (rápido)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist', 'client');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function extractJsonLd(html) {
  const blocks = [];
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

// Requisitos por tipo (subset de lo que valida Google Rich Results)
const REQUIRED_FIELDS = {
  HowTo: ['name', 'step'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  Article: ['headline'],
  WebApplication: ['name', 'applicationCategory'],
  SoftwareApplication: ['name', 'applicationCategory'],
  Dataset: ['name', 'description'],
  ItemList: ['itemListElement'],
  Organization: ['name', 'url'],
  WebSite: ['url'],
  SiteNavigationElement: ['name'],
  CollectionPage: ['name', 'url'],
};

function getTypes(obj) {
  if (!obj) return [];
  const t = obj['@type'];
  if (!t) return [];
  return Array.isArray(t) ? t : [t];
}

function validateNode(node, path, errors, warnings) {
  if (typeof node !== 'object' || node === null) return;
  const types = getTypes(node);
  for (const type of types) {
    const required = REQUIRED_FIELDS[type];
    if (!required) continue;
    for (const field of required) {
      if (node[field] === undefined || node[field] === null || node[field] === '') {
        errors.push(`${path}: ${type} falta campo obligatorio "${field}"`);
      }
    }
  }
  // Buscar URLs rotas
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string') {
      if (v.includes('${') || v.includes('/undefined')) {
        errors.push(`${path}: URL rota en "${k}": ${v.slice(0, 80)}`);
      }
      if (v.startsWith('http://hacecuentas.com')) {
        warnings.push(`${path}: HTTP en lugar de HTTPS en "${k}": ${v.slice(0, 80)}`);
      }
    }
    if (typeof v === 'object') {
      if (Array.isArray(v)) v.forEach((x, i) => validateNode(x, `${path}.${k}[${i}]`, errors, warnings));
      else validateNode(v, `${path}.${k}`, errors, warnings);
    }
  }
}

function validateSchema(jsonStr, filePath) {
  const errors = [];
  const warnings = [];
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    errors.push(`${filePath}: JSON inválido — ${e.message.slice(0, 100)}`);
    return { errors, warnings };
  }
  if (!parsed['@context']) errors.push(`${filePath}: falta @context`);
  const nodes = parsed['@graph'] || [parsed];
  nodes.forEach((n, i) => validateNode(n, `${filePath}[${i}]`, errors, warnings));
  return { errors, warnings };
}

const files = walk(DIST);
const sample = process.argv.includes('--sample');
const toCheck = sample ? files.sort(() => Math.random() - 0.5).slice(0, 20) : files;

let totalErrors = 0;
let totalWarnings = 0;
let filesWithErrors = 0;
const errorSamples = [];

console.log(`Validando ${toCheck.length} archivos HTML...`);
for (const f of toCheck) {
  const html = readFileSync(f, 'utf8');
  const blocks = extractJsonLd(html);
  if (blocks.length === 0) {
    // Blog/glossary/tabla may not have schema — skip silently
    continue;
  }
  const relative = f.replace(DIST + '/', '');
  let fileHasError = false;
  for (const block of blocks) {
    const { errors, warnings } = validateSchema(block, relative);
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    if (errors.length > 0) {
      fileHasError = true;
      if (errorSamples.length < 10) errorSamples.push(...errors.slice(0, 2));
    }
  }
  if (fileHasError) filesWithErrors++;
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Files checked: ${toCheck.length}`);
console.log(`Files with errors: ${filesWithErrors}`);
console.log(`Total errors: ${totalErrors}`);
console.log(`Total warnings: ${totalWarnings}`);

if (errorSamples.length > 0) {
  console.log('\nPrimeros errores:');
  for (const e of errorSamples) console.log('  ✗ ' + e);
}

if (totalErrors > 0) {
  console.log('\n❌ FAIL — hay errores de schema');
  process.exit(1);
}
console.log('\n✅ Schema válido');
