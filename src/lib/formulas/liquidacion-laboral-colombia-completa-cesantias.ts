export interface Inputs {
  salario_mensual: number;
  fecha_inicio: string; // DD/MM/YYYY
  fecha_termino: string; // DD/MM/YYYY
  tipo_contrato: 'indefinido' | 'termino_fijo';
  tipo_terminacion: 'renuncia' | 'despido_injusto' | 'despido_justo' | 'vencimiento' | 'acuerdo';
  dias_vacaciones_pendientes: number;
  aporte_pensional: number;
  aporte_salud: number;
  tiene_bonificacion: 'si' | 'no';
  promedio_bonificacion: number;
}

export interface Outputs {
  dias_trabajados: number;
  anos_servicio: number;
  salario_base_liquidacion: number;
  cesantias_bruto: number;
  intereses_cesantias: number;
  prima_servicios: number;
  vacaciones_no_disfrutadas: number;
  indemnizacion_despido: number;
  total_bruto_antes_descuentos: number;
  descuento_pensional: number;
  descuento_salud: number;
  retencion_renta: number;
  total_descuentos: number;
  total_neto: number;
  desglose_componentes: string;
}

export function compute(i: Inputs): Outputs {
  // Parsing de fechas
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const fechaInicio = parseDate(i.fecha_inicio);
  const fechaTermino = parseDate(i.fecha_termino);

  // Cálculo de días trabajados
  const diasTrabajados = Math.floor(
    (fechaTermino.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Validación mínima
  if (diasTrabajados < 0) {
    return {
      dias_trabajados: 0,
      anos_servicio: 0,
      salario_base_liquidacion: 0,
      cesantias_bruto: 0,
      intereses_cesantias: 0,
      prima_servicios: 0,
      vacaciones_no_disfrutadas: 0,
      indemnizacion_despido: 0,
      total_bruto_antes_descuentos: 0,
      descuento_pensional: 0,
      descuento_salud: 0,
      retencion_renta: 0,
      total_descuentos: 0,
      total_neto: 0,
      desglose_componentes: 'Error: fecha de término anterior a fecha de inicio'
    };
  }

  // Años de servicio
  const anosServicio = diasTrabajados / 365;

  // Salario base para liquidación (incluye bonificación si aplica)
  const salarioBase =
    i.salario_mensual +
    (i.tiene_bonificacion === 'si' ? i.promedio_bonificacion : 0);

  // ===== CESANTÍAS =====
  // Fórmula: Cesantías = (salario_base × años_servicio) / 12
  // Fuente: Artículo 250 CST
  const cesantiasBruto = (salarioBase * anosServicio) / 12;

  // ===== INTERESES SOBRE CESANTÍAS =====
  // Tasa 12% anual sobre cesantías
  // Fórmula simplificada: Intereses = Cesantías × 0.12 × años_servicio / años_servicio
  // En liquidación final: aproximadamente 12% × años
  const interesesCesantias = (cesantiasBruto * 0.12 * anosServicio) / anosServicio * 0.85;

  // ===== PRIMA DE SERVICIOS =====
  // Proporcionalmente: 1/2 mes de salario por semestre (o 1 mes al año)
  // Fórmula simplificada: Prima = salario_base / 2 × años_servicio
  // Para período incompleto: ajuste por días
  const primaCompleta = (salarioBase / 2) * Math.floor(anosServicio);
  const diasFraccion = (anosServicio % 1) * 365;
  const primaFraccion = (salarioBase / 360) * diasFraccion;
  const primaServicios = primaCompleta + primaFraccion;

  // ===== VACACIONES NO DISFRUTADAS =====
  // 15 días hábiles al año; aquí se ingresa días pendientes
  // Fórmula: Valor_día = salario_base / 30
  const vacacionesNoDisfrutadas = (salarioBase / 30) * i.dias_vacaciones_pendientes;

  // ===== INDEMNIZACIÓN POR DESPIDO INJUSTO =====
  // Aplica solo si:
  // - tipo_contrato === 'indefinido' Y
  // - tipo_terminacion === 'despido_injusto'
  // Fórmula (Artículo 58 CST):
  // Primeros 2 años: 30 días de salario × años
  // A partir del año 3: 20 días de salario × años
  let indemnizacionDespido = 0;

  if (i.tipo_contrato === 'indefinido' && i.tipo_terminacion === 'despido_injusto') {
    const anos = anosServicio;
    if (anos <= 2) {
      indemnizacionDespido = (salarioBase / 30) * 30 * anos;
    } else {
      // 2 años completos a razón de 30 días
      const indemnizacion2Anos = (salarioBase / 30) * 30 * 2;
      // Años adicionales a razón de 20 días
      const anosAdicionales = anos - 2;
      const indemnizacionAdicional = (salarioBase / 30) * 20 * anosAdicionales;
      indemnizacionDespido = indemnizacion2Anos + indemnizacionAdicional;
    }
  }

  // ===== TOTAL BRUTO =====
  const totalBrutoBefore = (
    cesantiasBruto +
    interesesCesantias +
    primaServicios +
    vacacionesNoDisfrutadas +
    indemnizacionDespido
  );

  // ===== DESCUENTOS =====
  const descuentoPensional = (totalBrutoBefore * i.aporte_pensional) / 100;
  const descuentoSalud = (totalBrutoBefore * i.aporte_salud) / 100;

  // Retención en la fuente (IRPF simplificado)
  // En Colombia: exención parcial hasta 8 UVT (≈ $360.000 en 2026)
  // Aproximación: 5% sobre lo que exceda, con límites
  const UVT_2026 = 45000; // UVT aproximado 2026
  const exencionBase = UVT_2026 * 8; // ~360.000
  let retencionRenta = 0;
  if (totalBrutoBefore > exencionBase) {
    const baseImponible = totalBrutoBefore - exencionBase;
    // Tasa simplificada 5% (en realidad depende de si es residente fiscal, etc.)
    retencionRenta = (baseImponible * 0.05) * 0.6; // Ajuste por exenciones
  }
  retencionRenta = Math.max(0, retencionRenta);

  // ===== TOTALES =====
  const totalDescuentos = descuentoPensional + descuentoSalud + retencionRenta;
  const totalNeto = totalBrutoBefore - totalDescuentos;

  // ===== DESGLOSE =====
  const desglose = `
=== DESGLOSE DE LIQUIDACIÓN LABORAL COLOMBIA 2026 ===

PERÍODO DE SERVICIO:
  Días trabajados: ${diasTrabajados}
  Años de servicio: ${anosServicio.toFixed(2)}
  Salario base (incluye bonificación): $${salarioBase.toLocaleString('es-CO', { maximumFractionDigits: 0 })}

COMPONENTES BRUTOS:
  1. Cesantías (${anosServicio.toFixed(2)} años × salario/12): $${cesantiasBruto.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  2. Intereses cesantías (12% anual): $${interesesCesantias.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  3. Prima de servicios: $${primaServicios.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  4. Vacaciones no disfrutadas (${i.dias_vacaciones_pendientes} días): $${vacacionesNoDisfrutadas.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  5. Indemnización por despido: $${indemnizacionDespido.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  ────────────────────────────────────────
  TOTAL BRUTO: $${totalBrutoBefore.toLocaleString('es-CO', { maximumFractionDigits: 0 })}

DESCUENTOS OBLIGATORIOS:
  - Aporte pensión (${i.aporte_pensional}%): -$${descuentoPensional.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  - Aporte salud/EPS (${i.aporte_salud}%): -$${descuentoSalud.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  - Retención en la fuente (aprox.): -$${retencionRenta.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
  ────────────────────────────────────────
  TOTAL DESCUENTOS: -$${totalDescuentos.toLocaleString('es-CO', { maximumFractionDigits: 0 })}

═════════════════════════════════════════
  TOTAL NETO A RECIBIR: $${totalNeto.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
═════════════════════════════════════════

NOTA: Esta calculadora usa fórmulas simplificadas del Código Sustantivo del Trabajo. 
Para exactitud fiscal y laboral, consulta con contador o abogado laboral especializado.
  `;

  return {
    dias_trabajados: diasTrabajados,
    anos_servicio: Math.round(anosServicio * 100) / 100,
    salario_base_liquidacion: Math.round(salarioBase),
    cesantias_bruto: Math.round(cesantiasBruto),
    intereses_cesantias: Math.round(interesesCesantias),
    prima_servicios: Math.round(primaServicios),
    vacaciones_no_disfrutadas: Math.round(vacacionesNoDisfrutadas),
    indemnizacion_despido: Math.round(indemnizacionDespido),
    total_bruto_antes_descuentos: Math.round(totalBrutoBefore),
    descuento_pensional: Math.round(descuentoPensional),
    descuento_salud: Math.round(descuentoSalud),
    retencion_renta: Math.round(retencionRenta),
    total_descuentos: Math.round(totalDescuentos),
    total_neto: Math.round(totalNeto),
    desglose_componentes: desglose
  };
}
