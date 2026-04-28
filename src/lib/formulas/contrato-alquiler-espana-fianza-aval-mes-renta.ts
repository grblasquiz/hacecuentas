// Calculadora costes inicio alquiler España 2026
// Base legal: LAU (Ley 29/1994), RDL 7/2019, Ley 12/2023

export interface Inputs {
  renta_mensual: number;                  // €/mes
  tipo_arrendador: 'persona_fisica' | 'empresa';
  meses_garantia_adicional: 0 | 1 | 2;   // 0, 1 o 2 meses (máx. legal: 2)
  hay_agencia: 'no' | 'si_fisica' | 'si_empresa';
  incluir_primera_mensualidad: 'si' | 'no';
}

export interface Outputs {
  fianza_legal: number;              // 1 mes obligatorio (art. 36.1 LAU)
  garantia_adicional: number;        // 0-2 meses pactados (art. 36.5 LAU)
  comision_agencia: number;          // 1 mes si arrendador empresa + agencia
  primera_mensualidad: number;       // renta del primer mes (si se incluye)
  desembolso_total: number;          // suma de los anteriores
  duracion_minima_contrato: string;  // texto explicativo
  aviso_legalidad: string;           // advertencia si procede
}

export function compute(i: Inputs): Outputs {
  // --- Validación y normalización de inputs ---
  const renta = Math.max(0, Number(i.renta_mensual) || 0);
  const mesesGarantia = Number(i.meses_garantia_adicional) as 0 | 1 | 2;

  // --- Fianza legal obligatoria: 1 mes (art. 36.1 LAU) ---
  // Fuente: Ley 29/1994, art. 36.1
  const MESES_FIANZA_LEGAL = 1;
  const fianza_legal = renta * MESES_FIANZA_LEGAL;

  // --- Garantía adicional: 0, 1 o 2 meses (art. 36.5 LAU) ---
  // Fuente: Ley 29/1994, art. 36.5 (modificado por RDL 7/2019)
  // Límite máximo: 2 mensualidades en contratos de vivienda habitual
  const MAXIMO_MESES_GARANTIA_ADICIONAL = 2;
  const mesesGarantiaEfectivos = Math.min(
    Math.max(0, mesesGarantia),
    MAXIMO_MESES_GARANTIA_ADICIONAL
  );
  const garantia_adicional = renta * mesesGarantiaEfectivos;

  // --- Comisión de agencia ---
  // Fuente: Ley 12/2023, art. 20: si arrendador es persona física,
  // los gastos de agencia son SIEMPRE a cargo del arrendador.
  // Si arrendador es empresa, puede pactarse a cargo del inquilino.
  let comision_agencia = 0;
  if (i.hay_agencia === 'si_empresa') {
    // Práctica habitual: 1 mensualidad (orientativo, sin IVA para vivienda)
    comision_agencia = renta * 1;
  }
  // si hay_agencia === 'si_fisica' o 'no': comisión = 0 para el inquilino

  // --- Primera mensualidad ---
  const primera_mensualidad =
    i.incluir_primera_mensualidad === 'si' ? renta : 0;

  // --- Desembolso total ---
  const desembolso_total =
    fianza_legal + garantia_adicional + comision_agencia + primera_mensualidad;

  // --- Duración mínima del contrato (art. 9 LAU, RDL 7/2019) ---
  // Persona física: 5 años; Empresa: 7 años
  let duracion_minima_contrato: string;
  if (i.tipo_arrendador === 'empresa') {
    duracion_minima_contrato =
      '7 años de duración mínima (arrendador empresa, art. 9 LAU). ' +
      'Prórroga tácita de hasta 3 años adicionales si ninguna parte comunica la extinción.';
  } else {
    duracion_minima_contrato =
      '5 años de duración mínima (arrendador persona física, art. 9 LAU). ' +
      'Prórroga tácita de hasta 3 años adicionales si ninguna parte comunica la extinción.';
  }

  // --- Aviso de legalidad ---
  let aviso_legalidad = '';

  if (mesesGarantia > MAXIMO_MESES_GARANTIA_ADICIONAL) {
    aviso_legalidad +=
      '⚠️ Has introducido más de 2 meses de garantía adicional. ' +
      'La LAU (art. 36.5) limita las garantías adicionales a un máximo de 2 mensualidades ' +
      'en contratos de vivienda habitual. Se ha aplicado el límite legal. ';
  }

  if (i.hay_agencia === 'si_fisica') {
    aviso_legalidad +=
      'ℹ️ Con arrendador persona física, los gastos de agencia son siempre a cargo del ' +
      'propietario según la Ley 12/2023. El inquilino no debe pagar comisión de agencia. ';
  }

  if (renta === 0) {
    aviso_legalidad +=
      '⚠️ Introduce una renta mensual válida para obtener el cálculo. ';
  }

  if (aviso_legalidad === '') {
    aviso_legalidad = 'Las condiciones introducidas son conformes con los límites legales de la LAU.';
  }

  return {
    fianza_legal,
    garantia_adicional,
    comision_agencia,
    primera_mensualidad,
    desembolso_total,
    duracion_minima_contrato,
    aviso_legalidad: aviso_legalidad.trim()
  };
}
