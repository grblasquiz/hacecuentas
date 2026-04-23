/** Mundial 2026 - Detector de grupo de la muerte */
export interface Inputs {
  seleccionA: string; rankingA: number; titulosA: number;
  seleccionB: string; rankingB: number; titulosB: number;
  seleccionC: string; rankingC: number; titulosC: number;
  seleccionD: string; rankingD: number; titulosD: number;
}
export interface Outputs { score: string; veredicto: string; desglose: string; }

export function mundial2026GrupoMuerte(i: Inputs): Outputs {
  const rankings = [Number(i.rankingA), Number(i.rankingB), Number(i.rankingC), Number(i.rankingD)];
  const titulos = [Number(i.titulosA) || 0, Number(i.titulosB) || 0, Number(i.titulosC) || 0, Number(i.titulosD) || 0];
  if (rankings.some(r => !r || r < 1)) throw new Error('Ranking FIFA inválido');
  const names = [String(i.seleccionA || 'A'), String(i.seleccionB || 'B'), String(i.seleccionC || 'C'), String(i.seleccionD || 'D')];

  const avgRank = rankings.reduce((a, b) => a + b, 0) / 4;
  const ptsRank = Math.max(0, 100 - (avgRank - 1));
  const totalTitulos = titulos.reduce((a, b) => a + b, 0);
  const ptsTit = Math.min(100, (totalTitulos / 8) * 100);
  const score = 0.6 * ptsRank + 0.4 * ptsTit;

  let veredicto: string;
  if (score >= 80) veredicto = 'Grupo de la muerte EXTREMO';
  else if (score >= 70) veredicto = 'Grupo de la muerte';
  else if (score >= 55) veredicto = 'Grupo difícil';
  else if (score >= 40) veredicto = 'Grupo parejo';
  else veredicto = 'Grupo accesible';

  const desglose = `${names.join(', ')} | Ranking promedio: ${avgRank.toFixed(1)} | Títulos suma: ${totalTitulos} | Pts ranking ${ptsRank.toFixed(1)} + Pts títulos ${ptsTit.toFixed(1)}`;

  return {
    score: `${score.toFixed(1)} / 100`,
    veredicto,
    desglose,
  };
}
