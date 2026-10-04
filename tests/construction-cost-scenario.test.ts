import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { CONSTRUCTION_DEFAULTS as defaults, calculateConstructionScenario as calculate, constructionScenarioView as view, constructionMoney as money } from '../src/lib/construction-cost-scenario';
import { M2, SHARES } from '../src/lib/hubs/costo-por-m2';

const reference = { ars: 1552000, usd: 1000 };
const source = readFileSync(new URL('../src/components/CostoM2Experience.astro', import.meta.url), 'utf8');
const script = source.match(/<script>\s*import[^;]+;([\s\S]*?)<\/script>/)![1];
function mount(input = defaults, costs = M2) {
  const values: Record<string, any> = {
    'm2-covered': input.covered, 'm2-semi': input.semi, 'm2-semi-factor': input.semiFactorPercent,
    'm2-custom': input.customUnitPrice, 'm2-contingency': input.contingencyPercent, 'm2-extra': input.extras, 'm2-zone': input.zone,
    'm2-reference-data': '',
  };
  const ids: Record<string, any> = {};
  for (const id of [...Object.keys(values), 'm2-total', 'm2-unit', 'm2-area', 'm2-usd', 'm2-monthly', 'm2-plan-label', 'm2-verdict', 'm2-detail-total', 'm2-update']) {
    ids[id] = { value: String(values[id] ?? ''), textContent: id === 'm2-reference-data' ? JSON.stringify({ COSTS: costs, defaults: input }) : '', innerHTML: '', listeners: {} as Record<string, () => void>, addEventListener(k: string, fn: () => void) { this.listeners[k] = fn; } };
  }
  const createButtons = () => Object.keys(costs).map(cat => ({ dataset: { cat, catCard: cat }, classList: { toggle() {} }, listeners: {} as Record<string, () => void>, addEventListener(k: string, fn: () => void) { this.listeners[k] = fn; }, querySelector: () => ({ textContent: '' }) }));
  const buttons = createButtons(), cards = createButtons();
  const shares = SHARES.map(s => ({ dataset: { m2Share: String(s.share) }, textContent: '' }));
  const measure = { textContent: '' };
  const events: any[] = [];
  const document = {
    getElementById: (id: string) => ids[id],
    querySelector: (s: string) => s === '.measure' ? measure : { scrollIntoView() {} },
    querySelectorAll: (s: string) => s === '[data-m2-share]' ? shares : s === '[data-cat]' ? buttons : s === '[data-cat-card]' ? cards : Object.keys(values).filter(k => k !== 'm2-reference-data').map(k => ids[k]),
  };
  runInNewContext(script, { document, calculateConstructionScenario: calculate, constructionScenarioView: view, constructionMoney: money, window: { dataLayer: { push: (e: any) => events.push(e) } }, setTimeout() {} });
  return { ids, buttons, cards, shares, events, measure };
}
function assertServerClient(input = defaults, costs = M2) {
  const result = calculate(input, costs[input.category][input.zone]), server = view(result), ui = mount(input, costs);
  expect(ui.ids['m2-total'].textContent).toBe(server.total);
  expect(ui.ids['m2-detail-total'].textContent).toBe(server.total);
  expect(ui.ids['m2-unit'].textContent).toBe(server.unit);
  expect(ui.ids['m2-area'].textContent).toBe(server.area);
  expect(ui.ids['m2-usd'].textContent).toBe(server.usd);
  expect(ui.ids['m2-monthly'].textContent).toBe(server.range);
  expect(ui.ids['m2-verdict'].innerHTML).toBe(server.verdict);
  expect(ui.measure.textContent).toBe(server.measure);
  expect(ui.shares.map(s => s.textContent)).toEqual(SHARES.map(s => money(result.work * s.share)));
  return ui;
}
describe('construction initial SSR/client agreement without changing the existing cost model', () => {
  it('calculates the current default from the reference instead of a stale HTML price', () => {
    const result = calculate(defaults, reference);
    expect(result).toMatchObject({ area: 130, unitArs: 1552000, work: 201760000, subtotal: 201760000 });
    expect(result.total).toBeCloseTo(221936000, 5);
    expect(view(result)).toMatchObject({ total: '$221.936.000', unit: '$1.552.000', area: '130 m²', usd: 'US$130.000', range: '$188.645.600 – $255.226.400', plan: 'Contingencia 10%' });
    assertServerClient();
  });
  it('uses a changed exchange-rate reference for SSR and client equally', () => {
    const costs = structuredClone(M2); costs.estandar.gba_sur = { ars: 1400000, usd: 1000 };
    expect(view(calculate(defaults, costs.estandar.gba_sur)).total).toBe('$200.200.000');
    assertServerClient(defaults, costs);
  });
  it('keeps optional local quotation and its configured-total display', () => {
    const input = { ...defaults, customUnitPrice: 2000000, extras: 5000000, contingencyPercent: 20 };
    const result = calculate(input, reference);
    expect(result.total).toBe(318000000);
    expect(view(result)).toMatchObject({ total: '$318.000.000', unit: '$2.000.000', usd: 'Cotización propia', range: 'Total configurado' });
    assertServerClient(input);
  });
  it('uses an editable semi-covered percentage, extras and reserve in their existing order', () => {
    const input = { ...defaults, semiFactorPercent: 75, extras: 3000000, contingencyPercent: 20 };
    expect(calculate(input, reference)).toMatchObject({ area: 135, work: 209520000, subtotal: 212520000, total: 255024000 });
    assertServerClient(input);
  });
  it('preserves input clamps and rounding', () => {
    expect(calculate({ ...defaults, covered: -20, semi: 10, semiFactorPercent: 150, extras: -100, contingencyPercent: 60 }, reference)).toMatchObject({ area: 10, total: 23280000, contingency: .5 });
    expect(view(calculate({ ...defaults, covered: 1, semi: 0, contingencyPercent: 0 }, { ars: 100.5, usd: 1 })).total).toBe('$101');
  });
  it('agrees for every actual category and zone, with varied inputs', () => {
    for (const category of Object.keys(M2)) for (const zone of Object.keys(M2[category])) {
      assertServerClient({ ...defaults, category, zone, covered: 85.5, semi: 32, semiFactorPercent: 65, extras: 1750000, contingencyPercent: 17 });
    }
  });
  it('retains category/input handlers and the existing calculator-submit event payload', () => {
    const ui = assertServerClient();
    ui.ids['m2-update'].listeners.click();
    expect(ui.events[0]).toEqual({ event: 'calculator_submit', calculator: 'costo_m2_construccion', category: 'estandar', uses_custom_price: false });
    ui.buttons.find(b => b.dataset.cat === 'premium')!.listeners.click();
    expect(ui.ids['m2-unit'].textContent).toBe(money(M2.premium.gba_sur.ars));
    ui.cards.find(b => b.dataset.catCard === 'alta')!.listeners.click();
    expect(ui.ids['m2-unit'].textContent).toBe(money(M2.alta.gba_sur.ars));
    ui.buttons.find(b => b.dataset.cat === 'premium')!.listeners.click();
    ui.ids['m2-custom'].value = '2000000'; ui.ids['m2-custom'].listeners.input();
    ui.ids['m2-update'].listeners.click();
    expect(ui.events[1]).toEqual({ event: 'calculator_submit', calculator: 'costo_m2_construccion', category: 'premium', uses_custom_price: true });
    expect(ui.ids['m2-total'].textContent).toBe('$286.000.000');
  });
});
