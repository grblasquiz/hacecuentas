/**
 * Estimador de factura de luz mensual — EDENOR/EDESUR, cuadro 2026.
 *
 * Fuente: cuadros tarifarios ENRE. Espejo del módulo canónico
 * tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts.
 * https://www.argentina.gob.ar/enre/cuadros_tarifarios
 *
 * Esquema vigente (SEF, Decreto 943/2025):
 *   - "Con subsidio": bonificación del 50% sobre el bloque base de 300 kWh;
 *     el excedente va a precio pleno.
 *   - "Sin subsidio": $220/kWh (precio pleno) sobre cada kWh.
 * Mantenemos el enum 'subsidiada' | 'sin-subsidio' | 'ingresos-altos' por
 * compatibilidad del JSON. 'ingresos-altos' == 'sin-subsidio' (mismo precio).
 *
 * Impuestos: alumbrado público 8% sobre el subtotal, IVA 27% (Art. 28 Ley
 * 23.349, servicios públicos domiciliarios) sobre subtotal + alumbrado, y
 * Ley 25.413 0,6% sobre el subtotal. Factor total: 1,3776.
 *
 * Corregido: este módulo tenía $115,28/kWh (≈la mitad del cuadro vigente),
 * cargo fijo $1.414,93 (2,5× menor) y un 45% de impuestos puesto a ojo. Para
 * 300 kWh daba $19.276 donde el cuadro real da ~$50.282, y contradecía al
 * módulo canónico tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts,
 * que es la fuente que usan los hubs de luz, climatización y gaming.
 */
export interface Inputs { consumoKwh: number; tarifa: string; precioKwhBase?: number; }
export interface Outputs {
  facturaEstimada: number;
  precioKwhEfectivo: number;
  cargoFijo: number;
  consumoCategoria: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Cuadro tarifario 2026 (EDENOR; EDESUR difiere <2%). Mismos valores que el
// módulo canónico: precio pleno $220/kWh y cargo fijo $3.500/mes. El usuario
// "con subsidio" paga la bonificación del 50% sobre el bloque base.
const TARIFAS: Record<string, { precioKwh: number; cargoFijo: number; etiqueta: string }> = {
  'subsidiada':     { precioKwh: 110, cargoFijo: 3500, etiqueta: 'Con subsidio (SEF)' },
  'sin-subsidio':   { precioKwh: 220, cargoFijo: 3500, etiqueta: 'Sin subsidio' },
  'ingresos-altos': { precioKwh: 220, cargoFijo: 3500, etiqueta: 'Sin subsidio (ingresos altos)' },
};

// Tramo subsidiado: primeros 300 kWh bonificados, luego precio pleno.
const TOPE_SUBSIDIADO_KWH = 300;

// Alícuotas reales, en el mismo orden que las aplica la distribuidora:
// alumbrado sobre subtotal, IVA sobre (subtotal + alumbrado), Ley 25.413
// sobre subtotal. Equivale a un factor de 1,3776 sobre el subtotal.
const ALUMBRADO_PUBLICO  = 0.08;
const IVA_ALICUOTA       = 0.27;
const LEY_25413_ALICUOTA = 0.006;

export function facturaLuzEstimada(i: Inputs): Outputs {
  const kwh = Number(i.consumoKwh);
  const tarifa = i.tarifa || 'sin-subsidio';
  if (!Number.isFinite(kwh) || kwh < 0) throw new Error('Ingresá el consumo en kWh');

  const cfg = TARIFAS[tarifa] || TARIFAS['sin-subsidio'];
  // Override manual opcional (dejá que el usuario pase otro precio si quiere).
  const precioKwh = Number(i.precioKwhBase) > 0 ? Number(i.precioKwhBase) : cfg.precioKwh;
  const cargoFijo = cfg.cargoFijo;

  // Energía: si es subsidiada, los kWh por encima de 300 pagan tarifa plena.
  let energiaBruta: number;
  if (tarifa === 'subsidiada' && kwh > TOPE_SUBSIDIADO_KWH) {
    const excedente = kwh - TOPE_SUBSIDIADO_KWH;
    energiaBruta = TOPE_SUBSIDIADO_KWH * precioKwh + excedente * TARIFAS['sin-subsidio'].precioKwh;
  } else {
    energiaBruta = kwh * precioKwh;
  }

  const subtotal = cargoFijo + energiaBruta;
  const alumbrado = subtotal * ALUMBRADO_PUBLICO;
  const iva = (subtotal + alumbrado) * IVA_ALICUOTA;
  const ley25413 = subtotal * LEY_25413_ALICUOTA;
  const impuestos = alumbrado + iva + ley25413;
  const facturaEstimada = subtotal + impuestos;

  let categoria = 'Bajo';
  if (kwh > 500) categoria = 'Muy alto';
  else if (kwh > 350) categoria = 'Alto';
  else if (kwh > 200) categoria = 'Medio';

  const detalle =
    `${cfg.etiqueta}: ${kwh} kWh × $${precioKwh.toFixed(2)}/kWh` +
    (tarifa === 'subsidiada' && kwh > TOPE_SUBSIDIADO_KWH
      ? ` (primeros ${TOPE_SUBSIDIADO_KWH} kWh subsidiados, el resto a tarifa plena)`
      : '') +
    ` + cargo fijo $${cargoFijo.toFixed(0)} + alumbrado 8%, IVA 27% y Ley 25.413 ≈ $${Math.round(facturaEstimada).toLocaleString('es-AR')}.`;

  const totalR = Math.round(facturaEstimada);
  const altoTone = categoria === 'Alto' || categoria === 'Muy alto';
  const esSubsidiada = tarifa === 'subsidiada';
  const insightText = altoTone
    ? `Consumo **${categoria.toLowerCase()}** (${kwh} kWh/mes) con tarifa ${cfg.etiqueta.toLowerCase()}: la factura ronda **$${totalR.toLocaleString('es-AR')}**.` +
      (esSubsidiada && kwh > TOPE_SUBSIDIADO_KWH ? ` Ojo: pasaste los ${TOPE_SUBSIDIADO_KWH} kWh subsidiados y el excedente paga tarifa plena.` : ' Recortar consumo en horas pico se nota acá.')
    : `Consumo **${categoria.toLowerCase()}** (${kwh} kWh/mes) con tarifa ${cfg.etiqueta.toLowerCase()}: la factura ronda **$${totalR.toLocaleString('es-AR')}**. Los impuestos y tasas suman ~38% sobre energía + cargo fijo.`;

  return {
    facturaEstimada: totalR,
    precioKwhEfectivo: kwh > 0 ? Math.round(facturaEstimada / kwh) : 0,
    cargoFijo: Math.round(cargoFijo),
    consumoCategoria: `${categoria} (${kwh} kWh/mes)`,
    detalle,
    _insight: {
      title: 'Tu factura de luz',
      text: insightText,
      tone: altoTone ? 'warn' : 'neutral',
      icon: '💡',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Cargo fijo', value: Math.round(cargoFijo) },
        { label: 'Energía', value: Math.round(energiaBruta) },
        { label: 'Impuestos', value: Math.round(impuestos) },
      ],
      prefix: '$',
      centerValue: `$${totalR.toLocaleString('es-AR')}`,
      centerLabel: 'Total mensual',
      ariaLabel: `Composición de la factura de luz: cargo fijo, energía e impuestos suman $${totalR.toLocaleString('es-AR')}`,
    },
  };
}
