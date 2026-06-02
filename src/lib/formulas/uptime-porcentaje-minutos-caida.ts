/** Conversión de porcentaje de uptime SLA a minutos de caída */
export interface Inputs { uptimePorcentaje: number; }
export interface Outputs { caidaAnualMin: number; caidaAnualHoras: number; caidaMensualMin: number; caidaSemanalMin: number; detalle: string; _insight?: any; _chart?: any; }

export function uptimePorcentajeMinutosCaida(i: Inputs): Outputs {
  const uptime = Number(i.uptimePorcentaje);

  if (isNaN(uptime) || uptime < 0 || uptime > 100) throw new Error('Ingresá un porcentaje de uptime entre 0 y 100');

  const minutosAnio = 525960; // 365.25 * 24 * 60
  const downtimeFraction = 1 - uptime / 100;

  const caidaAnualMin = minutosAnio * downtimeFraction;
  const caidaAnualHoras = caidaAnualMin / 60;
  const caidaMensualMin = caidaAnualMin / 12;
  const caidaSemanalMin = caidaAnualMin / 52;

  let caidaTexto: string;
  if (caidaAnualMin < 1) caidaTexto = `${(caidaAnualMin * 60).toFixed(1)} segundos/año`;
  else if (caidaAnualMin < 60) caidaTexto = `${caidaAnualMin.toFixed(1)} minutos/año`;
  else if (caidaAnualHoras < 24) caidaTexto = `${caidaAnualHoras.toFixed(1)} horas/año`;
  else caidaTexto = `${(caidaAnualHoras / 24).toFixed(1)} días/año`;

  const tone = uptime >= 99.9 ? 'good' : uptime >= 99 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Cuánto podés caerte',
    text: `Un SLA de **${uptime}%** te deja un margen de caída de **${caidaTexto}**, equivalente a **${caidaMensualMin.toFixed(1)} min/mes**. ${
      uptime >= 99.99 ? 'Nivel "cuatro nueves": prácticamente sin downtime, exigente de cumplir.'
      : uptime >= 99.9 ? 'Nivel "tres nueves": estándar sólido para producción.'
      : uptime >= 99 ? 'Dos nueves: aceptable, pero deja varias horas de caída al año.'
      : 'Por debajo del 99%: el margen de caída es grande, revisá el objetivo.'
    }`,
    tone,
    icon: uptime >= 99.9 ? '✅' : uptime >= 99 ? '🟡' : '⚠️',
  };
  const _chart = {
    type: 'scale',
    marker: uptime,
    markerLabel: `${uptime}%`,
    min: 90,
    segments: [
      { nombre: '< 99% (1 nueve)', max: 99, color: '#ef4444', colorDark: '#f87171' },
      { nombre: '99% (2 nueves)', max: 99.9, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: '99,9% (3 nueves)', max: 99.99, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: '99,99%+ (4 nueves)', max: 100, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: `Uptime de ${uptime}% sobre la escala de SLA`,
  };

  return {
    caidaAnualMin: Number(caidaAnualMin.toFixed(2)),
    caidaAnualHoras: Number(caidaAnualHoras.toFixed(2)),
    caidaMensualMin: Number(caidaMensualMin.toFixed(2)),
    caidaSemanalMin: Number(caidaSemanalMin.toFixed(2)),
    detalle: `Uptime ${uptime}% = caída máxima de ${caidaTexto} (${caidaMensualMin.toFixed(1)} min/mes, ${caidaSemanalMin.toFixed(1)} min/semana).`,
    _insight,
    _chart,
  };
}
