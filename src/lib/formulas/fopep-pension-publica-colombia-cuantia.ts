export interface Inputs {
  cargo_publico: 'docente' | 'fopep_general' | 'telecom' | 'energia' | 'policia' | 'militar' | 'otro';
  anos_servicio: number;
  salario_promedio: number;
  edad_actual: number;
  genero: 'masculino' | 'femenino';
  cotizacion_afiliado?: 'no' | 'si_menor_10' | 'si_10_20';
}

export interface Outputs {
  pension_mensual_estimada: number;
  edad_jubilacion_minima: number;
  anos_servicio_restantes: number;
  porcentaje_sustitucion: number;
  mensualidades_estimadas: number;
  capital_actuarial_aproximado: number;
  regulacion_vigente: string;
  consideraciones_especiales: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN, Superfinanciera
  const SMMLV_2026 = 1_346_000; // Salario mínimo mensual legal vigente 2026
  const IPC_2026 = 0.035; // Revalorización anual aprox. 3.5%
  const COMISION_FOPEP = 0.008; // Comisión administrativa anual FOPEP 0.8%
  const RETENSION_IRPF_BASE = 0.08; // Retención en fuente pensión base 8%
  
  // Determinación régimen según sector
  let edad_jubilacion_h = 62;
  let edad_jubilacion_m = 60;
  let anos_servicio_minimo = 10;
  let tasa_sustitucion = 0.75;
  let anos_maximo_calculo = 30;
  let mensualidades_anuales = 12;
  let regulacion = 'Ley 100/1993';
  let consideraciones = '';
  
  if (i.cargo_publico === 'docente') {
    // Caja del Magisterio - Decreto 2277/1979
    edad_jubilacion_h = 62;
    edad_jubilacion_m = 57;
    anos_servicio_minimo = 15;
    tasa_sustitucion = 0.85;
    anos_maximo_calculo = 30;
    mensualidades_anuales = 14; // 12 + 2 bonificaciones
    regulacion = 'Caja del Magisterio (D.2277/79), actualizado 2026';
    consideraciones = 'Docentes: 14 mensualidades anuales (inclusión 2 bonificaciones especiales). Bonificación antigüedad: +1% cada 10 años adicionales. Requisito: 15 años servicio cotizado. Jubilación anticipada: -8% por año adelantado.';
  } else if (i.cargo_publico === 'fopep_general') {
    // FOPEP - Ley 100/1993, Decreto 1048/1968
    edad_jubilacion_h = 62;
    edad_jubilacion_m = 60;
    anos_servicio_minimo = 10;
    tasa_sustitucion = 0.78;
    anos_maximo_calculo = 30;
    mensualidades_anuales = 12;
    regulacion = 'FOPEP (D.1048/68), Ley 100/93';
    consideraciones = 'FOPEP capitalizado. Comisión fondo: 0.8% anual. Permite aportes voluntarios (+2–7% pensión). Traslado a Colpensiones requiere tramite especial DIAN.';
  } else if (i.cargo_publico === 'policia') {
    // Policía Nacional - Régimen especial
    edad_jubilacion_h = 56;
    edad_jubilacion_m = 56;
    anos_servicio_minimo = 20;
    tasa_sustitucion = 0.80;
    anos_maximo_calculo = 35;
    mensualidades_anuales = 12;
    regulacion = 'Fondo Pensión Policía Nacional (D. especiales)';
    consideraciones = 'Policía: edad baja por riesgos operacionales. 20 años servicio mínimo. Bonificación antigüedad: +2% cada 5 años extra. Pensión invalidez: 75–100% salario.';
  } else if (i.cargo_publico === 'militar') {
    // Fuerzas Armadas - Régimen especial
    edad_jubilacion_h = 55;
    edad_jubilacion_m = 55;
    anos_servicio_minimo = 20;
    tasa_sustitucion = 0.85;
    anos_maximo_calculo = 35;
    mensualidades_anuales = 14;
    regulacion = 'Fondo Pensión Fuerzas Armadas (D. especiales, actualizado 2026)';
    consideraciones = 'Fuerzas Armadas: 20 años servicio mínimo. 14 mensualidades anuales. Bonificación antigüedad: +1% cada 10 años. Jubilación anticipada por discapacidad operacional: sin descuento.';
  } else if (i.cargo_publico === 'telecom') {
    // Fondo Pensión Telecom
    edad_jubilacion_h = 62;
    edad_jubilacion_m = 60;
    anos_servicio_minimo = 20;
    tasa_sustitucion = 0.72;
    anos_maximo_calculo = 30;
    mensualidades_anuales = 12;
    regulacion = 'Fondo Pensión Telecom (D. sectorial 2026)';
    consideraciones = 'Telecom: 20 años servicio mínimo, tasa media 72%. Comisión 0.6%. Permite retiro programado desde año 28 servicio.';
  } else if (i.cargo_publico === 'energia') {
    // Fondos energía/minas
    edad_jubilacion_h = 62;
    edad_jubilacion_m = 60;
    anos_servicio_minimo = 15;
    tasa_sustitucion = 0.75;
    anos_maximo_calculo = 30;
    mensualidades_anuales = 12;
    regulacion = 'Fondo Pensión Energía/Minas (D. sectorial 2026)';
    consideraciones = 'Energía: 15 años servicio mínimo. Prima riesgo ocupacional incorporada. Invalidez por accidente laboral: 100% salario integral.';
  } else {
    // Otro fondo público genérico
    edad_jubilacion_h = 62;
    edad_jubilacion_m = 60;
    anos_servicio_minimo = 10;
    tasa_sustitucion = 0.70;
    anos_maximo_calculo = 30;
    mensualidades_anuales = 12;
    regulacion = 'Fondo público especial (verificar normas DIAN/Superfinanciera)';
    consideraciones = 'Consulta con administrador fondo específico: edades y tasas pueden variar. Algunos permiten aportes voluntarios.';
  }
  
