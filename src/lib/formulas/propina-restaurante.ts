/** Calculadora de propina en restaurante */
export interface Inputs {
  totalCuenta: number;
  porcentajePropina: string;
  propinaCustom?: number;
  cantidadPersonas?: number;
}
export interface Outputs {
  montoPropina: number;
  totalConPropina: number;
  porPersona: number;
  _chart?: any;
  _insight?: any;
}

export function propinaRestaurante(i: Inputs): Outputs {
  const cuenta = Number(i.totalCuenta);
  const personas = Number(i.cantidadPersonas) || 1;

  if (!cuenta || cuenta <= 0) throw new Error('Ingresá el total de la cuenta');
  if (personas < 1) throw new Error('Mínimo 1 persona');

  let pct: number;
  if (i.porcentajePropina === 'custom') {
    pct = Number(i.propinaCustom) || 0;
  } else {
    pct = (Number.isFinite(Number(i.porcentajePropina)) ? Number(i.porcentajePropina) : 10);
  }

  if (pct < 0 || pct > 100) throw new Error('Porcentaje de propina inválido');

  const montoPropina = cuenta * (pct / 100);
  const totalConPropina = cuenta + montoPropina;
  const porPersona = totalConPropina / personas;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuenta', value: Math.round(cuenta) },
      { label: 'Propina', value: Math.round(montoPropina) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalConPropina).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del total: cuenta más propina',
  };

  const fmtAR = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const pctTxt = Number.isInteger(pct) ? `${pct}` : pct.toFixed(1);
  const _insight = {
    title: 'Tu propina y el total',
    text: personas > 1
      ? `Con **${pctTxt}%** de propina sumás **${fmtAR(montoPropina)}** a la cuenta. El total queda en **${fmtAR(totalConPropina)}**, o **${fmtAR(porPersona)}** por persona entre ${personas}.`
      : `Con **${pctTxt}%** de propina sumás **${fmtAR(montoPropina)}** a la cuenta, llevando el total a **${fmtAR(totalConPropina)}**.`,
    tone: (pct >= 18 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '🍽️',
  };

  return {
    montoPropina: Math.round(montoPropina),
    totalConPropina: Math.round(totalConPropina),
    porPersona: Math.round(porPersona),
    _chart: chart,
    _insight,
  };
}
