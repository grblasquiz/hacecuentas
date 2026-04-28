export interface Inputs {
  edad_actual: number;
  salario_mensual: number;
  semanas_cotizadas: number;
  tipo_trabajador: 'colpensiones' | 'rais' | 'beps' | 'independiente' | 'transicion';
  genero: 'M' | 'F';
  aporte_voluntario_anual: number;
  densidad_cotizacion: number;
}

export interface Outputs {
  pilar_aplicable: string;
  edad_pensional_requerida: number;
  semanas_requeridas: number;
  semanas_faltantes: number;
  fecha_elegibilidad_pensional: string;
  pension_pilar_1: number;
  fondo_pilar_3: number;
  pension_total_esperada: number;
  pension_sistema_anterior: number;
  diferencia_reforma: number;
  estado_transicion: string;
  cotizacion_mensual: number;
  observaciones: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes reforma 2025 Colombia
  const SEMANAS_MINIMAS = 1300; // 25 años cotización
  const FACTOR_COBERTURA_EXTRA = 0.005; // 0.5% por semana excedente
  const COBERTURA_MAXIMA = 0.80; // 80% salario máximo
  const PENCION_UNIVERSAL_2026 = 302000; // Pilar solidario
  const SALARIO_MINIMO_2026 = 1560000; // Salario mínimo legal 2026
  const COTIZACION_OBLIGATORIA = 0.16; // 16% pilar contributivo
  const EPS_PORCENTAJE = 0.04; // 4%
  const IPC_ANUAL_2026 = 0.025; // 2.5% inflación promedio
  const TASA_RENTABILIDAD_RAIS = 0.04; // 4% rentabilidad fondo
  const TRANSICION_FIN = 2034; // Fin período transición
  const AÑO_ACTUAL = 2026;

  // Determinar edad pensional según género y año
  const incremento_años = Math.min(
    (AÑO_ACTUAL - 2025),
    10 // máximo hasta 2035
  );
  const incremento_meses = incremento_años * 6 + ((AÑO_ACTUAL - 2025) % 1) * 12; // 6 meses por año
  const incremento_edad = incremento_meses / 12;

  const edad_base_hombre = 62;
  const edad_base_mujer = 57;
  const edad_pensional_hombre = Math.min(
    edad_base_hombre + incremento_edad,
    65
  );
  const edad_pensional_mujer = Math.min(
    edad_base_mujer + incremento_edad,
    62
  );
  const edad_pensional_requerida =
    i.genero === 'M' ? edad_pensional_hombre : edad_pensional_mujer;

  // Determinar pilar y régimen aplicable
  let pilar_aplicable = '';
  let es_contributivo = false;
  let es_beps = false;
  let es_solidario = false;

  if (
    i.tipo_trabajador === 'colpensiones' ||
    i.tipo_trabajador === 'rais'
  ) {
    pilar_aplicable = `Pilar 3 (Contributivo - ${i.tipo_trabajador === 'colpensiones' ? 'Colpensiones' : 'RAIS privada'})`;
    es_contributivo = true;
  } else if (i.tipo_trabajador === 'beps') {
    pilar_aplicable = 'Pilar 2 (Semicontributivo BEPS)';
    es_beps = true;
  } else if (i.tipo_trabajador === 'independiente') {
    if (i.edad_actual >= 60) {
      pilar_aplicable = 'Pilar 1 (Solidario) + posible BEPS complementario';
      es_solidario = true;
    } else {
      pilar_aplicable = 'Pilar 2 (Semicontributivo BEPS)';
      es_beps = true;
    }
  } else if (i.tipo_trabajador === 'transicion') {
    pilar_aplicable = 'Sistema anterior + opción migración reforma';
  }

  // Semanas requeridas
  const semanas_requeridas = SEMANAS_MINIMAS;
  const semanas_faltantes = Math.max(
    0,
    semanas_requeridas - i.semanas_cotizadas
  );

  // Fecha elegibilidad pensional
  const años_faltantes = Math.max(
    0,
    edad_pensional_requerida - i.edad_actual
  );
  const fecha_pensional = AÑO_ACTUAL + Math.ceil(años_faltantes);
  const fecha_elegibilidad_pensional =
    semanas_faltantes > 0
      ? `${fecha_pensional} (faltarían ${semanas_faltantes} semanas)`
      : `${fecha_pensional} (cumple requisitos)`;

  // Salario promedio estimado (asume estabilidad + IPC)
  const salario_promedio = i.salario_mensual * Math.pow(1 + IPC_ANUAL_2026, años_faltantes);

  // Factor cobertura pilar contributivo
  const semanas_excedentes = Math.max(0, i.semanas_cotizadas - SEMANAS_MINIMAS);
  const factor_cobertura_bruto = FACTOR_COBERTURA_EXTRA * semanas_excedentes;
  const factor_cobertura = Math.min(factor_cobertura_bruto, COBERTURA_MAXIMA);

  // Aplicación densidad cotización (descuento por períodos sin aportes)
  const factor_densidad = i.densidad_cotizacion / 100;
  const factor_final = factor_cobertura * factor_densidad;

  // Pensión pilar 1 (contributivo)
  let pension_pilar_1 = 0;
  if (es_contributivo) {
    pension_pilar_1 = Math.max(
      salario_promedio * factor_final,
      SALARIO_MINIMO_2026 * 0.8 // Pensión mínima garantizada 80% SM
    );
  } else if (es_beps && i.semanas_cotizadas >= 600) {
    // BEPS con débil cotización
    pension_pilar_1 = PENCION_UNIVERSAL_2026 + (salario_promedio * 0.2); // Complemento modest
  } else if (es_solidario) {
    pension_pilar_1 = PENCION_UNIVERSAL_2026;
  }

