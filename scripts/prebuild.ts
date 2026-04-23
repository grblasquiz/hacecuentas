/**
 * Orquestador de prebuild paralelo.
 *
 * Dependencias reales:
 *   validate:data   → gate (falla rápido si hay datos inválidos)
 *   related, og, sitemap, stamp-sw → independientes entre sí
 *   og-manifest     → lee public/og/, necesita `og` terminado
 *
 * Serial equivalente (npm run prebuild anterior):
 *   ~125s sin cache, ~2s con cache.
 * Paralelo: max(og) domina, resto corre en background → ~100s sin cache.
 */

import { spawn } from 'node:child_process';

type Task = { name: string; cmd: string; args: string[] };

const NODE = 'node';
const FLAGS = ['--experimental-strip-types'];

function task(name: string, script: string): Task {
  return { name, cmd: NODE, args: [...FLAGS, `scripts/${script}.ts`] };
}

function run(t: Task): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const child = spawn(t.cmd, t.args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const prefix = `[${t.name}]`;
    const relay = (stream: NodeJS.ReadableStream, out: NodeJS.WriteStream) => {
      let buf = '';
      stream.on('data', (chunk: Buffer) => {
        buf += chunk.toString();
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) out.write(`${prefix} ${line}\n`);
      });
      stream.on('end', () => {
        if (buf) out.write(`${prefix} ${buf}\n`);
      });
    };
    relay(child.stdout!, process.stdout);
    relay(child.stderr!, process.stderr);
    child.on('error', reject);
    child.on('exit', (code) => {
      const secs = ((Date.now() - start) / 1000).toFixed(1);
      if (code === 0) {
        console.log(`${prefix} ✓ ${secs}s`);
        resolve();
      } else {
        reject(new Error(`${t.name} falló con código ${code} (${secs}s)`));
      }
    });
  });
}

async function main() {
  const t0 = Date.now();

  console.log('[prebuild] fase 1: validate:data');
  await run(task('validate', 'validate-data-updates'));

  console.log('[prebuild] fase 2: related, og, sitemap, stamp-sw (paralelo)');
  await Promise.all([
    run(task('related', 'compute-related')),
    run(task('og', 'generate-og-images')),
    run(task('sitemap', 'generate-sitemap')),
    run(task('stamp-sw', 'stamp-sw')),
  ]);

  console.log('[prebuild] fase 3: og-manifest');
  await run(task('og-manifest', 'generate-og-manifest'));

  const total = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[prebuild] ✓ total ${total}s`);
}

main().catch((err) => {
  console.error('[prebuild] ✗', err.message);
  process.exit(1);
});
