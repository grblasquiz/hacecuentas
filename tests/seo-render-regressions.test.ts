import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const approved = readFileSync(join(root, 'src/components/ApprovedMockupPage.astro'), 'utf8');
const router = readFileSync(join(root, 'src/components/hub/DecisionHub.astro'), 'utf8');

describe('SEO server-render regressions', () => {
  it('keeps a real H1 for LATAM canvas hubs before JavaScript runs', () => {
    expect(approved).toContain('data-hub-seo-title');
    expect(approved).toContain('ssrContent');
    expect(router).toContain('const ssrTitle =');
    expect(router).toContain('seoTitle={ssrTitle}');
  });
});
