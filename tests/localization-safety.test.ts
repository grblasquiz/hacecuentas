import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const BANNED_VOSEO = /(?<![\p{L}\p{N}_])(cobrás|recibís|cargá|guardá|verificá|consultá|revisá|usá|leé|mirá|tenés|podés|querés|sos|vendés|retirás|dividí|perdés|renunciás|realizás|cambiás|terminás|dejás|pagás|necesitás|trabajás|calculás|ahorrás|ganás|invertís|sabés|decidís|elegís|ponés|sumás|restás|multiplicás|aplicás|llevás|hacés|contás|vos)(?![\p{L}\p{N}_])/iu;

function jsonFiles(dir: string) {
  return readdirSync(join(ROOT, dir))
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(ROOT, dir, name));
}

describe('locale isolation', () => {
  it.each(['src/content/calcs-mx', 'src/content/calcs-es'])('%s no contiene voseo argentino', (dir) => {
    const leaks = jsonFiles(dir)
      .filter((file) => BANNED_VOSEO.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(ROOT, ''));
    expect(leaks).toEqual([]);
  });

  it('mantiene navegación y salida dinámica dentro del locale', () => {
    const layout = readFileSync(join(ROOT, 'src/components/CalcLayoutV2.astro'), 'utf8');
    const calculator = readFileSync(join(ROOT, 'src/components/Calculator.astro'), 'utf8');
    const footer = readFileSync(join(ROOT, 'src/components/Footer.astro'), 'utf8');

    expect(layout).toContain('`${linkPrefix}/calculadoras`');
    expect(calculator).toContain('neutralizeOutputSpanish');
    expect(footer).toContain('neutralSpanishLocales');
    expect(footer).toContain('`${localePrefix}/calculadoras`');
  });
});
