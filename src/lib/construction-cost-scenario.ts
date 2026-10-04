/** Inputs and arithmetic already used by CostoM2Experience; shared by SSR and browser. */
export const CONSTRUCTION_DEFAULTS = {
  category: 'estandar', zone: 'gba_sur', covered: 120, semi: 20,
  semiFactorPercent: 50, customUnitPrice: 0, contingencyPercent: 10, extras: 0,
};
export interface ConstructionInputs {
  covered: number | string;
  semi: number | string;
  semiFactorPercent: number | string;
  customUnitPrice: number | string;
  contingencyPercent: number | string;
  extras: number | string;
}
export interface ConstructionReference { ars: number; usd: number }
export function calculateConstructionScenario(input: ConstructionInputs, reference: ConstructionReference) {
  const num = (value: number | string) => Math.max(0, Number(value) || 0);
  const covered = num(input.covered), semi = num(input.semi);
  const semiFactor = Math.min(100, num(input.semiFactorPercent)) / 100;
  const area = covered + semi * semiFactor;
  const custom = num(input.customUnitPrice), unitArs = custom || reference.ars;
  const contingency = Math.min(50, num(input.contingencyPercent)) / 100;
  const extras = num(input.extras), work = unitArs * area;
  const subtotal = work + extras, total = subtotal * (1 + contingency);
  // Keep the existing client expressions and display contract, including custom-price mode.
  const low = (custom ? total : work * .85 + extras) * (1 + contingency);
  const high = (custom ? total : work * 1.15 + extras) * (1 + contingency);
  return { area, custom, unitArs, contingency, work, subtotal, total, low, high, referenceUsd: reference.usd };
}
export const constructionMoney = (n: number) => '$' + Math.round(n || 0).toLocaleString('es-AR');
export function constructionScenarioView(result: ReturnType<typeof calculateConstructionScenario>) {
  const { area, custom, unitArs, contingency, subtotal, total, low, high, referenceUsd } = result;
  return {
    total: constructionMoney(total), unit: constructionMoney(unitArs),
    area: area.toLocaleString('es-AR') + ' m²',
    usd: custom ? 'Cotización propia' : 'US$' + Math.round(referenceUsd * area).toLocaleString('es-AR'),
    range: custom ? 'Total configurado' : constructionMoney(low) + ' – ' + constructionMoney(high),
    plan: 'Contingencia ' + Math.round(contingency * 100) + '%',
    verdict: '<b>' + constructionMoney(subtotal) + ' antes de contingencia; ' + constructionMoney(total) + ' con reserva.</b><br><i>⚠️ ' + (custom ? 'Usamos tu cotización local.' : 'La referencia editorial se muestra como rango ±15%.') + ' No incluye terreno ni lo que no cargues en otros costos.</i>',
    measure: area.toLocaleString('es-AR') + ' m² computables',
  };
}
