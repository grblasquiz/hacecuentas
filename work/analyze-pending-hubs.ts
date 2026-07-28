import fs from 'node:fs';
import path from 'node:path';
import { formulas } from '../src/lib/formulas/index';

const root = process.cwd();
const pendingDir = path.join(root, 'work/hubs-pendientes');
const files = fs.readdirSync(pendingDir).filter((f) => /^sueltas-.*\.tsv$/.test(f));
const rows = files.flatMap((file) =>
  fs.readFileSync(path.join(pendingDir, file), 'utf8').trim().split('\n').map((line) => {
    const [url, title] = line.split('\t');
    return { url, title, locale: url.split('/')[1], slug: url.split('/').pop()! };
  }),
);

const claimedText = fs.readdirSync(path.join(root, 'src/lib/hubs'), { recursive: true })
  .filter((f) => String(f).endsWith('.ts'))
  .map((f) => fs.readFileSync(path.join(root, 'src/lib/hubs', String(f)), 'utf8'))
  .join('\n');

const summary: any[] = [];
for (const row of rows) {
  if (claimedText.includes(`'${row.url}'`) || claimedText.includes(`"${row.url}"`)) continue;
  const contentDir = path.join(root, `src/content/calcs-${row.locale}`);
  const jsonPath = fs.readdirSync(contentDir).map((f) => path.join(contentDir, f)).find((p) => {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')).slug === row.slug; } catch { return false; }
  });
  if (!jsonPath) {
    summary.push({ ...row, error: 'JSON_NOT_FOUND' });
    continue;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const fn = formulas[data.formulaId];
  const inputs = Object.fromEntries((data.fields || []).map((f: any) => [f.id, f.default ?? f.value ?? f.placeholder ?? 0]));
  try {
    const output = fn ? fn(inputs) : null;
    summary.push({
      ...row, jsonPath: path.relative(root, jsonPath), formulaId: data.formulaId,
      fields: (data.fields || []).map((f: any) => ({ id: f.id, type: f.type, default: inputs[f.id] })),
      output, error: fn ? undefined : 'FORMULA_NOT_FOUND',
    });
  } catch (error: any) {
    summary.push({ ...row, jsonPath: path.relative(root, jsonPath), formulaId: data.formulaId, fields: data.fields, error: String(error?.stack || error) });
  }
}
fs.writeFileSync(path.join(root, 'work/pending-hubs-analysis.json'), JSON.stringify(summary, null, 2));
const errors = summary.filter((x) => x.error);
const shapes = new Map<string, number>();
for (const x of summary) {
  const shape = x.output && typeof x.output === 'object' ? Object.keys(x.output).sort().join(',') : typeof x.output;
  shapes.set(shape, (shapes.get(shape) || 0) + 1);
}
console.log(JSON.stringify({ count: summary.length, errors: errors.map((x) => ({ url: x.url, error: x.error })), shapes: [...shapes] }, null, 2));
