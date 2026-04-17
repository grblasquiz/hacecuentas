/** Impuestos 1099 contractor USA */
export interface Inputs { ingresoAnualBruto: number; gastosDeducibles: number; estadoResidencia: string; estadoCivil: string; }
export interface Outputs { netoAnual: number; selfEmploymentTax: number; federalTax: number; stateTax: number; quarterlyPayment: number; }
export function impuestos1099ContractorUsa(i: Inputs): Outputs {
  const bruto = Number(i.ingresoAnualBruto);
  const gastos = Number(i.gastosDeducibles);
  const est = String(i.estadoResidencia || 'other');
  const civil = String(i.estadoCivil || 'single');
  if (bruto < 0) throw new Error('Ingreso inválido');
  const netEarnings = Math.max(0, bruto - gastos);
  const seBase = netEarnings * 0.9235;
  const seTax = seBase * 0.153;
  const seDeduction = seTax / 2;
  const agi = netEarnings - seDeduction;
  const stdDeduction = civil === 'married' ? 29200 : 14600;
  const taxable = Math.max(0, agi - stdDeduction);
  const brackets: [number, number][] = civil === 'married'
    ? [[23200, 0.10], [94300, 0.12], [201050, 0.22], [383900, 0.24], [487450, 0.32], [731200, 0.35], [Infinity, 0.37]]
    : [[11600, 0.10], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35], [Infinity, 0.37]];
  let fed = 0, prev = 0;
  for (const [limit, rate] of brackets) {
    if (taxable > prev) {
      const t = Math.min(taxable, limit) - prev;
      fed += t * rate;
      prev = limit;
      if (taxable <= limit) break;
    }
  }
  const stateRates: Record<string, number> = { ca: 0.09, ny: 0.06, tx: 0, fl: 0, other: 0.05 };
  const stateTax = taxable * (stateRates[est] || 0.05);
  const totalTax = seTax + fed + stateTax;
  const neto = bruto - gastos - totalTax;
  return {
    netoAnual: Math.round(neto),
    selfEmploymentTax: Math.round(seTax),
    federalTax: Math.round(fed),
    stateTax: Math.round(stateTax),
    quarterlyPayment: Math.round(totalTax / 4)
  };
}
