import { describe, expect, it } from 'vitest';
import { DECISION_MANIFEST } from '../src/lib/decisions/manifest';
import { PRIORITY_DECISIONS, PRIORITY_DECISION_SLUGS } from '../src/lib/decisions/priority';

describe('salas de decisión P0', () => {
  it('concentra exactamente diez salas únicas y publicadas', () => {
    expect(PRIORITY_DECISIONS).toHaveLength(10);
    expect(new Set(PRIORITY_DECISION_SLUGS).size).toBe(10);
    const published = new Set(DECISION_MANIFEST.map((room) => room.slug));
    for (const slug of PRIORITY_DECISION_SLUGS) expect(published.has(slug)).toBe(true);
  });

  it('cada sala tiene respuesta de búsqueda y metadata propias', () => {
    expect(new Set(PRIORITY_DECISIONS.map((item) => item.seoTitle)).size).toBe(10);
    expect(new Set(PRIORITY_DECISIONS.map((item) => item.seoDescription)).size).toBe(10);
    for (const item of PRIORITY_DECISIONS) {
      expect(item.searchAnswer.length).toBeGreaterThan(120);
      expect(item.questionTitle).toContain('?');
    }
  });
});
