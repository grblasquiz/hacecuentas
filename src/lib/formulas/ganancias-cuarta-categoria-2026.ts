/** Impuesto a las Ganancias 4ta categoría Argentina 2026
 *  Ley 20.628 — Empleados en relación de dependencia
 *  Con Ley 27.743 (Bases): nuevo piso y escala
 */

export interface Inputs {
  sueldoBrutoMensual: number;
  cargasFamiliares: number;
  conyuge: string;
  hijos: number;
  deduccionesEspeciales: number;
}

export interface Outputs {
  sueldoNetoSegSocial: number;
  gananciaAnual: number;
  deduccionesTotal: number;
  gananciaNetaSujetaImpuesto: number;
  impuestoAnual: number;
  impuestoMensual: number;
  tasaEfectiva: number;
  formula: string;
  explicacion: string;
}

// Valores estimados 2026 (basado en Ley 27.743 + actualización por inflación)
const MINIMO_NO_IMPONIBLE = 5_100_000; // Anual
const DEDUCCION_ESPECIAL = 24_480_000; // 4.8x del MNI para empleados
const DEDUCCION_CONYUGE = 4_775_000;
const DEDUCCION_HIJO = 2_400_000;

// Escala Art. 94 LIG (anual, estimada 2026)
const ESCALA = [
  { hasta: 1_500_000, tasa: 5, acum: 0 },
  { hasta: 3_000_000, tasa: 9, acum: 75_000 },
  { hasta: 4_500_000, tasa: 12, acum: 210_000 },
  { hasta: 6_000_000, tasa: 15, acum: 390_000 },
  { hasta: 9_000_000, tasa: 19, acum: 615_000 },
  { hasta: 12_000_000, tasa: 23, acum: 1_185_000 },
  { hasta: 18_000_000, tasa: 27, acum: 1_875_000 },
  { hasta: 27_000_000, tasa: 31, acum: 3_495_000 },
  { hasta: Infinity, tasa: 35, acum: 6_285_000 },
];

function calcGanancias(gananciaNetaAnual: number): number {
  if (gananciaNetaAnual <= 0) return 0;
  for (const e of ESCALA) {
    if (gananciaNetaAnual <= e.hasta) {
      const prevHasta = ESCALA.indexOf(e) > 0 ? ESCALA[ESCALA.indexOf(e) - 1].hasta : 0;
      return e.acum + (gananciaNetaAnual - prevHasta) * (e.tasa / 100);
    }
  }
  const last = ESCALA[ESCALA.length - 1];
  const prevHasta = ESCALA[ESCALA.length - 2].hasta;
  return last.acum + (gananciaNetaAnual - prevHasta) * (last.tasa / 100);
}

export function gananciasCuartaCategoria2026(i: Inputs): Outputs {
  const sueldoBruto = Number(i.sueldoBrutoMensual);
  const cargasFam = Number(i.cargasFamiliares) || 0;
  const tieneConyuge = i.conyuge === 'si' || i.conyuge === 'true';
  const hijos = Number(i.hijos) || 0;
  const deduccEsp = Number(i.deduccionesEspeciales) || 0;

  if (!sueldoBruto || sueldoBruto <= 0) throw new Error('Ingresá tu sueldo bruto mensual');

  // Aportes seguridad social: ~17%
  const aportesSegSocial = sueldoBruto * 0.17;
  const sueldoNetoSegSocial = sueldoBruto - aportesSegSocial;

  // Ganancia anual (13 sueldos con SAC)
  const gananciaAnual = sueldoNetoSegSocial * 13;

  // Deducciones
  let deduccionesTotal = MINIMO_NO_IMPONIBLE + DEDUCCION_ESPECIAL;
  if (tieneConyuge) deduccionesTotal += DEDUCCION_CONYUGE;
  deduccionesTotal += hijos * DEDUCCION_HIJO;
  deduccionesTotal += deduccEsp;

  const gananciaNetaSujetaImpuesto = Math.max(0, gananciaAnual - deduccionesTotal);
  const impuestoAnual = calcGanancias(gananciaNetaSujetaImpuesto);
  const impuestoMensual = impuestoAnual / 12;
  const tasaEfectiva = gananciaAnual > 0 ? (impuestoAnual / gananciaAnual) * 100 : 0;

  const formula = `Impuesto = escala($${Math.round(gananciaAnual).toLocaleString()} - $${Math.round(deduccionesTotal).toLocaleString()}) = $${Math.round(impuestoAnual).toLocaleString()}/año`;
  const explicacion = gananciaNetaSujetaImpuesto <= 0
    ? `Con un sueldo bruto de $${sueldoBruto.toLocaleString()}/mes, tus deducciones ($${Math.round(deduccionesTotal).toLocaleString()}) superan tu ganancia neta ($${Math.round(gananciaAnual).toLocaleString()}). No pagás Ganancias.`
    : `Sueldo bruto: $${sueldoBruto.toLocaleString()}/mes. Aportes seg. social (17%): $${Math.round(aportesSegSocial).toLocaleString()}. Ganancia anual (13 sueldos): $${Math.round(gananciaAnual).toLocaleString()}. Deducciones: $${Math.round(deduccionesTotal).toLocaleString()} (MNI + especial${tieneConyuge ? ' + cónyuge' : ''}${hijos > 0 ? ` + ${hijos} hijo(s)` : ''}). Ganancia sujeta a impuesto: $${Math.round(gananciaNetaSujetaImpuesto).toLocaleString()}. Impuesto anual: $${Math.round(impuestoAnual).toLocaleString()} ($${Math.round(impuestoMensual).toLocaleString()}/mes). Tasa efectiva: ${tasaEfectiva.toFixed(2)}%.`;

  return {
    sueldoNetoSegSocial: Math.round(sueldoNetoSegSocial),
    gananciaAnual: Math.round(gananciaAnual),
    deduccionesTotal: Math.round(deduccionesTotal),
    gananciaNetaSujetaImpuesto: Math.round(gananciaNetaSujetaImpuesto),
    impuestoAnual: Math.round(impuestoAnual),
    impuestoMensual: Math.round(impuestoMensual),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    formula,
    explicacion,
  };
}
