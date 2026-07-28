import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src/lib/hub-formulas-generated');
let formulas = 0;
for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
  const mod = await import(path.join(dir, name));
  const entries = Object.entries(mod.formulaMap || {});
  if (!entries.length || entries.some(([, fn]) => typeof fn !== 'function')) throw new Error(`Invalid formula map: ${name}`);
  formulas += entries.length;
}
if (formulas !== 160) throw new Error(`Expected 160 formula bindings, got ${formulas}`);
console.log(JSON.stringify({ bridges: fs.readdirSync(dir).filter((f) => f.endsWith('.ts')).length, formulas }, null, 2));
