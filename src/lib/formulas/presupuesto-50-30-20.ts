/** Distribución sueldo regla 50/30/20 */

export interface Inputs {
  ingresoMensual: number;
  moneda?: string;
  ingresosExtra?: number;
}

export interface Outputs {
  necesidades50: number;
  deseos30: number;
  ahorro20: number;
  necesidades: number;
  deseos: number;
  ahorro: number;
  ahorroAnual: number;
  detalle: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function presupuesto503020(i: Inputs): Outputs {
  const ingresoBase = Number(i.ingresoMensual);
  const extras = Number(i.ingresosExtra) || 0;
  const ingreso = ingresoBase + extras;
  const moneda = String(i.moneda || '$');

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso mensual');

  const necesidades50 = ingreso * 0.50;
  const deseos30 = ingreso * 0.30;
  const ahorro20 = ingreso * 0.20;
  const ahorroAnual = ahorro20 * 12;

  const detalle = `Total ingresos: ${moneda}${Math.round(ingreso).toLocaleString()}${extras > 0 ? ` (sueldo ${moneda}${Math.round(ingresoBase).toLocaleString()} + extras ${moneda}${Math.round(extras).toLocaleString()})` : ''}. Distribución: 50% necesidades = ${moneda}${Math.round(necesidades50).toLocaleString()} | 30% deseos = ${moneda}${Math.round(deseos30).toLocaleString()} | 20% ahorro = ${moneda}${Math.round(ahorro20).toLocaleString()}. En un año, el ahorro acumulado sería ${moneda}${Math.round(ahorroAnual).toLocaleString()}.`;

  const formula = `${moneda}${ingreso.toLocaleString()} → 50%: ${moneda}${Math.round(necesidades50).toLocaleString()} | 30%: ${moneda}${Math.round(deseos30).toLocaleString()} | 20%: ${moneda}${Math.round(ahorro20).toLocaleString()}`;
  const explicacion = `Ingreso mensual: ${moneda}${ingreso.toLocaleString()}. **50% necesidades**: ${moneda}${Math.round(necesidades50).toLocaleString()} (alquiler, servicios, comida, transporte, salud). **30% deseos**: ${moneda}${Math.round(deseos30).toLocaleString()} (entretenimiento, restaurantes, ropa, suscripciones). **20% ahorro/inversión**: ${moneda}${Math.round(ahorro20).toLocaleString()}/mes = ${moneda}${Math.round(ahorroAnual).toLocaleString()}/año. Si no llegás al 50/30/20, empezá con 60/20/20 o 70/20/10 y ajustá gradualmente.`;

  const rNec = Math.round(necesidades50);
  const rDes = Math.round(deseos30);
  const rAho = Math.round(ahorro20);
  const sumaSlices = rNec + rDes + rAho;
  const _insight = {
    title: 'Tu sueldo, repartido',
    text: `Con ${moneda}${Math.round(ingreso).toLocaleString()} al mes te corresponden **${moneda}${rNec.toLocaleString()}** para necesidades, **${moneda}${rDes.toLocaleString()}** para deseos y **${moneda}${rAho.toLocaleString()}** para ahorro. Si sostenés ese 20%, juntás **${moneda}${Math.round(ahorroAnual).toLocaleString()}** en un año.`,
    tone: 'good',
    icon: '💰',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Necesidades (50%)', value: rNec },
      { label: 'Deseos (30%)', value: rDes },
      { label: 'Ahorro (20%)', value: rAho },
    ],
    prefix: moneda,
    centerValue: moneda + sumaSlices.toLocaleString(),
    centerLabel: 'Ingreso mensual',
    ariaLabel: 'Distribución del ingreso mensual según la regla 50/30/20: necesidades, deseos y ahorro.',
  };

  return {
    necesidades50: rNec,
    deseos30: rDes,
    ahorro20: rAho,
    necesidades: rNec,
    deseos: rDes,
    ahorro: rAho,
    ahorroAnual: Math.round(ahorroAnual),
    detalle,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
