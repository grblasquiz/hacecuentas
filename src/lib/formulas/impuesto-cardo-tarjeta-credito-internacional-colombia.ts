export interface Inputs {
  monto_usd: number;
  trm_aplicada: number;
  banco_seleccionado: 'lulo' | 'tuya' | 'banco_bogota' | 'bbva' | 'scotiabank' | 'santander' | 'itau' | 'otro';
  comision_cambio_manual?: number;
  aplica_gravamen_4x1000: 'si' | 'no';
}

export interface Outputs {
  monto_cop_base: number;
  comision_cambio_cop: number;
  gravamen_4x1000_cop: number;
  costo_total_cop: number;
  costo_por_usd: number;
  ahorro_vs_caro: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Fuente: Banco de la República, DIAN (gravamen 4×1000), Superfinanciera
  // Comisiones 2026 según sitios web bancos actualizados

  // Mapeo de comisiones por banco (en porcentaje)
  const comisiones: Record<string, number> = {
    'lulo': 0.0,        // Lulo Bank: 0% comisión cambio
    'tuya': 0.0,        // Tuya: 0% comisión cambio
    'banco_bogota': 2.0, // Banco de Bogotá: 2%
    'bbva': 3.0,        // BBVA: 3%
    'scotiabank': 2.5,  // Scotiabank: 2.5%
    'santander': 2.8,   // Santander: 2.8%
    'itau': 2.2,        // Itaú: 2.2%
    'otro': i.comision_cambio_manual || 2.0 // Defecto 2% si no especifica
  };

  const comision_porcentaje = comisiones[i.banco_seleccionado];

  // 1. Monto base: USD × TRM
  const monto_cop_base = i.monto_usd * i.trm_aplicada;

  // 2. Comisión cambio: sobre el monto en COP
  const comision_cambio_cop = monto_cop_base * (comision_porcentaje / 100);

  // 3. Gravamen 4×1000: 0,4% sobre el monto en USD, convertido a COP
  // Gravamen = (USD × TRM) × 0,004
  const gravamen_4x1000_cop = i.aplica_gravamen_4x1000 === 'si'
    ? i.monto_usd * i.trm_aplicada * 0.004
    : 0;

  // 4. Costo total
  const costo_total_cop = monto_cop_base + comision_cambio_cop + gravamen_4x1000_cop;

  // 5. Costo efectivo por USD (TRM real incluyendo comisiones)
  const costo_por_usd = costo_total_cop / i.monto_usd;

  // 6. Ahorro vs tarjeta más cara (BBVA 3%)
  // Cálculo hipotético con BBVA
  const comision_bbva_cop = monto_cop_base * 0.03;
  const total_bbva = monto_cop_base + comision_bbva_cop + gravamen_4x1000_cop;
  const ahorro_vs_caro = total_bbva - costo_total_cop;

  const fmtCOP = (v: number) => '$' + Math.round(v).toLocaleString('es-CO');
  const recargo_pct = monto_cop_base > 0
    ? ((costo_total_cop - monto_cop_base) / monto_cop_base) * 100
    : 0;
  const sobrecosto = costo_total_cop - monto_cop_base;

  const insight = {
    title: 'Costo real de tu compra',
    text: `Cada dólar te termina costando **${fmtCOP(costo_por_usd)}** (TRM real con comisión y gravamen incluidos). Pagás **${fmtCOP(sobrecosto)}** de sobrecosto sobre la conversión base, un **${recargo_pct.toFixed(2)}%** extra.` +
      (ahorro_vs_caro > 0
        ? ` Frente al banco más caro (BBVA 3%), te ahorrás **${fmtCOP(ahorro_vs_caro)}**.`
        : ` Estás usando una de las opciones más caras del mercado: cambiar de banco podría ahorrarte plata.`),
    tone: recargo_pct > 2.5 ? 'warn' : (recargo_pct < 1 ? 'good' : 'neutral'),
    icon: '💳',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Conversión base (TRM)', value: Math.round(monto_cop_base) },
      { label: 'Comisión de cambio', value: Math.round(comision_cambio_cop) },
      { label: 'Gravamen 4×1000', value: Math.round(gravamen_4x1000_cop) },
    ],
    prefix: '$',
    centerValue: fmtCOP(costo_total_cop),
    centerLabel: 'Costo total',
    ariaLabel: 'Composición del costo total en pesos: conversión base más comisión de cambio más gravamen 4 por 1000',
  };

  return {
    monto_cop_base: Math.round(monto_cop_base * 100) / 100,
    comision_cambio_cop: Math.round(comision_cambio_cop * 100) / 100,
    gravamen_4x1000_cop: Math.round(gravamen_4x1000_cop * 100) / 100,
    costo_total_cop: Math.round(costo_total_cop * 100) / 100,
    costo_por_usd: Math.round(costo_por_usd * 100) / 100,
    ahorro_vs_caro: Math.round(ahorro_vs_caro * 100) / 100,
    _insight: insight,
    _chart: chart
  };
}
