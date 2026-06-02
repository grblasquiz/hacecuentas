/** Calculadora de Tiempo para Completar Juego */
export interface Inputs {
  horasJuego: number;
  porcentajeObjetivo: number;
  horasPorDia: number;
  diasPorSemana: number;
}
export interface Outputs {
  diasTotales: number;
  semanasTotal: number;
  horasReales: number;
  mensaje: string;
  _insight?: any;
}

export function tiempoCompletarJuegoHoras(i: Inputs): Outputs {
  const horasJuego = Number(i.horasJuego);
  const pctObj = Number(i.porcentajeObjetivo);
  const hpd = Number(i.horasPorDia);
  const dpw = Number(i.diasPorSemana);
  if (!horasJuego || horasJuego <= 0) throw new Error('Ingresá las horas del juego');
  if (!pctObj || pctObj <= 0) throw new Error('Ingresá el porcentaje objetivo');
  if (!hpd || hpd <= 0) throw new Error('Ingresá las horas por día');
  if (!dpw || dpw < 1 || dpw > 7) throw new Error('Ingresá días por semana (1-7)');

  // Ajuste: si el objetivo es >100%, es completismo que agrega contenido
  const horasReales = horasJuego * (pctObj / 100);
  const horasSemanales = hpd * dpw;
  const semanasTotal = horasReales / horasSemanales;
  const diasTotales = Math.ceil(semanasTotal * 7);

  const tone = semanasTotal > 12 ? 'warn' : semanasTotal < 2 ? 'good' : 'neutral';
  const insightText =
    semanasTotal > 12
      ? `Son **${semanasTotal.toFixed(1)} semanas** (${diasTotales} días) a tu ritmo actual: un compromiso largo. Subir a más horas por día acorta bastante la meta.`
      : semanasTotal < 2
        ? `Lo terminás rápido: **${horasReales.toFixed(0)} horas** que a ${horasSemanales} hs/semana se van en menos de 2 semanas.`
        : `A ${hpd} hs/día y ${dpw} días/semana sumás **${horasSemanales} hs/semana**, así que las ${horasReales.toFixed(0)} horas te llevan **${semanasTotal.toFixed(1)} semanas**.`;

  return {
    diasTotales,
    semanasTotal: Number(semanasTotal.toFixed(1)),
    horasReales: Number(horasReales.toFixed(1)),
    mensaje: `Necesitás ${horasReales.toFixed(0)} horas de juego. A ${hpd} hs/día, ${dpw} días/semana, terminás en ~${semanasTotal.toFixed(1)} semanas (${diasTotales} días corridos).`,
    _insight: {
      title: 'Tu plan de juego',
      text: insightText,
      tone,
      icon: '🎮',
    },
  };
}
