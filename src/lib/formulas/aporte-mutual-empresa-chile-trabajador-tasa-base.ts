export interface Inputs {
  salario_bruto_mensual: number;
  numero_trabajadores: number;
  clasificacion_riesgo: 'bajo' | 'medio' | 'alto';
  tasa_cotizacion_adicional: number;
  mutualidad_seleccionada: 'achs' | 'ist' | 'mutual_seguridad';
}

export interface Outputs {
  tasa_total_aporte: number;
  aporte_mensual_por_trabajador: number;
  aporte_mensual_total: number;
  aporte_anual_total: number;
  cobertura_descripcion: string;
  aporte_como_porcentaje_planilla: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile – Ley 16.744 (SII)
  const TASA_BASE_APORTE_MUTUAL = 0.0095; // 0.95% base legal obligatorio
  const TASA_MAXIMA_ADICIONAL = 0.0245; // 2.45% máximo riesgo
  
  // Validaciones básicas
  const salario = Math.max(0, i.salario_bruto_mensual || 0);
  const trabajadores = Math.max(1, Math.floor(i.numero_trabajadores || 1));
  const cotizacion_riesgo = Math.min(
    TASA_MAXIMA_ADICIONAL,
    Math.max(0, (i.tasa_cotizacion_adicional || 0) / 100)
  );
  
  // Cálculo de tasa total
  const tasa_total = TASA_BASE_APORTE_MUTUAL + cotizacion_riesgo;
  
  // Aporte mensual por trabajador
  const aporte_por_trabajador = salario * tasa_total;
  
  // Aporte mensual total nómina
  const aporte_mensual = aporte_por_trabajador * trabajadores;
  
  // Aporte anual
  const aporte_anual = aporte_mensual * 12;
  
  // Porcentaje sobre nómina total
  const nomina_total_mensual = salario * trabajadores;
  const porcentaje_nomina = nomina_total_mensual > 0 
    ? (aporte_mensual / nomina_total_mensual) * 100 
    : 0;
  
  // Descripción de cobertura según mutualidad
  let cobertura = '';
  const mutualidades = {
    'achs': 'ACHS: Cobertura integral accidentes trabajo y enfermedades profesionales. Incluye atención médica, subsidios incapacidad, pensiones invalidez/sobrevivientes, rehabilitación profesional.',
    'ist': 'IST: Cobertura legal completa (Ley 16.744). Prestaciones médicas, económicas, rehabilitación, pensiones de invalidez y sobrevivencia por accidentes del trabajo.',
    'mutual_seguridad': 'Mutual de Seguridad: Aseguramiento integral contra accidentes laborales y enfermedades ocupacionales. Atención sin copago, pensiones por invalidez, prestaciones en dinero.'
  };
  cobertura = mutualidades[i.mutualidad_seleccionada] || 
    'Cobertura integral según Ley 16.744: atención médica, subsidios, pensiones invalidez/sobrevivientes.';
  
  return {
    tasa_total_aporte: Math.round(tasa_total * 10000) / 100, // Redondear a 2 decimales %
    aporte_mensual_por_trabajador: Math.round(aporte_por_trabajador),
    aporte_mensual_total: Math.round(aporte_mensual),
    aporte_anual_total: Math.round(aporte_anual),
    cobertura_descripcion: cobertura,
    aporte_como_porcentaje_planilla: Math.round(porcentaje_nomina * 100) / 100
  };
}
