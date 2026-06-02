/** Mundial 2026 - Detector de grupo de la muerte */
export interface Inputs {
  seleccionA: string; rankingA: number; titulosA: number;
  seleccionB: string; rankingB: number; titulosB: number;
  seleccionC: string; rankingC: number; titulosC: number;
  seleccionD: string; rankingD: number; titulosD: number;
}
export interface Outputs { score: string; veredicto: string; desglose: string; _insight?: any; _chart?: any; }

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

  const tone = score >= 70 ? 'warn' : score >= 55 ? 'neutral' : 'good';
  const insight = {
    title: veredicto,
    text: `Con ranking FIFA promedio **${avgRank.toFixed(1)}** y **${totalTitulos}** título(s) mundiales sumados, este grupo puntúa **${score.toFixed(1)}/100**: ${
      score >= 80 ? 'casi imposible pronosticar dos clasificados, todos se sacan puntos entre sí.'
      : score >= 70 ? 'pelea brava — al menos un candidato fuerte queda afuera.'
      : score >= 55 ? 'exigente, pero hay favoritos algo más claros.'
      : score >= 40 ? 'parejo y abierto, sin un dominador evidente.'
      : 'cómodo para los mejor rankeados del grupo.'
    }`,
    tone,
    icon: '💀',
  };

  return {
    score: `${score.toFixed(1)} / 100`,
    veredicto,
    desglose,
    _insight: insight,
    _chart: {
      type: 'scale',
      marker: Number(score.toFixed(1)),
      markerLabel: `${score.toFixed(0)} pts`,
      min: 0,
      segments: [
        { nombre: 'Accesible', max: 40, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Parejo', max: 55, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Difícil', max: 70, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'De la muerte', max: 80, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Extremo', max: 100, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Índice de dificultad del grupo: ${score.toFixed(1)} sobre 100 (${veredicto})`,
    },
  };
}
