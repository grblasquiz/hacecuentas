/**
 * Bonificación familiar Paraguay 2026 — Código del Trabajo (Ley 213/93, art. 261).
 *
 * El trabajador que percibe un salario de hasta DOS salarios mínimos tiene derecho
 * a una bonificación familiar del 5% del salario mínimo por cada hijo menor de 17
 * años (sin límite de edad si el hijo tiene discapacidad).
 *
 *   bonificación = (salario ≤ 2 × SMVM) ? hijos × SMVM × 5% : 0
 *
 * Con el SMVM 2026 (Gs. 3.044.000) = Gs. 152.200 por hijo. El tope para percibirla
 * es de 2 SMVM = Gs. 6.088.000.
 *
 * Usa el helper oficial bonificacionFamiliar() de la tabla maestra del país.
 * Fuente: MTESS — Código del Trabajo, art. 261.
 */
import { PARAGUAY_2026, bonificacionFamiliar, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  hijos: number;          // cantidad de hijos < 17 años con derecho
  salarioBruto: number;   // salario bruto mensual (Gs.)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function bonificacionFamiliarParaguay(i: Inputs): Outputs {
  const hijos = Math.max(0, Math.floor(Number(i.hijos) || 0));
  const salarioBruto = Number(i.salarioBruto) || 0;

  if (salarioBruto <= 0) throw new Error('Ingresá tu salario bruto en guaraníes');

  const sm = PARAGUAY_2026.salarioMinimo;
  const tope = sm * PARAGUAY_2026.laboral.bonificacionFamiliarTopeSalarios; // 2 SMVM
  const bonifPorHijo = sm * PARAGUAY_2026.laboral.bonificacionFamiliarPct;  // 5% del SMVM

  // Helper oficial: aplica el tope de 2 SMVM y el 5% por hijo.
  const bonificacionTotal = bonificacionFamiliar(hijos, salarioBruto);
  const tieneDerecho = salarioBruto <= tope;
  const salarioConBonif = salarioBruto + bonificacionTotal;

  const _insight = tieneDerecho
    ? {
        type: 'highlight',
        icon: '👨‍👩‍👧‍👦',
        text: hijos > 0
          ? `Con **${hijos} hijo(s)** menores de 17 cobrás **${fmtPYG(bonificacionTotal)}** de bonificación familiar ` +
            `(${fmtPYG(bonifPorHijo)} por hijo). Sumada a tu salario, tu ingreso pasa a **${fmtPYG(salarioConBonif)}**.`
          : `Tu salario (${fmtPYG(salarioBruto)}) está dentro del tope de 2 salarios mínimos, así que tenés derecho ` +
            `a la bonificación: serían **${fmtPYG(bonifPorHijo)}** por cada hijo menor de 17.`,
      }
    : {
        type: 'highlight',
        icon: '⚠️',
        text: `Tu salario (**${fmtPYG(salarioBruto)}**) supera el tope de **2 salarios mínimos** (${fmtPYG(tope)}), ` +
          `así que la ley NO reconoce la bonificación familiar. El beneficio es Gs. 0.`,
      };

  const _table = {
    title: 'Bonificación familiar según cantidad de hijos',
    headers: ['Hijos < 17 años', 'Bonificación mensual', 'Salario + bonificación'],
    rows: [1, 2, 3, 4].map((n) => {
      const b = tieneDerecho ? n * bonifPorHijo : 0;
      return [String(n), fmtPYG(b), fmtPYG(salarioBruto + b)];
    }),
    note: `Cada hijo suma ${fmtPYG(bonifPorHijo)} (5% del salario mínimo de ${fmtPYG(sm)}). Solo se percibe si el salario es ≤ 2 SMVM (${fmtPYG(tope)}).`,
  };

  return {
    bonificacion: tieneDerecho
      ? `${hijos} hijo(s) · ${fmtPYG(bonificacionTotal)}`
      : 'Sin derecho (supera 2 SMVM)',
    bonificacionMonto: Math.round(bonificacionTotal),
    bonificacionPorHijo: Math.round(bonifPorHijo),
    salarioConBonificacion: Math.round(salarioConBonif),
    detalle: tieneDerecho
      ? `${hijos} × ${fmtPYG(bonifPorHijo)} = ${fmtPYG(bonificacionTotal)}`
      : `Salario ${fmtPYG(salarioBruto)} > tope ${fmtPYG(tope)} → sin bonificación`,
    _insight,
    _table,
  };
}
