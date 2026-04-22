/** Pokémon GO IV calculator simplificado
 *  Dado CP, HP, polvo estelar y stats base → rango IV posible
 *  IV = (Ataque 0-15, Defensa 0-15, HP 0-15) → 0-45 total
 */
export interface Inputs {
  cp: number;
  hp: number;
  polvoEstelar: number;
  ataqueBase: number;
  defensaBase: number;
  hpBase: number;
}

export interface Outputs {
  nivelEstimado: number;
  ivMinEstimado: number;
  ivMaxEstimado: number;
  porcentajeMin: number;
  porcentajeMax: number;
  calificacion: string;
  resumen: string;
}

// Stardust → rango de niveles Pokémon GO
const DUST_LEVELS: Array<{ dust: number; min: number; max: number }> = [
  { dust: 200, min: 1, max: 2.5 },
  { dust: 400, min: 3, max: 4.5 },
  { dust: 600, min: 5, max: 6.5 },
  { dust: 800, min: 7, max: 8.5 },
  { dust: 1000, min: 9, max: 10.5 },
  { dust: 1300, min: 11, max: 12.5 },
  { dust: 1600, min: 13, max: 14.5 },
  { dust: 1900, min: 15, max: 16.5 },
  { dust: 2200, min: 17, max: 18.5 },
  { dust: 2500, min: 19, max: 20.5 },
  { dust: 3000, min: 21, max: 22.5 },
  { dust: 3500, min: 23, max: 24.5 },
  { dust: 4000, min: 25, max: 26.5 },
  { dust: 4500, min: 27, max: 28.5 },
  { dust: 5000, min: 29, max: 30.5 },
  { dust: 6000, min: 31, max: 32.5 },
  { dust: 7000, min: 33, max: 34.5 },
  { dust: 8000, min: 35, max: 36.5 },
  { dust: 9000, min: 37, max: 38.5 },
  { dust: 10000, min: 39, max: 40 },
];

// CPM values (simplified - subset para niveles enteros)
const CPM: Record<number, number> = {
  1: 0.094, 5: 0.29024988, 10: 0.4225, 15: 0.51739395, 20: 0.5974, 25: 0.667934, 30: 0.7317, 35: 0.76156384, 40: 0.7903,
};

function cpmAprox(nivel: number): number {
  // aproximación lineal entre los valores conocidos
  const levels = Object.keys(CPM).map(Number).sort((a, b) => a - b);
  for (let k = 0; k < levels.length - 1; k++) {
    const lo = levels[k], hi = levels[k + 1];
    if (nivel >= lo && nivel <= hi) {
      const t = (nivel - lo) / (hi - lo);
      return CPM[lo] + t * (CPM[hi] - CPM[lo]);
    }
  }
  if (nivel < levels[0]) return CPM[levels[0]];
  return CPM[levels[levels.length - 1]];
}

export function ivPokemonGo(i: Inputs): Outputs {
  const cp = Number(i.cp);
  const hp = Number(i.hp);
  const dust = Number(i.polvoEstelar);
  const atkB = Number(i.ataqueBase);
  const defB = Number(i.defensaBase);
  const hpB = Number(i.hpBase);

  if (!cp || cp <= 0) throw new Error('Ingresá el CP');
  if (!hp || hp <= 0) throw new Error('Ingresá el HP');
  if (!dust || dust <= 0) throw new Error('Ingresá el polvo estelar');
  if (!atkB || !defB || !hpB) throw new Error('Ingresá stats base del Pokémon (ataque, defensa, HP)');

  const rango = DUST_LEVELS.find(d => d.dust === dust) || DUST_LEVELS.reduce((best, curr) =>
    Math.abs(curr.dust - dust) < Math.abs(best.dust - dust) ? curr : best);

  // Estimar IV asumiendo nivel medio del rango
  const nivelMedio = (rango.min + rango.max) / 2;
  const cpm = cpmAprox(nivelMedio);

  // HP_iv = HP / cpm - hpBase
  const hpIvRaw = (hp / cpm) - hpB;
  const hpIv = Math.max(0, Math.min(15, Math.round(hpIvRaw)));

  // CP = floor( (Atk*(Def*HP_total)^0.5) / 10 ) donde HP_total = hpBase+hpIv
  // simplificamos: atk+def combinado
  const hpTotal = hpB + hpIv;
  const sqrtDef = Math.sqrt(defB + 7.5); // def media
  const atkEstim = (cp * 10) / (cpm * cpm * Math.sqrt(hpTotal) * sqrtDef);
  const atkDefIv = Math.max(0, Math.min(30, Math.round(atkEstim - atkB)));

  // Dividir entre atk y def (asumimos balance)
  const atkIv = Math.min(15, Math.floor(atkDefIv / 2));
  const defIv = Math.min(15, atkDefIv - atkIv);

  const ivTotal = atkIv + defIv + hpIv;
  const ivMin = Math.max(0, ivTotal - 3);
  const ivMax = Math.min(45, ivTotal + 3);
  const pctMin = Math.round((ivMin / 45) * 100);
  const pctMax = Math.round((ivMax / 45) * 100);

  let calif = '';
  const pctMed = (pctMin + pctMax) / 2;
  if (pctMed >= 96) calif = 'Hundo / casi perfecto (PvE élite)';
  else if (pctMed >= 82) calif = 'Excelente (GL/UL viable)';
  else if (pctMed >= 66) calif = 'Bueno';
  else calif = 'Regular / transferir';

  return {
    nivelEstimado: Number(nivelMedio.toFixed(1)),
    ivMinEstimado: ivMin,
    ivMaxEstimado: ivMax,
    porcentajeMin: pctMin,
    porcentajeMax: pctMax,
    calificacion: calif,
    resumen: `Nivel ~${nivelMedio.toFixed(1)} — IV estimado entre **${pctMin}%** y **${pctMax}%** (${ivMin}-${ivMax}/45). **${calif}**.`,
  };
}
