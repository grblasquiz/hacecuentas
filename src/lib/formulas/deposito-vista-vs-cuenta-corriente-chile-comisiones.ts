export interface Inputs {
  tipo_cuenta_actual: 'vista' | 'corriente' | 'ninguna';
  transacciones_mensuales: number;
  usa_chequera: 'no' | 'si' | 'mucho';
  usa_sobregiro: 'no' | 'ocasional' | 'regular';
  consultas_saldo: number;
  tiene_cuenta_otros_bancos: 'no' | 'si_1' | 'si_2';
  edad: number;
}

export interface Outputs {
  costo_mensual_vista: number;
  costo_mensual_corriente: number;
  ahorro_anual: number;
  recomendacion: string;
  desglose_vista: {
    mantension: number;
    comision_transacciones: number;
    comision_cheques: number;
    comisiones_especiales: number;
    total: number;
  };
  desglose_corriente: {
    mantension: number;
    comision_transacciones: number;
    comision_cheques: number;
    comisiones_especiales: number;
    total: number;
  };
}

export function compute(i: Inputs): Outputs {
  // Constantes CMF/SII 2026 Chile
  const MANTENSION_VISTA_BASE = 0; // Bancos grandes sin costo
  const MANTENSION_CORRIENTE_BASE = 4500; // Promedio: $4.000–$5.000/mes
  
  const OPERACIONES_GRATIS_VISTA = 6; // 6 ops/mes sin comisión
  const COSTO_OPERACION_EXCEDENTE = 200; // $200 por op. excedente
  
  const OPERACIONES_GRATIS_CORRIENTE = 10;
  const COSTO_OPERACION_CORRIENTE = 200;
  
  const COSTO_CHEQUE_POR_UNIDAD = 500; // Comisión por cheque girado
  const CHEQUES_GRATIS_CORRIENTE = 3; // Primeros 3 gratis en corriente
  
  const COSTO_CONSULTA_ESPECIAL = 300; // Certificados, consultas CMF
  const SOBREGIRO_TASA_MENSUAL = 0.02; // 2% mensual (CMF máx. 2026)
  
  // Edad: descuento <25 años
  const DESCUENTO_MENOR_25 = i.edad < 25 ? 0.3 : 0; // 30% descuento
  
  // ============== CUENTA VISTA ==============
  let costo_vista = MANTENSION_VISTA_BASE;
  
  // Comisiones por transacciones excedentes
  if (i.transacciones_mensuales > OPERACIONES_GRATIS_VISTA) {
    const excedentes = i.transacciones_mensuales - OPERACIONES_GRATIS_VISTA;
    costo_vista += excedentes * COSTO_OPERACION_EXCEDENTE;
  }
  
  // Cuenta vista NO tiene chequera, así que costo_cheques = 0
  const comision_cheques_vista = 0;
  
  // Consultas especiales (si superan 8/mes, cobran)
  let comisiones_especiales_vista = 0;
  if (i.consultas_saldo > 8) {
    comisiones_especiales_vista = (i.consultas_saldo - 8) * 50; // $50/consulta extra
  }
  
  costo_vista += comisiones_especiales_vista;
  
  // Penalización: tener múltiples cuentas
  if (i.tiene_cuenta_otros_bancos === 'si_1') {
    costo_vista += 500; // Cargo administrativo
  } else if (i.tiene_cuenta_otros_bancos === 'si_2') {
    costo_vista += 1200;
  }
  
  // Descuento <25 años
  costo_vista = costo_vista * (1 - DESCUENTO_MENOR_25);
  
  const desglose_vista = {
    mantension: MANTENSION_VISTA_BASE,
    comision_transacciones: costo_vista - comisiones_especiales_vista - MANTENSION_VISTA_BASE,
    comision_cheques: 0,
    comisiones_especiales: comisiones_especiales_vista,
    total: Math.max(0, Math.round(costo_vista))
  };
  
  // ============== CUENTA CORRIENTE ==============
  let costo_corriente = MANTENSION_CORRIENTE_BASE;
  
  // Comisiones por transacciones excedentes
  if (i.transacciones_mensuales > OPERACIONES_GRATIS_CORRIENTE) {
    const excedentes = i.transacciones_mensuales - OPERACIONES_GRATIS_CORRIENTE;
    costo_corriente += excedentes * COSTO_OPERACION_CORRIENTE;
  }
  
  // Comisión por cheques girados
  let comision_cheques_corriente = 0;
  if (i.usa_chequera === 'si') {
    // Asumimos 8 cheques/mes
    const cheques_a_cobrar = Math.max(0, 8 - CHEQUES_GRATIS_CORRIENTE); // 5 cheques excedentes
    comision_cheques_corriente = cheques_a_cobrar * COSTO_CHEQUE_POR_UNIDAD; // 5 × 500 = 2.500
  } else if (i.usa_chequera === 'mucho') {
    // Asumimos 25 cheques/mes
    const cheques_a_cobrar = Math.max(0, 25 - CHEQUES_GRATIS_CORRIENTE); // 22 cheques
    comision_cheques_corriente = cheques_a_cobrar * COSTO_CHEQUE_POR_UNIDAD; // 22 × 500 = 11.000
  }
  
  costo_corriente += comision_cheques_corriente;
  
  // Consultas especiales
  let comisiones_especiales_corriente = 0;
  if (i.consultas_saldo > 8) {
    comisiones_especiales_corriente = (i.consultas_saldo - 8) * 50;
  }
  costo_corriente += comisiones_especiales_corriente;
  
  // Sobregiro: simulamos costo mensual estimado
  let costo_sobregiro = 0;
  if (i.usa_sobregiro === 'ocasional') {
    // Asumimos $50.000 de sobregiro 10 días/mes = promedio $16.667 * 0.02 * (10/30)
    costo_sobregiro = 50000 * SOBREGIRO_TASA_MENSUAL * (10 / 30); // ~$333
  } else if (i.usa_sobregiro === 'regular') {
    // Asumimos $100.000 de sobregiro 20 días/mes
    costo_sobregiro = 100000 * SOBREGIRO_TASA_MENSUAL * (20 / 30); // ~$1.333
  }
  costo_corriente += costo_sobregiro;
  
  // Penalización: múltiples cuentas (ya tienen mantención en otro lado)
  if (i.tiene_cuenta_otros_bancos === 'si_1') {
    costo_corriente += 800;
  } else if (i.tiene_cuenta_otros_bancos === 'si_2') {
    costo_corriente += 1500;
  }
  
  // Descuento <25 años
  costo_corriente = costo_corriente * (1 - DESCUENTO_MENOR_25);
  
  const desglose_corriente = {
    mantension: Math.round(MANTENSION_CORRIENTE_BASE * (1 - DESCUENTO_MENOR_25)),
    comision_transacciones: Math.round((costo_corriente - MANTENSION_CORRIENTE_BASE * (1 - DESCUENTO_MENOR_25) - comision_cheques_corriente - comisiones_especiales_corriente - costo_sobregiro) * (1 - DESCUENTO_MENOR_25)),
    comision_cheques: Math.round(comision_cheques_corriente * (1 - DESCUENTO_MENOR_25)),
    comisiones_especiales: Math.round((comisiones_especiales_corriente + costo_sobregiro) * (1 - DESCUENTO_MENOR_25)),
    total: Math.max(0, Math.round(costo_corriente))
  };
  
  const costo_mensual_vista = Math.max(0, Math.round(costo_vista));
  const costo_mensual_corriente = Math.max(0, Math.round(costo_corriente));
  const ahorro_anual = (costo_mensual_corriente - costo_mensual_vista) * 12;
  
  // Generamos recomendación
  let recomendacion = '';
  
  if (i.usa_chequera === 'no' && i.usa_sobregiro === 'no') {
    recomendacion = `✅ **Cuenta vista recomendada.** Tu perfil (sin cheques, sin sobregiro) es ideal para vista. Ahorras $${ahorro_anual.toLocaleString('es-CL')} anuales.`;
  } else if ((i.usa_chequera === 'si' || i.usa_chequera === 'mucho') && i.transacciones_mensuales > 15) {
    recomendacion = `⚠️ **Cuenta corriente necesaria.** Usas cheques y muchas transacciones. Costo: $${costo_mensual_corriente.toLocaleString('es-CL')}/mes. Considera negociar comisión con tu banco.`;
  } else if (i.usa_sobregiro === 'regular') {
    recomendacion = `⚠️ **Corriente recomendada por sobregiro regular.** Costo total: $${costo_mensual_corriente.toLocaleString('es-CL')}/mes (~$${ahorro_anual.toLocaleString('es-CL')}/año vs vista).`;
  } else {
    const diferencia = costo_mensual_corriente - costo_mensual_vista;
    if (diferencia > 5000) {
      recomendacion = `✅ **Mantén vista.** La corriente cuesta $${diferencia.toLocaleString('es-CL')}/mes más ($${(diferencia * 12).toLocaleString('es-CL')}/año).`;
    } else {
      recomendacion = `⚠️ **Evalúa corriente.** Diferencia mínima ($${diferencia.toLocaleString('es-CL')}/mes). Considera beneficios adicionales (crédito, seguros).`;
    }
  }
  
  return {
    costo_mensual_vista,
    costo_mensual_corriente,
    ahorro_anual,
    recomendacion,
    desglose_vista,
    desglose_corriente
  };
}
