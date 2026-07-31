import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const baseline = readFileSync(join(root, 'src/components/AccessibilityBaseline.astro'), 'utf8');
const home = readFileSync(join(root, 'src/pages/index.astro'), 'utf8');
const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');

describe('core accessibility baseline', () => {
  it('models expandable search inputs as comboboxes', () => {
    expect(home).toContain('type="search" role="combobox"');
    expect(home).toContain('aria-haspopup="listbox"');
    expect(baseline).toContain("input[type=\"search\"][aria-expanded]");
  });

  it('labels generated controls from their visible labels', () => {
    expect(baseline).toContain("control.closest('.field, .smonth, .input-wrap, .form-group')");
    expect(baseline).toContain("label.setAttribute('for', control.id)");
  });

  it('enforces shared touch, type and contrast baselines', () => {
    expect(baseline).toContain('min-height: 44px');
    expect(baseline).toContain('font-size: 0.75rem !important');
    expect(baseline).toContain('background-color: #78480b !important');
    expect(layout).toContain('<AccessibilityBaseline />');
  });
});
