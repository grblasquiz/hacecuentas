export interface Inputs {
  sector_actividad: 'agricola' | 'ganaderia' | 'transporte' | 'mineria_pequena' | 'forestal';
  avaluo_fiscal: number; // UF
  valor_uf: number; // CLP por UF
  ventas_anuales: number; // CLP
  numero_vehiculos?: number;
  verificar_contabilidad?: boolean;
  ganancia_estimada_contabilidad?: number; // CLP
}

export interface Outputs {
  base_imponible_presunta: number;
  tasa_presuntiva_usada: number;
  impuesto_primera_categoria: number;
  impuesto_global_complementario: number;
  carga_impositiva_total: number;
  cumple_tope_ventas: string;
  comparativa_contabilidad: number;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Tasas presuntivas 2026 SII por sector
  const tasasPresuntivas: Record<string, number> = {
    'agricola': 0.07,
    'ganaderia': 0.09,
    'transporte': 0.10,
    'mineria_pequena': 0.05,
    'forestal': 0.06
  };

  const tasaPresuntiva = tasasPresuntivas[i.sector_actividad] || 0.07;
  const topeVentas = 100_000_000; // $100M CLP
  const tasaPrimeraCategoria = 0.27; // 27% 2026
  const tasaGlobalBase = 0.04; // Tramo base estimado Global Complementario

  // 1. Calcular Base Imponible Presunta
  const avaluo_clp = i.avaluo_fiscal * i.valor_uf;
  const base_imponible_presunta = Math.round(avaluo_clp * tasaPresuntiva);

  // 2. Impuesto Primera Categoría
  const impuesto_primera_categoria = Math.round(base_imponible_presunta * tasaPrimeraCategoria);

  // 3. Estimación Global Complementario (simplificado)
  // UTA 2026 aprox. 47.280 CLP; tramo medio estimado 4–8%
  const uta_2026 = 47_280;
  const renta_presunta_neta = base_imponible_presunta * 0.85; // Aprox. tras deducciones
  const renta_en_utas = renta_presunta_neta / uta_2026;
  
  let tasaGlobalComplementario = 0;
  if (renta_en_utas > 13.5 && renta_en_utas <= 30) {
    tasaGlobalComplementario = 0.04;
  } else if (renta_en_utas > 30 && renta_en_utas <= 60) {
    tasaGlobalComplementario = 0.08;
  } else if (renta_en_utas > 60) {
    tasaGlobalComplementario = 0.14;
  }
  // Si <= 13.5 UTA: exento (0%)

  const impuesto_global_complementario = Math.round(renta_presunta_neta * tasaGlobalComplementario);

  // 4. Carga Impositiva Total
  const carga_impositiva_total = impuesto_primera_categoria + impuesto_global_complementario;

  // 5. Verificar tope $100M
  const cumple_tope_ventas = i.ventas_anuales <= topeVentas ? 'Sí, cumple' : 'No, supera tope';

  // 6. Comparativa con Contabilidad (si se solicita)
  let comparativa_contabilidad = 0;
  let recomendacion = '';

  if (i.verificar_contabilidad && i.ganancia_estimada_contabilidad !== undefined) {
    const impuesto_contabilidad_1cat = Math.round(i.ganancia_estimada_contabilidad * tasaPrimeraCategoria);
    const ganancia_neta_cont = i.ganancia_estimada_contabilidad * 0.85;
    const renta_cont_utas = ganancia_neta_cont / uta_2026;
    
    let tasaGlobalContabilidad = 0;
    if (renta_cont_utas > 13.5 && renta_cont_utas <= 30) {
      tasaGlobalContabilidad = 0.04;
    } else if (renta_cont_utas > 30 && renta_cont_utas <= 60) {
      tasaGlobalContabilidad = 0.08;
    } else if (renta_cont_utas > 60) {
      tasaGlobalContabilidad = 0.14;
    }
    
    const impuesto_contabilidad_global = Math.round(ganancia_neta_cont * tasaGlobalContabilidad);
    const carga_contabilidad = impuesto_contabilidad_1cat + impuesto_contabilidad_global;
    
    comparativa_contabilidad = carga_impositiva_total - carga_contabilidad;
    
    if (comparativa_contabilidad > 0) {
      recomendacion = `Presunta genera $${comparativa_contabilidad.toLocaleString('es-CL')} más impuesto. Considera cambiar a contabilidad si márgenes reales son altos.`;
    } else if (comparativa_contabilidad < 0) {
      recomendacion = `Presunta ahorra $${Math.abs(comparativa_contabilidad).toLocaleString('es-CL')} vs contabilidad. Viable si gastos reales son >30% ventas.`;
    } else {
      recomendacion = 'Presunta y contabilidad generan carga similar. Elige según complejidad operativa.';
    }
  } else {
    if (i.ventas_anuales <= topeVentas) {
      recomendacion = `Accedes a renta presunta (ventas $${i.ventas_anuales.toLocaleString('es-CL')} ≤ $100M). Viable si gastos reales >30% ingresos. Asesoría tributaria recomendada.`;
    } else {
      recomendacion = `Superas tope $100M. Obligatorio régimen optativo (contabilidad completa). Renta presunta no aplica.`;
    }
  }

  return {
    base_imponible_presunta,
    tasa_presuntiva_usada: Math.round(tasaPresuntiva * 10000) / 100, // Porcentaje
    impuesto_primera_categoria,
    impuesto_global_complementario,
    carga_impositiva_total,
    cumple_tope_ventas,
    comparativa_contabilidad,
    recomendacion
  };
}
