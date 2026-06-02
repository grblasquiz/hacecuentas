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
  _insight?: any;
  _chart?: any;
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

  // Insight y donut según origen.
  let _insight: any;
  let _chart: any;
  if (origen === 'reventa') {
    const baseTotal = precioBase * cantidad;
    const sobreprecio = total - baseTotal;
    _insight = {
      title: 'El costo de la reventa',
      text: `Pagás **$${total.toLocaleString('en-US')} USD** por reventa: son **$${sobreprecio.toLocaleString('en-US')}** por encima del precio oficial FIFA ($${baseTotal.toLocaleString('en-US')}), un **+${Math.round((multReventa - 1) * 100)}%**. El mercado secundario suele inflarse cuanto más avanzada es la fase.`,
      tone: 'warn',
      icon: '🎟️',
    };
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Precio oficial FIFA', value: baseTotal },
        { label: 'Sobreprecio reventa', value: sobreprecio },
      ],
      prefix: '$',
      centerValue: `$${total.toLocaleString('en-US')}`,
      centerLabel: 'Total reventa',
      ariaLabel: `Composición del precio de reventa: $${baseTotal.toLocaleString('en-US')} de precio oficial y $${sobreprecio.toLocaleString('en-US')} de sobreprecio.`,
    };
  } else {
    _insight = {
      title: 'Precio oficial FIFA',
      text: `**${cantidad} entrada${cantidad > 1 ? 's' : ''}** de ${NOMBRES_FASE[fase].toLowerCase()} Tier ${tier} salen **$${total.toLocaleString('en-US')} USD** (≈ ARS ${Math.round(totalArs).toLocaleString('es-AR')}), incluida la tasa FIFA del 5% ($${tasaFifa.toLocaleString('en-US')}). Comprar oficial te ahorra el sobreprecio del mercado secundario.`,
      tone: 'good',
      icon: '🎟️',
    };
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Entradas', value: subtotalSinTasa },
        { label: 'Tasa FIFA (5%)', value: tasaFifa },
      ],
      prefix: '$',
      centerValue: `$${total.toLocaleString('en-US')}`,
      centerLabel: 'Total',
      ariaLabel: `Composición del costo: $${subtotalSinTasa.toLocaleString('en-US')} en entradas y $${tasaFifa.toLocaleString('en-US')} de tasa FIFA.`,
    };
  }

  return {
    precioUnitario,
    tasaFifa,
    subtotal: total,
    totalPesos: `ARS ${Math.round(totalArs).toLocaleString('es-AR')}`,
    totalEuros: `€${Math.round(totalEur).toLocaleString('es-ES')}`,
    resumen: `**${cantidad} entrada${cantidad > 1 ? 's' : ''} ${NOMBRES_FASE[fase]} Tier ${tier}** (${origenTxt}): $${precioUnitario} × ${cantidad} + $${tasaFifa} tasa = **$${total.toLocaleString('en-US')} USD** (≈ ARS ${Math.round(totalArs).toLocaleString('es-AR')} / €${Math.round(totalEur).toLocaleString('es-ES')}).`,
    _insight,
    _chart,
  };
}
