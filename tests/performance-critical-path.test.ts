import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
const calculator = readFileSync(join(root, 'src/components/Calculator.astro'), 'utf8');
const astroConfig = readFileSync(join(root, 'astro.config.mjs'), 'utf8');

describe('mobile critical path', () => {
  it('loads one Google runtime on pageview and keeps Ads conversion support lazy', () => {
    const runtimeTags = layout.match(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js/g) ?? [];
    expect(runtimeTags).toHaveLength(1);
    expect(layout).toContain("gtag('config', 'G-789KMTKWX2'");
    expect(layout).toContain("gtag('config', 'AW-18096606872', { send_page_view: false })");
    expect(layout).not.toContain("gtag('config', 'AW-18096606872');");
    expect(layout).toContain('ensureGoogleAdsTag();');
  });

  it('does not download the formula map on load or unrelated page interaction', () => {
    expect(calculator).toContain("import('../lib/formula-loader-map')");
    expect(calculator).toContain("form.addEventListener('input', getFormulaReady");
    expect(calculator).toContain('await getFormulaReady()');
    expect(calculator).not.toContain("window.addEventListener('load', onLoad");
    expect(astroConfig).not.toContain("return 'formula-map'");
  });

  it('inlines the current Home hero geometry needed by the LCP', () => {
    expect(layout).toContain('body[data-page-type="home"] .hc-home .hero h1');
    expect(layout).toContain('body[data-page-type="home"] .hc-home .hero-copy > p');
  });
});
