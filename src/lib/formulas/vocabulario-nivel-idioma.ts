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

  return {
    palabrasNecesarias: necesarias,
    palabrasFaltantes: faltan,
    rangoMin: min,
    rangoMax: max,
    consejo,
  };

}
