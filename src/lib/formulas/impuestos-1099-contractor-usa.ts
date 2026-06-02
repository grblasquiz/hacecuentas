/** Impuestos 1099 contractor USA */
export interface Inputs { ingresoAnualBruto: number; gastosDeducibles: number; estadoResidencia: string; estadoCivil: string; }
export interface Outputs { netoAnual: number; selfEmploymentTax: number; federalTax: number; stateTax: number; quarterlyPayment: number; _insight?: any; _chart?: any; }
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

  const netoR = Math.round(neto);
  const seR = Math.round(seTax);
  const fedR = Math.round(fed);
  const stR = Math.round(stateTax);
  const totalTaxR = Math.round(totalTax);
  const quarterR = Math.round(totalTax / 4);
  const fmtUSD = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
  const effRate = bruto > 0 ? (totalTax / bruto) * 100 : 0;
  const tone = effRate >= 30 ? 'warn' : effRate >= 20 ? 'neutral' : 'good';

  const _insight = {
    title: 'Tu carga impositiva como 1099',
    text: `Sobre **${fmtUSD(bruto)}** de ingreso bruto pagás **${fmtUSD(totalTaxR)}** en impuestos `
      + `(SE, federal y estatal): una presión efectiva del **${effRate.toFixed(1)}%**. `
      + `Te quedan **${fmtUSD(netoR)}** netos. Reservá **${fmtUSD(quarterR)}** cada trimestre para los pagos estimados al IRS.`,
    tone,
    icon: '🇺🇸'
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Ingreso neto (te queda)', value: netoR },
      { label: 'Gastos deducibles', value: Math.round(gastos) },
      { label: 'Self-employment tax', value: seR },
      { label: 'Impuesto federal', value: fedR },
      { label: 'Impuesto estatal', value: stR }
    ],
    prefix: '$',
    centerValue: fmtUSD(bruto),
    centerLabel: 'Ingreso bruto',
    ariaLabel: `Distribución del ingreso bruto de ${fmtUSD(bruto)}: ${fmtUSD(netoR)} netos, ${fmtUSD(Math.round(gastos))} en gastos, y ${fmtUSD(totalTaxR)} en impuestos (self-employment, federal y estatal).`
  };

  return {
    netoAnual: netoR,
    selfEmploymentTax: seR,
    federalTax: fedR,
    stateTax: stR,
    quarterlyPayment: quarterR,
    _insight,
    _chart
  };
}
