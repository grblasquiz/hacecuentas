import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';

const code = transformSync(readFileSync('scripts/prebuild.ts', 'utf8'), { loader: 'ts', format: 'cjs' }).code;

async function build(fail: string | null, block = false) {
  const events: string[] = [];
  const messages: string[] = [];
  let exit: number | undefined;
  const stream = { write() {} };
  const spawn = (_cmd: string, args: string[]) => {
    const script = args.find(a => a.startsWith('scripts/'))!;
    events.push('start:' + script);
    const child = Object.assign(new EventEmitter(), { stdout: new EventEmitter(), stderr: new EventEmitter() });
    queueMicrotask(() => {
      events.push('end:' + script);
      child.emit('exit', script === fail ? 217 : 0);
    });
    return child;
  };
  runInNewContext(code, {
    require(name: string) { return name === 'node:child_process' ? { spawn } : { existsSync: () => true }; },
    process: { env: block ? { HC_GATES: 'block' } : {}, stdout: stream, stderr: stream,
      exit(n: number) { exit = n; } },
    console: { log(...args: unknown[]) { messages.push(args.join(' ')); },
      warn(...args: unknown[]) { messages.push(args.join(' ')); },
      error(...args: unknown[]) { messages.push(args.join(' ')); } },
    Date, Promise,
  });
  await new Promise(resolve => setImmediate(resolve));
  return { events, messages, exit };
}

describe('sitemap obligatorio y ejecución serial de tsx en prebuild', () => {
  it('un fallo 217 de sitemap aborta incluso en modo aviso y no publica índices derivados', async () => {
    const r = await build('scripts/generate-sitemap.ts');
    expect(r.exit).toBe(1);
    expect(r.events).not.toContain('start:scripts/generate-hub-citable-research.ts');
    expect(r.events).not.toContain('start:scripts/generate-page-feed.ts');
    expect(r.messages.some(m => m.includes('sitemap falló con código 217'))).toBe(true);
  });

  it('completa sitemap antes de lanzar el siguiente tsx y produce el feed después', async () => {
    const r = await build(null);
    expect(r.exit).toBeUndefined();
    expect(r.events.indexOf('end:scripts/generate-sitemap.ts'))
      .toBeLessThan(r.events.indexOf('start:scripts/generate-hub-citable-research.ts'));
    expect(r.events).toContain('end:scripts/generate-page-feed.ts');
    expect(r.messages.some(m => m.includes('[prebuild] ✓ total'))).toBe(true);
  });

  it('conserva el modo aviso preexistente para los otros gates', async () => {
    const r = await build('scripts/validate-data-updates.ts');
    expect(r.exit).toBeUndefined();
    expect(r.events).toContain('end:scripts/generate-page-feed.ts');
    expect(r.messages.some(m => m.includes('NO bloquea'))).toBe(true);
  });

  it('conserva HC_GATES=block para los otros gates', async () => {
    const r = await build('scripts/validate-data-updates.ts', true);
    expect(r.exit).toBe(1);
    expect(r.events).not.toContain('start:scripts/generate-sitemap.ts');
  });
});
