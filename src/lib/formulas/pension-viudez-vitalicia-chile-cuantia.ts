export interface Inputs {
  pension_causante: number;
  tiene_hijos_dependientes: boolean;
  cantidad_hijos: number;
  es_conyuge_invalido: boolean;
}

export interface Outputs {
  pension_conyuge: number;
  pension_total_hijos: number;
  pension_por_hijo: number;
  pension_total_grupo: number;
  porcentaje_aplicado: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Fuente: SII, Superintendencia de Pensiones
  const PORCENTAJE_VIUDEZ_SIN_HIJOS = 0.60;
  const PORCENTAJE_VIUDEZ_CON_HIJOS = 0.50;
  const PORCENTAJE_CONYUGE_INVALIDO = 0.60; // Excepción si es inválido
  const DISTRIBUCION_CONYUGE_CON_HIJOS = 0.50; // 50% del 50% para cónyuge
  const DISTRIBUCION_HIJOS = 0.50; // 50% del 50% para hijos

  const pensionCausante = i.pension_causante || 0;
  const tieneHijos = i.tiene_hijos_dependientes || false;
  const cantidadHijos = (i.cantidad_hijos && tieneHijos) ? i.cantidad_hijos : 0;
  const esConyugeInvalido = i.es_conyuge_invalido || false;

  let pensionConyuge = 0;
  let pensionTotalHijos = 0;
  let pensionPorHijo = 0;
  let porcentajeAplicado = '';

  // Lógica de cálculo según Art. 46-47 Ley 19.071
  if (!tieneHijos) {
    // Sin hijos: cónyuge recibe 60%
    porcentajeAplicado = '60% (sin hijos dependientes)';
    pensionConyuge = pensionCausante * PORCENTAJE_VIUDEZ_SIN_HIJOS;
    pensionTotalHijos = 0;
    pensionPorHijo = 0;
  } else if (esConyugeInvalido) {
    // Cónyuge inválido: recibe 60% aunque haya hijos
    porcentajeAplicado = '60% cónyuge inválido + 40% hijos';
    pensionConyuge = pensionCausante * PORCENTAJE_CONYUGE_INVALIDO;
    pensionTotalHijos = pensionCausante * (1 - PORCENTAJE_CONYUGE_INVALIDO);
    pensionPorHijo = cantidadHijos > 0 ? pensionTotalHijos / cantidadHijos : 0;
  } else {
    // Con hijos, cónyuge válido: 50% total, distribuido 50/50 cónyuge-hijos
    porcentajeAplicado = '50% total (25% cónyuge + 25% hijos)';
    const pensionTotalGrupo = pensionCausante * PORCENTAJE_VIUDEZ_CON_HIJOS;
    pensionConyuge = pensionTotalGrupo * DISTRIBUCION_CONYUGE_CON_HIJOS;
    pensionTotalHijos = pensionTotalGrupo * DISTRIBUCION_HIJOS;
    pensionPorHijo = cantidadHijos > 0 ? pensionTotalHijos / cantidadHijos : 0;
  }

  const pensionTotalGrupo = pensionConyuge + pensionTotalHijos;

  // Validación: total no puede superar pensión causante (100%)
  const pensionTotalGrupoFinal = Math.min(pensionTotalGrupo, pensionCausante);

  // Si hay ajuste por límite, redistribuir proporcionalmente
  let pensionConyugeFinal = pensionConyuge;
  let pensionTotalHijosFinal = pensionTotalHijos;
  if (pensionTotalGrupoFinal < pensionTotalGrupo && pensionTotalGrupo > 0) {
    const factor = pensionTotalGrupoFinal / pensionTotalGrupo;
    pensionConyugeFinal = pensionConyuge * factor;
    pensionTotalHijosFinal = pensionTotalHijos * factor;
  }

  const pensionPorHijoFinal = cantidadHijos > 0 ? pensionTotalHijosFinal / cantidadHijos : 0;

  return {
    pension_conyuge: Math.round(pensionConyugeFinal),
    pension_total_hijos: Math.round(pensionTotalHijosFinal),
    pension_por_hijo: Math.round(pensionPorHijoFinal),
    pension_total_grupo: Math.round(pensionTotalGrupoFinal),
    porcentaje_aplicado: porcentajeAplicado
  };
}
