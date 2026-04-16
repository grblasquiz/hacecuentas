import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const CALCS_DIR = '/Users/marrod/hacecuentas/src/content/calcs';
const files = readdirSync(CALCS_DIR)
  .filter(f => f.endsWith('.json'))
  .sort()
  .map(f => path.join(CALCS_DIR, f));

let totalFiles = 0;
let alreadyHad2026 = 0;
let updated2025 = 0;
let updatedNoYear = 0;
const changes = [];

/**
 * Insert "2026" into a title that has no year.
 * Rules:
 *   - If title contains " — ", insert "2026 " before the first " — "
 *   - Else if title contains " | ", insert " 2026" before the first " | "
 *   - Else append " 2026" at the end
 */
function insertYear(title) {
  const emDashIdx = title.indexOf(' — ');
  const pipeIdx = title.indexOf(' | ');

  if (emDashIdx !== -1) {
    // Insert before " — "
    return title.slice(0, emDashIdx) + ' 2026' + title.slice(emDashIdx);
  } else if (pipeIdx !== -1) {
    // Insert before " | "
    return title.slice(0, pipeIdx) + ' 2026' + title.slice(pipeIdx);
  } else {
    // No separator — append at end
    return title + ' 2026';
  }
}

for (const filePath of files) {
  totalFiles++;
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const originalTitle = data.title ?? '';

  if (typeof originalTitle !== 'string' || !originalTitle) {
    continue;
  }

  let newTitle = originalTitle;

  if (originalTitle.includes('2026')) {
    alreadyHad2026++;
    continue;
  } else if (originalTitle.includes('2025')) {
    newTitle = originalTitle.replace(/2025/g, '2026');
    updated2025++;
  } else {
    newTitle = insertYear(originalTitle);
    updatedNoYear++;
  }

  data.title = newTitle;
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  changes.push({ file: path.basename(filePath), before: originalTitle, after: newTitle });
}

// Report
console.log('=== fix-titles-year.mjs ===\n');
console.log(`Total JSON files scanned : ${totalFiles}`);
console.log(`Already had 2026         : ${alreadyHad2026}`);
console.log(`Updated (2025 → 2026)    : ${updated2025}`);
console.log(`Updated (no year → 2026) : ${updatedNoYear}`);
console.log(`Total updated            : ${updated2025 + updatedNoYear}`);
console.log();

if (changes.length > 0) {
  console.log('--- Changes made ---');
  for (const { file, before, after } of changes) {
    console.log(`\n  FILE : ${file}`);
    console.log(`  BEFORE: ${before}`);
    console.log(`  AFTER : ${after}`);
  }
}
