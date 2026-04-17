/** ¿Cuántas flashcards crear por día? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  nuevasPorDia: number;
  repasosPorDia: number;
  tiempoRequerido: number;
  viable: string;
}

export function flashcardsPorDia(i: Inputs): Outputs {
  const min = Number(i.minutosDia) || 30;
  const total = Number(i.totalCards) || 3000;
  const meses = Number(i.plazoMeses) || 12;
  if (min <= 0 || total <= 0 || meses <= 0) throw new Error('Datos inválidos');

  const dias = meses * 30.42;
  const nuevasDia = Math.ceil(total / dias);
  const repasosDia = nuevasDia * 10;
  const tiempoReq = Math.round((repasosDia * 10) / 60);

  let viable = '';
  if (tiempoReq > min) viable = `❌ No viable: necesitás ${tiempoReq} min, tenés ${min}. Extendé plazo o reducí tarjetas.`;
  else if (tiempoReq > min * 0.8) viable = '⚠️ Ajustado: casi al límite. Margen de error pequeño.';
  else viable = '✅ Viable con margen.';

  return {
    nuevasPorDia: nuevasDia,
    repasosPorDia: repasosDia,
    tiempoRequerido: tiempoReq,
    viable,
  };

}
