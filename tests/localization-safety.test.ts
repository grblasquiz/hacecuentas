import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const BANNED_VOSEO = /(?<![\p{L}\p{N}_])(cobrás|recibís|cargá|guardá|verificá|consultá|revisá|usá|leé|mirá|tenés|podés|querés|sos|vendés|retirás|dividí|perdés|renunciás|realizás|cambiás|terminás|dejás|pagás|necesitás|trabajás|calculás|ahorrás|ganás|invertís|sabés|decidís|elegís|ponés|sumás|restás|multiplicás|aplicás|llevás|hacés|contás|vos)(?![\p{L}\p{N}_])/iu;

function sourceFiles(dir: string): string[] {
  const full = join(ROOT, dir);
  return readdirSync(full).flatMap((name) => {
    const path = join(full, name);
    if (statSync(path).isDirectory()) return sourceFiles(`${dir}/${name}`);
    return /\.(?:ts|html|astro)$/.test(name) ? [path] : [];
  });
}

describe('locale isolation', () => {
  it.each([
    ['México', ['src/lib/hubs/mx', 'src/mockups/approved/mx']],
    ['España', ['src/lib/hubs/es', 'src/mockups/approved/es']],
  ])('%s no contiene voseo argentino', (_locale, dirs) => {
    const leaks = dirs.flatMap(sourceFiles)
      .filter((file) => BANNED_VOSEO.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(ROOT, ''));
    expect(leaks).toEqual([]);
  });

  it('mantiene navegación y salida dinámica dentro del locale', () => {
    const layout = readFileSync(join(ROOT, 'src/components/CalcLayoutV2.astro'), 'utf8');
    const calculator = readFileSync(join(ROOT, 'src/components/Calculator.astro'), 'utf8');
    const viewModel = readFileSync(join(ROOT, 'src/lib/calculator-view-model.ts'), 'utf8');
    const footer = readFileSync(join(ROOT, 'src/components/Footer.astro'), 'utf8');

    expect(layout).toContain('`${linkPrefix}/calculadoras`');
    expect(calculator).toContain('neutralizeOutputSpanish');
    expect(calculator).toContain('neutralizeSpanish(rawDisclaimer)');
    expect(viewModel).toContain(".replace(/verificá/gi, 'verifica')");
    expect(footer).toContain('neutralSpanishLocales');
    expect(footer).toContain('`${localePrefix}/calculadoras`');
  });
});
