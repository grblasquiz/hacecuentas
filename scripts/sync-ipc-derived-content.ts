/** Sincroniza únicamente el contenido IPC; escritura idempotente. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { syncIpcContent } from '../src/lib/ipc-content.ts';

const root = process.cwd();
const file = join(root, 'src/content/calcs/inflacion-ipc.json');
const calc = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(join(root, 'src/data/ipc-indec-serie.json'), 'utf8'));
const live = JSON.parse(readFileSync(join(root, 'src/data/live/inflacion.json'), 'utf8'));
const result = syncIpcContent(calc, base, live);
if (JSON.stringify(result) !== JSON.stringify(calc)) {
  writeFileSync(file, JSON.stringify(result, null, 2) + '\n');
  console.log('[sync-ipc] ✓ textos, ejemplos y tablas sincronizados');
} else {
  console.log('[sync-ipc] ✓ contenido ya sincronizado');
}
