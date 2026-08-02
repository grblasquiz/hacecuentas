import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';
import { adaptGeneratedHubResult, numericValue } from '../src/lib/generated-hub-adapter';

const root = join(__dirname, '..');
const pagesRoot = join(root, 'src', 'pages');
const generatedPages = (readdirSync(pagesRoot, { recursive: true }) as string[])
  .filter((path) => path.endsWith('.astro'))
  .map((path) => join(pagesRoot, path))
  .filter((path) => readFileSync(path, 'utf8').includes('hub-formulas-generated'));

const formulaModules = import.meta.glob('../src/lib/hub-formulas-generated/*.ts', {
  eager: true,
}) as Record<string, { formulaMap: Record<string, (values: Record<string, unknown>) => Record<string, any>> }>;

const hubModules = import.meta.glob('../src/lib/hubs/**/*.ts', {
  eager: true,
}) as Record<string, { hub?: { slug: string; fields?: Array<{ id: string; type?: string; value?: unknown }> } }>;

const hubs = Object.values(hubModules).map((module) => module.hub).filter(Boolean);

function parsePage(path: string) {
  const source = readFileSync(path, 'utf8');
  const configsMatch = source.match(/const configs = (\{.*\});\n/);
  const mapMatch = source.match(/hub-formulas-generated\/([^']+)'/);
  if (!configsMatch || !mapMatch) throw new Error(`No se pudo leer la configuración de ${path}`);

  const slug = relative(pagesRoot, path).split(sep).join('/').replace(/\.astro$/, '');
  const formulaModule = Object.entries(formulaModules)
    .find(([modulePath]) => basename(modulePath, '.ts') === mapMatch[1])?.[1];
  const hub = hubs.find((candidate) => candidate?.slug === slug);

  if (!formulaModule) throw new Error(`No existe formulaMap para ${slug}`);
  if (!hub) throw new Error(`No existe HubData para ${slug}`);

  return {
    slug,
    configs: JSON.parse(configsMatch[1]),
    formulaMap: formulaModule.formulaMap,
    hub,
  };
}

describe('hubs generados', () => {
  it('mantiene el inventario completo dentro del test', () => {
    expect(generatedPages).toHaveLength(32);
    const totalCases = generatedPages
      .map(parsePage)
      .reduce((sum, page) => sum + Object.keys(page.configs).length, 0);
    expect(totalCases).toBe(130);
  });

  it('ejecuta los 130 casos con sus defaults reales sin cero falso ni [object Object]', () => {
    const failures: string[] = [];

    for (const page of generatedPages.map(parsePage)) {
      const values = Object.fromEntries((page.hub.fields || []).map((field) => [field.id, field.value]));

      for (const id of Object.keys(page.configs)) {
        const result = adaptGeneratedHubResult(
          values,
          { id },
          page.configs,
          page.formulaMap,
          { locale: page.slug.startsWith('en/') ? 'en' : page.slug.startsWith('pt/') ? 'pt-BR' : 'es' },
        );

        if (!result.total || result.total === '—') failures.push(`${page.slug}#${id}: total=${result.total}`);
        if (String(result.sub).includes('[object Object]')) failures.push(`${page.slug}#${id}: explicación inválida`);
        if (result.rows.some((row) => !Number.isFinite(row.v))) failures.push(`${page.slug}#${id}: fila no finita`);
        if (result.chart.some((item: any) => !Number.isFinite(item.value))) failures.push(`${page.slug}#${id}: gráfico no finito`);
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('acepta números formateados y resultados categóricos', () => {
    expect(numericValue('S/ 88.600')).toBe(88600);
    expect(numericValue('$1,234.56')).toBe(1234.56);
    expect(numericValue('14.81 / 20')).toBe(14.81);

    const categorical = adaptGeneratedHubResult(
      { c1__nivel: 'basico' },
      { id: 'c1' },
      { c1: { fields: ['nivel'], outputs: [{ id: 'recomendacion', primary: true }], title: 'Test' } },
      { c1: () => ({ recomendacion: 'Duolingo', _insight: { text: 'Una opción inicial.' } }) },
    );
    expect(categorical.total).toBe('Duolingo');
    expect(categorical.sub).toBe('Una opción inicial.');
  });

  it('no permite strings localizados dentro de inputs HTML number', () => {
    const invalid: string[] = [];
    for (const hub of hubs) {
      for (const field of hub?.fields || []) {
        const localizedNumericString =
          field.type === 'number' &&
          typeof field.value === 'string' &&
          (field.value.includes(',') || /^\d{1,3}(?:\.\d{3})+$/.test(field.value));
        if (localizedNumericString) {
          invalid.push(`${hub?.slug}:${field.id}=${field.value}`);
        }
      }
    }
    expect(invalid, invalid.join('\n')).toEqual([]);
  });

  it('no vuelve a ocultar la primera alternativa con CSS', () => {
    const css = readFileSync(join(root, 'src', 'styles', 'hub.css'), 'utf8');
    expect(css).not.toMatch(/\.opt:first-child\s*\{\s*display:\s*none/);
  });
});
