import { existsSync, lstatSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const source = process.env.HC_SHARED_OG_DIR;
if (!source) process.exit(0);

const target = resolve('dist/client/og');
if (!existsSync(source)) throw new Error(`HC_SHARED_OG_DIR no existe: ${source}`);
let targetExists = existsSync(target);
if (!targetExists) {
  try { lstatSync(target); targetExists = true; } catch {}
}
if (targetExists) rmSync(target, { recursive: true, force: true });
mkdirSync(dirname(target), { recursive: true });
symlinkSync(source, target, 'dir');
console.log(`[build] OG compartidas enlazadas: ${source} → ${target}`);
