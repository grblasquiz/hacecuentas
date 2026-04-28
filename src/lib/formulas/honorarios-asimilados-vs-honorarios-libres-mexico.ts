export interface Inputs {
  ingreso_mensual_bruto: number;
  gastos_deducibles_mensual: number;
  modalidad: 'ambas' | 'asimilado' | 'honorarios';
}

export interface Outputs {
  asimilado_ingreso_gravable: number;
  asimilado_isr: number;
  asimilado_imss_aportacion: number;
  asimilado_neto_mensual: number;
  asimilado_costo_cliente: number;
  honorarios_ingreso_gravable: number;
  honorarios_isr_retension: number;
  honorarios_iva: number;
  honorarios_isr_anual_estimado: number;
  honorarios_neto_mensual: number;
  honorarios_costo_cliente: number;
  diferencia_neto: number;
  diferencia_cliente: number;
  recomendacion: string;
}

// Tarifa ISR Salarios 2026 México (UMA 2026 = ~$312.05 MXN)
function calcularISRSalarios(ingreso_gravable: number): number {
  // Tarifa simplificada 2026 (tramos aproximados)
  const UMA = 312.05;
  const limit1 = UMA * 2.18; // ~$680.94
  const limit2 = UMA * 19.07; // ~$5,951.97
  const limit3 = UMA * 333.67; // ~$104,087.95
  const limit4 = UMA * 416.67; // ~$130,068.62
  const limit5 = UMA * 833.33; // ~$260,137.24
  const limit6 = UMA * 2083.33; // ~$650,343.10
  const limit7 = UMA * 5000; // ~$1,560,250

  let isr = 0;
  let cuota = 0;

  if (ingreso_gravable <= limit1) {
    isr = ingreso_gravable * 0.0192;
  } else if (ingreso_gravable <= limit2) {
    cuota = limit1 * 0.0192;
    isr = cuota + (ingreso_gravable - limit1) * 0.064;
  } else if (ingreso_gravable <= limit3) {
    cuota = limit1 * 0.0192 + (limit2 - limit1) * 0.064;
    isr = cuota + (ingreso_gravable - limit2) * 0.1088;
  } else if (ingreso_gravable <= limit4) {
    cuota = limit1 * 0.0192 + (limit2 - limit1) * 0.064 + (limit3 - limit2) * 0.1088;
    isr = cuota + (ingreso_gravable - limit3) * 0.1664;
  } else if (ingreso_gravable <= limit5) {
    cuota = limit1 * 0.0192 + (limit2 - limit1) * 0.064 + (limit3 - limit2) * 0.1088 + (limit4 - limit3) * 0.1664;
    isr = cuota + (ingreso_gravable - limit4) * 0.1760;
  } else if (ingreso_gravable <= limit6) {
    cuota = limit1 * 0.0192 + (limit2 - limit1) * 0.064 + (limit3 - limit2) * 0.1088 + (limit4 - limit3) * 0.1664 + (limit5 - limit4) * 0.1760;
    isr = cuota + (ingreso_gravable - limit5) * 0.1776;
  } else if (ingreso_gravable <= limit7) {
    cuota = limit1 * 0.0192 + (limit2 - limit1) * 0.064 + (limit3 - limit2) * 0.1088 + (limit4 - limit3) * 0.1664 + (limit5 - limit4) * 0.1760 + (limit6 - limit5) * 0.1776;
    isr = cuota + (ingreso_gravable - limit6) * 0.1904;
  } else {
    cuota = limit1 * 0.0192 + (limit2 - limit1) * 0.064 + (limit3 - limit2) * 0.1088 + (limit4 - limit3) * 0.1664 + (limit5 - limit4) * 0.1760 + (limit6 - limit5) * 0.1776 + (limit7 - limit6) * 0.1904;
    isr = cuota + (ingreso_gravable - limit7) * 0.35;
  }

  return Math.max(0, isr);
}

// Tarifa ISR Personas Físicas 2026 (simplificada anual)
function calcularISRPersonasFisicas(ingreso_gravable_anual: number): number {
  // Tarifa PF 2026 (simplificada, progresiva 5%-35%)
  const limit1 = 20681.76 * 12; // ~$248,181.12
  const limit2 = 34896.25 * 12; // ~$418,755
  const limit3 = 58644.10 * 12; // ~$703,729.20
  const limit4 = 87220.42 * 12; // ~$1,046,645.04
  const limit5 = 173616.33 * 12; // ~$2,083,396

  let isr = 0;
  let cuota = 0;

  if (ingreso_gravable_anual <= limit1) {
    isr = ingreso_gravable_anual * 0.05;
  } else if (ingreso_gravable_anual <= limit2) {
    cuota = limit1 * 0.05;
    isr = cuota + (ingreso_gravable_anual - limit1) * 0.10;
  } else if (ingreso_gravable_anual <= limit3) {
    cuota = limit1 * 0.05 + (limit2 - limit1) * 0.10;
    isr = cuota + (ingreso_gravable_anual - limit2) * 0.15;
  } else if (ingreso_gravable_anual <= limit4) {
    cuota = limit1 * 0.05 + (limit2 - limit1) * 0.10 + (limit3 - limit2) * 0.15;
    isr = cuota + (ingreso_gravable_anual - limit3) * 0.20;
  } else if (ingreso_gravable_anual <= limit5) {
    cuota = limit1 * 0.05 + (limit2 - limit1) * 0.10 + (limit3 - limit2) * 0.15 + (limit4 - limit3) * 0.20;
    isr = cuota + (ingreso_gravable_anual - limit4) * 0.25;
  } else {
    cuota = limit1 * 0.05 + (limit2 - limit1) * 0.10 + (limit3 - limit2) * 0.15 + (limit4 - limit3) * 0.20 + (limit5 - limit4) * 0.25;
    isr = cuota + (ingreso_gravable_anual - limit5) * 0.35;
  }

  return Math.max(0, isr);
}

