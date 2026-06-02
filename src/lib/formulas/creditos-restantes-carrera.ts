/** Calculadora Créditos Restantes */
export interface Inputs { creditosTotal: number; creditosAprobados: number; creditosPorCuatri: number; }
export interface Outputs { creditosFaltantes: number; porcentajeAvance: number; cuatrimestresFaltantes: number; fechaEstimada: string; _insight?: any; _chart?: any; }

export function creditosRestantesCarrera(i: Inputs): Outputs {
  const total = Number(i.creditosTotal);
  const aprobados = Number(i.creditosAprobados);
  const porCuatri = Number(i.creditosPorCuatri);
  if (total <= 0) throw new Error('Los créditos totales deben ser mayor a 0');
  if (aprobados < 0) throw new Error('Los créditos aprobados no pueden ser negativos');
  if (porCuatri <= 0) throw new Error('Los créditos por cuatrimestre deben ser mayor a 0');

  const faltantes = Math.max(0, total - aprobados);
  const avance = (aprobados / total) * 100;
  const cuatris = Math.ceil(faltantes / porCuatri);
  const anos = cuatris / 2;

  let tiempo: string;
  if (faltantes === 0) tiempo = '¡Ya completaste todos los créditos!';
  else if (cuatris === 1) tiempo = '1 cuatrimestre (~6 meses)';
  else tiempo = `${cuatris} cuatrimestres (~${anos.toFixed(1)} años)`;

  const avanceRound = Number(avance.toFixed(1));
  const completo = faltantes === 0;
  const _insight = {
    title: completo ? '¡Carrera completa!' : (avanceRound >= 75 ? 'Estás en la recta final' : 'Vas en camino'),
    text: completo
      ? `Aprobaste los **${total}** créditos: ya tenés el **100%** de la carrera. ¡Felicitaciones!`
      : `Llevás **${avanceRound}%** de la carrera con **${aprobados}** de **${total}** créditos. Te faltan **${faltantes}** créditos, unos **${tiempo}** a razón de ${porCuatri} créditos por cuatrimestre.`,
    tone: (completo ? 'good' : (avanceRound >= 75 ? 'good' : 'neutral')) as 'good' | 'neutral',
    icon: '🎓'
  };
  const _chart = {
    type: 'scale',
    marker: avanceRound,
    markerLabel: `${avanceRound}% aprobado`,
    min: 0,
    segments: [
      { nombre: 'Arrancando', max: 50, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'En camino', max: 80, color: '#3b82f6', colorDark: '#60a5fa' },
      { nombre: 'Recta final', max: 100.5, color: '#16a34a', colorDark: '#22c55e' }
    ],
    ariaLabel: `Avance de la carrera: ${avanceRound}% de los créditos aprobados.`
  };

  return {
    creditosFaltantes: faltantes,
    porcentajeAvance: avanceRound,
    cuatrimestresFaltantes: cuatris,
    fechaEstimada: tiempo,
    _insight,
    _chart,
  };
}
