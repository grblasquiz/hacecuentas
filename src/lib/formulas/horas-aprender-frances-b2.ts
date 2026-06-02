/** ¿Cuántas horas para llegar a francés B2? */
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
  _chart?: any;
}

export function horasAprenderFrancesB2(i: Inputs): Outputs {
  const horasDiarias = Number(i.horasDiarias) || 2;
  const diasSemana = Number(i.diasSemana) || 5;
  const nivelActual = String(i.nivelActual || 'a0');
  const inmersion = String(i.inmersion || 'no');
  if (horasDiarias <= 0) throw new Error('Horas diarias inválidas');
  if (diasSemana <= 0 || diasSemana > 7) throw new Error('Días/semana entre 1 y 7');

  const totalBase = 600;
  const yaHechas: Record<string, number> = { a0: 0, a1: 80, a2: 200, b1: 400, b2: 650 };
  let restante = totalBase - (yaHechas[nivelActual] || 0);
  if (restante < 50) restante = 50;

  const factor: Record<string, number> = { no: 1, parcial: 0.8, si: 0.6 };
  restante = restante * (factor[inmersion] || 1);

  const horasSemana = horasDiarias * diasSemana;
  const semanas = restante / horasSemana;
  const meses = semanas / 4.33;
  const anos = meses / 12;

  const hTot = Math.round(restante);
  const mes = Math.round(meses * 10) / 10;
  const hWk = Math.round(horasSemana);
  const tone = mes <= 12 ? 'good' : mes <= 24 ? 'neutral' : 'warn';
  const ritmo =
    mes <= 12
      ? `A **${hWk} h/semana** lo alcanzás en menos de un año: el francés es **Cat I del FSI**, de los más cercanos al español, así que tenés mucho a favor.`
      : mes <= 24
        ? `Con **${hWk} h/semana** son **${mes} meses**; al ser **Cat I del FSI** (muy cercano al español), subir un poco el ritmo lo acorta rápido.`
        : `A **${hWk} h/semana** te llevaría **${mes} meses**; como el francés es **Cat I del FSI** (muy cercano al español), con más horas semanales bajás bastante ese plazo.`;

  const segTop = Math.max(Math.ceil(mes * 1.15), 30);
  const _insight = {
    title: 'Tu camino al francés B2',
    text: `Te faltan **${hTot.toLocaleString('es-AR')} h** de estudio, unos **${mes} meses** a tu ritmo actual. ${ritmo}`,
    tone,
    icon: '📚',
  };
  const _chart = {
    type: 'scale',
    marker: mes,
    markerLabel: `${mes} meses`,
    min: 0,
    segments: [
      { nombre: 'Rápido', max: 6, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 12, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Largo', max: 24, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Maratón', max: segTop, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Horizonte de estudio: ${mes} meses para llegar a francés B2`,
  };

  return {
    horasTotales: hTot,
    semanas: Math.round(semanas),
    meses: mes,
    anos: Math.round(anos * 10) / 10,
    categoriaFsi: 'Cat I FSI (muy cercano)',
    _insight,
    _chart,
  };

}
