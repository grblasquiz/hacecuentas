/**
 * fix-descriptions.mjs
 *
 * Ensures every calc JSON has its primary seoKeyword (seoKeywords[0])
 * present in the meta description. If not, rewrites the description
 * naturally using a "{Keyword}: {rest}" pattern, trimmed to 120-160 chars.
 *
 * Usage: node scripts/fix-descriptions.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CALCS_DIR = join(__dirname, '../src/content/calcs');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize text: lowercase + strip accents for comparison */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Check if haystack contains needle (accent+case insensitive) */
function containsKeyword(description, keyword) {
  return normalize(description).includes(normalize(keyword));
}

/**
 * Smart trim: trim string to maxLen chars, cutting at the last
 * complete word boundary (no mid-word cuts). Strips trailing punctuation
 * like comma or space before adding nothing (we don't add ellipsis for SEO).
 */
function trimToWord(str, maxLen) {
  if (str.length <= maxLen) return str;
  const cut = str.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  // Strip trailing comma, dash or whitespace
  return trimmed.replace(/[,\s\-–]+$/, '').trimEnd();
}

/**
 * Pad description to at least 120 chars if possible. We can't magically
 * add content so we only apply trimming — descriptions under 120 that we
 * created are accepted as-is (the limit is "keep between 120-160").
 */
function ensureLength(str) {
  return trimToWord(str, 160);
}

/**
 * Build a new description that naturally includes `keyword`.
 *
 * Strategy (in order):
 *  1. If description starts with "Calculá " or "Calcula " → prefix with
 *     "{Keyword}: {description}" where {description} starts lowercase.
 *  2. If description starts with "Compará " or "Compara " → same.
 *  3. If description starts with "Convertí " or "Convierte " → same.
 *  4. If description starts with "Estimá " or "Estima " → same.
 *  5. If description starts with "Consultá " or "Consulta " → same.
 *  6. Otherwise → "{Keyword}: {description lowercased first char}"
 *
 * After concatenation, trim to 160 chars at a word boundary.
 * Capitalise the keyword naturally (original casing from JSON).
 */
function rewriteDescription(description, keyword) {
  // Capitalise first letter of keyword
  const kw = keyword.charAt(0).toUpperCase() + keyword.slice(1);

  // Lower-case the first character of the original description
  const descLower = description.charAt(0).toLowerCase() + description.slice(1);

  const candidate = `${kw}: ${descLower}`;
  return ensureLength(candidate);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));

let alreadyOk = 0;
let rewritten = 0;
let skipped = 0; // no seoKeywords or no description
const examples = []; // first 5 rewrites stored here

for (const filename of files) {
  const filePath = join(CALCS_DIR, filename);
  let data;

  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`⚠  Could not parse ${filename}: ${e.message}`);
    skipped++;
    continue;
  }

  const description = data.description;
  const seoKeywords = data.seoKeywords;

  if (!description || !seoKeywords || seoKeywords.length === 0) {
    skipped++;
    continue;
  }

  const primaryKeyword = seoKeywords[0];

  if (containsKeyword(description, primaryKeyword)) {
    alreadyOk++;
    continue;
  }

  // Needs rewrite
  const newDescription = rewriteDescription(description, primaryKeyword);

  if (examples.length < 5) {
    examples.push({
      file: filename,
      keyword: primaryKeyword,
      before: description,
      after: newDescription,
    });
  }

  data.description = newDescription;
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  rewritten++;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log('\n========================================');
console.log('  fix-descriptions.mjs — Results');
console.log('========================================');
console.log(`Total files scanned : ${files.length}`);
console.log(`Already OK          : ${alreadyOk}`);
console.log(`Rewritten           : ${rewritten}`);
console.log(`Skipped (no data)   : ${skipped}`);
console.log('');

if (examples.length > 0) {
  console.log('--- 5 example rewrites ---\n');
  examples.forEach(({ file, keyword, before, after }, i) => {
    console.log(`[${i + 1}] ${file}`);
    console.log(`    Keyword : "${keyword}"`);
    console.log(`    BEFORE  : ${before}`);
    console.log(`    AFTER   : ${after}`);
    console.log(`    Chars   : ${before.length} → ${after.length}`);
    console.log('');
  });
}

console.log('Done.');
