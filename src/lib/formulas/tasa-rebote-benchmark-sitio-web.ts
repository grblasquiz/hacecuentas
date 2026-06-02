/** Tasa de rebote (bounce rate) con benchmark por tipo de sitio */

export interface Inputs {
  sesionesRebote: number;
  sesionesTotales: number;
  tipoSitio: string;
}

export interface Outputs {
  tasaRebote: number;
  benchmark: string;
  diagnostico: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const benchmarks: Record<string, { min: number; max: number; label: string }> = {
  ecommerce: { min: 20, max: 45, label: 'E-commerce' },
  saas: { min: 30, max: 55, label: 'SaaS / Software' },
  blog: { min: 65, max: 90, label: 'Blog / Contenido' },
  landing: { min: 60, max: 90, label: 'Landing page' },
  portal: { min: 40, max: 60, label: 'Portal / Noticias' },
  servicios: { min: 25, max: 55, label: 'Servicios / Brochure' },
  otro: { min: 40, max: 60, label: 'General' },
};

export function tasaReboteBenchmarkSitioWeb(i: Inputs): Outputs {
  const rebotes = Number(i.sesionesRebote);
  const total = Number(i.sesionesTotales);
  const tipo = String(i.tipoSitio || 'otro');

  if (isNaN(rebotes) || rebotes < 0) throw new Error('Ingresá las sesiones con rebote');
  if (isNaN(total) || total <= 0) throw new Error('Ingresá las sesiones totales');
  if (rebotes > total) throw new Error('Los rebotes no pueden superar las sesiones totales');

  const tasaRebote = (rebotes / total) * 100;
  const bench = benchmarks[tipo] || benchmarks.otro;
  const benchmark = `${bench.label}: ${bench.min}-${bench.max}%`;

  let diagnostico: string;
  if (tasaRebote < bench.min) {
    diagnostico = `Tu tasa de rebote (${tasaRebote.toFixed(1)}%) está por debajo del benchmark ${bench.label} (${bench.min}-${bench.max}%). ` +
      'Excelente engagement. Verificá que no sea un error de tracking (bounce rate < 20% es sospechoso).';
  } else if (tasaRebote <= bench.max) {
    diagnostico = `Tu tasa de rebote (${tasaRebote.toFixed(1)}%) está dentro del rango normal para ${bench.label} (${bench.min}-${bench.max}%). ` +
      'Buen engagement. Siempre hay margen de mejora.';
  } else {
    diagnostico = `Tu tasa de rebote (${tasaRebote.toFixed(1)}%) está por encima del benchmark ${bench.label} (${bench.min}-${bench.max}%). ` +
      'Revisá velocidad de carga, relevancia del contenido y experiencia mobile.';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `${fmt.format(rebotes)} rebotes de ${fmt.format(total)} sesiones = ${tasaRebote.toFixed(1)}% tasa de rebote. ` +
    `Benchmark ${bench.label}: ${bench.min}-${bench.max}%. ` +
    `Sesiones con engagement: ${fmt.format(total - rebotes)} (${(100 - tasaRebote).toFixed(1)}%).`;

  const tasaR = Number(tasaRebote.toFixed(1));
  const engagement = Number((100 - tasaRebote).toFixed(1));

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (tasaRebote < bench.min) {
    insightTone = 'good';
    insightText = `Tu **${tasaR}%** de rebote queda por debajo del rango típico de ${bench.label} (${bench.min}-${bench.max}%): el **${engagement}%** de las sesiones interactúa. Excelente, pero un valor tan bajo a veces delata un error de tracking — verificalo.`;
  } else if (tasaRebote <= bench.max) {
    insightTone = 'good';
    insightText = `Tu **${tasaR}%** de rebote cae dentro de lo normal para ${bench.label} (${bench.min}-${bench.max}%): el **${engagement}%** de las sesiones sigue navegando. Sano, con margen para optimizar.`;
  } else {
    insightTone = 'warn';
    insightText = `Tu **${tasaR}%** de rebote supera el benchmark de ${bench.label} (${bench.min}-${bench.max}%): sólo el **${engagement}%** interactúa. Revisá velocidad de carga, relevancia del contenido y experiencia mobile.`;
  }

  const _insight = {
    title: 'Tu tasa de rebote vs. el benchmark',
    text: insightText,
    tone: insightTone,
    icon: '📉',
  };

  const topCap = Math.max(100, Math.ceil(tasaRebote) + 1);
  const _chart = {
    type: 'scale',
    marker: tasaR,
    markerLabel: `${tasaR}%`,
    min: 0,
    segments: [
      { nombre: 'Bajo el rango', max: bench.min, color: '#3b82f6', colorDark: '#60a5fa' },
      { nombre: 'Rango normal', max: bench.max, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Sobre el rango', max: topCap, color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Tasa de rebote ${tasaR}% sobre el benchmark de ${bench.label}, ${bench.min} a ${bench.max} por ciento.`,
  };

  return {
    tasaRebote: tasaR,
    benchmark,
    diagnostico,
    detalle,
    _insight,
    _chart,
  };
}