  // Fondo pilar 4 (ahorro voluntario)
  const meses_cotizacion = Math.round(años_faltantes * 12);
  const aporte_mensual_voluntario = i.aporte_voluntario_anual / 12;
  const fondo_acumulado_sin_rentabilidad =
    aporte_mensual_voluntario * meses_cotizacion;
  // Rentabilidad compuesta simplificada
  const rentabilidad_acumulada = fondo_acumulado_sin_rentabilidad * Math.pow(1 + TASA_RENTABILIDAD_RAIS, años_faltantes);
  const fondo_pilar_3 = i.aporte_voluntario_anual > 0 ? rentabilidad_acumulada : 0;

  // Pensión total esperada (pilar 1 + pilar 4 distribuido en 240 meses = 20 años)
  const meses_jubilacion = 240;
  const complemento_pilar_4 = fondo_pilar_3 / meses_jubilacion;
  const pension_total_esperada = pension_pilar_1 + complemento_pilar_4;

  // Pensión sistema anterior (SGRL IPC)
  const pension_sistema_anterior = salario_promedio * 0.65; // Aproximación IPC: 65% salario promedio

  // Diferencia reforma
  const diferencia_reforma = pension_total_esperada - pension_sistema_anterior;

  // Estado transición
  let estado_transicion = '';
  if (i.tipo_trabajador === 'transicion') {
    estado_transicion =
      `Afiliado régimen anterior. Puede permanecer o migrar hasta ${TRANSICION_FIN}. Semanas previas reconocidas.`;
  } else if (i.tipo_trabajador === 'colpensiones' || i.tipo_trabajador === 'rais') {
    if (i.edad_actual > edad_pensional_requerida - 5) {
      estado_transicion =
        `Próximo a edad pensional. Revisar con ${i.tipo_trabajador === 'colpensiones' ? 'Colpensiones' : 'tu RAIS'} cálculos definitivos.`;
    } else {
      estado_transicion = `Vinculado pilar contributivo. Sigue aportando regularmente.`;
    }
  } else if (es_beps) {
    estado_transicion =
      `Pilar semicontributivo. Aporte voluntario 2-3% para mejorar pensión. Flexibilidad edad 55-62 años.`;
  } else if (es_solidario) {
    estado_transicion = `Acceso pilar solidario. Requiere residencia 20 años en Colombia.`;
  }

  // Cotización mensual obligatoria
  const cotizacion_mensual = es_contributivo
    ? i.salario_mensual * COTIZACION_OBLIGATORIA
    : es_beps
      ? i.salario_mensual * 0.03 // 3% BEPS
      : 0;

  // Observaciones y recomendaciones
  let observaciones = '';
  const notas: string[] = [];

  if (semanas_faltantes > 0) {
    notas.push(
      `Necesita cotizar ${semanas_faltantes} semanas más (~${Math.ceil(semanas_faltantes / 52)} años).`
    );
  }
  if (i.densidad_cotizacion < 90) {
    notas.push(
      `Densidad cotización baja (${i.densidad_cotizacion}%). Períodos sin aporte reducen pensión. Intenta regularizar.`
    );
  }
  if (factor_final >= COBERTURA_MAXIMA) {
    notas.push(
      `Factor cobertura en máximo (80%). Aportes adicionales no aumentan pensión de pilar 1; usa pilar 4 (ahorro voluntario).`
    );
  }
  if (i.aporte_voluntario_anual > 0) {
    notas.push(
      `Aporte voluntario $${i.aporte_voluntario_anual.toLocaleString('es-CO')} deducible en renta. Beneficio tributario aproximado: $${(i.aporte_voluntario_anual * 0.25).toLocaleString('es-CO')}.`
    );
  }
  if (diferencia_reforma > 0) {
    notas.push(
      `Reforma 2025 favorable: ganancia estimada $${diferencia_reforma.toLocaleString('es-CO')}/mes + fondo ahorro.`
    );
  } else if (diferencia_reforma < 0 && i.tipo_trabajador !== 'transicion') {
    notas.push(
      `Reforma 2025 menor pensión inicial, pero acceso pilar solidario + ahorro voluntario complementario.`
    );
  }
  if (AÑO_ACTUAL <= TRANSICION_FIN && (i.tipo_trabajador === 'colpensiones' || i.tipo_trabajador === 'rais')) {
    notas.push(
      `Período transición activo hasta ${TRANSICION_FIN}. Confirma tu situación y opciones con tu fondo/Colpensiones.`
    );
  }

  observaciones = notas.join(' ');

  return {
    pilar_aplicable,
    edad_pensional_requerida: parseFloat(edad_pensional_requerida.toFixed(1)),
    semanas_requeridas,
    semanas_faltantes,
    fecha_elegibilidad_pensional,
    pension_pilar_1: Math.round(pension_pilar_1),
    fondo_pilar_3: Math.round(fondo_pilar_3),
    pension_total_esperada: Math.round(pension_total_esperada),
    pension_sistema_anterior: Math.round(pension_sistema_anterior),
    diferencia_reforma: Math.round(diferencia_reforma),
    estado_transicion,
    cotizacion_mensual: Math.round(cotizacion_mensual),
    observaciones
  };
}
