import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

// Exercise the script actually shipped by Astro, including handlers and invalid-state UI.
const component = readFileSync(new URL('../src/components/generated/CuantoValeNegocioExperience.astro', import.meta.url), 'utf8');
const script = component.match(/<script is:inline>([\s\S]*?)<\/script>/)![1];
function mount() {
  const ids: Record<string, any> = {};
  for (const id of ['profit', 'debt', 'low', 'mid', 'high', 'factor-note', 'valuation-error', 'valuation-values']) {
    ids[id] = { value: id === 'profit' ? '9600000' : id === 'debt' ? '1500000' : '', textContent: '', hidden: false, attrs: {}, setAttribute(k: string, v: string) { this.attrs[k] = v; } };
  }
  const buttons = ['1.2', '.8', '.85', '1.1'].map((score, i) => {
    const classes = new Set(i === 0 ? ['on'] : []);
    return { dataset: { score }, attrs: { 'aria-pressed': String(i === 0) } as Record<string, string>, classList: { toggle(k: string) { if (classes.has(k)) classes.delete(k); else classes.add(k); }, contains: (k: string) => classes.has(k) }, setAttribute(k: string, v: string) { this.attrs[k] = v; }, onclick: undefined as any };
  });
  const root = { matches: () => true, querySelector: (selector: string) => ids[selector.slice(1)], querySelectorAll: (selector: string) => selector === '[data-score]' ? buttons : selector === '[data-score].on' ? buttons.filter(b => b.classList.contains('on')) : [ids.profit, ids.debt] };
  runInNewContext(script, { document: { currentScript: { previousElementSibling: root } } });
  return { ids, buttons, values: () => ['low', 'mid', 'high'].map(k => ids[k].textContent), enter(profit: string, debt = '1500000') { ids.profit.value = profit; ids.debt.value = debt; ids.profit.oninput(); } };
}
describe('published business valuation UI contract', () => {
  it('preserves initial values and removes recurrence without changing coefficients', () => {
    const ui = mount();
    expect(ui.values()).toEqual(['$ 21.540.000', '$ 33.060.000', '$ 44.580.000']);
    ui.buttons[0].onclick();
    expect(ui.values()).toEqual(['$ 17.700.000', '$ 27.300.000', '$ 36.900.000']);
    expect(ui.buttons[0].attrs['aria-pressed']).toBe('false');
    expect(ui.ids['factor-note'].textContent).toContain('1.');
  });
  it('compounds the four existing factors and reports their active state', () => {
    const ui = mount();
    ui.buttons.slice(1).forEach(b => b.onclick());
    expect(ui.values()).toEqual(['$ 15.733.920', '$ 24.350.880', '$ 32.967.840']);
    expect(ui.ids['factor-note'].textContent).toContain('0,8976');
    expect(ui.buttons.every(b => b.attrs['aria-pressed'] === 'true')).toBe(true);
  });
  it('preserves net cash, zero and negative profit, and the existing floor', () => {
    const ui = mount();
    ui.enter('1000000', '-500000');
    expect(ui.values()).toEqual(['$ 2.900.000', '$ 4.100.000', '$ 5.300.000']);
    ui.enter('1000000', '5000000');
    expect(ui.values()).toEqual(['$ 0', '$ 0', '$ 0']);
    ui.enter('0', '0'); expect(ui.values()).toEqual(['$ 0', '$ 0', '$ 0']);
    ui.enter('-1000000', '0'); expect(ui.values()).toEqual(['$ 0', '$ 0', '$ 0']);
    expect(ui.ids['valuation-error'].hidden).toBe(true);
  });
  it.each(['', ' ', 'NaN', 'Infinity', '-Infinity', '1e308'])('clears stale output for invalid or overflowing profit %j and recovers', bad => {
    const ui = mount(); ui.enter(bad);
    expect(ui.values()).toEqual(['—', '—', '—']);
    expect(ui.ids['valuation-values'].hidden).toBe(true);
    expect(ui.ids['valuation-error'].hidden).toBe(false);
    ui.enter('9600000');
    expect(ui.values()[1]).toBe('$ 33.060.000');
    expect(ui.ids['valuation-values'].hidden).toBe(false);
    expect(ui.ids.profit.attrs['aria-invalid']).toBe('false');
  });
  it.each(['', 'NaN', 'Infinity', '-Infinity'])('rejects invalid debt %j without retaining a result', bad => {
    const ui = mount(); ui.enter('9600000', bad);
    expect(ui.values()).toEqual(['—', '—', '—']);
    expect(ui.ids.debt.attrs['aria-invalid']).toBe('true');
    expect(ui.ids['valuation-values'].hidden).toBe(true);
  });
});
