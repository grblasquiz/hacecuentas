import { describe, expect, it } from 'vitest';
import { validFreshDate, filterFreshEntries } from '../src/lib/seo/fresh-feed';

describe('fresh sitemap eligibility', () => {
  it('rejects impossible dates and malformed values', () => {
    expect(validFreshDate('2026-02-30')).toBeNull();
    expect(validFreshDate('2026-09-01oops')).toBeNull();
    expect(validFreshDate('2026-09-01T12:00:00Z')).toBe('2026-09-01');
  });
  it('keeps recent canonical URLs only, without future dates or duplicates', () => {
    const now = Date.parse('2026-09-13T12:00:00Z');
    const entries = [
      { loc: '/valid', lastmod: '2026-09-12' },
      { loc: '/valid', lastmod: '2026-09-10' },
      { loc: '/future', lastmod: '2026-09-14' },
      { loc: '/old', lastmod: '2026-08-01' },
      { loc: '/noindex', lastmod: '2026-09-13' },
    ];
    expect(filterFreshEntries(entries, new Set(['/valid', '/future', '/old']), now))
      .toEqual([{ loc: '/valid', lastmod: '2026-09-12' }]);
  });
});
