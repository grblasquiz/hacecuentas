export interface Inputs {
  monto_retiro: number;
  frecuencia_mensual: number;
  tiene_cuenta_exenta: 'si' | 'no';
  monto_exento_uvt?: number;
}

export interface Outputs {
  gmf_por_movimiento: number;
  gmf_mensual_sin_exencion: number;
  gmf_mensual_con_exencion: number;
  ahorro_mensual_exencion: number;
  gmf_anual: number;
  ahorro_anual_exencion: number;
  uvt_valor_2026: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes Colombia 2026 - DIAN
  const TASA_GMF = 0.004; // 0.4% = 4×1000
  const UVT_2026 = 48681; // Valor UVT 2026 pesos colombianos
  const EXENCION_MAXIMA_UVT = 350; // UVT exentos por mes
  
  // Validación de inputs
  const monto = Math.max(0, i.monto_retiro || 0);
  const frecuencia = Math.max(1, Math.min(31, i.frecuencia_mensual || 1));
  const tieneExencion = i.tiene_cuenta_exenta === 'si';
  const uvtExentos = tieneExencion ? Math.min(EXENCION_MAXIMA_UVT, (i.monto_exento_uvt || 0)) : 0;
  
  // Cálculos básicos
  const gmfPorMovimiento = monto * TASA_GMF;
  const gmfMensualSinExencion = gmfPorMovimiento * frecuencia;
  
  // Exención en pesos
  const exencionEnPesos = uvtExentos * UVT_2026;
  
  // GMF mensual con exención (no puede ser negativo)
  const gmfMensualConExencion = Math.max(0, gmfMensualSinExencion - exencionEnPesos);
  
  // Ahorro mensual por exención
  const ahorroMensualExencion = gmfMensualSinExencion - gmfMensualConExencion;
  
  // Proyecciones anuales (12 meses)
  // Nota: La exención NO es acumulable, se aplica mensual
  // Si la exención es mayor que el GMF mensual, solo aplica hasta cubrir GMF
  const gmfAnual = gmfMensualConExencion * 12;
  const ahorroAnualExencion = ahorroMensualExencion * 12;
  
  return {
    gmf_por_movimiento: Math.round(gmfPorMovimiento),
    gmf_mensual_sin_exencion: Math.round(gmfMensualSinExencion),
    gmf_mensual_con_exencion: Math.round(gmfMensualConExencion),
    ahorro_mensual_exencion: Math.round(ahorroMensualExencion),
    gmf_anual: Math.round(gmfAnual),
    ahorro_anual_exencion: Math.round(ahorroAnualExencion),
    uvt_valor_2026: UVT_2026
  };
}
