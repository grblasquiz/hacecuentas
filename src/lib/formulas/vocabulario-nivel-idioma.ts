/** Vocabulario Necesario por Nivel */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  palabrasNecesarias: number;
  palabrasFaltantes: number;
  rangoMin: number;
  rangoMax: number;
  consejo: string;
  _insight?: any;
  _chart?: any;
}

export function vocabularioNivelIdioma(i: Inputs): Outputs {
  const nivel = String(i.nivelMeta || 'b2');
  const idioma = String(i.idioma || 'ingles');
  const actuales = Number(i.palabrasActuales) || 0;

  const BASE: Record<string, number[]> = {
    a1: [300, 600], a2: [1000, 1500], b1: [2000, 3000],
    b2: [4000, 5500], c1: [7000, 9000], c2: [12000, 18000],
  };
  const AJUSTE: Record<string, number> = {
    ingles: 1.0, frances: 1.1, italiano: 1.1, portugues: 1.1,
    aleman: 1.15, ruso: 1.2, japones: 1.3, chino: 1.5,
    coreano: 1.1, arabe: 1.4,
  };

  const [lo, hi] = BASE[nivel] || [4000, 5500];
  const adj = AJUSTE[idioma] || 1.0;

  const min = Math.round(lo * adj);
  const max = Math.round(hi * adj);
  const necesarias = Math.round((min + max) / 2);
  const faltan = Math.max(0, necesarias - actuales);

  let consejo = '';
  if (faltan <= 0) consejo = 'Ya alcanzaste el rango. Consolidá con práctica activa.';
  else if (faltan < 500) consejo = 'Cerca de la meta. Enfocate en colocaciones y modismos.';
  else if (faltan < 2000) consejo = 'Plan factible en 3-6 meses con 15 palabras/día.';
  else consejo = 'Proyecto largo: priorizá frequency lists y word families.';

  const yaCubiertas = Math.min(actuales, necesarias);
  const pct = necesarias > 0 ? Math.round((yaCubiertas / necesarias) * 100) : 0;

  const _insight = {
    title: 'Cuánto te falta',
    text: faltan <= 0
      ? `Ya cubrís el rango de **${nivel.toUpperCase()}** (${necesarias.toLocaleString('es-AR')} palabras). Ahora tocá consolidar con uso activo.`
      : `Para **${nivel.toUpperCase()}** en ${idioma} apuntás a ~**${necesarias.toLocaleString('es-AR')}** palabras y te faltan **${faltan.toLocaleString('es-AR')}** (${pct}% del camino hecho).`,
    tone: faltan <= 0 ? 'good' : (faltan < 2000 ? 'neutral' : 'warn'),
    icon: '🗣️',
  };

  const out: Outputs = {
    palabrasNecesarias: necesarias,
    palabrasFaltantes: faltan,
    rangoMin: min,
    rangoMax: max,
    consejo,
    _insight,
  };

  // Donut sólo cuando hay composición (vocabulario actual + faltante = meta)
  if (faltan > 0 && yaCubiertas > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Ya sabés', value: yaCubiertas },
        { label: 'Te falta', value: faltan },
      ],
      prefix: '',
      centerValue: necesarias.toLocaleString('es-AR'),
      centerLabel: `palabras para ${nivel.toUpperCase()}`,
      ariaLabel: `Vocabulario actual frente a la meta para nivel ${nivel.toUpperCase()}`,
    };
  }

  return out;

}
