/** Mundial 2026: probabilidad de bicampeón consecutivo (Argentina). */
export interface Inputs {
  seleccion: string;
  rankingFifa: number;
  nucleoMantenido: number; // 0-100
  edadPromedio: number;
  dificultadGrupo: string; // 'facil' | 'medio' | 'duro'
}

export interface Outputs {
  probBicampeon: number;
  comparacionHistorica: string;
  factoresPositivos: string;
  factoresNegativos: string;
  casosPrevios: string;
  resumen: string;
}

export function mundial2026ProbabilidadBicampeon(i: Inputs): Outputs {
  const sel = String(i.seleccion || 'argentina').toLowerCase();
  const ranking = Math.max(1, Math.floor(Number(i.rankingFifa || 1)));
  const nucleo = Math.max(0, Math.min(100, Number(i.nucleoMantenido || 0)));
  const edad = Math.max(22, Math.min(36, Number(i.edadPromedio || 30)));
  const grupo = String(i.dificultadGrupo || 'medio').toLowerCase();

  if (sel !== 'argentina') throw new Error('Solo Argentina es campeón vigente 2022 (única opción para bicampeón 2026).');
  if (!['facil', 'medio', 'duro'].includes(grupo)) throw new Error('Dificultad de grupo inválida.');

  // Base histórica: 9% (2 bicampeonatos consecutivos en 22 mundiales).
  let base = 9;
  const positivos: string[] = [];
  const negativos: string[] = [];

  // Núcleo mantenido.
  let bonusNucleo = 0;
  if (nucleo >= 80) {
    bonusNucleo = 10;
    positivos.push(`Núcleo mantenido >80% (+10%): química y experiencia 2022 intactas.`);
  } else if (nucleo >= 70) {
    bonusNucleo = 6;
    positivos.push(`Núcleo mantenido ${nucleo}% (+6%): mantiene base + renueva con calidad.`);
  } else if (nucleo >= 50) {
    bonusNucleo = 1;
  } else {
    bonusNucleo = -6;
    negativos.push(`Núcleo mantenido solo ${nucleo}% (-6%): pierde química 2022.`);
  }

  // Ranking FIFA.
  let bonusRanking = 0;
  if (ranking <= 3) {
    bonusRanking = 3;
    positivos.push(`Ranking FIFA #${ranking} (+3%): entre los 3 mejores del mundo.`);
  } else if (ranking <= 5) {
    bonusRanking = 1;
  } else if (ranking <= 10) {
    bonusRanking = 0;
  } else {
    bonusRanking = -3;
    negativos.push(`Ranking FIFA #${ranking} (-3%): fuera del top 10.`);
  }

  // Edad.
  let bonusEdad = 0;
  if (edad >= 27 && edad <= 30) {
    bonusEdad = 3;
    positivos.push(`Edad promedio ${edad.toFixed(1)} años (+3%): peak biológico colectivo.`);
  } else if (edad > 30 && edad <= 32) {
    bonusEdad = 0;
  } else if (edad > 32) {
    bonusEdad = -5;
    negativos.push(`Edad promedio ${edad.toFixed(1)} años (-5%): plantel envejecido (Messi 39, Otamendi 38).`);
  } else {
    bonusEdad = -2;
    negativos.push(`Edad promedio ${edad.toFixed(1)} años (-2%): plantel demasiado joven, falta experiencia internacional.`);
  }

  // Grupo.
  let bonusGrupo = 0;
  if (grupo === 'facil') {
    bonusGrupo = 3;
    positivos.push(`Grupo accesible en sorteo (+3%): sin rivales top 15 directos.`);
  } else if (grupo === 'medio') {
    bonusGrupo = 0;
  } else {
    bonusGrupo = -5;
    negativos.push(`Grupo de la muerte (-5%): cruces difíciles desde fase de grupos.`);
  }

  let prob = base + bonusNucleo + bonusRanking + bonusEdad + bonusGrupo;
  prob = Math.max(2, Math.min(22, prob)); // Cap 2-22%.

  if (positivos.length === 0) positivos.push('Sin factores positivos relevantes con estos inputs.');
  if (negativos.length === 0) negativos.push('Sin factores negativos relevantes con estos inputs.');

  let comparacion: string;
  if (prob > 14) comparacion = `${prob.toFixed(1)}% — bastante POR ENCIMA del baseline histórico de 9% (solo Italia '38 y Brasil '62 lo lograron).`;
  else if (prob >= 9) comparacion = `${prob.toFixed(1)}% — en línea con el baseline histórico de 9%.`;
  else comparacion = `${prob.toFixed(1)}% — POR DEBAJO del baseline histórico de 9%. Hay malus dominante.`;

  const casosPrevios = `Solo 2 bicampeonatos consecutivos en historia: Italia (1934 → 1938, Pozzo + Meazza, Mussolini-era) y Brasil (1958 → 1962, Pelé/Garrincha). En la era moderna, 5 de los últimos 5 campeones vigentes FALLARON defensa: Brasil '06 (cuartos), Italia '10 (grupos), España '14 (grupos), Alemania '18 (grupos), Francia '22 (final perdida).`;

  const resumen = `Probabilidad de bicampeón Mundial 2026: **${prob.toFixed(1)}%** (Argentina). Base histórica: 9%. Núcleo ${nucleo}%, edad ${edad.toFixed(1)}, ranking #${ranking}, grupo ${grupo}. ${comparacion}`;

  return {
    probBicampeon: Number(prob.toFixed(2)),
    comparacionHistorica: comparacion,
    factoresPositivos: positivos.join(' '),
    factoresNegativos: negativos.join(' '),
    casosPrevios,
    resumen,
  };
}
