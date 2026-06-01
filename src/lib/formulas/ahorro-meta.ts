/** Cuánto ahorrar por mes para llegar a una meta */
export interface Inputs { montoMeta: number; plazoMeses: number; tasaAnual: number; ahorroInicial?: number; }
export interface Outputs {
  aporteMensual: number;
  totalAportado: number;
  interesesGanados: number;
  montoFinal: number;
  tasaMensual: number;
  _chart?: any;
  _insight?: any;
}

export function ahorroMeta(i: Inputs): Outputs {
  const meta = Number(i.montoMeta);
  const meses = Number(i.plazoMeses);
  const tasaAnual = Number(i.tasaAnual);
  const inicial = Number(i.ahorroInicial) || 0;
  if (!meta || meta <= 0) throw new Error('Ingresá la meta de ahorro');
  if (!meses || meses <= 0) throw new Error('Ingresá el plazo en meses');
  if (tasaAnual < 0) throw new Error('La tasa no puede ser negativa');

  // Tasa mensual efectiva a partir de la TNA (capitalización mensual)
  const tasaMensual = tasaAnual / 100 / 12;

  // Valor futuro del capital inicial
  const vfInicial = inicial * Math.pow(1 + tasaMensual, meses);

  // Monto que falta acumular con aportes mensuales
  const faltante = meta - vfInicial;

  let aporteMensual = 0;
  if (faltante > 0) {
    if (tasaMensual === 0) {
      aporteMensual = faltante / meses;
    } else {
      // VF serie de aportes = aporte × [((1+i)^n - 1) / i]
      const factor = (Math.pow(1 + tasaMensual, meses) - 1) / tasaMensual;
      aporteMensual = faltante / factor;
    }
  }

  const totalAportado = aporteMensual * meses;
  const intereses = meta - totalAportado - inicial;

  const totalAportadoR = Math.round(totalAportado);
  const interesesR = Math.round(Math.max(0, intereses));
  const inicialR = Math.round(inicial);

  const slices = [
    { label: 'Aportes mensuales', value: totalAportadoR },
    { label: 'Intereses ganados', value: interesesR },
  ];
  if (inicialR > 0) slices.push({ label: 'Ahorro inicial', value: inicialR });

  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(meta).toLocaleString('es-AR'),
    centerLabel: 'Meta',
    ariaLabel: 'Composición de la meta de ahorro: aportes mensuales, intereses ganados y ahorro inicial.',
  };

  const interesPct = meta > 0 ? (interesesR / meta) * 100 : 0;
  const insight = {
    title: 'Cómo se arma tu meta',
    text: interesesR > 0
      ? `Ahorrando **$${Math.round(aporteMensual).toLocaleString('es-AR')}/mes** durante **${meses} meses**, los intereses aportan **$${interesesR.toLocaleString('es-AR')}** (el **${interesPct.toFixed(0)}%** de la meta) y vos ponés el resto. A mayor plazo, mayor es ese empujón del interés compuesto.`
      : `Para juntar **$${Math.round(meta).toLocaleString('es-AR')}** en **${meses} meses** necesitás aportar **$${Math.round(aporteMensual).toLocaleString('es-AR')}/mes**. Con tasa 0% todo sale de tu bolsillo: una tasa positiva bajaría la cuota.`,
    tone: 'neutral' as const,
    icon: '🎯',
  };

  return {
    aporteMensual: Math.round(aporteMensual),
    totalAportado: totalAportadoR,
    interesesGanados: interesesR,
    montoFinal: Math.round(meta),
    tasaMensual: Number((tasaMensual * 100).toFixed(2)),
    _chart: chart,
    _insight: insight,
  };
}
