export interface Inputs {
  precio_venta: number;
  monto_hipoteca: number;
  tipo_banco: 'privado' | 'estatal' | 'cooperativa';
}

export interface Outputs {
  arancel_notaria: number;
  arancel_conservador: number;
  impuesto_timbre: number;
  comisiones_banco: number;
  otros_gastos: number;
  total_gastos: number;
  porcentaje_precio: number;
  costo_efectivo: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - SII/Superintendencia Notariado
  // Arancel notaría según SII 2026
  let arancel_notaria = 0;
  if (i.precio_venta <= 5_000_000) {
    arancel_notaria = 200_000;
  } else if (i.precio_venta <= 25_000_000) {
    arancel_notaria = 300_000;
  } else if (i.precio_venta <= 100_000_000) {
    arancel_notaria = 350_000 + (i.precio_venta - 25_000_000) * 0.001; // $1 por $1000 adicional
  } else {
    arancel_notaria = 425_000 + (i.precio_venta - 100_000_000) * 0.0005; // $0.50 por $1000 adicional
  }

  // Arancel Conservador Bienes Raíces - tramos SII 2026
  let arancel_conservador = 0;
  if (i.precio_venta <= 5_000_000) {
    arancel_conservador = 75_000;
  } else if (i.precio_venta <= 25_000_000) {
    arancel_conservador = 100_000 + (i.precio_venta - 5_000_000) * 0.004;
  } else if (i.precio_venta <= 100_000_000) {
    arancel_conservador = 180_000 + (i.precio_venta - 25_000_000) * 0.003;
  } else {
    arancel_conservador = 405_000 + (i.precio_venta - 100_000_000) * 0.0015;
  }

  // Impuesto timbre DFL 215 - 0.8% sobre hipoteca
  const impuesto_timbre = i.monto_hipoteca * 0.008;

  // Comisiones bancarias según tipo institución
  let tasa_comision = 0.003; // 0.3% default
  if (i.tipo_banco === 'estatal') {
    tasa_comision = 0.0025; // 0.25% bancos estatales (BCI, Santander estatal)
  } else if (i.tipo_banco === 'privado') {
    tasa_comision = 0.004; // 0.4% bancos privados
  } else if (i.tipo_banco === 'cooperativa') {
    tasa_comision = 0.005; // 0.5% cooperativas
  }
  const comisiones_banco = i.monto_hipoteca * tasa_comision;

  // Otros gastos: tasación ($400K-$600K) + seguros iniciales ($200K-$300K)
  // Estimado según precio venta
  let otros_gastos = 0;
  if (i.precio_venta <= 25_000_000) {
    otros_gastos = 500_000;
  } else if (i.precio_venta <= 100_000_000) {
    otros_gastos = 650_000;
  } else {
    otros_gastos = 850_000;
  }

  // Total gastos
  const total_gastos = arancel_notaria + arancel_conservador + impuesto_timbre + comisiones_banco + otros_gastos;

  // Porcentaje sobre precio venta
  const porcentaje_precio = (total_gastos / i.precio_venta) * 100;

  // Costo efectivo total
  const costo_efectivo = i.precio_venta + total_gastos;

  // Valores redondeados (los mismos que se devuelven)
  const r_notaria = Math.round(arancel_notaria);
  const r_conservador = Math.round(arancel_conservador);
  const r_timbre = Math.round(impuesto_timbre);
  const r_comisiones = Math.round(comisiones_banco);
  const r_otros = Math.round(otros_gastos);
  const r_total = Math.round(total_gastos);
  const r_pct = Math.round(porcentaje_precio * 100) / 100;

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  // --- Insight narrativo ---
  // Los gastos de cierre en Chile suelen ubicarse en torno al 2–4% del precio.
  let insightTone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (r_pct >= 4) insightTone = 'warn';
  else if (r_pct <= 2) insightTone = 'good';

  // Ítem que más pesa
  const items = [
    { label: 'Impuesto al timbre', val: r_timbre },
    { label: 'Conservador', val: r_conservador },
    { label: 'Notaría', val: r_notaria },
    { label: 'Comisión bancaria', val: r_comisiones },
    { label: 'Otros gastos', val: r_otros }
  ];
  const mayor = items.reduce((a, b) => (b.val > a.val ? b : a));

  const _insight = {
    title: 'Cuánto suman los gastos de inscripción',
    text: `Inscribir esta propiedad cuesta unos **${fmtCLP(r_total)}**, equivalente al **${r_pct}%** del precio de venta. El ítem que más pesa es **${mayor.label}** (${fmtCLP(mayor.val)})${r_timbre > 0 ? ', y el impuesto al timbre escala con el monto de la hipoteca' : ''}.`,
    tone: insightTone,
    icon: '🏠'
  };

  // --- Gráfico donut: composición de los gastos totales ---
  const slices = [
    { label: 'Notaría', value: r_notaria },
    { label: 'Conservador', value: r_conservador },
    { label: 'Timbre (hipoteca)', value: r_timbre },
    { label: 'Comisión banco', value: r_comisiones },
    { label: 'Otros', value: r_otros }
  ].filter(s => s.value > 0);
  const sumaSlices = slices.reduce((a, s) => a + s.value, 0);

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: Math.round(sumaSlices).toLocaleString('es-CL'),
    centerLabel: 'Gastos totales',
    ariaLabel: `Desglose de los gastos de inscripción: notaría ${fmtCLP(r_notaria)}, conservador ${fmtCLP(r_conservador)}, impuesto al timbre ${fmtCLP(r_timbre)}, comisión bancaria ${fmtCLP(r_comisiones)} y otros ${fmtCLP(r_otros)}.`
  };

  return {
    arancel_notaria: r_notaria,
    arancel_conservador: r_conservador,
    impuesto_timbre: r_timbre,
    comisiones_banco: r_comisiones,
    otros_gastos: r_otros,
    total_gastos: r_total,
    porcentaje_precio: r_pct,
    costo_efectivo: Math.round(costo_efectivo),
    _insight,
    _chart
  };
}
