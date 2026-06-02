/** Predicción de estatura adulta del hijo — Tanner */
export interface Inputs { alturaPadre: number; alturaMadre: number; sexoHijo: string; __lang?: string; }
export interface Outputs { tallaDiana: string; rangoEstimado: string; explicacion: string; _insight?: any; }

export function estaturaAdultaHijo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const padre = Number(i.alturaPadre);
  const madre = Number(i.alturaMadre);
  const sexo = String(i.sexoHijo);
  if (!padre || padre < 140 || padre > 220) throw new Error(
    __lang === 'en' ? 'Enter the father\'s height (140-220 cm)' : 'Ingresá la estatura del padre (140-220 cm)'
  );
  if (!madre || madre < 130 || madre > 200) throw new Error(
    __lang === 'en' ? 'Enter the mother\'s height (130-200 cm)' : 'Ingresá la estatura de la madre (130-200 cm)'
  );

  let talla: number;
  if (sexo === 'f') {
    talla = (padre + madre - 13) / 2;
  } else {
    talla = (padre + madre + 13) / 2;
  }

  const min = talla - 8.5;
  const max = talla + 8.5;

  const sexoLabel = sexo === 'f'
    ? (__lang === 'en' ? 'daughter' : 'hija')
    : (__lang === 'en' ? 'child' : 'hijo');
  const formula = sexo === 'f'
    ? `(${padre} + ${madre} − 13) ÷ 2 = ${talla.toFixed(1)} cm`
    : `(${padre} + ${madre} + 13) ÷ 2 = ${talla.toFixed(1)} cm`;

  return {
    tallaDiana: `${talla.toFixed(1)} cm`,
    rangoEstimado: __lang === 'en'
      ? `${min.toFixed(1)} cm to ${max.toFixed(1)} cm (±8.5 cm)`
      : `${min.toFixed(1)} cm a ${max.toFixed(1)} cm (±8,5 cm)`,
    explicacion: __lang === 'en'
      ? `Your ${sexoLabel} would have an estimated adult height of ${talla.toFixed(1)} cm. Formula: ${formula}. The ±8.5 cm range covers 95% of cases.`
      : `Tu ${sexoLabel} tendría una estatura adulta estimada de ${talla.toFixed(1)} cm. Fórmula: ${formula}. El rango de ±8,5 cm cubre al 95% de los casos.`,
    _insight: {
      title: __lang === 'en' ? 'Estimate, not a sentence' : 'Es una estimación, no un destino',
      text: __lang === 'en'
        ? `The genetic target points to **${talla.toFixed(1)} cm**, but the real outcome can land anywhere between **${min.toFixed(1)}** and **${max.toFixed(1)} cm**. Nutrition, sleep and overall health move the final number within that range.`
        : `La diana genética apunta a **${talla.toFixed(1)} cm**, pero el resultado real puede caer entre **${min.toFixed(1)}** y **${max.toFixed(1)} cm**. La nutrición, el sueño y la salud general mueven el número final dentro de ese rango.`,
      tone: 'neutral',
      icon: '📏',
    },
  };
}
