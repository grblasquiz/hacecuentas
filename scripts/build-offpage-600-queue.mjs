/**
 * Construye una cola editorial auditable para 5 notas alrededor de cada hub.
 * No genera texto publicable: evita fabricar hechos regulatorios o fuentes.
 * Uso: node scripts/build-offpage-600-queue.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lib/current-tools-index.json'), 'utf8'));
const importMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/backlinks/offpage-150/blog-import-map.json'), 'utf8'));
const done = new Set(importMap.posts.map((post) => post.primaryHub));
const angles = [
  { key: 'guia', label: 'Guía práctica', title: (name) => `Cómo tomar mejores decisiones con ${name}` },
  { key: 'errores', label: 'Errores', title: (name) => `7 errores frecuentes al calcular ${name}` },
  { key: 'caso', label: 'Caso práctico', title: (name) => `Caso práctico: cómo ordenar ${name} con números` },
  { key: 'comparacion', label: 'Comparación', title: (name) => `${name}: qué comparar antes de decidir` },
  { key: 'actualizacion', label: 'Actualización', title: (name) => `${name} en 2026: qué revisar antes de usar el resultado` },
];

const rows = tools.map((tool, index) => {
  const hub = new URL(tool.url).pathname.replace(/\/$/, '') || '/';
  const name = tool.title.replace(/\s+[—-]\s+calculadoras y guías$/i, '').trim();
  return {
    order: index + 1,
    hub,
    title: tool.title,
    name,
    description: tool.description,
    category: tool.category,
    locale: tool.locale,
    audience: tool.audience,
    status: done.has(hub) ? 'done' : 'pending',
    notes: angles.map((angle) => ({
      angle: angle.key,
      label: angle.label,
      title: angle.title(name),
      primaryHub: hub,
      needsSourceReview: true,
    })),
  };
});

const outDir = path.join(ROOT, 'work', 'offpage-600');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'queue.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), targetHubs: rows.length, targetNotes: rows.length * 5, alreadyDoneHubs: rows.filter((row) => row.status === 'done').length, alreadyDoneNotes: done.size * 5, rows }, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'queue.tsv'), ['order\tstatus\thub\ttitle\tcategory\tlocale\tnote1\tnote2\tnote3\tnote4\tnote5', ...rows.map((row) => [row.order, row.status, row.hub, row.title, row.category, row.locale, ...row.notes.map((note) => note.title)].join('\t'))].join('\n') + '\n');
console.log(JSON.stringify({ hubs: rows.length, notes: rows.length * 5, doneHubs: done.size, pendingHubs: rows.length - done.size, pendingNotes: (rows.length - done.size) * 5, output: outDir }, null, 2));
