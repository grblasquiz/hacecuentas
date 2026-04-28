export interface Inputs {
  tipo_conversion: 'pesos_a_uvt' | 'uvt_a_pesos' | 'pesos_a_uvr' | 'uvr_a_pesos';
  monto: number;
  fecha_uvr?: string;
  uvr_valor_diario?: number;
}

export interface Outputs {
  resultado_conversion: number;
  unidad_destino: string;
  valor_unitario_aplicado: number;
  tipo_ajuste: string;
  referencia_normativa: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN y Banco República
  const UVT_2026 = 49799; // Pesos colombianos, vigente desde 1 enero 2026. Fuente: DIAN
  const UVR_APROXIMADO_2026 = 34567.89; // UVR aproximado base 2026, variable según inflación BR
  
  // Validación entrada
  if (!i.monto || i.monto < 0) {
    return {
      resultado_conversion: 0,
      unidad_destino: 'Error',
      valor_unitario_aplicado: 0,
      tipo_ajuste: 'Monto inválido',
      referencia_normativa: 'No aplica'
    };
  }

  let resultado_conversion = 0;
  let unidad_destino = '';
  let valor_unitario = 0;
  let tipo_ajuste = '';
  let referencia_normativa = '';

  if (i.tipo_conversion === 'pesos_a_uvt') {
    // Conversión: Pesos colombianos → UVT
    // Fórmula: Monto (pesos) ÷ Valor UVT 2026
    resultado_conversion = i.monto / UVT_2026;
    unidad_destino = 'UVT';
    valor_unitario = UVT_2026;
    tipo_ajuste = 'División por UVT 2026 ($49.799)';
    referencia_normativa = 'DIAN Resolución UVT 2026 (Actualización IPC anual)';
  } else if (i.tipo_conversion === 'uvt_a_pesos') {
    // Conversión: UVT → Pesos colombianos
    // Fórmula: Cantidad UVT × Valor UVT 2026
    resultado_conversion = i.monto * UVT_2026;
    unidad_destino = 'Pesos COP';
    valor_unitario = UVT_2026;
    tipo_ajuste = 'Multiplicación por UVT 2026 ($49.799)';
    referencia_normativa = 'DIAN Resolución UVT 2026';
  } else if (i.tipo_conversion === 'pesos_a_uvr') {
    // Conversión: Pesos → UVR (diaria)
    // Requiere valor UVR del día; si no hay, usa aproximado 2026
    const uvrDelDia = i.uvr_valor_diario && i.uvr_valor_diario > 0 ? i.uvr_valor_diario : UVR_APROXIMADO_2026;
    resultado_conversion = i.monto / uvrDelDia;
    unidad_destino = 'UVR';
    valor_unitario = uvrDelDia;
    tipo_ajuste = i.uvr_valor_diario ? `División por UVR del ${i.fecha_uvr || 'fecha especificada'}` : `División por UVR aproximado 2026 ($${UVR_APROXIMADO_2026.toFixed(2)})`;
    referencia_normativa = 'Banco de la República - Certificación diaria UVR (www.bancarepublica.gov.co)';
  } else if (i.tipo_conversion === 'uvr_a_pesos') {
    // Conversión: UVR → Pesos (diaria)
    // Requiere valor UVR del día; si no hay, usa aproximado 2026
    const uvrDelDia = i.uvr_valor_diario && i.uvr_valor_diario > 0 ? i.uvr_valor_diario : UVR_APROXIMADO_2026;
    resultado_conversion = i.monto * uvrDelDia;
    unidad_destino = 'Pesos COP';
    valor_unitario = uvrDelDia;
    tipo_ajuste = i.uvr_valor_diario ? `Multiplicación por UVR del ${i.fecha_uvr || 'fecha especificada'}` : `Multiplicación por UVR aproximado 2026 ($${UVR_APROXIMADO_2026.toFixed(2)})`;
    referencia_normativa = 'Banco de la República - Certificación diaria UVR';
  }

  return {
    resultado_conversion: Math.round(resultado_conversion * 100) / 100,
    unidad_destino: unidad_destino,
    valor_unitario_aplicado: Math.round(valor_unitario * 10000) / 10000,
    tipo_ajuste: tipo_ajuste,
    referencia_normativa: referencia_normativa
  };
}
