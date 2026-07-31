import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import tools from '../src/lib/current-tools-index.json';

const root = join(import.meta.dirname, '..');
const snapshotScript = readFileSync(join(root, 'scripts/snapshot-current-tools.mjs'), 'utf8');

describe('related tools editorial spacing', () => {
  it('preserves a separator when stripping inline HTML from headings', () => {
    expect(snapshotScript).toContain("replace(/<[^>]+>/g, ' ')");
    expect(snapshotScript).toContain("replace(/\\s+/g, ' ')");
  });

  it('keeps the three Trabajo headings readable', () => {
    const bySlug = new Map(tools.map((tool) => [tool.slug, tool.h1]));
    expect(bySlug.get('trabajo/vacaciones')).toBe('¿Cuántos días te corresponden y cuánto cobrás?');
    expect(bySlug.get('trabajo/sueldos-por-convenio')).toBe('Tu convenio dice cuánto deberías estar cobrando.');
    expect(bySlug.get('trabajo/horas-extra')).toBe('Cada hora de más tiene un valor distinto.');
  });
});
