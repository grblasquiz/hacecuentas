export interface Inputs {
  modo: 'directo' | 'inverso';
  precio: number;
  tipo_iva: '21' | '10' | '4';
}

export interface Outputs {
  base_imponible: number;
  cuota_iva: number;
  precio_con_iva: number;
  tipo_aplicado_label: string;
  porcentaje_iva_sobre_total: number;
  _chart?: any;
  _insight?: any;
}

/**
 * Calcula el IVA español según los tipos vigentes en 2026.
 * Fuente: Ley 37/1992 del IVA (BOE-A-1992-28740) y AEAT.
 */
export function compute(i: Inputs): Outputs {
  // Tipos de IVA vigentes en España 2026 (art. 90 y 91 Ley 37/1992)
  const TIPOS_IVA: Record<string, number> = {
    '21': 21, // Tipo general
    '10': 10, // Tipo reducido
    '4': 4,   // Tipo superreducido
  };

  const tipoNumerico: number = TIPOS_IVA[i.tipo_iva] ?? 21;
  const precio: number = typeof i.precio === 'number' && i.precio >= 0 ? i.precio : 0;
  const divisor: number = 1 + tipoNumerico / 100;

  let base_imponible: number;
  let cuota_iva: number;
  let precio_con_iva: number;

  if (i.modo === 'inverso') {
    // Modo inverso: el usuario introduce el precio con IVA incluido
    // Base imponible = Precio con IVA / (1 + tipo/100)
    base_imponible = precio / divisor;
    precio_con_iva = precio;
    cuota_iva = precio_con_iva - base_imponible;
  } else {
    // Modo directo: el usuario introduce el precio sin IVA (base imponible)
    // Cuota IVA = Base imponible × (tipo / 100)
    // Precio con IVA = Base imponible × (1 + tipo / 100)
    base_imponible = precio;
    cuota_iva = base_imponible * (tipoNumerico / 100);
    precio_con_iva = base_imponible + cuota_iva;
  }

  // Porcentaje que representa el IVA sobre el precio total con IVA
  // % IVA sobre total = Cuota IVA / Precio con IVA × 100
  const porcentaje_iva_sobre_total: number =
    precio_con_iva > 0 ? (cuota_iva / precio_con_iva) * 100 : 0;

  // Etiqueta descriptiva del tipo aplicado
  const etiquetas: Record<string, string> = {
    '21': '21% — Tipo general',
    '10': '10% — Tipo reducido',
    '4': '4% — Tipo superreducido',
  };
  const tipo_aplicado_label: string =
    etiquetas[i.tipo_iva] ?? `${tipoNumerico}%`;

  // Redondeo a 2 decimales para evitar errores de punto flotante
  const redondear = (n: number): number => Math.round(n * 100) / 100;

  const baseR = redondear(base_imponible);
  const cuotaR = redondear(cuota_iva);
  const totalR = redondear(precio_con_iva);
  const pctR = redondear(porcentaje_iva_sobre_total);

  const chart = baseR > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Base imponible', value: baseR },
      { label: `IVA ${tipoNumerico}%`, value: cuotaR },
    ],
    prefix: '€',
    centerValue: '€' + totalR.toLocaleString('es-ES'),
    centerLabel: 'Precio con IVA',
    ariaLabel: 'Composición del precio: base imponible más cuota de IVA',
  } : undefined;

  const insight = baseR > 0 ? {
    title: 'Desglose del precio',
    text: i.modo === 'inverso'
      ? `Del precio final de **€${totalR.toLocaleString('es-ES')}**, **€${cuotaR.toLocaleString('es-ES')}** corresponden al IVA (${tipoNumerico}%) y **€${baseR.toLocaleString('es-ES')}** a la base imponible. El IVA representa el **${pctR}%** del total.`
      : `Aplicando el tipo del **${tipoNumerico}%** sobre €${baseR.toLocaleString('es-ES')}, la cuota de IVA es **€${cuotaR.toLocaleString('es-ES')}** y el precio final queda en **€${totalR.toLocaleString('es-ES')}**.`,
    tone: 'neutral' as const,
    icon: '🇪🇸',
  } : undefined;

  return {
    base_imponible: baseR,
    cuota_iva: cuotaR,
    precio_con_iva: totalR,
    tipo_aplicado_label,
    porcentaje_iva_sobre_total: pctR,
    _chart: chart,
    _insight: insight,
  };
}
