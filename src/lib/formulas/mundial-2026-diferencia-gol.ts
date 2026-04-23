/** Mundial 2026: desempate por diferencia de gol y criterios FIFA */
export interface Inputs {
  equipoAGf: number;
  equipoAGc: number;
  equipoBGf: number;
  equipoBGc: number;
  headToHead: string; // 'no-jugaron' | 'ganoA' | 'ganoB' | 'empate'
}

export interface Outputs {
  diferenciaA: number;
  diferenciaB: number;
  quienPasa: string;
  criterioDesempate: string;
  resumen: string;
}

export function mundial2026DiferenciaGol(i: Inputs): Outputs {
  const aGf = Number(i.equipoAGf || 0);
  const aGc = Number(i.equipoAGc || 0);
  const bGf = Number(i.equipoBGf || 0);
  const bGc = Number(i.equipoBGc || 0);
  const h2h = String(i.headToHead || 'empate').toLowerCase();

  if ([aGf, aGc, bGf, bGc].some((n) => n < 0)) throw new Error('Los goles no pueden ser negativos.');

  const diffA = aGf - aGc;
  const diffB = bGf - bGc;

  let quien = '';
  let criterio = '';

  // Paso 1: head-to-head (si jugaron entre sí)
  if (h2h === 'ganoA') {
    quien = 'Equipo A pasa primero';
    criterio = 'Enfrentamiento directo: ganó A en el cruce';
  } else if (h2h === 'ganoB') {
    quien = 'Equipo B pasa primero';
    criterio = 'Enfrentamiento directo: ganó B en el cruce';
  } else {
    // Empate en head-to-head o no jugaron → diferencia de gol global
    if (diffA > diffB) {
      quien = 'Equipo A pasa primero';
      criterio = `Diferencia de gol global: A tiene +${diffA}, B tiene ${diffB >= 0 ? '+' : ''}${diffB}`;
    } else if (diffB > diffA) {
      quien = 'Equipo B pasa primero';
      criterio = `Diferencia de gol global: B tiene +${diffB}, A tiene ${diffA >= 0 ? '+' : ''}${diffA}`;
    } else {
      // GD empatada → goles a favor
      if (aGf > bGf) {
        quien = 'Equipo A pasa primero';
        criterio = `Misma diferencia de gol (${diffA >= 0 ? '+' : ''}${diffA}). Desempate por goles a favor: A tiene ${aGf}, B tiene ${bGf}`;
      } else if (bGf > aGf) {
        quien = 'Equipo B pasa primero';
        criterio = `Misma diferencia de gol (${diffA >= 0 ? '+' : ''}${diffA}). Desempate por goles a favor: B tiene ${bGf}, A tiene ${aGf}`;
      } else {
        quien = 'Totalmente empatados en criterios objetivos';
        criterio = 'Empate total en gd y goles a favor. Próximo desempate: fair play (tarjetas) → sorteo FIFA';
      }
    }
  }

  return {
    diferenciaA: diffA,
    diferenciaB: diffB,
    quienPasa: quien,
    criterioDesempate: criterio,
    resumen: `**A**: ${aGf} GF / ${aGc} GC = ${diffA >= 0 ? '+' : ''}${diffA} gd. **B**: ${bGf} GF / ${bGc} GC = ${diffB >= 0 ? '+' : ''}${diffB} gd. **Resultado**: ${quien}. Criterio: ${criterio}.`,
  };
}
