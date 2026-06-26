/**
 * Días sin fumar: ahorro económico y proyección.
 * cigarrillosEvitados = diasSinFumar × cigarrillosPorDia
 * atadosEvitados = cigarrillosEvitados / cigarrillosPorAtado
 * plataAhorrada = atadosEvitados × precioAtado
 * proyeccionAnual = (cigarrillosPorDia / cigarrillosPorAtado) × precioAtado × 365
 * Los hitos de salud (20 min, 24 h, 1 año, etc.) son información pública estándar
 * de la OMS / American Cancer Society — se muestran como referencia, no diagnóstico.
 */
export interface Inputs {
  diasSinFumar: number;
  cigarrillosPorDia: number;
  precioAtado: number;
  cigarrillosPorAtado?: number;
  __lang?: string;
}
export interface Outputs {
  plataAhorrada: number;
  cigarrillosEvitados: number;
  proyeccionAnualAhorro: number;
  diasSinFumar: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function diasSinFumarAhorroSalud(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá los días sin fumar, los cigarrillos por día y el precio del atado',
      insightTitle: 'Lo que ganaste',
      chartAria: 'Plata ahorrada acumulada frente a la proyección de ahorro anual.',
      ahorrado: 'Ahorrado hasta hoy',
      restante: 'Resto del año',
    },
    en: {
      errorRequired: 'Enter days smoke-free, cigarettes per day and pack price',
      insightTitle: 'What you gained',
      chartAria: 'Accumulated money saved versus projected yearly savings.',
      ahorrado: 'Saved so far',
      restante: 'Rest of the year',
    },
  } as const)[__lang];

  const dias = Number(i.diasSinFumar);
  const cigPorDia = Number(i.cigarrillosPorDia);
  const precioAtado = Number(i.precioAtado);
  const cigPorAtado = i.cigarrillosPorAtado ? Number(i.cigarrillosPorAtado) : 20;
  if (!dias || !cigPorDia || !precioAtado || dias <= 0 || cigPorDia <= 0 || precioAtado <= 0) {
    throw new Error(T.errorRequired);
  }

  const cigarrillosEvitados = dias * cigPorDia;
  const atadosEvitados = cigarrillosEvitados / cigPorAtado;
  const plataAhorrada = atadosEvitados * precioAtado;
  const proyeccionAnual = (cigPorDia / cigPorAtado) * precioAtado * 365;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const ahorrado = Math.round(plataAhorrada);
  const anual = Math.round(proyeccionAnual);
  const restante = Math.max(0, anual - ahorrado);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.ahorrado, value: Math.min(ahorrado, anual) },
      { label: T.restante, value: restante },
    ],
    prefix: '$',
    centerValue: '$' + ahorrado.toLocaleString(locale),
    centerLabel: T.ahorrado,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `In **${dias} days** smoke-free you avoided **${Math.round(cigarrillosEvitados).toLocaleString(locale)} cigarettes** and saved **$${ahorrado.toLocaleString(locale)}**. Over a full year that's about **$${anual.toLocaleString(locale)}**.`
      : `En **${dias} días** sin fumar evitaste **${Math.round(cigarrillosEvitados).toLocaleString(locale)} cigarrillos** y ahorraste **$${ahorrado.toLocaleString(locale)}**. En un año entero serían unos **$${anual.toLocaleString(locale)}**.`,
    tone: 'good' as const,
    icon: '🚭',
  };

  return {
    plataAhorrada: ahorrado,
    cigarrillosEvitados: Math.round(cigarrillosEvitados),
    proyeccionAnualAhorro: anual,
    diasSinFumar: Math.round(dias),
    formula: `$${ahorrado} = (${cigarrillosEvitados} cig ÷ ${cigPorAtado}) × $${precioAtado}`,
    _chart: chart,
    _insight: insight,
  };
}
