export interface Inputs {
  monto_usd: number;
  tipo_cambio: 'trm_oficial' | 'banco_comercial' | 'casa_cambio' | 'mercado_informal';
  trm_oficial: number;
  precio_banco?: number;
  precio_casa_cambio?: number;
  comision_banco_pct?: number;
}

export interface Outputs {
  trm_pesos_totales: number;
  banco_pesos_totales: number;
  casa_cambio_pesos_totales: number;
  spread_banco_pct: number;
  spread_casa_cambio_pct: number;
  diferencia_pesos: number;
  mejor_opcion: string;
  tasa_efectiva: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia basadas en Superintendencia Financiera
  const MARGEN_BANCO_DEFECTO = i.comision_banco_pct ?? 2.0; // 2% por defecto
  const SPREAD_CASA_CAMBIO_DEFECTO = 2.5; // Diferencial típico 2-3%
  const SPREAD_MERCADO_INFORMAL = 6.0; // Premium riesgoso

  const trm = i.trm_oficial;
  
  // Validación básica
  if (i.monto_usd <= 0 || trm <= 0) {
    return {
      trm_pesos_totales: 0,
      banco_pesos_totales: 0,
      casa_cambio_pesos_totales: 0,
      spread_banco_pct: 0,
      spread_casa_cambio_pct: 0,
      diferencia_pesos: 0,
      mejor_opcion: 'Valores inválidos',
      tasa_efectiva: 0
    };
  }

  // 1. Cálculo TRM oficial (sin comisiones)
  const trm_pesos_totales = i.monto_usd * trm;

  // 2. Cálculo banco comercial
  const precio_banco = i.precio_banco ?? (trm * (1 - MARGEN_BANCO_DEFECTO / 100));
  const banco_bruto = i.monto_usd * precio_banco;
  const comision_banco = banco_bruto * (MARGEN_BANCO_DEFECTO / 100);
  const banco_pesos_totales = banco_bruto - comision_banco;

  // 3. Cálculo casa de cambio (spread comprador/vendedor, sin comisión adicional)
  const precio_casa_cambio = i.precio_casa_cambio ?? (trm * (1 + SPREAD_CASA_CAMBIO_DEFECTO / 100));
  const casa_cambio_pesos_totales = i.monto_usd * precio_casa_cambio;

  // 4. Cálculo mercado informal (NO RECOMENDADO - solo referencia)
  const precio_mercado_informal = trm * (1 + SPREAD_MERCADO_INFORMAL / 100);
  const mercado_informal_pesos = i.monto_usd * precio_mercado_informal;

  // 5. Spreads porcentuales
  const spread_banco_pct = ((precio_banco - trm) / trm) * 100;
  const spread_casa_cambio_pct = ((precio_casa_cambio - trm) / trm) * 100;
  const spread_mercado_informal_pct = ((precio_mercado_informal - trm) / trm) * 100;

  // 6. Determinar mejor opción y diferencia
  const opciones = [
    { nombre: 'TRM oficial', pesos: trm_pesos_totales, spread: 0 },
    { nombre: 'Banco comercial', pesos: banco_pesos_totales, spread: spread_banco_pct },
    { nombre: 'Casa de cambio', pesos: casa_cambio_pesos_totales, spread: spread_casa_cambio_pct },
    { nombre: 'Mercado informal (no legal)', pesos: mercado_informal_pesos, spread: spread_mercado_informal_pct }
  ];

  // Filtrar solo opciones legales/recomendadas
  const opciones_legales = opciones.slice(0, 3);
  const mejor = opciones_legales.reduce((prev, curr) => (curr.pesos > prev.pesos ? curr : prev));
  const peor = opciones_legales.reduce((prev, curr) => (curr.pesos < prev.pesos ? curr : prev));
  const diferencia_pesos = mejor.pesos - peor.pesos;

  // 7. Tasa efectiva promedio
  const tasa_efectiva = (precio_banco + precio_casa_cambio) / 2;

  // 8. Mensaje mejor opción
  let mejor_opcion_msg = mejor.nombre;
  if (i.monto_usd > 10000) {
    mejor_opcion_msg += ' (REQUIERE RTC ante DIAN para montos >USD 10.000)';
  }
  if (mejor.nombre === 'Casa de cambio') {
    mejor_opcion_msg += ' - Verifica que sea autorizada por Superintendencia Financiera';
  }

  return {
    trm_pesos_totales: Math.round(trm_pesos_totales * 100) / 100,
    banco_pesos_totales: Math.round(banco_pesos_totales * 100) / 100,
    casa_cambio_pesos_totales: Math.round(casa_cambio_pesos_totales * 100) / 100,
    spread_banco_pct: Math.round(spread_banco_pct * 100) / 100,
    spread_casa_cambio_pct: Math.round(spread_casa_cambio_pct * 100) / 100,
    diferencia_pesos: Math.round(diferencia_pesos * 100) / 100,
    mejor_opcion: mejor_opcion_msg,
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100
  };
}
