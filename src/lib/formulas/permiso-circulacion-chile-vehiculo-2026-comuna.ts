export interface Inputs {
  tasacion_sii: number;
  comuna: string;
  tipo_pago: 'anual' | 'fraccionado';
}

export interface Outputs {
  permiso_base: number;
  descuento_pronto_pago: number;
  permiso_neto: number;
  cuota_marzo: number;
  cuota_agosto: number;
  ahorro_anual: number;
  _insight?: any;
  _chart?: any;
}

const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

// Tasas comunales 2026 según SII (% de tasación)
const tasas_comunales: Record<string, number> = {
  'arica_parinacota': 0.90,
  'tarapaca': 0.92,
  'antofagasta': 1.00,
  'atacama': 0.98,
  'coquimbo': 1.05,
  'valparaiso': 1.20,
  'metropolitana': 1.18,
  'ohiggins': 1.08,
  'maule': 1.10,
  'nuble': 1.06,
  'biobio': 1.12,
  'araucania': 1.09,
  'losrios': 1.04,
  'loslagos': 1.02,
  'aisen': 0.96,
  'magallanes': 0.94
};

export function compute(i: Inputs): Outputs {
  // Validación de inputs
  if (i.tasacion_sii <= 0) {
    return {
      permiso_base: 0,
      descuento_pronto_pago: 0,
      permiso_neto: 0,
      cuota_marzo: 0,
      cuota_agosto: 0,
      ahorro_anual: 0
    };
  }

  // Obtener tasa comunal (default 1.1 si no existe)
  const tasa = (tasas_comunales[i.comuna] || 1.1) / 100;

  // Cálculo del permiso base
  // Fuente: SII – Permiso de Circulación = Tasación × Tasa comunal
  const permiso_base = Math.round(i.tasacion_sii * tasa);

  let descuento_pronto_pago = 0;
  let permiso_neto = permiso_base;
  let cuota_marzo = 0;
  let cuota_agosto = 0;
  let ahorro_anual = 0;

  if (i.tipo_pago === 'anual') {
    // Descuento por pronto pago: 11.8% (según SII 2026)
    descuento_pronto_pago = Math.round(permiso_base * 0.118);
    permiso_neto = permiso_base - descuento_pronto_pago;
    ahorro_anual = descuento_pronto_pago;
  } else if (i.tipo_pago === 'fraccionado') {
    // Pago en dos cuotas: marzo y agosto (50% c/u, sin descuento)
    cuota_marzo = Math.round(permiso_base / 2);
    cuota_agosto = permiso_base - cuota_marzo; // Redondeo residual
    permiso_neto = permiso_base;
    ahorro_anual = 0;
  }

  let _insight: any;
  let _chart: any;

  if (i.tipo_pago === 'anual') {
    _insight = {
      title: 'Pago anual con descuento',
      text: `Pagando todo en marzo ahorrás **${fmtCLP(descuento_pronto_pago)}** (11,8% de pronto pago): el permiso baja de **${fmtCLP(permiso_base)}** a **${fmtCLP(permiso_neto)}**.`,
      tone: 'good',
      icon: '🚗',
    };
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Permiso neto', value: permiso_neto },
        { label: 'Descuento pronto pago', value: descuento_pronto_pago },
      ],
      prefix: '$',
      centerValue: fmtCLP(permiso_base),
      centerLabel: 'Permiso base',
      ariaLabel: `Del permiso base ${fmtCLP(permiso_base)}, pagás ${fmtCLP(permiso_neto)} y ahorrás ${fmtCLP(descuento_pronto_pago)} por pronto pago.`,
    };
  } else if (i.tipo_pago === 'fraccionado') {
    _insight = {
      title: 'Pago en dos cuotas',
      text: `Fraccionado pagás **${fmtCLP(permiso_base)}** en total (**${fmtCLP(cuota_marzo)}** en marzo y **${fmtCLP(cuota_agosto)}** en agosto). Perdés los **${fmtCLP(Math.round(permiso_base * 0.118))}** del descuento por pronto pago.`,
      tone: 'warn',
      icon: '🗓️',
    };
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Cuota marzo', value: cuota_marzo },
        { label: 'Cuota agosto', value: cuota_agosto },
      ],
      prefix: '$',
      centerValue: fmtCLP(permiso_base),
      centerLabel: 'Permiso total',
      ariaLabel: `El permiso de ${fmtCLP(permiso_base)} se divide en cuota de marzo ${fmtCLP(cuota_marzo)} y cuota de agosto ${fmtCLP(cuota_agosto)}.`,
    };
  }

  return {
    permiso_base,
    descuento_pronto_pago,
    permiso_neto,
    cuota_marzo,
    cuota_agosto,
    ahorro_anual,
    _insight,
    _chart
  };
}
