import { URUGUAY_2026, fmtUYU, tasaFonasa } from '../data/uruguay-2026';

export interface DevolucionFonasaUruguayInputs {
  /** Modo de ingreso de los aportes anuales. */
  modo: 'aportes' | 'sueldo';
  /** Si modo="aportes": total de aportes FONASA pagados en el año ($U). */
  aportesAnuales?: number;
  /** Si modo="sueldo": sueldo nominal mensual ($U) para estimar los aportes. */
  nominalMensual?: number;
  /** Cónyuge/concubino a cargo sin cobertura SNIS propia. */
  conConyuge: 'si' | 'no';
  /** Hijos menores a cargo (afectan tasa FONASA y suman al tope). */
  hijos: number;
}

export interface DevolucionFonasaUruguayOutputs {
  resultado: string;
  aportes: string;
  tope: string;
  detalle: string;
  nota: string;
}

/**
 * Devolución FONASA (reintegro de cuota mutual) — Uruguay, aportes 2026.
 *
 * Lógica oficial (BPS/DGI):
 *   tope anual = CPE mensual × 12 × 1,25, sumando un CPE por cada beneficiario del hogar
 *                (titular + cónyuge/concubino + hijos menores / personas a cargo).
 *   Si los aportes FONASA del año (montepío de salud: 3% a 8% del nominal) superan ese tope,
 *   el EXCEDENTE se devuelve. Si no lo superan, no hay devolución.
 *
 *   devolución = max(0, aportes FONASA del año − tope anual)
 *
 * CPE 2026 = $6.693/mes (rige desde 1-ene-2026). Ver disclaimer: la devolución que se cobra
 * EN 2026 se calcula sobre los aportes 2025 con el CPE viejo; este cálculo estima la devolución
 * de los aportes 2026 (que se cobra en 2027) con el CPE 2026.
 */
export function devolucionFonasaUruguay(
  inputs: DevolucionFonasaUruguayInputs,
): DevolucionFonasaUruguayOutputs {
  const modo = inputs.modo || 'aportes';
  const conConyuge = inputs.conConyuge === 'si';
  const hijos = Math.max(0, Math.floor(Number(inputs.hijos) || 0));
  const conHijos = hijos > 0;

  const cpe = URUGUAY_2026.fonasa.cpeMensual;     // 6693
  const factor = URUGUAY_2026.fonasa.factorTope;  // 1.25
  const meses = URUGUAY_2026.fonasa.mesesAnio;    // 12

  // Beneficiarios que generan tope: titular + cónyuge + hijos menores.
  const beneficiarios = 1 + (conConyuge ? 1 : 0) + hijos;
  const tope = cpe * meses * factor * beneficiarios;

  // Aportes FONASA del año.
  let aportesAnuales: number;
  let baseDetalle: string;
  if (modo === 'sueldo') {
    const nominal = Math.max(0, Number(inputs.nominalMensual) || 0);
    const t = tasaFonasa(nominal, conConyuge, conHijos);
    aportesAnuales = nominal * t * meses;
    baseDetalle = `Aportes FONASA estimados = ${fmtUYU(nominal)} nominal × ${(t * 100).toFixed(1)}% × 12 = ${fmtUYU(aportesAnuales)}.`;
  } else {
    aportesAnuales = Math.max(0, Number(inputs.aportesAnuales) || 0);
    baseDetalle = `Aportes FONASA del año ingresados: ${fmtUYU(aportesAnuales)}.`;
  }

  const devolucion = Math.max(0, aportesAnuales - tope);

  let resultado: string;
  let nota: string;
  if (aportesAnuales <= 0) {
    resultado = 'Ingresá tus aportes FONASA del año (o tu sueldo nominal) para estimar la devolución.';
  } else if (devolucion > 0) {
    resultado = `Te correspondería una devolución estimada de ${fmtUYU(devolucion)}.`;
  } else {
    resultado = 'No te correspondería devolución: tus aportes FONASA del año no superan el tope.';
  }

  if (devolucion > 0) {
    nota = `Tus aportes (${fmtUYU(aportesAnuales)}) superan el tope (${fmtUYU(tope)}) en ${fmtUYU(devolucion)}, que es lo que se reintegra.`;
  } else {
    nota = `Tus aportes (${fmtUYU(aportesAnuales)}) no superan el tope anual (${fmtUYU(tope)}), por eso no hay excedente para devolver.`;
  }

  const detalle =
    `${baseDetalle} Tope anual = ${fmtUYU(cpe)} (CPE) × 12 × 1,25 × ${beneficiarios} beneficiario${beneficiarios === 1 ? '' : 's'} = ${fmtUYU(tope)}.`;

  return {
    resultado,
    aportes: fmtUYU(aportesAnuales),
    tope: `${fmtUYU(tope)} (${beneficiarios} beneficiario${beneficiarios === 1 ? '' : 's'})`,
    detalle,
    nota,
  };
}
