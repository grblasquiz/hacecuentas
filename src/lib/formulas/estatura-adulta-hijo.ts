/** Predicción de estatura adulta del hijo — Tanner */
export interface Inputs { alturaPadre: number; alturaMadre: number; sexoHijo: string; }
export interface Outputs { tallaDiana: string; rangoEstimado: string; explicacion: string; }

export function estaturaAdultaHijo(i: Inputs): Outputs {
  const padre = Number(i.alturaPadre);
  const madre = Number(i.alturaMadre);
  const sexo = String(i.sexoHijo);
  if (!padre || padre < 140 || padre > 220) throw new Error('Ingresá la estatura del padre (140-220 cm)');
  if (!madre || madre < 130 || madre > 200) throw new Error('Ingresá la estatura de la madre (130-200 cm)');

  let talla: number;
  if (sexo === 'f') {
    talla = (padre + madre - 13) / 2;
  } else {
    talla = (padre + madre + 13) / 2;
  }

  const min = talla - 8.5;
  const max = talla + 8.5;

  const sexoLabel = sexo === 'f' ? 'hija' : 'hijo';
  const formula = sexo === 'f'
    ? `(${padre} + ${madre} − 13) ÷ 2 = ${talla.toFixed(1)} cm`
    : `(${padre} + ${madre} + 13) ÷ 2 = ${talla.toFixed(1)} cm`;

  return {
    tallaDiana: `${talla.toFixed(1)} cm`,
    rangoEstimado: `${min.toFixed(1)} cm a ${max.toFixed(1)} cm (±8,5 cm)`,
    explicacion: `Tu ${sexoLabel} tendría una estatura adulta estimada de ${talla.toFixed(1)} cm. Fórmula: ${formula}. El rango de ±8,5 cm cubre al 95% de los casos.`,
  };
}
