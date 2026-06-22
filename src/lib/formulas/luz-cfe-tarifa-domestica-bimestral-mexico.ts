export interface Inputs {
  consumo_kwh: number; // consumo BIMESTRAL en kWh (suma de los 2 meses del recibo)
  tarifa_zona: string; // '1' | '1a' | '1b' | '1c' | '1d' | '1e' | '1f'
  temporada: string; // 'verano' | 'fuera_verano'
  aplicar_dac: string; // 'si' | 'no'
}

export interface Outputs {
  cargo_energia: number;
  cargo_fijo: number;
  subtotal_antes_iva: number;
  iva_16: number;
  total_recibo: number;
  costo_por_kwh: number;
  ahorro_anual_solar_80: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // ===== Cuotas CFE — tarifa doméstica, junio 2026 (MXN/kWh) =====
  // Estructura escalonada MENSUAL subsidiada. Cuotas confirmadas para Tarifa 1
  // (DOF junio 2026). Las cuotas exactas se ajustan cada mes y varían por región;
  // en zonas muy cálidas (1E/1F) el básico/intermedio de verano corre más barato.
  const PRECIO_BASICO = 1.125; //   tramo básico
  const PRECIO_INTERMEDIO = 1.369; // tramo intermedio
  const PRECIO_EXCEDENTE = 4.004; //  tramo excedente (sin subsidio efectivo)

  // Tarifa DAC (Doméstica de Alto Consumo): SIN subsidio y SIN tramos.
  const DAC_PRECIO_KWH = 6.8; // MXN/kWh (rango típico ~$5.70–6.80 según región)
  const DAC_CARGO_FIJO_MENSUAL = 142.41; // MXN/mes

  const IVA = 0.16; // 16% nacional (8% en franja fronteriza de 20 km)

  // Límites de bloque MENSUALES (kWh/mes). En la temporada de verano las zonas
  // cálidas amplían básico+intermedio; fuera de verano TODAS facturan como
  // Tarifa 1 (75 / 140). basicoHasta = techo del básico; intermedioHasta = techo
  // del intermedio (en 1C–1F agrupa intermedio bajo + alto).
  const BLOQUES_VERANO: Record<string, { basicoHasta: number; intermedioHasta: number }> = {
    '1': { basicoHasta: 75, intermedioHasta: 140 }, // templada: sin temporada de verano
    '1a': { basicoHasta: 100, intermedioHasta: 150 },
    '1b': { basicoHasta: 125, intermedioHasta: 225 },
    '1c': { basicoHasta: 150, intermedioHasta: 450 },
    '1d': { basicoHasta: 175, intermedioHasta: 600 },
    '1e': { basicoHasta: 300, intermedioHasta: 900 },
    '1f': { basicoHasta: 300, intermedioHasta: 2500 },
  };
  const BLOQUE_FUERA_VERANO = { basicoHasta: 75, intermedioHasta: 140 };

  // Límite de Alto Consumo (LAC): promedio móvil de 12 meses (kWh/mes) que
  // dispara la reclasificación a DAC.
  const LIMITE_DAC: Record<string, number> = {
    '1': 250, '1a': 300, '1b': 400, '1c': 850, '1d': 1000, '1e': 2000, '1f': 2500,
  };

  const zona = (i.tarifa_zona || '1').toLowerCase();
  const esVerano = (i.temporada || 'verano').toLowerCase() === 'verano';
  const aplicaDac = (i.aplicar_dac || 'no').toLowerCase() === 'si';

  const consumoBim = Math.max(0, i.consumo_kwh || 0);
  const consumoMes = consumoBim / 2; // los tramos CFE son MENSUALES

  const limiteDac = LIMITE_DAC[zona] ?? 250;
  const bloques = esVerano ? (BLOQUES_VERANO[zona] || BLOQUE_FUERA_VERANO) : BLOQUE_FUERA_VERANO;

  // Montos por tramo (mensuales) y kWh en cada tramo
  let kwhBasico = 0, kwhIntermedio = 0, kwhExcedente = 0;
  let basicoMes = 0, intermedioMes = 0, excedenteMes = 0;
  let cargoEnergiaMes: number;
  let cargoFijoMes = 0;

  if (aplicaDac) {
    // DAC: todo el consumo a precio pleno + cargo fijo mensual, sin subsidio.
    cargoEnergiaMes = consumoMes * DAC_PRECIO_KWH;
    cargoFijoMes = DAC_CARGO_FIJO_MENSUAL;
  } else {
    const { basicoHasta, intermedioHasta } = bloques;
    kwhBasico = Math.min(consumoMes, basicoHasta);
    kwhIntermedio = Math.max(0, Math.min(consumoMes, intermedioHasta) - basicoHasta);
    kwhExcedente = Math.max(0, consumoMes - intermedioHasta);
    basicoMes = kwhBasico * PRECIO_BASICO;
    intermedioMes = kwhIntermedio * PRECIO_INTERMEDIO;
    excedenteMes = kwhExcedente * PRECIO_EXCEDENTE;
    cargoEnergiaMes = basicoMes + intermedioMes + excedenteMes;
  }

