import { isrMensual2026, isrAnual2026 } from '../data/mexico-2026';

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
  _insight?: any;
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
    const isr_asimilado = isrMensual2026(gravable_asimilado); // tarifa mensual 2026 (Art. 96 LISR, Anexo 8 RMF 2026)
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
    const isr_anual_pf = isrAnual2026(ingreso_gravable_anual); // tarifa anual 2026 (Art. 152 LISR, Anexo 8 RMF 2026)
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

  // Insight dinámico según la modalidad calculada
  const fmtMX = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  if (modalidad === 'ambas') {
    const ganaAsimilado = resultado.diferencia_neto > 0;
    const empate = Math.abs(resultado.diferencia_neto) <= 1000;
    resultado._insight = {
      title: 'Qué te conviene',
      text: empate
        ? `Ambas modalidades te dejan un neto casi igual (diferencia de **${fmtMX(Math.abs(resultado.diferencia_neto))}/mes**). Decidí por lo no monetario: **asimilado** te da IMSS; **honorarios** te da deducciones e independencia.`
        : `**${ganaAsimilado ? 'Asimilado' : 'Honorarios'}** te deja **${fmtMX(Math.abs(resultado.diferencia_neto))} más al mes** en neto. ${ganaAsimilado ? 'Sumás cobertura IMSS, pero perdés flexibilidad de deducciones.' : `Ganás flexibilidad e independencia, pero tu cliente paga **${fmtMX(resultado.diferencia_cliente)}** más de IVA y no tenés IMSS automático.`}`,
      tone: 'neutral' as 'good' | 'warn' | 'neutral',
      icon: '⚖️',
    };
  } else if (modalidad === 'asimilado') {
    resultado._insight = {
      title: 'Qué significa',
      text: `Como asimilado a salarios, de **${fmtMX(ingreso_bruto)}** brutos te quedan **${fmtMX(resultado.asimilado_neto_mensual)}** netos: ${fmtMX(resultado.asimilado_isr)} de ISR y ${fmtMX(resultado.asimilado_imss_aportacion)} de IMSS. A cambio del descuento, sumás seguridad social.`,
      tone: 'neutral' as 'good' | 'warn' | 'neutral',
      icon: '🧾',
    };
  } else if (modalidad === 'honorarios') {
    resultado._insight = {
      title: 'Qué significa',
      text: `Por honorarios, de **${fmtMX(ingreso_bruto)}** te quedan **${fmtMX(resultado.honorarios_neto_mensual)}** netos tras retención (${fmtMX(resultado.honorarios_isr_retension)}) e ISR estimado. Tu cliente paga **${fmtMX(resultado.honorarios_costo_cliente)}** con el IVA del 16% incluido.`,
      tone: 'neutral' as 'good' | 'warn' | 'neutral',
      icon: '🧾',
    };
  }

  return resultado;
}
