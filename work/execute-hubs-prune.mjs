import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowed = path.join(root, 'src/content') + path.sep;
const list = fs.readFileSync(path.join(root, 'work/hubs-prune-json-paths.txt'), 'utf8').trim().split('\n').filter(Boolean);
if (list.length !== 160 || new Set(list).size !== 160) throw new Error(`Expected 160 unique JSON targets, got ${list.length}/${new Set(list).size}`);
for (const file of list) {
  const absolute = path.resolve(root, file);
  if (!absolute.startsWith(allowed) || !/\/calcs-[^/]+\/[^/]+\.json$/.test(absolute)) throw new Error(`Unsafe target: ${absolute}`);
  if (!fs.existsSync(absolute)) throw new Error(`Missing target before prune: ${absolute}`);
  const data = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (!data.slug) throw new Error(`Target is not a calc JSON: ${absolute}`);
}
for (const file of list) fs.unlinkSync(path.resolve(root, file));
console.log(`Deleted ${list.length} validated calculator JSON files.`);
