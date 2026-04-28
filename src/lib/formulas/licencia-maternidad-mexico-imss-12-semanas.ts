export interface Inputs {
  salario_diario_integrado: number;
  semanas_cotizadas: number;
  fecha_parto_estimada: string; // YYYY-MM-DD
}

export interface Outputs {
  cumple_requisito: boolean;
  uma_diaria_2026: number;
  salario_diario_pagado: number;
  subsidio_total_maternidad: number;
  fecha_inicio_licencia: string;
  fecha_fin_licencia: string;
  dias_pagados: number;
  diferencia_sdi_vs_limite: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México
  // UMA 2026: $2,500 diarios (INEGI)
  const UMA_DIARIA_2026 = 2500;
  
  // Límite IMSS: 25 veces UMA diaria
  const LIMITE_UMA = 25 * UMA_DIARIA_2026; // $62,500 MXN
  
  // Requisito mínimo: 30 semanas cotizadas últimos 12 meses
  const SEMANAS_MINIMAS = 30;
  
  // Duración licencia: 12 semanas = 84 días (6 semanas antes + 6 semanas después)
  const DIAS_LICENCIA = 84;
  const DIAS_ANTES_PARTO = 42;
  const DIAS_DESPUES_PARTO = 42;
  
  // 1. Validar requisito mínimo
  const cumple_requisito = i.semanas_cotizadas >= SEMANAS_MINIMAS;
  
  // 2. Salario diario pagado: mínimo entre SDI e límite IMSS
  const salario_diario_pagado = Math.min(
    i.salario_diario_integrado,
    LIMITE_UMA
  );
  
  // 3. Subsidio total: salario diario × 84 días
  let subsidio_total_maternidad = 0;
  if (cumple_requisito) {
    subsidio_total_maternidad = salario_diario_pagado * DIAS_LICENCIA;
  } else {
    // Sin requisito mínimo, no hay subsidio IMSS
    subsidio_total_maternidad = 0;
  }
  
  // 4. Fechas de licencia
  const fecha_parto = new Date(i.fecha_parto_estimada);
  
  // Inicio: 42 días antes del parto
  const fecha_inicio = new Date(fecha_parto);
  fecha_inicio.setDate(fecha_inicio.getDate() - DIAS_ANTES_PARTO);
  const fecha_inicio_licencia = fecha_inicio.toISOString().split('T')[0];
  
  // Fin: 42 días después del parto
  const fecha_fin = new Date(fecha_parto);
  fecha_fin.setDate(fecha_fin.getDate() + DIAS_DESPUES_PARTO);
  const fecha_fin_licencia = fecha_fin.toISOString().split('T')[0];
  
  // 5. Diferencia si SDI excede límite IMSS
  const diferencia_sdi_vs_limite = Math.max(
    0,
    (i.salario_diario_integrado - LIMITE_UMA) * DIAS_LICENCIA
  );
  
  // 6. Días pagados
  const dias_pagados = cumple_requisito ? DIAS_LICENCIA : 0;
  
  return {
    cumple_requisito,
    uma_diaria_2026: UMA_DIARIA_2026,
    salario_diario_pagado,
    subsidio_total_maternidad: Math.round(subsidio_total_maternidad * 100) / 100,
    fecha_inicio_licencia,
    fecha_fin_licencia,
    dias_pagados,
    diferencia_sdi_vs_limite: Math.round(diferencia_sdi_vs_limite * 100) / 100
  };
}
