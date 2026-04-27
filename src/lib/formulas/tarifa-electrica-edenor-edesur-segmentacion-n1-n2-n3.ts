export interface Inputs {
  distribuidora: string; // 'edenor' | 'edesur'
  segmento: string;      // 'n1' | 'n2' | 'n3'
  consumo_kwh: number;
}

export interface Outputs {
  total_factura: number;
  cargo_fijo: number;
  cargo_variable: number;
  impuestos_total: number;
  desglose_texto: string;
}

// ---------------------------------------------------------------------------
// Tarifas de referencia 2026 — Fuente: ENRE, cuadros tarifarios Edenor/Edesur
// Valores en ARS. Actualizar cuando ENRE publique nuevos cuadros.
// ---------------------------------------------------------------------------

interface TarifaSegmento {
  cargoFijo: number;   // $/mes
  kwhPrecio: number;   // $/kWh
}

const TARIFAS_2026: Record<string, Record<string, TarifaSegmento>> = {
  edenor: {
    n1: { cargoFijo: 3500,  kwhPrecio: 220 },
    n2: { cargoFijo: 1800,  kwhPrecio: 95  },
    n3: { cargoFijo: 900,   kwhPrecio: 45  },
  },
  edesur: {
    n1: { cargoFijo: 3520,  kwhPrecio: 222 },
    n2: { cargoFijo: 1820,  kwhPrecio: 96  },
    n3: { cargoFijo: 910,   kwhPrecio: 46  },
  },
};

// Alícuotas impositivas
const IVA_ALICUOTA          = 0.27;   // Art. 28 Ley 23.349 — IVA servicios públicos domiciliarios
const LEY_25413_ALICUOTA    = 0.006;  // Impuesto créditos/débitos bancarios
const ALUMBRADO_PUBLICO     = 0.08;   // Tasa municipal promedio GBA (rango 6%-12%)

export function compute(i: Inputs): Outputs {
  // --- Validar y normalizar inputs ---
  const distribuidora = (i.distribuidora || 'edenor').toLowerCase();
  const segmento      = (i.segmento      || 'n2').toLowerCase();
  const consumoKwh    = Math.max(0, Number(i.consumo_kwh) || 0);

  // Buscar tarifa; fallback a edenor n2
  const distTarifas   = TARIFAS_2026[distribuidora] ?? TARIFAS_2026['edenor'];
  const tarifa        = distTarifas[segmento]        ?? distTarifas['n2'];

  if (consumoKwh === 0) {
    return {
      total_factura:  0,
      cargo_fijo:     0,
      cargo_variable: 0,
      impuestos_total: 0,
      desglose_texto: 'Ingresá un consumo en kWh mayor a 0 para calcular.',
    };
  }

  // --- Cálculo principal ---
  const cargoFijo     = tarifa.cargoFijo;
  const cargoVariable = consumoKwh * tarifa.kwhPrecio;
  const subtotal      = cargoFijo + cargoVariable;

  // Alumbrado público sobre subtotal
  const alumbrado     = subtotal * ALUMBRADO_PUBLICO;

  // Base imponible para IVA (subtotal + alumbrado)
  const baseImponible = subtotal + alumbrado;

  // IVA 27%
  const iva           = baseImponible * IVA_ALICUOTA;

  // Ley 25.413 sobre subtotal energía
  const ley25413      = subtotal * LEY_25413_ALICUOTA;

  const impuestosTotal = alumbrado + iva + ley25413;
  const totalFactura   = baseImponible + iva + ley25413;

  // --- Desglose texto ---
  const distribuidoraLabel = distribuidora === 'edesur' ? 'Edesur' : 'Edenor';
  const segmentoLabel      = segmento.toUpperCase();
  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const desglose = [
    `Distribuidora: ${distribuidoraLabel} | Segmento: ${segmentoLabel} | Consumo: ${consumoKwh} kWh`,
    `Cargo fijo: ${fmt(cargoFijo)}`,
    `Cargo variable (${consumoKwh} kWh × ${fmt(tarifa.kwhPrecio)}/kWh): ${fmt(cargoVariable)}`,
    `Subtotal energía: ${fmt(subtotal)}`,
    `Alumbrado público (8%): ${fmt(alumbrado)}`,
    `Base imponible: ${fmt(baseImponible)}`,
    `IVA 27%: ${fmt(iva)}`,
    `Ley 25.413 (0,6%): ${fmt(ley25413)}`,
    `─────────────────────────`,
    `TOTAL ESTIMADO: ${fmt(totalFactura)}`,
    `(Valores de referencia 2026 — verificar cuadro ENRE vigente)`,
  ].join('\n');

  return {
    total_factura:   Math.round(totalFactura),
    cargo_fijo:      Math.round(cargoFijo),
    cargo_variable:  Math.round(cargoVariable),
    impuestos_total: Math.round(impuestosTotal),
    desglose_texto:  desglose,
  };
}
