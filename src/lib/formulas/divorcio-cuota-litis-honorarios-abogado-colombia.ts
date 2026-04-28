export interface Inputs {
  tipo_divorcio: 'mutuo_acuerdo' | 'contencioso';
  numero_hijos: number;
  patrimonio_estimado: number;
  hay_inmuebles: 'no' | 'si' | 'multiples';
  acuerdo_custodia: 'si' | 'no';
  complejidad_laboral: 'no' | 'si_simple' | 'si_complejo';
}

export interface Outputs {
  costo_total_minimo: number;
  costo_total_maximo: number;
  duracion_meses_minimo: number;
  duracion_meses_maximo: number;
  cuota_litis_rango: string;
  honorarios_abogado: string;
  gastos_notaria: number;
  otros_gastos: number;
  resumen_pasos: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN, Colegio Abogados, Rama Judicial
  const COSTO_NOTARIA_MIN = 300000;  // pesos, DIAN 2026
  const COSTO_NOTARIA_MAX = 500000;
  const HONORARIO_ABOGADO_PORCENTAJE_MIN = 0.05;  // 5% patrimonio, Colegio Abogados
  const HONORARIO_ABOGADO_PORCENTAJE_MAX = 0.10;  // 10%
  const HONORARIO_ABOGADO_MINIMO = 3000000;  // piso $3M
  const CUOTA_LITIS_MIN = 0.10;  // 10% de lo ganado
  const CUOTA_LITIS_MAX = 0.20;  // 20%
  const GASTOS_JUZGADO_MIN = 200000;
  const GASTOS_JUZGADO_MAX = 1000000;
  const COSTO_PERITAJE_PSICOLOGICO = 2000000;  // promedio $1.5–3M
  const COSTO_AVALUO_INMUEBLE = 750000;  // promedio $500K–1M
  const COSTO_PERITAJE_CONTABLE = 3500000;  // promedio $2–5M
  const DURACION_MUTUO_ACUERDO_MIN = 1;
  const DURACION_MUTUO_ACUERDO_MAX = 3;
  const DURACION_CONTENCIOSO_MIN = 12;
  const DURACION_CONTENCIOSO_MAX = 24;

  let costo_minimo = 0;
  let costo_maximo = 0;
  let duracion_min = 0;
  let duracion_max = 0;
  let cuota_litis_pct_min = 0;
  let cuota_litis_pct_max = 0;
  let honorarios_min = 0;
  let honorarios_max = 0;
  let gastos_notaria = 0;
  let otros_gastos = 0;
  let resumen = '';

