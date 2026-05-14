/** Mundial 2026: predictor de campeón según ranking FIFA, bombo y modelo Elo. */
export interface Inputs {
  seleccion: string;
  rankingFifa: number;
  bombo: string; // '1' | '2' | '3' | '4'
}

export interface Outputs {
  probPasarGrupo: number;
  probCuartos: number;
  probFinal: number;
  probCampeon: number;
  rankingFavoritos: string;
  resumen: string;
}

const SELECCION_LABEL: Record<string, string> = {
  argentina: 'Argentina',
  brasil: 'Brasil',
  espana: 'España',
  francia: 'Francia',
  inglaterra: 'Inglaterra',
  alemania: 'Alemania',
  portugal: 'Portugal',
  paisesbajos: 'Países Bajos',
  belgica: 'Bélgica',
  croacia: 'Croacia',
  italia: 'Italia',
  uruguay: 'Uruguay',
  otra: 'Otra selección',
};

const FACTOR_BOMBO: Record<string, number> = {
  '1': 1.20,
  '2': 1.00,
  '3': 0.85,
  '4': 0.65,
};

export function mundial2026PredictorCampeonRanking(i: Inputs): Outputs {
  const sel = String(i.seleccion || 'argentina').toLowerCase();
  const ranking = Math.max(1, Math.floor(Number(i.rankingFifa || 50)));
  const bombo = String(i.bombo || '1');

  if (!SELECCION_LABEL[sel]) throw new Error('Selección inválida.');
  if (!FACTOR_BOMBO[bombo]) throw new Error('Bombo inválido (debe ser 1-4).');
  if (ranking < 1 || ranking > 210) throw new Error('Ranking FIFA fuera de rango (1-210).');

  // Base por ranking FIFA: top 5 alto, top 10 medio, top 20 leve negativo, +20 negativo fuerte.
  let base: number;
  if (ranking <= 3) base = 0.95;
  else if (ranking <= 5) base = 0.85;
  else if (ranking <= 10) base = 0.70;
  else if (ranking <= 15) base = 0.55;
  else if (ranking <= 20) base = 0.42;
  else if (ranking <= 30) base = 0.30;
  else if (ranking <= 50) base = 0.18;
  else base = 0.10;

  const factorBombo = FACTOR_BOMBO[bombo];

  // Bonus campeón vigente (Argentina ganó 2022).
  const bonusCampeon = sel === 'argentina' ? 1.10 : 1.00;

  // Bonus continental/tradición: Europa y Sudamérica concentran 100% de los campeones históricos.
  const europeasTop = ['francia', 'espana', 'inglaterra', 'alemania', 'portugal', 'paisesbajos', 'belgica', 'croacia', 'italia'];
  const sudamericanasTop = ['argentina', 'brasil', 'uruguay'];
  let bonusTradicion = 1.00;
  if (europeasTop.includes(sel) || sudamericanasTop.includes(sel)) {
    bonusTradicion = 1.05;
  } else if (sel === 'otra') {
    bonusTradicion = 0.80; // Ningún campeón fuera de Europa/Sudamérica en la historia.
  }

  const eloScore = base * factorBombo * bonusCampeon * bonusTradicion;

  // Mapeo a probabilidades por fase.
  // Pasar fase de grupos (formato 48 equipos: 2 directos + 8 mejores terceros, ~67% pasa promedio).
  const probPasarGrupo = Math.min(0.97, Math.max(0.25, 0.35 + eloScore * 0.55));

  // De pasar grupos, llegar a cuartos: aproximadamente 40-60% de los que pasan.
  const probCuartos = probPasarGrupo * Math.min(0.78, Math.max(0.30, 0.35 + eloScore * 0.40));

  // De llegar a cuartos, llegar a final: ~30-55%.
  const probFinal = probCuartos * Math.min(0.58, Math.max(0.18, 0.20 + eloScore * 0.38));

  // De llegar a final, ganar: ~45-55% (es prácticamente coin flip ajustado).
  const probCampeon = probFinal * Math.min(0.58, Math.max(0.30, 0.35 + eloScore * 0.20));

  // Cap del modelo al 22% para campeón (techo histórico observado).
  const probCampeonCapped = Math.min(0.22, probCampeon);

  // Ranking entre favoritos según probabilidad de campeón.
  let rankingFavoritos: string;
  if (probCampeonCapped >= 0.15) rankingFavoritos = 'Top 3 favoritos al título';
  else if (probCampeonCapped >= 0.10) rankingFavoritos = 'Top 5 favoritos al título';
  else if (probCampeonCapped >= 0.05) rankingFavoritos = 'Top 10 favoritos al título';
  else if (probCampeonCapped >= 0.02) rankingFavoritos = 'Top 15 — outsider';
  else rankingFavoritos = '+15 (no es candidato real al título)';

  const label = SELECCION_LABEL[sel];
  const resumen = `${label} con ranking FIFA #${ranking} en bombo ${bombo}: ${(probPasarGrupo * 100).toFixed(1)}% pasa grupos, ${(probCuartos * 100).toFixed(1)}% llega a cuartos, ${(probFinal * 100).toFixed(1)}% llega a final, ${(probCampeonCapped * 100).toFixed(1)}% gana Mundial 2026. ${rankingFavoritos}.`;

  return {
    probPasarGrupo: Number((probPasarGrupo * 100).toFixed(2)),
    probCuartos: Number((probCuartos * 100).toFixed(2)),
    probFinal: Number((probFinal * 100).toFixed(2)),
    probCampeon: Number((probCampeonCapped * 100).toFixed(2)),
    rankingFavoritos,
    resumen,
  };
}
