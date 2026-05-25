/**
 * Calculadora de indemnización por Incapacidad Laboral Permanente Parcial Definitiva (ILPPD)
 * Ley 24.557 Art. 14 + Ley 26.773 Art. 3° (20%) + Decreto 659/96 (baremo)
 *
 * Fórmula clásica del Art. 14 LRT:
 *   Indemnización = 53 × VIB × (65/edad) × (%incapacidad/100)
 *
 * Categorías de incapacidad (Art. 8 LRT):
 *   < 50%        → Parcial (indemnización única, Art. 14 inc. 2 a)
 *   50% - 65%    → Parcial con derecho a renta (Art. 14 inc. 2 b)
 *   >= 66%       → Total (renta vitalicia o pago único, Art. 15 LRT)
 *
 * Adicional 20% Ley 26.773 Art. 3° (no aplica para in itinere).
 * Nota: esta calc aplica el 20% por defecto al estilo accidente laboral; el usuario
 * puede descontarlo manualmente si el siniestro fue in itinere (informado en mensaje).
 */

export interface ArtIndemnizacionInputs {
  sueldoBrutoMensual: number;
  edadTrabajador: number;
  porcentajeIncapacidad: number;
}

export interface ArtIndemnizacionOutputs {
  indemnizacionUnica: number;
  indemnizacionBaseLRT: number;
  adicional20Ley26773: number;
  valorIngresoBase: number;
  factorEdad: string;
  categoriaIncapacidad: string;
  mensaje: string;
}

const COEFICIENTE_LRT = 53;

export function artIndemnizacionTablaIncapacidadPermanente(
  inputs: ArtIndemnizacionInputs,
): ArtIndemnizacionOutputs {
  const sueldo = Number(inputs.sueldoBrutoMensual);
  const edad = Math.max(16, Math.min(75, Number(inputs.edadTrabajador) || 0));
  const porc = Math.max(
    1,
    Math.min(100, Number(inputs.porcentajeIncapacidad) || 0),
  );

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo bruto mensual (VIB)');
  }
  if (!edad || edad < 16) {
    throw new Error('Ingresá una edad válida (16-75 años)');
  }
  if (!porc || porc < 1) {
    throw new Error('Ingresá el porcentaje de incapacidad');
  }

  // Factor edad: 65 / edad
  const factorEdadNum = 65 / edad;

  // Fórmula Art. 14 LRT
  const indemnizacionBaseLRT =
    COEFICIENTE_LRT * sueldo * factorEdadNum * (porc / 100);

  // Adicional 20% Ley 26.773 Art. 3° (asumimos accidente en el lugar de trabajo;
  // el usuario debe descartarlo si fue in itinere)
  const adicional20Ley26773 = indemnizacionBaseLRT * 0.2;

  const indemnizacionUnica = indemnizacionBaseLRT + adicional20Ley26773;

  // Categorización Art. 8 LRT
  let categoriaIncapacidad: string;
  let mensaje: string;

  if (porc >= 66) {
    categoriaIncapacidad =
      'Incapacidad TOTAL (≥66%) — Art. 8° inc. 3 LRT';
    mensaje =
      'Tu incapacidad es TOTAL. Podés optar entre renta vitalicia previsional o pago ' +
      'único capitalizado (Art. 15 LRT). Aplican pisos mínimos especiales por Ley ' +
      '26.773 Art. 17°. Verificá la Resolución SRT vigente.';
  } else if (porc >= 50) {
    categoriaIncapacidad =
      'Incapacidad PARCIAL con derecho a prestaciones (50-65%) — Art. 14 inc. 2 b';
    mensaje =
      'Tu incapacidad supera el 50%: además de la indemnización única podés tener ' +
      'derecho a prestaciones adicionales del Art. 14 inc. 2 b LRT. Consultá con ' +
      'la Comisión Médica el detalle de las prestaciones complementarias.';
  } else {
    categoriaIncapacidad =
      'Incapacidad PARCIAL (<50%) — indemnización única Art. 14 inc. 2 a';
    mensaje =
      'Indemnización única (pago de capital, sin renta). Verificá que el monto no sea ' +
      'inferior al piso mínimo de la Resolución SRT vigente. El 20% adicional corresponde ' +
      'salvo accidente in itinere (CNAT \"Argüello\").';
  }

  // Advertencia adicional si el trabajador es joven
  if (edad <= 25) {
    mensaje +=
      ' Tenés menos de 25 años: el factor 65/edad es alto y eleva sensiblemente la ' +
      'indemnización. Verificá que el dictamen contemple los años de proyección laboral perdidos.';
  }

  const factorEdad = `${factorEdadNum.toFixed(4)} (= 65 / ${edad})`;

  return {
    indemnizacionUnica: Math.round(indemnizacionUnica),
    indemnizacionBaseLRT: Math.round(indemnizacionBaseLRT),
    adicional20Ley26773: Math.round(adicional20Ley26773),
    valorIngresoBase: Math.round(sueldo),
    factorEdad,
    categoriaIncapacidad,
    mensaje,
  };
}
