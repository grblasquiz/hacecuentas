/** Dividir cuenta con propina */
export interface Inputs { totalCuenta: number; personas: number; propinaPct: number; }
export interface Outputs { porPersona: number; propina: number; totalConPropina: number; mensaje: string; _chart?: any; _insight?: any; }

export function propinaDividirCuenta(i: Inputs): Outputs {
  const total = Number(i.totalCuenta);
  const personas = Number(i.personas) || 1;
  const pct = Number(i.propinaPct) || 10;
  if (!total || total <= 0) throw new Error('Ingresá el total de la cuenta');

  const propina = Math.round(total * pct / 100);
  const totalConPropina = total + propina;
  const porPersona = Math.ceil(totalConPropina / personas);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuenta', value: Math.round(total) },
      { label: 'Propina', value: propina },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalConPropina).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del total: cuenta más propina',
  };

  const _insight = {
    title: 'Cuánto pone cada uno',
    text: personas > 1
      ? `Entre **${personas} personas**, cada uno pone **$${porPersona.toLocaleString('es-AR')}**, propina del ${pct}% incluida. De ese total, $${propina.toLocaleString('es-AR')} son de propina (redondeamos hacia arriba para que la suma cubra la cuenta).`
      : `El total con ${pct}% de propina es **$${totalConPropina.toLocaleString('es-AR')}**, de los cuales **$${propina.toLocaleString('es-AR')}** son propina.`,
    tone: 'neutral' as const,
    icon: '🍽️',
  };

  return {
    porPersona, propina, totalConPropina,
    mensaje: `Cuenta: $${total.toLocaleString()} + ${pct}% propina ($${propina.toLocaleString()}) = $${totalConPropina.toLocaleString()}. Cada uno: $${porPersona.toLocaleString()}.`,
    _chart: chart,
    _insight,
  };
}