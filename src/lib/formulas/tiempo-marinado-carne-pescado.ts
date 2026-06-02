/** Calculadora de tiempo de marinado ideal */
export interface Inputs {
  tipoProteina: string;
  grosor?: string;
  tipoMarinada?: string;
}
export interface Outputs {
  tiempoMinimo: string;
  tiempoOptimo: string;
  tiempoMaximo: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

interface TiempoBase {
  min: number; // en minutos
  opt: number;
  max: number;
}

export function tiempoMarinadoCarnePescado(i: Inputs): Outputs {
  const proteina = i.tipoProteina;
  const grosor = i.grosor || 'medio';
  const marinada = i.tipoMarinada || 'aceite';

  if (!proteina) throw new Error('Seleccioná el tipo de proteína');

  // Tiempos base en minutos para grosor medio, marinada aceite
  const tiemposBase: Record<string, TiempoBase> = {
    vacuna: { min: 120, opt: 480, max: 1440 },
    cerdo: { min: 120, opt: 360, max: 720 },
    pollo: { min: 60, opt: 240, max: 720 },
    pescado: { min: 30, opt: 60, max: 240 },
    mariscos: { min: 15, opt: 25, max: 60 },
  };

  const base = tiemposBase[proteina];
  if (!base) throw new Error('Tipo de proteína no válido');

  // Factor grosor
  const factorGrosor: Record<string, number> = {
    fino: 0.7,
    medio: 1.0,
    grueso: 1.4,
  };
  const fg = factorGrosor[grosor] || 1.0;

  // Factor marinada
  const factorMarinada: Record<string, number> = {
    acida: 0.6,
    aceite: 1.0,
    yogur: 1.1,
    seca: 1.3,
  };
  const fm = factorMarinada[marinada] || 1.0;

  const min = Math.round(base.min * fg * fm);
  const opt = Math.round(base.opt * fg * fm);
  const max = Math.round(base.max * fg * fm);

  const formatTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos} minutos`;
    const hs = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${hs} h ${m} min` : `${hs} horas`;
  };

  const nombres: Record<string, string> = {
    vacuna: 'carne vacuna',
    cerdo: 'cerdo',
    pollo: 'pollo/ave',
    pescado: 'pescado',
    mariscos: 'mariscos',
  };

  const nombreProt = nombres[proteina] || proteina;
  const esAcida = marinada === 'acida';
  const esDelicada = proteina === 'pescado' || proteina === 'mariscos';

  let insightText: string; let insightTone: 'good' | 'warn' | 'neutral';
  if (esAcida && esDelicada) {
    insightText = `El **${nombreProt}** con marinada ácida es delicado: el ácido empieza a "cocinarlo" como un ceviche. No pases de **${formatTiempo(opt)}** y nunca de **${formatTiempo(max)}**, o la textura se arruina.`;
    insightTone = 'warn';
  } else if (esAcida) {
    insightText = `Con marinada ácida el **${nombreProt}** toma sabor rápido pero el ácido ablanda las fibras: apuntá al óptimo de **${formatTiempo(opt)}** y no superes **${formatTiempo(max)}** para que no quede pastoso.`;
    insightTone = 'warn';
  } else if (esDelicada) {
    insightText = `El **${nombreProt}** marina rápido: con **${formatTiempo(opt)}** ya toma todo el sabor. Pasarte de **${formatTiempo(max)}** lo deja blando, mejor quedarse corto.`;
    insightTone = 'neutral';
  } else {
    insightText = `El punto justo para el **${nombreProt}** es **${formatTiempo(opt)}**. Aguanta hasta **${formatTiempo(max)}** sin problema, así que podés dejarlo de un día para el otro y gana profundidad de sabor.`;
    insightTone = 'good';
  }

  return {
    tiempoMinimo: formatTiempo(min),
    tiempoOptimo: formatTiempo(opt),
    tiempoMaximo: formatTiempo(max),
    detalle: `${nombreProt} (${grosor}, marinada ${marinada}): mínimo ${formatTiempo(min)}, óptimo ${formatTiempo(opt)}, máximo ${formatTiempo(max)}. Siempre marinar en heladera.`,
    _insight: { title: 'Punto justo de marinado', text: insightText, tone: insightTone, icon: '🥩' },
    _chart: {
      type: 'scale',
      marker: opt,
      markerLabel: `Óptimo: ${formatTiempo(opt)}`,
      min: 0,
      segments: [
        { nombre: 'Poco sabor', max: min, color: '#fde68a', colorDark: '#a16207' },
        { nombre: 'Ventana ideal', max: max, color: '#86efac', colorDark: '#15803d' },
        { nombre: 'Se pasa', max: Math.round(max * 1.5), color: '#fca5a5', colorDark: '#b91c1c' },
      ],
      ariaLabel: `Tiempo de marinado en minutos: ventana ideal entre ${min} y ${max}, óptimo en ${opt}`,
    },
  };
}
