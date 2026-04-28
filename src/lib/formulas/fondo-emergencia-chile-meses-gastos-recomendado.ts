export interface Inputs {
  gasto_arriendo: number;
  gasto_servicios_comunes: number;
  gasto_alimentacion: number;
  gasto_transporte: number;
  gasto_salud: number;
  gasto_afp: number;
  deuda_minima_mensual: number;
  otros_gastos_esenciales: number;
  tipo_contrato: 'indefinido' | 'plazo_fijo' | 'honorarios' | 'independiente' | 'jubilado';
  tengo_dependientes: 'no' | '1_2' | '3_mas';
}

export interface Outputs {
  gasto_mensual_total: number;
  meses_minimo_recomendado: number;
  meses_optimo_recomendado: number;
  pesos_objetivo_minimo: number;
  pesos_objetivo_optimo: number;
  instrumentos_sugeridos: string;
  plazo_cumplimiento_meses: number;
  recomendacion_nivel_riesgo: string;
}

export function compute(i: Inputs): Outputs {
  // Cálculo gasto mensual total
  const gastoMensualTotal = i.gasto_arriendo +
    i.gasto_servicios_comunes +
    i.gasto_alimentacion +
    i.gasto_transporte +
    i.gasto_salud +
    i.gasto_afp +
    i.deuda_minima_mensual +
    i.otros_gastos_esenciales;

  // Determinación meses mínimo según tipo contrato (SII, estabilidad laboral 2026 Chile)
  let mesesMinimo = 3;
  switch (i.tipo_contrato) {
    case 'indefinido':
      mesesMinimo = 3; // Empleados estables
      break;
    case 'plazo_fijo':
      mesesMinimo = 4; // Vencimiento contractual conocido
      break;
    case 'honorarios':
      mesesMinimo = 6; // Ingresos variables
      break;
    case 'independiente':
      mesesMinimo = 8; // Máxima incertidumbre
      break;
    case 'jubilado':
      mesesMinimo = 6; // Ingresos fijos pero generalmente menores
      break;
  }

  // Ajuste por dependientes
  let ajusteDependientes = 0;
  switch (i.tengo_dependientes) {
    case 'no':
      ajusteDependientes = 0;
      break;
    case '1_2':
      ajusteDependientes = 1;
      break;
    case '3_mas':
      ajusteDependientes = 2;
      break;
  }

  const mesesOptimo = mesesMinimo + ajusteDependientes;

  // Cálculo pesos objetivo
  const pesosObjetivoMinimo = Math.round(gastoMensualTotal * mesesMinimo);
  const pesosObjetivoOptimo = Math.round(gastoMensualTotal * mesesOptimo);

  // Determinación instrumentos sugeridos según riesgo
  let instrumentosSugeridos = '';
  switch (i.tipo_contrato) {
    case 'indefinido':
      instrumentosSugeridos =
        '70% Depósito a plazo 30-60 días (3.2–3.5% anual, BCI, Santander, Itaú) + ' +
        '30% Cuenta vista MACH o BCI (acceso inmediato, ~2.8–3% anual). ' +
        'Rota depósitos cada mes para tener acceso parcial continuo.';
      break;
    case 'plazo_fijo':
      instrumentosSugeridos =
        '50% Depósito a plazo 30 días + ' +
        '50% Cuenta de ahorro fintech (MACH, Coopeuch, Itaú Fintech, 2.5–3% anual). ' +
        'Liquida depósitos según necesidad de nuevo trabajo.';
      break;
    case 'honorarios':
      instrumentosSugeridos =
        '60% Fondo mutualista conservador (rentabilidad 2–2.5% anual, liquidez 2–3 días) + ' +
        '40% Cuenta vista (acceso inmediato). ' +
        'Evita acciones; necesitas seguridad, no volatilidad.';
      break;
    case 'independiente':
      instrumentosSugeridos =
        '50% Fondo mutualista conservador + ' +
        '30% Depósito a plazo (90 días, máxima tasa ~3.6% anual) + ' +
        '20% Cuenta corriente de emergencia pura (BCI, Santander). ' +
        'Considera línea de crédito aprobada como respaldo (no gasto, es colchón).';
      break;
    case 'jubilado':
      instrumentosSugeridos =
        '80% Depósito a plazo seguro (instituciones sólidas, rentabilidad 3–3.3% anual) + ' +
        '20% Cuenta vista. ' +
        'Prioriza solidez sobre rentabilidad; bajo riesgo de pérdida principal.';
      break;
  }

  // Plazo estimado cumplimiento (asume ahorro de ~$200.000/mes en promedio)
  const ahorroMensualEstimado = 200000;
  const plazoMeses = Math.ceil(pesosObjetivoOptimo / ahorroMensualEstimado);

  // Recomendación según riesgo
  let recomendacionRiesgo = '';
  if (i.tipo_contrato === 'indefinido') {
    recomendacionRiesgo =
      '✓ Estabilidad alta. Contrato indefinido + dependientes bajos = fondo 3–4 meses suficiente. ' +
      'Prioridad: completar fondo en 12–18 meses, luego acelerar AFP voluntaria o inversión.';
  } else if (i.tipo_contrato === 'plazo_fijo') {
    recomendacionRiesgo =
      '⚠ Estabilidad media. Contrato vence en máx. 2 años. Construye fondo 4–5 meses ANTES del vencimiento. ' +
      'Inicia búsqueda laboral 3 meses antes del término para transición suave.';
  } else if (i.tipo_contrato === 'honorarios') {
    recomendacionRiesgo =
      '⚠ Estabilidad baja. Ingresos variables. Fondo 6–8 meses es CRÍTICO. ' +
      'Ahorres 25–35% de ingresos mensuales para construcción rápida (12–18 meses). ' +
      'Mantén relación con 3+ clientes; no dependas de uno.';
  } else if (i.tipo_contrato === 'independiente') {
    recomendacionRiesgo =
      '⚠⚠ Estabilidad muy baja. Emprendedor/profesional independiente. ' +
      'Fondo 8–12 meses es IMPRESCINDIBLE para sobrevivir 1 año sin ingresos ' +
      '(enfermedad, crisis mercado, cese operaciones). ' +
      'Ahorres 30–50% de utilidades netas mensuales. Objetivo realista: 24–36 meses.';
  } else if (i.tipo_contrato === 'jubilado') {
    recomendacionRiesgo =
      '⚠ Ingresos fijos pero generalmente limitados. Fondo 6–9 meses necesario para ' +
      'gastos médicos inesperados, reparaciones, ayuda a familia. ' +
      'Rentabilidad segura (depósito) es prioridad sobre rendimiento.';
  }

  return {
    gasto_mensual_total: Math.round(gastoMensualTotal),
    meses_minimo_recomendado: mesesMinimo,
    meses_optimo_recomendado: mesesOptimo,
    pesos_objetivo_minimo: pesosObjetivoMinimo,
    pesos_objetivo_optimo: pesosObjetivoOptimo,
    instrumentos_sugeridos: instrumentosSugeridos,
    plazo_cumplimiento_meses: plazoMeses,
    recomendacion_nivel_riesgo: recomendacionRiesgo
  };
}
