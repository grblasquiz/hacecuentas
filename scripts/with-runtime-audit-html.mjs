import { spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createTestHarness } from 'wrangler';

const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error('Falta indicar el comando de auditoría.');

const path = '/fechas/feriados';
const file = `dist/client${path}.html`;
const worker = createTestHarness({ workers: [{ configPath: 'dist/server/wrangler.json' }] });
let html;
try {
  const response = await worker.fetch(`https://hacecuentas.com${path}`);
  if (!response.ok || !response.headers.get('cache-control')?.includes('no-store')) {
    throw new Error(`[runtime-audit] ${path}: HTTP ${response.status} o caché inesperada`);
  }
  html = await response.text();
  if (!html.includes('id="holidayList"')) {
    throw new Error(`[runtime-audit] ${path}: el Worker no devolvió el calendario`);
  }
} catch (error) {
  worker.debug();
  throw error;
} finally {
  await worker.close();
}

// Las auditorías leen el árbol estático. El HTML obtenido del Worker se usa
// durante la auditoría y se quita antes de distribuir los archivos al CDN.
await mkdir(dirname(file), { recursive: true });
await writeFile(file, html, { flag: 'wx' });
try {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(file);
}
