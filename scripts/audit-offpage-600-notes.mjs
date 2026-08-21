/** Auditoría de cobertura y estructura del programa off-page 600. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BATCHES = path.join(ROOT, 'docs/backlinks/offpage-600/batches');
const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lib/current-tools-index.json'), 'utf8'));
const importMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/backlinks/offpage-150/blog-import-map.json'), 'utf8'));
const oldHubs = new Set(importMap.posts.map((post) => post.primaryHub));
const rows = JSON.parse(fs.readFileSync(path.join(BATCHES, 'manifest.json'), 'utf8')).notes;
const wordCounts = rows.map((row) => row.words);
const validHubs = new Set(tools.map((tool) => new URL(tool.url).pathname.replace(/\/$/, '') || '/'));
const counts = new Map();
const titles = new Map();
const failures = [];

for (const row of rows) {
  counts.set(row.hub, (counts.get(row.hub) || 0) + 1);
  if (titles.has(row.title)) failures.push(`duplicate title: ${row.title}`);
  titles.set(row.title, row.hub);
  if (!validHubs.has(row.hub)) failures.push(`unknown hub: ${row.hub}`);
  if (oldHubs.has(row.hub)) failures.push(`overlap with offpage-150: ${row.hub}`);
  const file = path.join(BATCHES, row.source.replace(/^batches\//, ''));
  const text = fs.readFileSync(file, 'utf8');
  const marker = `<!-- angle: ${row.angle}; primaryHub: ${row.hub} -->`;
  if (!text.includes(marker)) failures.push(`missing marker: ${row.hub} / ${row.angle}`);
  const internalLinks = text.split(`](${row.hub})`).length - 1;
  if (internalLinks < 2) failures.push(`fewer than 2 internal links: ${row.hub} / ${row.angle} (${internalLinks})`);
  if (!text.includes('## Preguntas frecuentes')) failures.push(`missing FAQ: ${row.hub} / ${row.angle}`);
  if (!text.includes('## Fuentes de referencia')) failures.push(`missing sources: ${row.hub} / ${row.angle}`);
  if (row.words < 250) failures.push(`short note: ${row.hub} / ${row.angle} (${row.words} words)`);
}

const missing = [...validHubs].filter((hub) => !oldHubs.has(hub) && counts.get(hub) !== 5);
for (const hub of missing) failures.push(`coverage != 5: ${hub} (${counts.get(hub) || 0})`);
const result = {
  totalHubs: tools.length,
  existingHubs: oldHubs.size,
  generatedHubs: counts.size,
  expectedGeneratedHubs: tools.length - oldHubs.size,
  generatedNotes: rows.length,
  expectedGeneratedNotes: (tools.length - oldHubs.size) * 5,
  averageWords: Math.round(wordCounts.reduce((sum, words) => sum + words, 0) / wordCounts.length),
  minimumWords: Math.min(...wordCounts),
  maximumWords: Math.max(...wordCounts),
  below900Words: wordCounts.filter((words) => words < 900).length,
  uniqueTitles: titles.size,
  batches: fs.readdirSync(BATCHES).filter((name) => /^offpage-600-\d+\.md$/.test(name)).length,
  failures,
  ok: failures.length === 0 && counts.size === tools.length - oldHubs.size && rows.length === (tools.length - oldHubs.size) * 5 && Math.round(wordCounts.reduce((sum, words) => sum + words, 0) / wordCounts.length) >= 1000 && Math.min(...wordCounts) >= 900,
};
const reportDir = path.join(ROOT, 'reports', 'offpage-600');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'audit.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
