export interface Inputs {
  distribuidora: string;   // 'edenor' | 'edesur'
  condicion: string;       // 'con_subsidio' | 'sin_subsidio'
  temporada: string;       // 'alta_demanda' | 'templado'
  consumo_kwh: number;
}

export interface Outputs {
  total_factura: number;
  cargo_fijo: number;
  cargo_variable: number;
  impuestos_total: number;
  desglose_texto: string;
  _chart?: any;
  _insight?: any;
}

// ---------------------------------------------------------------------------
// Esquema SEF — Subsidios Energéticos Focalizados (Decreto 943/2025,
// Boletín Oficial 02/01/2026). Reemplaza la segmentación N1/N2/N3 y el RASE.
//
// Lógica vigente 2026:
//  - Sólo dos condiciones: CON subsidio / SIN subsidio (según ingresos).
//  - "Sin subsidio" = paga el PRECIO PLENO (costo real) de la energía por kWh.
//  - "Con subsidio" = 50% de bonificación SOLO sobre un bloque base de
//      300 kWh/mes en meses de mayor demanda (verano e invierno) o
//      150 kWh/mes en meses templados (primavera y otoño).
//    El EXCEDENTE del bloque se paga a precio pleno (sin subsidio).
//  - Bonificación extraordinaria SOLO 2026: +25% en enero (→75% total),
//    bajando 2 p.p. por mes hasta desaparecer en diciembre. Se explica en la
//    prosa; el cálculo usa la bonificación base estable del 50%.
//
// Valores de energía en ARS por kWh y cargo fijo $/mes — referencia 2026,
// cuadros tarifarios Edenor/Edesur (ENRE). Actualizar con cada cuadro nuevo.
// ---------------------------------------------------------------------------

interface TarifaDist {
  cargoFijo: number;     // $/mes (cargo fijo + comercialización)
  kwhPleno: number;      // $/kWh a precio pleno (costo real, sin subsidio)
}

// Precio pleno = energía a costo real (lo que paga "sin subsidio").
// El usuario "con subsidio" paga la mitad sobre el bloque base.
const TARIFAS_2026: Record<string, TarifaDist> = {
  edenor: { cargoFijo: 3500, kwhPleno: 220 },
  edesur: { cargoFijo: 3520, kwhPleno: 222 },
};

// Bonificación base del subsidio focalizado (estable todo el año).
const BONIFICACION_BASE = 0.50;

// Bloque base subsidiado (kWh/mes) según temporada — Decreto 943/2025.
const BLOQUE_ALTA_DEMANDA = 300; // verano e invierno (mayor demanda)
const BLOQUE_TEMPLADO     = 150; // primavera y otoño

// Alícuotas impositivas
const IVA_ALICUOTA       = 0.27;  // Art. 28 Ley 23.349 — IVA servicios públicos domiciliarios
const LEY_25413_ALICUOTA = 0.006; // Impuesto créditos/débitos bancarios
const ALUMBRADO_PUBLICO  = 0.08;  // Tasa municipal promedio GBA (rango 6%-12%)

