export interface Inputs {
  arriendo_mensual: number;
  servicios_basicos: number;
  alimentacion_mensual: number;
  transporte_mensual: number;
  eps_mensual?: number;
  deuda_minima_mensual?: number;
  otros_gastos?: number;
  tipo_trabajo: 'asalariado' | 'asalariado_temporal' | 'independiente' | 'informal';
  personas_dependientes: number;
}

export interface Outputs {
  gasto_mensual_total: number;
  meses_recomendados: number;
  valor_objetivo_pesos: number;
  etapa_construccion: string;
  composicion_recomendada: string;
  alerta_dependientes: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN/Banco República 2026
  const EPS_MINIMA_INDEPENDIENTE = 80000; // pesos mínimo EPS independiente

  // Gastos esenciales
  const gasto_total = 
    (i.arriendo_mensual || 0) +
    (i.servicios_basicos || 0) +
    (i.alimentacion_mensual || 0) +
    (i.transporte_mensual || 0) +
    (i.eps_mensual || 0) +
    (i.deuda_minima_mensual || 0) +
    (i.otros_gastos || 0);

  // Determinar meses base según tipo trabajo
  let meses_base = 3;
  if (i.tipo_trabajo === 'asalariado') {
    meses_base = 3;
  } else if (i.tipo_trabajo === 'asalariado_temporal') {
    meses_base = 4;
  } else if (i.tipo_trabajo === 'independiente') {
    meses_base = 6;
  } else if (i.tipo_trabajo === 'informal') {
    meses_base = 6;
  }

  // Ajuste por dependientes
  const dependientes_factor = i.tipo_trabajo === 'independiente' || i.tipo_trabajo === 'informal'
    ? i.personas_dependientes * 1.0
    : i.personas_dependientes * 0.5;

  const meses_recomendados = meses_base + dependientes_factor;

  // Valor objetivo en pesos
  const valor_objetivo = Math.round(gasto_total * meses_recomendados);

  // Etapa de construcción
  let etapa_construccion = '';
  if (meses_recomendados <= 2) {
    etapa_construccion = 
      'FASE 1: Construye tu primer mes de gastos (colchón mínimo de supervivencia). ' +
      `Meta: $${Math.round(gasto_total * 1).toLocaleString('es-CO', { minimumFractionDigits: 0 })}. ` +
      'Abre una cuenta ahorros remunerada hoy mismo.';
  } else if (meses_recomendados <= 4) {
    etapa_construccion =
      'FASE 2: Alcanza 3-4 meses (cobertura estándar asalariado). ' +
      `Meta: $${Math.round(gasto_total * 4).toLocaleString('es-CO', { minimumFractionDigits: 0 })}. ` +
      'Una vez 1 mes en ahorros, invierte el resto en CDT 90 días (3-4% EA).';
  } else {
    etapa_construccion =
      `FASE 3: Construye ${Math.ceil(meses_recomendados)} meses (tu perfil requiere fondo robusto). ` +
      `Meta: $${valor_objetivo.toLocaleString('es-CO', { minimumFractionDigits: 0 })}. ` +
      'Estrategia: 40% cuenta ahorros, 40% CDT, 20% fondos dinero.';
  }

  // Composición recomendada
  const composicion_40_ahorros = Math.round(valor_objetivo * 0.4);
  const composicion_40_cdt = Math.round(valor_objetivo * 0.4);
  const composicion_20_dinero = Math.round(valor_objetivo * 0.2);

  const composicion_recomendada =
    `40% Cuenta ahorros remunerada (acceso 24h): $${composicion_40_ahorros.toLocaleString('es-CO', { minimumFractionDigits: 0 })} | ` +
    `40% CDT 90 días (3-4% EA Banco República 2026): $${composicion_40_cdt.toLocaleString('es-CO', { minimumFractionDigits: 0 })} | ` +
    `20% Fondo dinero (1.5-2.5% EA, máx 3 días rescate): $${composicion_20_dinero.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

  // Alertas dependientes
  let alerta_dependientes = '';
  if (i.personas_dependientes === 0) {
    alerta_dependientes = 
      'Sin dependientes: Tu fondo es para ti solo. Prioriza ahorros flexibles primeros 3 meses.';
  } else if (i.personas_dependientes === 1) {
    alerta_dependientes =
      'Con 1 dependiente: Gastos de esa persona están incluidos en tu estimación. ' +
      'Recalcula si esa persona obtiene ingresos propios.';
  } else if (i.personas_dependientes >= 2 && i.personas_dependientes <= 3) {
    alerta_dependientes =
      `Con ${i.personas_dependientes} dependientes: Tu fondo es crítico porque es tu ingreso el que cubre a todos. ` +
      'Considera seguro de vida ($30k-50k/mes) y acelera construcción del fondo.';
  } else {
    alerta_dependientes =
      `ALERTA: ${i.personas_dependientes} dependientes = presión muy alta. ` +
      'Tu fondo es casi el único respaldo. Construye 8-12 meses sin aplazos. ' +
      'Evalúa fuentes alternas ingresos (pareja empleo, ingresos complementarios).';
  }

  return {
    gasto_mensual_total: gasto_total,
    meses_recomendados: parseFloat(meses_recomendados.toFixed(1)),
    valor_objetivo_pesos: valor_objetivo,
    etapa_construccion: etapa_construccion,
    composicion_recomendada: composicion_recomendada,
    alerta_dependientes: alerta_dependientes
  };
}
