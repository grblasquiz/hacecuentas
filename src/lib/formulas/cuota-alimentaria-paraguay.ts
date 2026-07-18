/**
 * Cuota alimentaria (asistencia alimenticia) — Paraguay. ESTIMACIÓN ORIENTATIVA.
 *
 * IMPORTANTE: en Paraguay el monto lo FIJA EL JUEZ. El Código de la Niñez y la
 * Adolescencia (Ley 1680/2001) manda fijar la prestación en proporción a la
 * capacidad económica del obligado y a las necesidades del hijo (arts. 97, 186 y
 * 258), y el art. 189 dispone que se exprese en JORNALES MÍNIMOS para que se
 * reajuste automáticamente con el salario mínimo. No existe un porcentaje fijo
 * legal (el viejo "25% del sueldo" quedó atrás como regla rígida).
 *
 * Esta herramienta da un RANGO ORIENTATIVO a partir de porcentajes frecuentes en la
 * práctica judicial según la cantidad de hijos, y traduce el resultado a jornales
 * mínimos. No sustituye la decisión del juez ni el asesoramiento de un abogado.
 * Moneda: guaraníes (PYG). Jornal mínimo: PARAGUAY_2026.jornalMinimo.
 */
import { fmtPYG, PARAGUAY_2026 } from '../data/paraguay-2026.ts';

export interface Inputs {
  ingreso?: number;   // ingreso mensual del alimentante (Gs.)
  hijos?: number;     // cantidad de hijos beneficiarios
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

// Rangos orientativos (fracción del ingreso) según cantidad de hijos — NO son tasas legales.
function rangoPorHijos(h: number): { min: number; centro: number; max: number } {
  if (h <= 1) return { min: 0.20, centro: 0.25, max: 0.30 };
  if (h === 2) return { min: 0.30, centro: 0.35, max: 0.40 };
  return { min: 0.40, centro: 0.45, max: 0.50 }; // 3 o más (tope práctico 50%)
}

export function compute(i: Inputs): Outputs {
  const ingreso = Math.max(0, Number(i.ingreso) || 0);
  if (ingreso <= 0) throw new Error('Ingresá el ingreso mensual del alimentante en guaraníes');
  const hijos = Math.max(1, Math.floor(Number(i.hijos) || 1));

  const r = rangoPorHijos(hijos);
  const cuotaMin = Math.round(ingreso * r.min);
  const cuotaCentro = Math.round(ingreso * r.centro);
  const cuotaMax = Math.round(ingreso * r.max);

  const jornal = PARAGUAY_2026.jornalMinimo;
  const enJornales = cuotaCentro / jornal;

  const _table = {
    title: 'Rangos orientativos de cuota alimentaria según cantidad de hijos',
    headers: ['Hijos', 'Rango orientativo del ingreso', `Sobre ${fmtPYG(ingreso)}`],
    rows: [
      ['1 hijo', '20% – 30%', `${fmtPYG(Math.round(ingreso * 0.20))} – ${fmtPYG(Math.round(ingreso * 0.30))}`],
      ['2 hijos', '30% – 40%', `${fmtPYG(Math.round(ingreso * 0.30))} – ${fmtPYG(Math.round(ingreso * 0.40))}`],
      ['3 o más', '40% – 50%', `${fmtPYG(Math.round(ingreso * 0.40))} – ${fmtPYG(Math.round(ingreso * 0.50))}`],
    ],
    note: 'Rangos ORIENTATIVOS frecuentes en la práctica, no tasas legales. El juez fija el monto según la capacidad del obligado y las necesidades del hijo (arts. 97, 186 y 258, Ley 1680/2001) y lo expresa en jornales mínimos (art. 189) para que se reajuste con el salario mínimo.',
  };

  const _insight = {
    type: 'highlight',
    icon: '👨‍👩‍👧',
    text: `Para **${hijos} hijo${hijos === 1 ? '' : 's'}** y un ingreso de **${fmtPYG(ingreso)}**, una cuota orientativa ronda **${fmtPYG(cuotaCentro)}** (rango ${fmtPYG(cuotaMin)} – ${fmtPYG(cuotaMax)}), equivalente a unos **${enJornales.toFixed(1)} jornales mínimos**. Es solo una referencia: el monto definitivo lo fija el juez.`,
  };

  return {
    cuotaEstimada: fmtPYG(cuotaCentro),
    rangoOrientativo: `${fmtPYG(cuotaMin)} – ${fmtPYG(cuotaMax)}`,
    enJornales: `${enJornales.toFixed(1)} jornales mínimos`,
    detalle: `Estimación orientativa para ${hijos} hijo${hijos === 1 ? '' : 's'}: ${fmtPYG(cuotaMin)} a ${fmtPYG(cuotaMax)} (~${fmtPYG(cuotaCentro)}). Equivale a ${enJornales.toFixed(1)} jornales mínimos (jornal ${fmtPYG(jornal)}). El monto lo fija el juez según capacidad y necesidades (Ley 1680/2001).`,
    _insight,
    _table,
  };
}
