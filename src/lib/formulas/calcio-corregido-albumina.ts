/**
 * Calcio corregido por albúmina (fórmula de Payne, 1973).
 *
 *   Ca corregido (mg/dL) = Ca medido + 0,8 × (4,0 − albúmina g/dL)
 *
 * Por qué existe la corrección: en sangre, cerca de la mitad del calcio circula
 * unido a proteínas, sobre todo albúmina. El calcio total que informa el
 * laboratorio incluye esa fracción unida, que NO es la biológicamente activa.
 * Si la albúmina está baja —algo muy común en internación, hepatopatía o
 * síndrome nefrótico— el calcio total cae aunque el calcio iónico esté normal,
 * y sin corregir se diagnostica una hipocalcemia que no existe.
 *
 * Limitación importante y bien documentada: la fórmula de Payne se derivó de una
 * población concreta y su desempeño es pobre en enfermedad renal crónica
 * avanzada y en pacientes críticos. Cuando la decisión clínica depende del
 * resultado, la referencia es el CALCIO IÓNICO medido, no esta estimación.
 * La calculadora lo dice en el resultado en lugar de dejarlo en la letra chica.
 *
 * Unidades: acepta mg/dL (habitual en América Latina) y mmol/L (Europa).
 * La conversión de calcio es 1 mmol/L = 4,008 mg/dL; la de albúmina,
 * 1 g/dL = 10 g/L.
 */

const CA_MMOL_A_MGDL = 4.008;
const ALBUMINA_REFERENCIA_GDL = 4.0;
const FACTOR_PAYNE = 0.8;

export interface CalcioCorregidoInputs {
  calcio: number | string;
  albumina: number | string;
  unidadCalcio?: 'mg/dL' | 'mmol/L' | string;
  unidadAlbumina?: 'g/dL' | 'g/L' | string;
  __lang?: string;
}

export interface CalcioCorregidoOutputs {
  calcioCorregido: number;
  calcioCorregidoMmol: number;
  calcioMedidoMgdl: number;
  albuminaGdl: number;
  correccionAplicada: number;
  interpretacion: string;
  advertencia: string;
}

/** Rango de referencia habitual de calcio total en adultos: 8,5–10,5 mg/dL. */
function clasificar(caMgdl: number): string {
  if (caMgdl < 7.0) return 'Hipocalcemia grave (<7,0 mg/dL)';
  if (caMgdl < 8.5) return 'Hipocalcemia (<8,5 mg/dL)';
  if (caMgdl <= 10.5) return 'Dentro del rango de referencia (8,5–10,5 mg/dL)';
  if (caMgdl <= 12.0) return 'Hipercalcemia leve (10,6–12,0 mg/dL)';
  if (caMgdl <= 14.0) return 'Hipercalcemia moderada (12,1–14,0 mg/dL)';
  return 'Hipercalcemia grave (>14,0 mg/dL)';
}

export function calcioCorregidoAlbumina(
  inputs: CalcioCorregidoInputs,
): CalcioCorregidoOutputs {
  let calcio = Number(inputs.calcio);
  let albumina = Number(inputs.albumina);

  if (!calcio || calcio <= 0) {
    throw new Error('Ingresá el calcio total del laboratorio.');
  }
  if (!albumina || albumina <= 0) {
    throw new Error('Ingresá la albúmina sérica del laboratorio.');
  }

  // Normalizamos a mg/dL y g/dL.
  if (String(inputs.unidadCalcio) === 'mmol/L') calcio = calcio * CA_MMOL_A_MGDL;
  if (String(inputs.unidadAlbumina) === 'g/L') albumina = albumina / 10;

  const correccion = FACTOR_PAYNE * (ALBUMINA_REFERENCIA_GDL - albumina);
  const corregido = calcio + correccion;

  const avisos: string[] = [];

  if (albumina >= 3.9 && albumina <= 4.1) {
    avisos.push(
      'Con la albúmina prácticamente en el valor de referencia (4,0 g/dL) la corrección es casi nula: el calcio total ya es representativo.',
    );
  }
  if (correccion < 0) {
    avisos.push(
      'La albúmina está por encima de 4,0 g/dL, así que la corrección BAJA el calcio: el total estaba inflado por la fracción unida a proteínas.',
    );
  }
  if (albumina < 2.0) {
    avisos.push(
      'Con albúmina muy baja la fórmula de Payne pierde exactitud y tiende a sobrecorregir. Acá el calcio iónico medido es especialmente preferible.',
    );
  }

  avisos.push(
    'La fórmula de Payne es una estimación con desempeño pobre en enfermedad renal crónica avanzada y en pacientes críticos. Si la conducta clínica depende del valor, la referencia es el calcio iónico medido, no esta corrección.',
  );

  const corregidoRedondeado = Number(corregido.toFixed(2));
  const categoria = clasificar(corregidoRedondeado);

  const interpretacion =
    `Calcio total medido: ${calcio.toFixed(2)} mg/dL con albúmina de ${albumina.toFixed(2)} g/dL. ` +
    `Corrección aplicada: ${correccion >= 0 ? '+' : ''}${correccion.toFixed(2)} mg/dL. ` +
    `Calcio corregido: ${corregidoRedondeado} mg/dL → ${categoria}.`;

  return {
    calcioCorregido: corregidoRedondeado,
    calcioCorregidoMmol: Number((corregido / CA_MMOL_A_MGDL).toFixed(2)),
    calcioMedidoMgdl: Number(calcio.toFixed(2)),
    albuminaGdl: Number(albumina.toFixed(2)),
    correccionAplicada: Number(correccion.toFixed(2)),
    interpretacion,
    advertencia: avisos.join(' '),
  };
}

export default calcioCorregidoAlbumina;