  // Bimestral = mensual × 2
  const cargoEnergia = cargoEnergiaMes * 2;
  const cargoFijo = cargoFijoMes * 2;
  const subtotalAntesIva = cargoEnergia + cargoFijo;
  const iva16 = subtotalAntesIva * IVA;
  const totalRecibo = subtotalAntesIva + iva16;
  const costoPorKwh = consumoBim > 0 ? totalRecibo / consumoBim : 0;

  // Ahorro solar: 80% del consumo anual valuado al costo promedio actual
  const consumoAnual = consumoBim * 6; // 6 bimestres
  const ahorroConSolar = consumoAnual * 0.8 * costoPorKwh;

  const fmt = (n: number) =>
    '$' + (Math.round(n * 100) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const r0 = (n: number) => Math.round(n);

  const totalR = r2(totalRecibo);
  const energiaR = r2(cargoEnergia);
  const fijoR = r2(cargoFijo);
  const ivaR = r2(iva16);
  const kwhR = r2(costoPorKwh);

  const superaDac = !aplicaDac && consumoMes > limiteDac;
  const cercaDac = !aplicaDac && !superaDac && consumoMes >= limiteDac * 0.85;

  let insight;
  if (aplicaDac) {
    insight = {
      title: 'Estás en tarifa DAC',
      text: `Sin subsidio: tus **${r0(consumoBim)} kWh** del bimestre se cobran a **$${DAC_PRECIO_KWH.toFixed(2)}/kWh** más el cargo fijo. El recibo queda en **${fmt(totalR)}** (~**${fmt(kwhR)}/kWh**), varias veces más caro que la tarifa subsidiada. Para volver al subsidio tenés que bajar tu **promedio móvil de 12 meses** por debajo de **${limiteDac} kWh/mes** (zona ${zona.toUpperCase()}).`,
      tone: 'warn',
      icon: '⚡',
    };
  } else {
    const desglose = kwhExcedente > 0
      ? `${r0(kwhBasico)} kWh caen en básico, ${r0(kwhIntermedio)} en intermedio y ${r0(kwhExcedente)} en excedente (**$${PRECIO_EXCEDENTE.toFixed(2)}/kWh**)`
      : `${r0(kwhBasico)} kWh caen en básico y ${r0(kwhIntermedio)} en intermedio: todavía no tocás el excedente`;
    let aviso = '';
    if (superaDac) {
      aviso = ` ⚠️ Tu consumo mensual (${r0(consumoMes)} kWh) ya supera el límite DAC de ${limiteDac} kWh/mes; si lo sostenés 12 meses, CFE te reclasifica y perdés el subsidio.`;
    } else if (cercaDac) {
      aviso = ` ⚠️ Estás cerca del límite DAC (${limiteDac} kWh/mes); vigilá tu promedio anual para no perder el subsidio.`;
    }
    insight = {
      title: 'Tu recibo CFE, desglosado',
      text: `Pagás **${fmt(totalR)}** por el bimestre, o sea **${fmt(kwhR)} por kWh**. Tu consumo de ${r0(consumoBim)} kWh equivale a **${r0(consumoMes)} kWh/mes**: ${desglose}.${aviso}`,
      tone: superaDac ? 'warn' : 'neutral',
      icon: '⚡',
    };
  }

  const slices: { label: string; value: number }[] = [];
  if (aplicaDac) {
    if (energiaR > 0) slices.push({ label: 'Energía DAC', value: energiaR });
    if (fijoR > 0) slices.push({ label: 'Cargo fijo', value: fijoR });
  } else {
    if (basicoMes > 0) slices.push({ label: 'Básico', value: r2(basicoMes * 2) });
    if (intermedioMes > 0) slices.push({ label: 'Intermedio', value: r2(intermedioMes * 2) });
    if (excedenteMes > 0) slices.push({ label: 'Excedente', value: r2(excedenteMes * 2) });
  }
  if (ivaR > 0) slices.push({ label: 'IVA 16%', value: ivaR });

  const chart = totalR > 0
    ? {
        type: 'doughnut' as const,
        slices,
        prefix: '$',
        centerValue: fmt(totalR),
        centerLabel: 'Total bimestral',
        ariaLabel: 'Composición del recibo CFE por tramo de consumo e IVA.',
      }
    : undefined;

  return {
    cargo_energia: energiaR,
    cargo_fijo: fijoR,
    subtotal_antes_iva: r2(subtotalAntesIva),
    iva_16: ivaR,
    total_recibo: totalR,
    costo_por_kwh: kwhR,
    ahorro_anual_solar_80: r2(ahorroConSolar),
    _insight: insight,
    _chart: chart,
  };
}
