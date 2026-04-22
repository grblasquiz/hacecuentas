/**
 * Estimador de factura de luz mensual — EDENOR/EDESUR abril 2026.
 *
 * Fuente: cuadros tarifarios ENRE — Res 21/2026 (EDENOR) y 22/2026 (EDESUR).
 * https://www.argentina.gob.ar/enre/cuadros_tarifarios
 *
 * IMPORTANTE: desde enero 2026 el gobierno simplificó el esquema.
 *   - "Con subsidio" (ex N2 + N3): $44,29/kWh hasta 300 kWh, $115,28 desde ahí.
 *   - "Sin subsidio" (N1, ingresos altos): $115,28/kWh (tarifa plena).
 *   - El tramo "ingresos medios" (N3) quedó asimilado a subsidiado.
 * Mantenemos el enum 'subsidiada' | 'sin-subsidio' | 'ingresos-altos' por
 * compatibilidad del JSON. 'ingresos-altos' == 'sin-subsidio' (mismo precio).
 *
 * Impuestos: IVA 21% + impuesto municipal + fondos específicos ≈ 45% adicional
 * en zona AMBA (varía por jurisdicción). Antes el código ponía 27% — bajo.
 */
export interface Inputs { consumoKwh: number; tarifa: string; precioKwhBase?: number; }
export interface Outputs {
  facturaEstimada: number;
  precioKwhEfectivo: number;
  cargoFijo: number;
  consumoCategoria: string;
  detalle: string;
}

// Tarifas oficiales abril 2026 (EDENOR; EDESUR difiere <2%)
const TARIFAS: Record<string, { precioKwh: number; cargoFijo: number; etiqueta: string }> = {
  'subsidiada':     { precioKwh: 44.29,  cargoFijo: 1414.93, etiqueta: 'Con subsidio (ex N2)' },
  'sin-subsidio':   { precioKwh: 115.28, cargoFijo: 1414.93, etiqueta: 'Sin subsidio (N1)' },
  'ingresos-altos': { precioKwh: 115.28, cargoFijo: 1414.93, etiqueta: 'Sin subsidio (N1 / ingresos altos)' },
};

// Tramo subsidiado: primeros 300 kWh a tarifa baja, luego precio pleno.
const TOPE_SUBSIDIADO_KWH = 300;

// Suma de impuestos típicos AMBA (IVA + municipal + fondos nacionales).
const IMPUESTOS = 0.45;

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
  const impuestos = subtotal * IMPUESTOS;
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
    ` + cargo fijo $${cargoFijo.toFixed(0)} + 45% impuestos ≈ $${Math.round(facturaEstimada).toLocaleString('es-AR')}.`;

  return {
    facturaEstimada: Math.round(facturaEstimada),
    precioKwhEfectivo: kwh > 0 ? Math.round(facturaEstimada / kwh) : 0,
    cargoFijo: Math.round(cargoFijo),
    consumoCategoria: `${categoria} (${kwh} kWh/mes)`,
    detalle,
  };
}
