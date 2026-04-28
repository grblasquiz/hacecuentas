export interface Inputs {
  genero: 'masculino' | 'femenino';
  edad_actual: number;
  semanas_cotizadas: number;
  ibl_promedio_10_anos: number;
  incluir_comparativa_rais: boolean;
}

export interface Outputs {
  elegible: boolean;
  motivo_inelegibilidad: string;
  semanas_adicionales: number;
  porcentaje_pension: number;
  pension_mensual_bruta: number;
  pension_minima_legal: number;
  pension_maxima_legal: number;
  pension_aplicable: number;
  diferencia_rais: number;
  retencion_aporte_afiliado: number;
  retencion_salud: number;
  pension_neta_estimada: number;
  fondo_garantia_pensional: boolean;
  anos_faltantes: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia (DIAN + Colpensiones)
  const SMLM_2026 = 1160000; // Salario Mínimo Legal Mensual aprox.
  const TECHO_PENSION = SMLM_2026 * 5; // 5 × SMLM
  const EDAD_MIN_HOMBRE = 62;
  const EDAD_MIN_MUJER = 57;
  const SEMANAS_MINIMO = 1300; // Requisito mínimo Colpensiones
  const PORCENTAJE_BASE = 0.55; // 55% base
  const APORTE_AFILIADO = 0.04; // 4% retención aporte pensional
  const RETENCION_SALUD = 0.10; // 10% EPS (estimado variable 8-12.5%)
  const PORCENTAJE_POR_SEMANA_ADICIONAL = 0.0001; // 0.01% por semana
  const PORCENTAJE_MAXIMO = 0.79; // Máximo 79% con 2800+ semanas
  const SEMANAS_MAXIMO = 2800; // Semanas para alcanzar 79%

  // 1. Validar elegibilidad por edad
  const edad_minima = i.genero === 'masculino' ? EDAD_MIN_HOMBRE : EDAD_MIN_MUJER;
  const elegible_edad = i.edad_actual >= edad_minima;
  const elegible_semanas = i.semanas_cotizadas >= SEMANAS_MINIMO;
  const elegible = elegible_edad && elegible_semanas;

  // 2. Motivo inelegibilidad
  let motivo_inelegibilidad = '';
  if (!elegible_edad && !elegible_semanas) {
    const anos_falta_edad = edad_minima - i.edad_actual;
    const anos_falta_semanas = Math.ceil(
      (SEMANAS_MINIMO - i.semanas_cotizadas) / 52
    );
    motivo_inelegibilidad =
      `Falta ${anos_falta_edad} año(s) edad mínima (${edad_minima}) y ` +
      `${anos_falta_semanas} año(s) semanas (${SEMANAS_MINIMO} mín).`;
  } else if (!elegible_edad) {
    const anos_falta = edad_minima - i.edad_actual;
    motivo_inelegibilidad = `Falta ${anos_falta} año(s) para edad mínima (${edad_minima}).`;
  } else if (!elegible_semanas) {
    const anos_falta = Math.ceil(
      (SEMANAS_MINIMO - i.semanas_cotizadas) / 52
    );
    motivo_inelegibilidad = `Falta ${anos_falta} año(s) aprox. para 1.300 semanas mínimas.`;
  }

  // 3. Calcular semanas adicionales y porcentaje pensión
  const semanas_adicionales = Math.max(0, i.semanas_cotizadas - SEMANAS_MINIMO);
  let porcentaje_pension =
    PORCENTAJE_BASE + semanas_adicionales * PORCENTAJE_POR_SEMANA_ADICIONAL;
  porcentaje_pension = Math.min(porcentaje_pension, PORCENTAJE_MAXIMO);

  // 4. Pensión bruta (% del IBL)
  const pension_mensual_bruta = i.ibl_promedio_10_anos * porcentaje_pension;

  // 5. Pensión mínima y máxima legal
  const pension_minima_legal = SMLM_2026;
  const pension_maxima_legal = TECHO_PENSION;

  // 6. Pensión aplicable (piso y techo)
  const pension_sin_limites = pension_mensual_bruta;
  const pension_aplicable = Math.max(
    pension_minima_legal,
    Math.min(pension_sin_limites, pension_maxima_legal)
  );

  // 7. Diferencia vs. RAIS (salario mínimo)
  const diferencia_rais = pension_aplicable - SMLM_2026;

  // 8. Retenciones sobre pensión bruta
  const retencion_aporte_afiliado = pension_mensual_bruta * APORTE_AFILIADO;
  const retencion_salud = pension_mensual_bruta * RETENCION_SALUD;

  // 9. Pensión neta (aplicable − retenciones)
  const pension_neta_estimada =
    pension_aplicable - retencion_aporte_afiliado - retencion_salud;

  // 10. Fondo Garantía Pensional (si pensión bruta < SMLM)
  const fondo_garantia_pensional = pension_sin_limites < SMLM_2026;

  // 11. Años faltantes (si no elegible)
  let anos_faltantes = '';
  if (!elegible) {
    if (!elegible_edad && !elegible_semanas) {
      const y_edad = edad_minima - i.edad_actual;
      const y_semanas = Math.ceil((SEMANAS_MINIMO - i.semanas_cotizadas) / 52);
      anos_faltantes = `${y_edad} año(s) edad, ${y_semanas} año(s) semanas.`;
    } else if (!elegible_edad) {
      const y = edad_minima - i.edad_actual;
      anos_faltantes = `${y} año(s) para edad mínima.`;
    } else if (!elegible_semanas) {
      const y = Math.ceil((SEMANAS_MINIMO - i.semanas_cotizadas) / 52);
      anos_faltantes = `${y} año(s) aprox. para semanas mínimas.`;
    }
  }

  return {
    elegible,
    motivo_inelegibilidad,
    semanas_adicionales,
    porcentaje_pension: Math.round(porcentaje_pension * 10000) / 100, // % con 2 decimales
    pension_mensual_bruta: Math.round(pension_mensual_bruta),
    pension_minima_legal: SMLM_2026,
    pension_maxima_legal: TECHO_PENSION,
    pension_aplicable: Math.round(pension_aplicable),
    diferencia_rais: Math.round(diferencia_rais),
    retencion_aporte_afiliado: Math.round(retencion_aporte_afiliado),
    retencion_salud: Math.round(retencion_salud),
    pension_neta_estimada: Math.round(pension_neta_estimada),
    fondo_garantia_pensional,
    anos_faltantes
  };
}
