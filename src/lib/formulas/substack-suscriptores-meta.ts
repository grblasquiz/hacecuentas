/** Substack Suscriptores Meta */
export interface Inputs { metaMensual: number; precioMensual: number; pctAnual: number; }
export interface Outputs { suscriptoresNecesarios: string; ingresoBruto: string; comisionFees: string; ingresoNeto: string; _chart?: any; _insight?: any; }

export function substackSuscriptoresMeta(i: Inputs): Outputs {
  const meta = Number(i.metaMensual);
  const pm = Number(i.precioMensual);
  const pctA = Number(i.pctAnual);
  if (meta <= 0 || pm < 5) throw new Error('Valores inválidos');
  const pctM = 100 - pctA;
  const precioAnualMensualizado = pm * 0.84;
  const precioEfectivo = (pm * pctM / 100) + (precioAnualMensualizado * pctA / 100);
  // Stripe cobra USD 0,30 por transacción: 12 cobros/año en mensual, 1 en anual.
  const cargoFijoMensualizado = (pctM / 100) * 0.30 + (pctA / 100) * (0.30 / 12);
  const netoSub = precioEfectivo * 0.9 - (precioEfectivo * 0.029 + cargoFijoMensualizado);
  const subs = Math.ceil(meta / netoSub);
  const bruto = subs * precioEfectivo;
  const feesCom = bruto - subs * netoSub;
  const ingresoNetoNum = subs * netoSub;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ingreso neto', value: ingresoNetoNum },
      { label: 'Comisiones (Substack + Stripe)', value: feesCom },
    ],
    prefix: '$',
    centerValue: '$' + bruto.toFixed(2),
    centerLabel: 'Bruto/mes',
    ariaLabel: 'Composición del ingreso bruto mensual: ingreso neto más comisiones de Substack y Stripe',
  };
  const pctFees = bruto > 0 ? (feesCom / bruto) * 100 : 0;
  const insight = {
    title: 'Lo que te comen las comisiones',
    text: `Para embolsar **$${ingresoNetoNum.toFixed(0)}/mes** necesitás **${subs.toLocaleString('es-AR')} suscriptores pagos** a $${pm}/mes. Facturás **$${bruto.toFixed(0)} bruto**, pero Substack (10%) + Stripe (~3%) se llevan **$${feesCom.toFixed(0)} (${pctFees.toFixed(1)}%)**: presupuestá esa mordida antes de fijar tu meta.`,
    tone: 'warn',
    icon: '📨',
  };
  return {
    suscriptoresNecesarios: `${subs.toLocaleString('es-AR')} subs pagos`,
    ingresoBruto: `$${bruto.toFixed(2)} USD/mes`,
    comisionFees: `$${feesCom.toFixed(2)} USD (Substack 10% + Stripe 3%)`,
    ingresoNeto: `$${(subs * netoSub).toFixed(2)} USD`,
    _chart: chart,
    _insight: insight,
  };
}
