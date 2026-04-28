export interface Inputs {
  edad: number;
  pension_actual: number;
  rsh_decil: number;
  numero_dependientes: number;
  es_indigena: 'si' | 'no';
}

export interface Outputs {
  elegible_aps: boolean;
  pmas_2026: number;
  brecha_pension: number;
  aps_complemento: number;
  pension_total_aps: number;
  motivo_ineligibilidad: string;
  referencias_pgu: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile — Fuente: SII, Banco Central
  // PMAS 2026: Pensión Máxima con Aporte Solidario, actualizado IPC ene-2026
  const PMAS_2026 = 220000; // $\u00a0MXN/mes aprox., SII confirmará enero
  const EDAD_MINIMA_APS = 65;
  const RSH_DECIL_MAX_VULNERABLE = 4; // Deciles 1–4 = 40% vulnerable
  const COTIZACION_MINIMA_ANOS = 20; // Histórico, para validación
  const PGU_2026_REFERENCIAL = 225000; // Pensión Garantizada Universal 2026

  // Validaciones de elegibilidad
  const errores: string[] = [];

  if (i.edad < EDAD_MINIMA_APS) {
    errores.push(`Edad mínima para APS: ${EDAD_MINIMA_APS} años. Tu edad: ${i.edad}.`);
  }

  if (i.rsh_decil > RSH_DECIL_MAX_VULNERABLE || i.rsh_decil < 1) {
    errores.push(
      `RSH decil debe estar entre 1 y ${RSH_DECIL_MAX_VULNERABLE} para APS. ` +
      `Tu decil: ${i.rsh_decil} está fuera del rango vulnerable.`
    );
  }

  if (i.pension_actual >= PMAS_2026) {
    errores.push(
      `Tu pensión actual ($\u00a0${i.pension_actual.toLocaleString('es-CL')}) ` +
      `ya iguala o supera PMAS 2026 ($\u00a0${PMAS_2026.toLocaleString('es-CL')}). ` +
      `No hay complemento APS.`
    );
  }

  const elegible = errores.length === 0;

  // Cálculo del complemento APS
  let aps_complemento = 0;
  let brecha_pension = 0;

  if (elegible) {
    brecha_pension = Math.max(0, PMAS_2026 - i.pension_actual);
    aps_complemento = brecha_pension;

    // Factor adicional si edad >= 70 (bonificación histórica ~5%)
    // Nota: esto es referencial; SII confirmará en casos específicos
    if (i.edad >= 70) {
      aps_complemento = aps_complemento * 1.05;
    }

    // Factor si es indígena (vulnerabilidad adicional, bonificación ~3%)
    if (i.es_indigena === 'si') {
      aps_complemento = aps_complemento * 1.03;
    }

    // Ajuste por dependientes (histórico: hasta 2 dependientes, ~2% por cada uno)
    if (i.numero_dependientes > 0 && i.numero_dependientes <= 2) {
      aps_complemento = aps_complemento * (1 + i.numero_dependientes * 0.02);
    }

    // Límite superior: no puede superar brecha original (sin exceso sobre PMAS)
    aps_complemento = Math.min(aps_complemento, brecha_pension);
  } else {
    brecha_pension = Math.max(0, PMAS_2026 - i.pension_actual);
  }

  const pension_total_aps = i.pension_actual + aps_complemento;

  // Mensaje de ineligibilidad
  const motivo_ineligibilidad =
    errores.length > 0
      ? errores.join(' | ')
      : 'Cumplís requisitos APS (referencial 2026).';

  // Referencia PGU
  const referencias_pgu =
    elegible
      ? `APS 2026 (histórico): $\u00a0${aps_complemento.toLocaleString('es-CL', {
          maximumFractionDigits: 0,
        })} MXN/mes. ` +
        `Desde 2022, estás bajo PGU: monto garantizado ~$\u00a0${PGU_2026_REFERENCIAL.toLocaleString(
          'es-CL',
          { maximumFractionDigits: 0 }
        )} MXN/mes (monto real: consulta SII).`
      : `No elegible APS. Verifica tu estado en PGU 2022+ ` +
        `(https://www.sii.cl). PGU 2026 refencial: ~$\u00a0${PGU_2026_REFERENCIAL.toLocaleString(
          'es-CL',
          { maximumFractionDigits: 0 }
        )} MXN/mes.`;

  return {
    elegible_aps: elegible,
    pmas_2026: PMAS_2026,
    brecha_pension: Math.round(brecha_pension),
    aps_complemento: Math.round(aps_complemento),
    pension_total_aps: Math.round(pension_total_aps),
    motivo_ineligibilidad: motivo_ineligibilidad,
    referencias_pgu: referencias_pgu,
  };
}