  if (i.tipo_divorcio === 'mutuo_acuerdo') {
    // Mutuo acuerdo: notaría, sin abogado obligatorio
    gastos_notaria = COSTO_NOTARIA_MIN;
    otros_gastos = 0;
    
    costo_minimo = COSTO_NOTARIA_MIN;
    costo_maximo = COSTO_NOTARIA_MAX + 300000;  // asesoría opcional
    
    duracion_min = DURACION_MUTUO_ACUERDO_MIN;
    duracion_max = DURACION_MUTUO_ACUERDO_MAX;
    
    honorarios_min = 0;
    honorarios_max = 500000;  // asesoría opcional
    
    resumen = '1. Acuerdo escrito entre cónyuges (bienes, custodia, pensión)\n' +
              '2. Asesoría notarial ($300K–500K)\n' +
              '3. Escritura pública ante notario\n' +
              '4. Registro en juzgado (1–3 meses)';
  } else {
    // Contencioso: juzgado, abogado, cuota litis
    gastos_notaria = GASTOS_JUZGADO_MIN;
    
    // Honorarios base: 5–10% patrimonio, mín $3M
    honorarios_min = Math.max(
      HONORARIO_ABOGADO_MINIMO,
      i.patrimonio_estimado * HONORARIO_ABOGADO_PORCENTAJE_MIN
    );
    honorarios_max = Math.max(
      HONORARIO_ABOGADO_MINIMO * 2,
      i.patrimonio_estimado * HONORARIO_ABOGADO_PORCENTAJE_MAX
    );
    
    // Cuota litis: 10–20% de lo ganado (estimado 40–60% patrimonio)
    const patrimonio_ganado_min = i.patrimonio_estimado * 0.4;
    const patrimonio_ganado_max = i.patrimonio_estimado * 0.6;
    
    cuota_litis_pct_min = CUOTA_LITIS_MIN * 100;
    cuota_litis_pct_max = CUOTA_LITIS_MAX * 100;
    
    otros_gastos = GASTOS_JUZGADO_MIN;
    
    // Ajustes por factores
    let factor_costo = 1.0;
    let factor_duracion = 1.0;
    
    // Hijos menores
    if (i.numero_hijos > 0) {
      otros_gastos += i.numero_hijos * COSTO_PERITAJE_PSICOLOGICO;
      factor_duracion += i.numero_hijos * 0.15;  // +4–5 meses por hijo
    }
    
    // Inmuebles
    if (i.hay_inmuebles === 'si') {
      otros_gastos += COSTO_AVALUO_INMUEBLE;
      factor_duracion += 0.2;  // +5 meses
    } else if (i.hay_inmuebles === 'multiples') {
      otros_gastos += COSTO_AVALUO_INMUEBLE * 2.5;
      factor_duracion += 0.4;  // +10 meses
    }
    
    // Custodia en disputa
    if (i.acuerdo_custodia === 'no') {
      otros_gastos += COSTO_PERITAJE_PSICOLOGICO * 0.5;  // peritaje adicional
      factor_duracion += 0.3;  // +7 meses apelaciones
    }
    
    // Complejidad laboral
    if (i.complejidad_laboral === 'si_simple') {
      factor_duracion += 0.1;  // +2–3 meses
    } else if (i.complejidad_laboral === 'si_complejo') {
      otros_gastos += COSTO_PERITAJE_CONTABLE;
      factor_duracion += 0.3;  // +7 meses
      honorarios_max *= 1.5;  // abogado especializado más caro
    }
    
    // Cálculo final
    costo_minimo = honorarios_min + (patrimonio_ganado_min * CUOTA_LITIS_MIN) + 
                   GASTOS_JUZGADO_MIN + otros_gastos;
    costo_maximo = honorarios_max + (patrimonio_ganado_max * CUOTA_LITIS_MAX) + 
                   GASTOS_JUZGADO_MAX + otros_gastos;
    
    duracion_min = Math.round(DURACION_CONTENCIOSO_MIN * factor_duracion);
    duracion_max = Math.round(DURACION_CONTENCIOSO_MAX * factor_duracion);
    duracion_min = Math.max(12, duracion_min);
    duracion_max = Math.max(duracion_min + 6, duracion_max);
    
    resumen = '1. Demanda en juzgado de familia (2–3 semanas)\n' +
              '2. Notificación al otro cónyuge (1–2 semanas)\n' +
              '3. Contestación demanda (2–4 semanas)\n' +
              '4. Pruebas (peritajes, evaluaciones) (2–6 meses)\n' +
              '5. Audiencias (2–4 sesiones)\n' +
              '6. Sentencia juzgado (6–12 meses)\n' +
              '7. Posible apelación (+6–12 meses)\n' +
              '8. Ejecutoria (fase final, división bienes)';
  }

  const honorarios_text = `$${Math.round(honorarios_min / 1000000).toLocaleString('es-CO')}M–$${Math.round(honorarios_max / 1000000).toLocaleString('es-CO')}M`;
  const cuota_litis_text = `${Math.round(cuota_litis_pct_min)}%–${Math.round(cuota_litis_pct_max)}%`;

  return {
    costo_total_minimo: Math.round(costo_minimo),
    costo_total_maximo: Math.round(costo_maximo),
    duracion_meses_minimo: duracion_min,
    duracion_meses_maximo: duracion_max,
    cuota_litis_rango: i.tipo_divorcio === 'contencioso' ? cuota_litis_text : 'N/A (mutuo acuerdo)',
    honorarios_abogado: honorarios_text,
    gastos_notaria: Math.round(gastos_notaria),
    otros_gastos: Math.round(otros_gastos),
    resumen_pasos: resumen
  };
}
