/** Cuánto ahorrar por mes para llegar a una meta */
export interface Inputs { montoMeta: number; plazoMeses: number; tasaAnual: number; ahorroInicial?: number; }
export interface Outputs {
  aporteMensual: number;
  totalAportado: number;
  interesesGanados: number;
  montoFinal: number;
  tasaMensual: number;
  _chart?: any;
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

  return {
    aporteMensual: Math.round(aporteMensual),
    totalAportado: totalAportadoR,
    interesesGanados: interesesR,
    montoFinal: Math.round(meta),
    tasaMensual: Number((tasaMensual * 100).toFixed(2)),
    _chart: chart,
  };
}
