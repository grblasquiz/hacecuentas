/** ¿Cuántas horas para llegar a alemán C1? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  semanas: number;
  meses: number;
  anos: number;
  categoriaFsi: string;
  _insight?: any;
}

export function horasAprenderAlemanC1(i: Inputs): Outputs {
  const horasDiarias = Number(i.horasDiarias) || 2;
  const diasSemana = Number(i.diasSemana) || 5;
  const nivelActual = String(i.nivelActual || 'a0');
  const inmersion = String(i.inmersion || 'no');
  if (horasDiarias <= 0) throw new Error('Horas diarias inválidas');
  if (diasSemana <= 0 || diasSemana > 7) throw new Error('Días/semana entre 1 y 7');

  const totalBase = 900;
  const yaHechas: Record<string, number> = { a0: 0, a1: 80, a2: 200, b1: 400, b2: 650 };
  let restante = totalBase - (yaHechas[nivelActual] || 0);
  if (restante < 50) restante = 50;

  const factor: Record<string, number> = { no: 1, parcial: 0.8, si: 0.6 };
  restante = restante * (factor[inmersion] || 1);

  const horasSemana = horasDiarias * diasSemana;
  const semanas = restante / horasSemana;
  const meses = semanas / 4.33;
  const anos = meses / 12;

  const horasR = Math.round(restante);
  const mesesR = Math.round(meses * 10) / 10;
  const tiempoTxt = mesesR >= 12
    ? `${Math.round(anos * 10) / 10} años`
    : `${mesesR} meses`;

  const nivelLabels: Record<string, string> = {
    a0: 'cero', a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2',
  };
  const nivelTxt = nivelLabels[nivelActual] || nivelActual.toUpperCase();
  const inmersionTxt = inmersion === 'si' ? 'inmersión total en Alemania' : inmersion === 'parcial' ? 'inmersión parcial' : 'estudio sin inmersión';

  let insight_tone: 'good' | 'warn' | 'neutral';
  let insight_text: string;
  if (mesesR <= 18) {
    insight_tone = 'good';
    insight_text = `Partiendo de **${nivelTxt}** y estudiando **${Math.round(horasSemana)} h/semana** con ${inmersionTxt}, llegás al **C1** en unos **${tiempoTxt}** (**${horasR} h** de estudio). Ritmo ambicioso pero alcanzable: la constancia semanal es lo que decide.`;
  } else {
    insight_tone = 'warn';
    insight_text = `Desde **${nivelTxt}** y con **${Math.round(horasSemana)} h/semana** de ${inmersionTxt}, el **C1** te queda a unos **${tiempoTxt}** (**${horasR} h**). Es un camino largo: subir horas semanales o sumar inmersión lo acorta bastante.`;
  }
  const _insight = {
    title: 'Tu camino al C1',
    text: insight_text,
    tone: insight_tone,
    icon: '🇩🇪',
  };

  return {
    horasTotales: horasR,
    semanas: Math.round(semanas),
    meses: mesesR,
    anos: Math.round(anos * 10) / 10,
    categoriaFsi: 'Cat II FSI (medio)',
    _insight,
  };

}
