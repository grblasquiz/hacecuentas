import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const baseline = readFileSync(join(root, 'src/components/AccessibilityBaseline.astro'), 'utf8');
const home = readFileSync(join(root, 'src/pages/index.astro'), 'utf8');
const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
const currentTools = JSON.parse(readFileSync(join(root, 'src/lib/current-tools-index.json'), 'utf8'));

describe('core accessibility baseline', () => {
  it('models expandable search inputs as comboboxes', () => {
    expect(home).toContain('type="search" role="combobox"');
    expect(home).toContain('aria-haspopup="listbox"');
    expect(baseline).toContain("input[type=\"search\"][aria-expanded]");
  });

  it('labels generated controls from their visible labels', () => {
    expect(baseline).toContain(".calc-field, .input-group");
    expect(baseline).toContain("label.setAttribute('for', control.id)");
    expect(baseline).toContain("control.setAttribute('aria-labelledby'");
    expect(baseline).toContain("control.getAttribute('placeholder')");
  });

  it('enforces shared touch, type and contrast baselines', () => {
    expect(baseline).toContain('min-height: 44px');
    expect(baseline).toContain('font-size: 0.75rem !important');
    expect(baseline).toContain('background-color: #78480b !important');
    expect(layout).toContain('<AccessibilityBaseline />');
    expect(baseline).toContain('.result-box :where(small, span)');
    expect(baseline).toContain('.moments .section-title p');
    expect(baseline).toContain('text-decoration: underline');
  });

  it('applies the phase 3 baseline to the complete canonical hub catalog', () => {
    expect(currentTools.length).toBeGreaterThanOrEqual(600);
    expect(layout).toContain("(isRegisteredHub ? 'hub' : undefined)");
    expect(baseline).toContain("document.body.dataset.pageType === 'hub'");
    expect(baseline).toContain('data-hc-hub-announcer');
    expect(baseline).toContain('contain-intrinsic-size: auto 520px');
    expect(baseline).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