export function compute(i: Inputs): Outputs {
  // --- Validar y normalizar inputs ---
  const distribuidora = (i.distribuidora || 'edenor').toLowerCase();
  const condicion     = (i.condicion || 'con_subsidio').toLowerCase();
  const temporada     = (i.temporada || 'alta_demanda').toLowerCase();
  const consumoKwh    = Math.max(0, Number(i.consumo_kwh) || 0);

  const tarifa = TARIFAS_2026[distribuidora] ?? TARIFAS_2026['edenor'];

  if (consumoKwh === 0) {
    return {
      total_factura: 0,
      cargo_fijo: 0,
      cargo_variable: 0,
      impuestos_total: 0,
      desglose_texto: 'Ingresá un consumo en kWh mayor a 0 para calcular.',
    };
  }

  const tieneSubsidio = condicion === 'con_subsidio';
  const bloqueBase    = temporada === 'templado' ? BLOQUE_TEMPLADO : BLOQUE_ALTA_DEMANDA;

  // --- Cálculo del cargo variable (energía) ---
  // Sin subsidio: todo el consumo a precio pleno.
  // Con subsidio: hasta el bloque base con 50% off; el excedente, a precio pleno.
  let kwhSubsidiados = 0;
  let kwhExcedente   = consumoKwh;
  let energiaSubsidiada = 0;
  let energiaPlena      = 0;
  let ahorroSubsidio    = 0;

  if (tieneSubsidio) {
    kwhSubsidiados = Math.min(consumoKwh, bloqueBase);
    kwhExcedente   = Math.max(0, consumoKwh - bloqueBase);
    const precioSubsidiado = tarifa.kwhPleno * (1 - BONIFICACION_BASE);
    energiaSubsidiada = kwhSubsidiados * precioSubsidiado;
    energiaPlena      = kwhExcedente * tarifa.kwhPleno;
    ahorroSubsidio    = kwhSubsidiados * tarifa.kwhPleno * BONIFICACION_BASE;
  } else {
    energiaPlena = consumoKwh * tarifa.kwhPleno;
  }

  const cargoFijo     = tarifa.cargoFijo;
  const cargoVariable = energiaSubsidiada + energiaPlena;
  const subtotal      = cargoFijo + cargoVariable;

  // Alumbrado público sobre subtotal
  const alumbrado = subtotal * ALUMBRADO_PUBLICO;

  // Base imponible para IVA (subtotal + alumbrado)
  const baseImponible = subtotal + alumbrado;

  // IVA 27%
  const iva = baseImponible * IVA_ALICUOTA;

  // Ley 25.413 sobre subtotal energía
  const ley25413 = subtotal * LEY_25413_ALICUOTA;

  const impuestosTotal = alumbrado + iva + ley25413;
  const totalFactura   = baseImponible + iva + ley25413;

  // --- Desglose texto ---
  const distribuidoraLabel = distribuidora === 'edesur' ? 'Edesur' : 'Edenor';
  const condicionLabel     = tieneSubsidio ? 'Con subsidio (SEF)' : 'Sin subsidio (tarifa plena)';
  const temporadaLabel     = temporada === 'templado'
    ? 'Templado (primavera/otoño)'
    : 'Mayor demanda (verano/invierno)';
  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const lineas: string[] = [
    `Distribuidora: ${distribuidoraLabel} | ${condicionLabel} | Consumo: ${consumoKwh} kWh`,
    `Cargo fijo: ${fmt(cargoFijo)}`,
  ];

  if (tieneSubsidio) {
    const precioSubsidiado = tarifa.kwhPleno * (1 - BONIFICACION_BASE);
    lineas.push(
      `Temporada: ${temporadaLabel} → bloque subsidiado ${bloqueBase} kWh`,
      `Energía subsidiada (${kwhSubsidiados} kWh × ${fmt(precioSubsidiado)}/kWh, 50% off): ${fmt(energiaSubsidiada)}`,
    );
    if (kwhExcedente > 0) {
      lineas.push(`Excedente a precio pleno (${kwhExcedente} kWh × ${fmt(tarifa.kwhPleno)}/kWh): ${fmt(energiaPlena)}`);
    }
    lineas.push(`Ahorro por subsidio sobre el bloque: ${fmt(ahorroSubsidio)}`);
  } else {
    lineas.push(`Energía a precio pleno (${consumoKwh} kWh × ${fmt(tarifa.kwhPleno)}/kWh): ${fmt(energiaPlena)}`);
  }

  lineas.push(
    `Subtotal energía: ${fmt(subtotal)}`,
    `Alumbrado público (8%): ${fmt(alumbrado)}`,
    `Base imponible: ${fmt(baseImponible)}`,
    `IVA 27%: ${fmt(iva)}`,
    `Ley 25.413 (0,6%): ${fmt(ley25413)}`,
    `─────────────────────────`,
    `TOTAL ESTIMADO: ${fmt(totalFactura)}`,
    `(Esquema SEF 2026 — Decreto 943/2025. Verificar cuadro ENRE vigente.)`,
  );

  const desglose = lineas.join('\n');

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cargo fijo', value: Math.round(cargoFijo) },
      { label: 'Cargo variable', value: Math.round(cargoVariable) },
      { label: 'Impuestos y tasas', value: Math.round(impuestosTotal) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalFactura).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición de la factura eléctrica: cargo fijo, cargo variable por consumo e impuestos y tasas.',
  };

  const totalRound   = Math.round(totalFactura);
  const impRound     = Math.round(impuestosTotal);
  const pctImpuestos = totalRound > 0 ? Math.round((impRound / totalRound) * 100) : 0;

  let insightText: string;
  if (tieneSubsidio) {
    insightText = `Para **${consumoKwh} kWh** en **${distribuidoraLabel}** con subsidio (SEF), pagás unos **${fmt(totalRound)}**. El 50% de bonificación aplica solo sobre **${kwhSubsidiados} kWh** (bloque de ${bloqueBase} kWh); ${kwhExcedente > 0 ? `los **${kwhExcedente} kWh** excedentes van a precio pleno. ` : ''}Te ahorrás **${fmt(Math.round(ahorroSubsidio))}** frente a la tarifa plena. Impuestos y tasas: **${pctImpuestos}%** del total.`;
  } else {
    insightText = `Para **${consumoKwh} kWh** en **${distribuidoraLabel}** sin subsidio, la factura ronda **${fmt(totalRound)}**: pagás el **precio pleno** de la energía (costo real) sobre cada kWh. De ese total, **${fmt(impRound)}** (un **${pctImpuestos}%**) son impuestos y tasas.`;
  }

  const _insight = {
    title: `Factura estimada: ${fmt(totalRound)}`,
    text: insightText,
    tone: 'warn',
    icon: '🔌',
  };

  return {
    total_factura: totalRound,
    cargo_fijo: Math.round(cargoFijo),
    cargo_variable: Math.round(cargoVariable),
    impuestos_total: impRound,
    desglose_texto: desglose,
    _chart: chart,
    _insight,
  };
}
