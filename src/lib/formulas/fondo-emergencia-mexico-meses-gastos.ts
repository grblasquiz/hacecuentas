export interface Inputs {
  gasto_renta_vivienda: number;
  gasto_predial: number;
  gasto_servicios: number;
  gasto_alimentacion: number;
  gasto_transporte: number;
  gasto_minimo_deudas: number;
  gasto_otros_esenciales: number;
  tipo_trabajo: 'formal' | 'informal' | 'freelance';
  dependientes: 'no' | '1-2' | '3-mas';
}

export interface Outputs {
  gastos_esenciales_mensuales: number;
  meses_recomendados: number;
  monto_objetivo: number;
  tiempo_ahorrar_meses: number;
  instrumentos_sugeridos: string;
  distribucion_sugerida: string;
}

export function compute(i: Inputs): Outputs {
  // Sumar gastos esenciales mensuales
  const gastos_esenciales_mensuales = 
    i.gasto_renta_vivienda +
    i.gasto_predial +
    i.gasto_servicios +
    i.gasto_alimentacion +
    i.gasto_transporte +
    i.gasto_minimo_deudas +
    i.gasto_otros_esenciales;

  // Determinar meses base según tipo de trabajo (México 2026)
  // Fuente: CONDUSEF, mejores prácticas finanzas personales México
  let meses_base = 3; // formal por defecto
  
  if (i.tipo_trabajo === 'informal') {
    meses_base = 6; // sin contrato, ingresos variables
  } else if (i.tipo_trabajo === 'freelance') {
    meses_base = 9; // autónomo, volatilidad máxima
  }
  // formal = 3

  // Ajuste por dependientes
  let ajuste_dependientes = 0;
  if (i.dependientes === '1-2') {
    ajuste_dependientes = 1; // +1 mes para 1-2 dependientes
  } else if (i.dependientes === '3-mas') {
    ajuste_dependientes = 2; // +2 meses para 3 o más
  }

  const meses_recomendados = meses_base + ajuste_dependientes;

  // Meta de fondo = gastos esenciales × meses
  const monto_objetivo = gastos_esenciales_mensuales * meses_recomendados;

  // Estimar tiempo para ahorrar (asumiendo ahorro del 10% del ingreso)
  // Ingreso estimado = gastos / 0.8 (asumiendo 80% destinado a gastos, 20% disponible)
  // Ahorro realista = 10% del ingreso = 10% / 80% = 12.5% del gasto = gastos * 0.125
  const ahorro_mensual_estimado = gastos_esenciales_mensuales * 0.125;
  const tiempo_ahorrar_meses = ahorro_mensual_estimado > 0 
    ? Math.ceil(monto_objetivo / ahorro_mensual_estimado) 
    : 0;

  // Instrumentos sugeridos según tipo de trabajo
  let instrumentos_sugeridos = '';
  
  if (i.tipo_trabajo === 'formal') {
    instrumentos_sugeridos = 
      '50% CETES Directo (10.8% anual, Banxico); ' +
      '30% Mercado Pago (10% anual, retiro 24-48h); ' +
      '20% NU Cuenta Débito (liquidez inmediata)';
  } else if (i.tipo_trabajo === 'informal') {
    instrumentos_sugeridos = 
      '40% CETES Directo (10.8% anual, Banxico); ' +
      '40% Mercado Pago (10% anual, retiro 24-48h); ' +
      '20% NU Cuenta Débito (emergencias urgentes)';
  } else {
    // freelance
    instrumentos_sugeridos = 
      '40% CETES Directo (10.8% anual, Banxico); ' +
      '40% Mercado Pago (10% anual, retiro 24-48h); ' +
      '15% NU Cuenta Débito; ' +
      '5% Efectivo en caja fuerte (máximo, por robo/pérdida)';
  }

  // Distribución sugerida con tabla
  const distribucion_sugerida = 
    i.tipo_trabajo === 'formal' 
      ? '50% CETES ($' + Math.round(monto_objetivo * 0.5).toLocaleString('es-MX') + ') - Seguridad + rendimiento; ' +
        '30% Mercado Pago ($' + Math.round(monto_objetivo * 0.3).toLocaleString('es-MX') + ') - Retiro rápido; ' +
        '20% NU ($' + Math.round(monto_objetivo * 0.2).toLocaleString('es-MX') + ') - Acceso inmediato'
      : i.tipo_trabajo === 'informal'
      ? '40% CETES ($' + Math.round(monto_objetivo * 0.4).toLocaleString('es-MX') + ') - Seguridad; ' +
        '40% Mercado Pago ($' + Math.round(monto_objetivo * 0.4).toLocaleString('es-MX') + ') - Rapidez; ' +
        '20% NU ($' + Math.round(monto_objetivo * 0.2).toLocaleString('es-MX') + ') - Disponible'
      : '40% CETES ($' + Math.round(monto_objetivo * 0.4).toLocaleString('es-MX') + ') - Base segura; ' +
        '40% Mercado Pago ($' + Math.round(monto_objetivo * 0.4).toLocaleString('es-MX') + ') - Flexibilidad; ' +
        '15% NU ($' + Math.round(monto_objetivo * 0.15).toLocaleString('es-MX') + '); ' +
        '5% Efectivo ($' + Math.round(monto_objetivo * 0.05).toLocaleString('es-MX') + ') - Emergencias'; // freelance

  return {
    gastos_esenciales_mensuales: Math.round(gastos_esenciales_mensuales),
    meses_recomendados,
    monto_objetivo: Math.round(monto_objetivo),
    tiempo_ahorrar_meses: Math.max(1, tiempo_ahorrar_meses),
    instrumentos_sugeridos,
    distribucion_sugerida
  };
}
