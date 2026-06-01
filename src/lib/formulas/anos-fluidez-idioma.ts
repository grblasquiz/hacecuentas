/** ¿Cuántos años para alcanzar fluidez? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  anos: number;
  horasTotal: number;
  horasSemana: number;
  comentario: string;
  _insight?: any;
  _chart?: any;
}

export function anosFluidezIdioma(i: Inputs): Outputs {
  const minutosDia = Number(i.minutosDia) || 60;
  const dificultad = String(i.dificultad || 'cat1');
  const meta = String(i.metaFluidez || 'b2');
  if (minutosDia <= 0) throw new Error('Minutos por día inválidos');

  const TABLA: Record<string, Record<string, number>> = {
    cat1: { b2: 550, c1: 700, c2: 1000 },
    cat2: { b2: 700, c1: 900, c2: 1200 },
    cat3: { b2: 950, c1: 1200, c2: 1500 },
    cat4: { b2: 1600, c1: 2200, c2: 3000 },
  };
  const horasTotal = TABLA[dificultad]?.[meta] ?? 700;
  const horasSemana = (minutosDia * 7) / 60;
  const anos = horasTotal / (horasSemana * 52);

  let comentario = '';
  let tone: string;
  if (anos < 1) { comentario = 'Proyecto corto, sostenible sin fatiga.'; tone = 'good'; }
  else if (anos < 3) { comentario = 'Proyecto medio. Sumá hitos cada 3 meses.'; tone = 'neutral'; }
  else if (anos < 5) { comentario = 'Largo: considerá inmersión para acelerar.'; tone = 'warn'; }
  else { comentario = 'Muy largo: reconsiderá intensidad o meta.'; tone = 'warn'; }

  const anosR = Math.round(anos * 10) / 10;
  const horasSemanaR = Math.round(horasSemana * 10) / 10;

  const _insight = {
    title: 'Tu camino a la fluidez',
    text: `Dedicando **${minutosDia} min/día** (${horasSemanaR} h por semana) necesitás **${anosR} año(s)** para juntar las **${horasTotal} horas** que pide ese nivel. ${comentario}`,
    tone,
    icon: '🗣️',
  };

  const _chart = {
    type: 'scale',
    marker: anosR,
    markerLabel: `${anosR} año(s)`,
    min: 0,
    segments: [
      { nombre: 'Corto', max: 1, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Medio', max: 3, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Largo', max: 5, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Muy largo', max: Math.max(8, Math.ceil(anosR) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Con ${minutosDia} minutos por día, alcanzar la fluidez toma ${anosR} años, ubicándose en la zona "${anos < 1 ? 'corto' : anos < 3 ? 'medio' : anos < 5 ? 'largo' : 'muy largo'}".`,
  };

  return {
    anos: anosR,
    horasTotal,
    horasSemana: horasSemanaR,
    comentario,
    _insight,
    _chart,
  };

}