export function compute(i: Inputs): Outputs {
  const ingreso_bruto = i.ingreso_mensual_bruto || 0;
  const gastos = i.gastos_deducibles_mensual || 0;
  const modalidad = i.modalidad || 'ambas';

  // Validaciones
  if (ingreso_bruto < 0) throw new Error('Ingreso no puede ser negativo');
  if (gastos < 0) throw new Error('Gastos no pueden ser negativos');
  if (gastos > ingreso_bruto) throw new Error('Gastos no pueden exceder ingreso');

  let resultado: Outputs = {
    asimilado_ingreso_gravable: 0,
    asimilado_isr: 0,
    asimilado_imss_aportacion: 0,
    asimilado_neto_mensual: 0,
    asimilado_costo_cliente: 0,
    honorarios_ingreso_gravable: 0,
    honorarios_isr_retension: 0,
    honorarios_iva: 0,
    honorarios_isr_anual_estimado: 0,
    honorarios_neto_mensual: 0,
    honorarios_costo_cliente: 0,
    diferencia_neto: 0,
    diferencia_cliente: 0,
    recomendacion: ''
  };

  // CÁLCULO ASIMILADO
  if (modalidad === 'ambas' || modalidad === 'asimilado') {
    const gravable_asimilado = ingreso_bruto - gastos;
    const isr_asimilado = calcularISRSalarios(gravable_asimilado);
    // IMSS: 7.065% patronal + 8.5% obrero = 15.565% aproximado (sobre ingreso bruto)
    const imss_asimilado = ingreso_bruto * 0.15565;
    const neto_asimilado = ingreso_bruto - isr_asimilado - imss_asimilado;

    resultado.asimilado_ingreso_gravable = Math.round(gravable_asimilado * 100) / 100;
    resultado.asimilado_isr = Math.round(isr_asimilado * 100) / 100;
    resultado.asimilado_imss_aportacion = Math.round(imss_asimilado * 100) / 100;
    resultado.asimilado_neto_mensual = Math.round(neto_asimilado * 100) / 100;
    resultado.asimilado_costo_cliente = ingreso_bruto; // Sin IVA
  }

  // CÁLCULO HONORARIOS
  if (modalidad === 'ambas' || modalidad === 'honorarios') {
    const gravable_honorarios = ingreso_bruto - gastos;
    const iva_honorarios = ingreso_bruto * 0.16; // IVA sobre ingreso bruto
    const retencion_honorarios = ingreso_bruto * 0.10; // Retención 10%
    // ISR anual estimado (Personas Físicas, base anual)
    const ingreso_gravable_anual = gravable_honorarios * 12;
    const isr_anual_pf = calcularISRPersonasFisicas(ingreso_gravable_anual);
    // Restar retenciones anuales (10% mensual = 120% anual de ingreso bruto, simplificado)
    const retenciones_anuales = retencion_honorarios * 12;
    const isr_a_pagar_anual = Math.max(0, isr_anual_pf - retenciones_anuales);
    const isr_mensual_honorarios = isr_a_pagar_anual / 12;
    const neto_honorarios = ingreso_bruto - retencion_honorarios - isr_mensual_honorarios;
    const costo_cliente_honorarios = ingreso_bruto + iva_honorarios;

    resultado.honorarios_ingreso_gravable = Math.round(gravable_honorarios * 100) / 100;
    resultado.honorarios_isr_retension = Math.round(retencion_honorarios * 100) / 100;
    resultado.honorarios_iva = Math.round(iva_honorarios * 100) / 100;
    resultado.honorarios_isr_anual_estimado = Math.round(isr_a_pagar_anual * 100) / 100;
    resultado.honorarios_neto_mensual = Math.round(neto_honorarios * 100) / 100;
    resultado.honorarios_costo_cliente = Math.round(costo_cliente_honorarios * 100) / 100;
  }

  // COMPARATIVA Y RECOMENDACIÓN
  if (modalidad === 'ambas') {
    resultado.diferencia_neto = Math.round((resultado.asimilado_neto_mensual - resultado.honorarios_neto_mensual) * 100) / 100;
    resultado.diferencia_cliente = Math.round((resultado.honorarios_costo_cliente - resultado.asimilado_costo_cliente) * 100) / 100;

    let recomendacion = '';

    if (resultado.diferencia_neto > 1000) {
      recomendacion = `**Asimilado es más ventajoso para ti.** Recibes $${Math.abs(resultado.diferencia_neto).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN más neto/mes. Ventajas: Seguridad social IMSS, menor ISR. Desventaja: Cliente paga menos, menos flexibilidad en gastos deducibles. Ideal si valoras estabilidad y cobertura IMSS.`;
    } else if (resultado.diferencia_neto < -1000) {
      recomendacion = `**Honorarios es más ventajoso para ti.** Recibes $${Math.abs(resultado.diferencia_neto).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN más neto/mes. Ventajas: Mayor flexibilidad en deducciones, independencia. Desventaja: Cliente paga $${resultado.diferencia_cliente.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN más (IVA), sin IMSS automático. Ideal si tienes muchos gastos deducibles y buscas independencia.`;
    } else {
      recomendacion = `**Ambas modalidades generan neto similar.** Diferencia: $${Math.abs(resultado.diferencia_neto).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN/mes. Elige según: (1) ¿Valoras IMSS? → Asimilado. (2) ¿Tienes muchos gastos deducibles? → Honorarios. (3) ¿Qué acepta tu cliente? Consulta a tu contador fiscal.`;
    }

    resultado.recomendacion = recomendacion;
  }

  return resultado;
}
