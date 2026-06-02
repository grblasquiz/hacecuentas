export interface Inputs {
  cedula_general_ingresos: number;
  cedula_general_deducciones: number;
  cedula_pensiones_ingresos: number;
  cedula_pensiones_deducciones: number;
  cedula_no_laboral_ingresos: number;
  cedula_no_laboral_deducciones: number;
  cedula_capital_ingresos: number;
  cedula_capital_deducciones: number;
  retenciones_practicadas: number;
  impuesto_generado_2025: number;
}

export interface Outputs {
  renta_liquida_cedula_general: number;
  renta_liquida_cedula_pensiones: number;
  renta_liquida_cedula_no_laboral: number;
  renta_liquida_cedula_capital: number;
  renta_liquida_total: number;
  impuesto_cedula_general: number;
  impuesto_cedula_pensiones: number;
  impuesto_cedula_no_laboral: number;
  impuesto_cedula_capital: number;
  impuesto_total_generado: number;
  saldo_a_pagar_o_favor: number;
  tasa_efectiva: number;
  _insight?: any;
  _chart?: any;
}

function fmtCOP(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

function calcularImpuestoTramo(rentaLiquida: number, esCedulaGeneral: boolean): number {
  // Tramos DIAN 2026 Colombia
  // Cédula general (laboral): exención hasta $50M
  // Demás cédulas: exención hasta $2M
  if (esCedulaGeneral) {
    if (rentaLiquida <= 50000000) return 0;
    let impuesto = 0;
    const tramos = [
      { limite: 75000000, tasa: 0.19, anterior: 50000000 },
      { limite: 100000000, tasa: 0.28, anterior: 75000000 },
      { limite: 150000000, tasa: 0.37, anterior: 100000000 },
      { limite: Infinity, tasa: 0.39, anterior: 150000000 }
    ];
    let base = 50000000;
    for (const tramo of tramos) {
      if (rentaLiquida <= tramo.anterior) break;
      const hasta = Math.min(rentaLiquida, tramo.limite);
      impuesto += (hasta - base) * tramo.tasa;
      base = hasta;
    }
    return Math.round(impuesto);
  } else {
    // Cédulas pensiones, no laboral, capital
    if (rentaLiquida <= 2000000) return 0;
    let impuesto = 0;
    const tramos = [
      { limite: 3000000, tasa: 0.19, anterior: 2000000 },
      { limite: 4000000, tasa: 0.28, anterior: 3000000 },
      { limite: 20000000, tasa: 0.37, anterior: 4000000 },
      { limite: Infinity, tasa: 0.39, anterior: 20000000 }
    ];
    let base = 2000000;
    for (const tramo of tramos) {
      if (rentaLiquida <= tramo.anterior) break;
      const hasta = Math.min(rentaLiquida, tramo.limite);
      impuesto += (hasta - base) * tramo.tasa;
      base = hasta;
    }
    return Math.round(impuesto);
  }
}

export function compute(i: Inputs): Outputs {
  // Validar inputs
  const cedula_general_ingresos = Math.max(0, i.cedula_general_ingresos || 0);
  const cedula_general_deducciones = Math.max(0, Math.min(i.cedula_general_deducciones || 0, cedula_general_ingresos * 0.4));
  const cedula_pensiones_ingresos = Math.max(0, i.cedula_pensiones_ingresos || 0);
  const cedula_pensiones_deducciones = Math.max(0, Math.min(i.cedula_pensiones_deducciones || 0, cedula_pensiones_ingresos * 0.2));
  const cedula_no_laboral_ingresos = Math.max(0, i.cedula_no_laboral_ingresos || 0);
  const cedula_no_laboral_deducciones = Math.max(0, Math.min(i.cedula_no_laboral_deducciones || 0, cedula_no_laboral_ingresos * 0.3));
  const cedula_capital_ingresos = Math.max(0, i.cedula_capital_ingresos || 0);
  const cedula_capital_deducciones = Math.max(0, Math.min(i.cedula_capital_deducciones || 0, cedula_capital_ingresos));
  const retenciones_practicadas = Math.max(0, i.retenciones_practicadas || 0);

  // Calcular rentas líquidas por cédula
  const renta_liquida_cedula_general = cedula_general_ingresos - cedula_general_deducciones;
  const renta_liquida_cedula_pensiones = cedula_pensiones_ingresos - cedula_pensiones_deducciones;
  const renta_liquida_cedula_no_laboral = cedula_no_laboral_ingresos - cedula_no_laboral_deducciones;
  const renta_liquida_cedula_capital = cedula_capital_ingresos - cedula_capital_deducciones;

  const renta_liquida_total = Math.max(0, renta_liquida_cedula_general + renta_liquida_cedula_pensiones + renta_liquida_cedula_no_laboral + renta_liquida_cedula_capital);

  // Calcular impuesto por cédula aplicando tramos
  const impuesto_cedula_general = calcularImpuestoTramo(Math.max(0, renta_liquida_cedula_general), true);
  const impuesto_cedula_pensiones = 0; // Cédula pensiones generalmente exenta; si no, aplicar calcularImpuestoTramo(renta_liquida_cedula_pensiones, false)
  const impuesto_cedula_no_laboral = calcularImpuestoTramo(Math.max(0, renta_liquida_cedula_no_laboral), false);
  const impuesto_cedula_capital = calcularImpuestoTramo(Math.max(0, renta_liquida_cedula_capital), false);

  const impuesto_total_generado = impuesto_cedula_general + impuesto_cedula_pensiones + impuesto_cedula_no_laboral + impuesto_cedula_capital;

  // Calcular saldo a pagar o favor
  const saldo_a_pagar_o_favor = impuesto_total_generado - retenciones_practicadas;

  // Calcular tasa efectiva
  const ingreso_bruto_total = cedula_general_ingresos + cedula_pensiones_ingresos + cedula_no_laboral_ingresos + cedula_capital_ingresos;
  const tasa_efectiva = ingreso_bruto_total > 0 ? (impuesto_total_generado / ingreso_bruto_total) * 100 : 0;

  const saldo = Math.round(saldo_a_pagar_o_favor);
  const tasaEf = Math.round(tasa_efectiva * 100) / 100;

  const _insight = {
    title: saldo > 0 ? 'Te queda saldo a pagar' : saldo < 0 ? 'Tenés saldo a favor' : 'Declaración en cero',
    text: saldo > 0
      ? `El impuesto generado (**${fmtCOP(impuesto_total_generado)}**) supera tus retenciones por **${fmtCOP(saldo)}**: ese es el saldo a pagar a la DIAN. Tu tasa efectiva sobre el ingreso bruto es **${tasaEf}%**.`
      : saldo < 0
      ? `Tus retenciones (**${fmtCOP(retenciones_practicadas)}**) cubrieron de más el impuesto: tenés **${fmtCOP(Math.abs(saldo))}** a favor para solicitar en devolución. Tasa efectiva: **${tasaEf}%**.`
      : `Tus retenciones igualaron exactamente el impuesto generado: no pagás ni te devuelven. Tasa efectiva: **${tasaEf}%**.`,
    tone: saldo > 0 ? 'warn' : saldo < 0 ? 'good' : 'neutral',
    icon: saldo > 0 ? '🇨🇴' : saldo < 0 ? '💸' : '⚖️',
  };

  const out: Outputs = {
    renta_liquida_cedula_general: Math.round(renta_liquida_cedula_general),
    renta_liquida_cedula_pensiones: Math.round(renta_liquida_cedula_pensiones),
    renta_liquida_cedula_no_laboral: Math.round(renta_liquida_cedula_no_laboral),
    renta_liquida_cedula_capital: Math.round(renta_liquida_cedula_capital),
    renta_liquida_total: Math.round(renta_liquida_total),
    impuesto_cedula_general,
    impuesto_cedula_pensiones,
    impuesto_cedula_no_laboral,
    impuesto_cedula_capital,
    impuesto_total_generado,
    saldo_a_pagar_o_favor: saldo,
    tasa_efectiva: tasaEf,
    _insight,
  };

  // Donut: composición del impuesto total por cédula (las slices suman el total)
  const slicesImp = [
    { label: 'Cédula general', value: impuesto_cedula_general },
    { label: 'Cédula no laboral', value: impuesto_cedula_no_laboral },
    { label: 'Cédula de capital', value: impuesto_cedula_capital },
    { label: 'Cédula pensiones', value: impuesto_cedula_pensiones },
  ].filter(s => s.value > 0);

  if (impuesto_total_generado > 0 && slicesImp.length >= 2) {
    out._chart = {
      type: 'doughnut',
      slices: slicesImp,
      prefix: '$',
      centerValue: fmtCOP(impuesto_total_generado),
      centerLabel: 'Impuesto total',
      ariaLabel: 'Composición del impuesto de renta generado por cada cédula',
    };
  }

  return out;
}
