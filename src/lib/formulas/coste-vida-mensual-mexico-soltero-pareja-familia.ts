export interface Inputs {
  composicion_hogar: 'soltero' | 'pareja' | 'familia_2h' | 'familia_3h' | 'multigeneracional';
  ciudad: 'cdmx' | 'monterrey' | 'guadalajara' | 'puebla' | 'ciudad_mediana' | 'ciudad_pequena';
  estilo_vida: 'basico' | 'moderado' | 'confortable';
  incluir_auto: boolean;
  dependientes_mayores: boolean;
}

export interface Outputs {
  gasto_vivienda: number;
  gasto_alimentacion: number;
  gasto_transporte: number;
  gasto_servicios: number;
  gasto_salud: number;
  gasto_educacion: number;
  gasto_ocio: number;
  gasto_total: number;
  ingreso_recomendado: number;
  rango_comparativo: string;
}

export function compute(i: Inputs): Outputs {
  // Factores multiplicadores por ciudad (vs CDMX = 1.0)
  // Fuente: INEGI 2026, costo de vida regional
  const factoresCiudad: { [key: string]: number } = {
    'cdmx': 1.0,
    'monterrey': 0.95,
    'guadalajara': 0.85,
    'puebla': 0.75,
    'ciudad_mediana': 0.65,
    'ciudad_pequena': 0.55
  };

  const factorCiudad = factoresCiudad[i.ciudad] || 0.65;

  // Multiplicadores por composición (gastos base ajustados)
  const multiplicadoresComposicion: { [key: string]: { viv: number; ali: number; tra: number; sal: number; edu: number } } = {
    'soltero': { viv: 1.0, ali: 1.0, tra: 1.0, sal: 0.5, edu: 0.0 },
    'pareja': { viv: 1.4, ali: 1.6, tra: 1.3, sal: 0.8, edu: 0.0 },
    'familia_2h': { viv: 1.8, ali: 2.2, tra: 1.5, sal: 1.0, edu: 2.0 },
    'familia_3h': { viv: 2.1, ali: 2.8, tra: 1.7, sal: 1.2, edu: 3.0 },
    'multigeneracional': { viv: 2.4, ali: 3.2, tra: 1.9, sal: 1.4, edu: 2.0 }
  };

  const mult = multiplicadoresComposicion[i.composicion_hogar] || { viv: 1.0, ali: 1.0, tra: 1.0, sal: 0.5, edu: 0.0 };

  // Bases en CDMX, estilo MODERADO, soltero (valores 2026)
  // Fuente: INEGI, encuestas de gasto en hogares 2025-2026
  const basesModerizado: { [key: string]: number } = {
    'vivienda': 10000,    // renta + servicios agua/luz/gas promedio CDMX
    'alimentacion': 4000, // despensa + ocasionales cenas fuera
    'transporte': 1500,   // transporte público + Uber ocasional
    'servicios': 1000,    // telefonía internet seguros
    'salud': 800,         // farmacia consultas preventivas
    'educacion': 0,       // base sin escolares
    'ocio': 2000          // cines restaurantes entretenimiento
  };

  // Ajustes por estilo de vida (multiplicadores sobre bases MODERADO)
  const ajustesEstilo: { [key: string]: number } = {
    'basico': 0.75,
    'moderado': 1.0,
    'confortable': 1.35
  };

  const ajusteEstilo = ajustesEstilo[i.estilo_vida] || 1.0;

  // Cálculos base (CDMX, estilo elegido)
  let gasto_vivienda = basesModerizado['vivienda'] * mult.viv * ajusteEstilo;
  let gasto_alimentacion = basesModerizado['alimentacion'] * mult.ali * ajusteEstilo;
  let gasto_transporte = basesModerizado['transporte'] * mult.tra * ajusteEstilo;
  let gasto_servicios = basesModerizado['servicios'] * ajusteEstilo;
  let gasto_salud = basesModerizado['salud'] * mult.sal * ajusteEstilo;
  let gasto_educacion = basesModerizado['educacion'] * mult.edu * ajusteEstilo;
  let gasto_ocio = basesModerizado['ocio'] * (i.composicion_hogar === 'soltero' ? 1.0 : 0.8) * ajusteEstilo;

  // Ajuste por ciudad
  gasto_vivienda *= factorCiudad;
  gasto_alimentacion *= factorCiudad;
  gasto_transporte *= factorCiudad;
  gasto_servicios *= factorCiudad;
  gasto_salud *= factorCiudad;
  gasto_educacion *= factorCiudad;
  gasto_ocio *= factorCiudad;

  // Ajuste por automóvil (gasolina, mantenimiento, seguros, tenencia)
  // Estimado: 3,500-4,500 pesos mensuales
  if (i.incluir_auto) {
    const costoAuto = 4000 * factorCiudad; // gasolina, mantenimiento, tenencia, seguros
    gasto_transporte += costoAuto;
  }

  // Ajuste por dependientes mayores: +2,000-3,000 por medicamentos, consultas médicas
  if (i.dependientes_mayores) {
    const costoMayores = 2500 * factorCiudad;
    gasto_salud += costoMayores;
  }

  const gasto_total = gasto_vivienda + gasto_alimentacion + gasto_transporte + gasto_servicios + gasto_salud + gasto_educacion + gasto_ocio;

  // Ingreso recomendado: 3x gastos para cobertura de emergencias y ahorro
  // Fuente: buenas prácticas de presupuesto personal, CONDUSEF
  const ingreso_recomendado = gasto_total * 3;

  // Rango comparativo
  let rango_comparativo = '';
  if (i.composicion_hogar === 'soltero') {
    rango_comparativo = `Soltero en ${i.ciudad}: ${Math.round(gasto_total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} mensuales. Rango nacional: $13,800 - $30,000.`;
  } else if (i.composicion_hogar === 'pareja') {
    rango_comparativo = `Pareja en ${i.ciudad}: ${Math.round(gasto_total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} mensuales. Rango nacional: $20,000 - $50,000.`;
  } else if (i.composicion_hogar.startsWith('familia')) {
    rango_comparativo = `Familia en ${i.ciudad}: ${Math.round(gasto_total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} mensuales. Rango nacional: $35,000 - $80,000.`;
  } else {
    rango_comparativo = `Hogar multigeneracional en ${i.ciudad}: ${Math.round(gasto_total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} mensuales.`;
  }

  return {
    gasto_vivienda: Math.round(gasto_vivienda),
    gasto_alimentacion: Math.round(gasto_alimentacion),
    gasto_transporte: Math.round(gasto_transporte),
    gasto_servicios: Math.round(gasto_servicios),
    gasto_salud: Math.round(gasto_salud),
    gasto_educacion: Math.round(gasto_educacion),
    gasto_ocio: Math.round(gasto_ocio),
    gasto_total: Math.round(gasto_total),
    ingreso_recomendado: Math.round(ingreso_recomendado),
    rango_comparativo: rango_comparativo
  };
}
