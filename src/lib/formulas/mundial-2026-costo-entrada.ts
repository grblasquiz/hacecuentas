/** Mundial 2026: costo de entradas por fase y tier FIFA */
export interface Inputs {
  fase: string;
  tier: string;
  cantidadEntradas: number;
  origen: string; // 'fifa' | 'reventa'
}

export interface Outputs {
  precioUnitario: number;
  tasaFifa: number;
  subtotal: number;
  totalPesos: string;
  totalEuros: string;
  resumen: string;
}

// Precios oficiales FIFA 2026 (USD)
const PRECIOS: Record<string, Record<string, number>> = {
  grupos: { '1': 500, '2': 300, '3': 150, '4': 60 },
  '16avos': { '1': 600, '2': 400, '3': 200, '4': 70 },
  octavos: { '1': 800, '2': 500, '3': 250, '4': 80 },
  cuartos: { '1': 1250, '2': 750, '3': 350, '4': 125 },
  semi: { '1': 2500, '2': 1500, '3': 700, '4': 250 },
  'tercer-puesto': { '1': 1400, '2': 900, '3': 400, '4': 200 },
  final: { '1': 6000, '2': 3500, '3': 1800, '4': 950 },
};

const MULT_REVENTA: Record<string, number> = {
  grupos: 2.5,
  '16avos': 2.8,
  octavos: 3.0,
  cuartos: 3.3,
  semi: 3.7,
  'tercer-puesto': 2.5,
  final: 4.0,
};

const NOMBRES_FASE: Record<string, string> = {
  grupos: 'Fase de grupos',
  '16avos': '16avos de final',
  octavos: 'Octavos',
  cuartos: 'Cuartos',
  semi: 'Semifinal',
  'tercer-puesto': 'Tercer puesto',
  final: 'Final',
};

// Cotizaciones estimadas abril 2026 — actualizar si cambian dramáticamente
const ARS_USD = 1130; // blue promedio abril 2026
const EUR_USD = 0.92;

export function mundial2026CostoEntrada(i: Inputs): Outputs {
  const fase = String(i.fase || 'grupos');
  const tier = String(i.tier || '4');
  const cantidad = Math.max(1, Math.min(10, Number(i.cantidadEntradas || 1)));
  const origen = String(i.origen || 'fifa');

  if (!PRECIOS[fase]) throw new Error('Fase inválida.');
  if (!PRECIOS[fase][tier]) throw new Error('Tier inválido.');

  const precioBase = PRECIOS[fase][tier];
  const multReventa = origen === 'reventa' ? MULT_REVENTA[fase] : 1;
  const precioUnitario = Math.round(precioBase * multReventa);
  const subtotalSinTasa = precioUnitario * cantidad;
  const tasaFifa = origen === 'fifa' ? Math.round(subtotalSinTasa * 0.05) : 0;
  const total = subtotalSinTasa + tasaFifa;

  const totalArs = total * ARS_USD;
  const totalEur = total * EUR_USD;

  const origenTxt = origen === 'reventa' ? `Reventa (×${multReventa} precio FIFA)` : 'FIFA ticketing oficial';

  return {
    precioUnitario,
    tasaFifa,
    subtotal: total,
    totalPesos: `ARS ${Math.round(totalArs).toLocaleString('es-AR')}`,
    totalEuros: `€${Math.round(totalEur).toLocaleString('es-ES')}`,
    resumen: `**${cantidad} entrada${cantidad > 1 ? 's' : ''} ${NOMBRES_FASE[fase]} Tier ${tier}** (${origenTxt}): $${precioUnitario} × ${cantidad} + $${tasaFifa} tasa = **$${total.toLocaleString('en-US')} USD** (≈ ARS ${Math.round(totalArs).toLocaleString('es-AR')} / €${Math.round(totalEur).toLocaleString('es-ES')}).`,
  };
}
