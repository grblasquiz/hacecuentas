import { formulas } from './src/lib/formulas/index.ts';
import fs from 'node:fs';
import glob from 'node:fs';

// args: <relpath.json> <inputsJSON>
const file = process.argv[2];
const inputs = JSON.parse(process.argv[3] || '{}');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const fn = (formulas as any)[d.formulaId];
if (typeof fn !== 'function') { console.log('NO_FORMULA', d.formulaId); process.exit(1); }
const lang = file.includes('calcs-en') ? 'en' : (file.includes('calcs-pt')||file.includes('calcs-pt-pt')) ? 'pt' : 'es';
const out = fn({ __lang: lang, ...inputs });
console.log(JSON.stringify(out, null, 2));
