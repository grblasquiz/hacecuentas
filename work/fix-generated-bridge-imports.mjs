import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const index = fs.readFileSync(path.join(root, 'src/lib/formulas/index.ts'), 'utf8');
const originalByPathAndLocal = new Map();
for (const match of index.matchAll(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+'\.\/([^']+)';/gm)) {
  const spec = match[1].trim();
  const alias = spec.match(/^([^\s]+)\s+as\s+([^\s]+)$/);
  originalByPathAndLocal.set(`${match[2]}|${alias ? alias[2] : spec}`, alias ? alias[1] : spec);
}
const dir = path.join(root, 'src/lib/hub-formulas-generated');
for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
  const file = path.join(dir, name);
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/^import \{ ([^\s]+) as (f\d+) \} from '\.\.\/formulas\/([^']+)';$/gm, (line, local, alias, formulaPath) => {
    const original = originalByPathAndLocal.get(`${formulaPath}|${local}`);
    if (!original) throw new Error(`Cannot resolve ${formulaPath}|${local}`);
    return `import { ${original} as ${alias} } from '../formulas/${formulaPath}';`;
  });
  fs.writeFileSync(file, text);
}
