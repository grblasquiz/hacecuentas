export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function eficienciaCarnotTermodinamica(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errInputs: 'Completá T_h y T_c',
      errOrder: 'T fría debe ser menor',
    },
    en: {
      errInputs: 'Enter T_h and T_c',
      errOrder: 'Cold temperature must be lower',
    },
  } as const)[__lang];
  const tc = Number(i.tCalor); const tf = Number(i.tFrio);
  if (!tc || !tf) throw new Error(T.errInputs);
  if (tf >= tc) throw new Error(T.errOrder);
  const eta = 1 - tf / tc;
  const pct = eta * 100;
  // Tono dinámico: la eficiencia Carnot es el TOPE teórico inalcanzable; alto = mucho margen aprovechable.
  const tone = pct >= 50 ? 'good' : pct >= 25 ? 'neutral' : 'warn';
  const insight = {
    title: __lang === 'en' ? 'Theoretical ceiling' : 'El techo teórico',
    text: __lang === 'en'
      ? `**${pct.toFixed(1)}%** is the maximum efficiency any engine could reach between **${tc} K** and **${tf} K** — real machines fall well below this hard limit set by the temperature gap.`
      : `**${pct.toFixed(1)}%** es la eficiencia máxima que cualquier máquina podría alcanzar entre **${tc} K** y **${tf} K**: las máquinas reales quedan bastante por debajo de este límite que impone la diferencia de temperatura.`,
    tone,
    icon: '🔥',
  };
  // Gauge: eficiencia 0–100%, zonas por aprovechamiento del salto térmico.
  const chart = {
    type: 'scale',
    marker: Number(pct.toFixed(1)),
    markerLabel: pct.toFixed(1) + '%',
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Low' : 'Baja', max: 25, color: '#fca5a5', colorDark: '#f87171' },
      { nombre: __lang === 'en' ? 'Moderate' : 'Moderada', max: 50, color: '#fde68a', colorDark: '#fbbf24' },
      { nombre: __lang === 'en' ? 'High' : 'Alta', max: 100, color: '#86efac', colorDark: '#4ade80' },
    ],
    ariaLabel: __lang === 'en'
      ? `Carnot efficiency of ${pct.toFixed(1)}% on a 0 to 100 percent scale`
      : `Eficiencia de Carnot de ${pct.toFixed(1)}% en una escala de 0 a 100 por ciento`,
  };
  return {
    eficiencia: pct.toFixed(2) + '%',
    resumen: __lang === 'en'
      ? `Max Carnot efficiency ${pct.toFixed(1)}% between ${tc}K and ${tf}K.`
      : `Eficiencia Carnot máx ${pct.toFixed(1)}% entre ${tc}K y ${tf}K.`,
    _insight: insight,
    _chart: chart,
  };
}