  // Ajuste por género
  const edad_jubilacion_sector = i.genero === 'femenino' ? edad_jubilacion_m : edad_jubilacion_h;
  
  // Incremento tasa sustitución por cotizaciones voluntarias
  let bonus_cotizacion = 0;
  if (i.cotizacion_afiliado === 'si_menor_10') {
    bonus_cotizacion = 0.025; // +2.5%
  } else if (i.cotizacion_afiliado === 'si_10_20') {
    bonus_cotizacion = 0.065; // +6.5%
  }
  
  // Tasa final aplicable
  const tasa_final = Math.min(0.95, tasa_sustitucion + bonus_cotizacion);
  
  // Validar años servicio vs mínimo
  const anos_servicio_valido = Math.max(i.anos_servicio, anos_servicio_minimo);
  const factor_proporcional = Math.min(anos_servicio_valido / anos_maximo_calculo, 1.0);
  
  // Cálculo pensión mensual base
  const pension_bruta = i.salario_promedio * tasa_final * factor_proporcional;
  
  // Aplicar IPC revalorización (ajuste 2026)
  const pension_revalorizada = pension_bruta * (1 + IPC_2026);
  
  // Retención IRPF estimada (no se descuenta de output, solo informativa)
  // En producción, la retención se calcula según escala DIAN
  const pension_mensual_neta_aproximada = pension_revalorizada; // Output muestra BRUTA
  
  // Capital actuarial aproximado (fondo acumulado referencial)
  // Fórmula simplificada: pensión anual × 20 años esperados vida
  const capital_actuarial = pension_revalorizada * mensualidades_anuales * 18; // Factor conservador
  
  // Años servicio restantes hasta jubilación
  const anos_restantes = Math.max(0, edad_jubilacion_sector - i.edad_actual);
  
  // Porcentaje sustitución (sobre salario promedio)
  const porcentaje_sust = (pension_revalorizada / i.salario_promedio) * 100;
  
  // Validaciones y mensajes especiales
  let msg_especial = '';
  
  if (i.anos_servicio < anos_servicio_minimo) {
    msg_especial += `⚠️ Años servicio insuficientes (${i.anos_servicio}). Mínimo requerido: ${anos_servicio_minimo}. `;
  }
  
  if (i.edad_actual < edad_jubilacion_sector) {
    msg_especial += `Edad actual ${i.edad_actual} años. Jubilación mínima sector: ${edad_jubilacion_sector} años (${anos_restantes.toFixed(1)} años restantes). `;
  } else {
    msg_especial += `✓ Elegible jubilación inmediata (edad ${i.edad_actual} ≥ ${edad_jubilacion_sector} años). `;
  }
  
  if (bonus_cotizacion > 0) {
    msg_especial += `Aportes voluntarios incrementan tasa +${(bonus_cotizacion * 100).toFixed(1)}%. `;
  }
  
  // Mensajes especiales por sector
  if (i.cargo_publico === 'docente' && i.edad_actual >= 57 && i.anos_servicio >= 15) {
    msg_especial += 'Docente elegible jubilación anticipada a partir 57 años (mujeres) si completa 15 años. ';
  }
  
  if (i.cargo_publico === 'policia' && i.edad_actual >= 56 && i.anos_servicio >= 20) {
    msg_especial += 'Policía elegible a 56 años con 20 años servicio. Pensión incluye prima riesgos operacionales.';
  }
  
  // Output final
  return {
    pension_mensual_estimada: Math.round(pension_revalorizada),
    edad_jubilacion_minima: edad_jubilacion_sector,
    anos_servicio_restantes: Math.max(0, anos_restantes),
    porcentaje_sustitucion: parseFloat(porcentaje_sust.toFixed(1)),
    mensualidades_estimadas: mensualidades_anuales,
    capital_actuarial_aproximado: Math.round(capital_actuarial),
    regulacion_vigente: regulacion,
    consideraciones_especiales: msg_especial || consideraciones
  };
}
