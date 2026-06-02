export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any> | undefined; _insight?: any; }
export function tiempoDescansoEjercicioIntensidad(i: Inputs): Outputs {
  const obj = String(i.objetivo);
  const desc: Record<string, string> = { fuerza: '3-5 min', hipertrofia: '60-90 seg', resistencia: '15-60 seg' };
  const descanso = desc[obj] || '2 min';
  const motivo: Record<string, string> = {
    fuerza: 'el sistema neuromuscular necesita recuperarse del todo para mover cargas máximas',
    hipertrofia: 'el descanso medio acumula el estrés metabólico que dispara el crecimiento muscular',
    resistencia: 'el descanso corto mantiene la frecuencia cardíaca alta y mejora la capacidad aeróbica',
  };
  const insightText = motivo[obj]
    ? `Para **${obj}** descansá **${descanso}** entre series: ${motivo[obj]}.`
    : `Descanso recomendado de **${descanso}** entre series.`;
  return {
    descanso,
    resumen: `Descanso: ${descanso} para objetivo ${obj}.`,
    _insight: {
      title: 'Cuánto descansar entre series',
      text: insightText,
      tone: 'neutral',
      icon: '⏱️',
    },
  };
}
