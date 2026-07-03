/** Escala de plano o mapa: convierte medidas del plano a reales y viceversa. */
export interface Inputs {
  escala_denominador?: number | string;
  medida?: number | string;
  modo?: string;
  __country?: string;
}

export interface Outputs {
  resultado_texto: string;
  resultado_num: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function escalaPlanoMapa(i: Inputs): Outputs {
  const escala_denominador = Math.max(1, Number(i.escala_denominador) || 1);
  const medida = Math.max(0, Number(i.medida) || 0);
  const modo = String(i.modo || 'plano_a_real');

  let resultado_num = 0;
  let resultado_texto = '';

  if (modo === 'plano_a_real') {
    const real_cm = medida * escala_denominador;
    const real_m = Math.round((real_cm / 100) * 100) / 100;
    resultado_num = real_m;
    resultado_texto = `${real_m} m`;
  } else {
    const plano_cm = Math.round((medida * 100 / escala_denominador) * 100) / 100;
    resultado_num = plano_cm;
    resultado_texto = `${plano_cm} cm`;
  }

  const resumen = medida > 0
    ? (modo === 'plano_a_real'
      ? `${medida} cm en un plano a escala 1:${escala_denominador} representan ${resultado_texto} en la realidad.`
      : `${medida} m reales, a escala 1:${escala_denominador}, se dibujan como ${resultado_texto} en el plano.`)
    : 'Cargá la medida a convertir para usar la escala del plano o mapa.';

  const out: Outputs = { resultado_texto, resultado_num, resumen };

  if (medida > 0) {
    out._insight = {
      title: 'Conversión de escala',
      text: modo === 'plano_a_real'
        ? `A escala **1:${escala_denominador}**, cada centímetro del plano equivale a **${escala_denominador} cm reales**. Por eso **${medida} cm** del plano son **${resultado_texto}** en la realidad.`
        : `A escala **1:${escala_denominador}**, cada metro real se reduce ${escala_denominador} veces. Por eso **${medida} m** reales se dibujan como **${resultado_texto}** en el plano.`,
      tone: 'neutral',
      icon: '📐',
    };
  }

  return out;
}
