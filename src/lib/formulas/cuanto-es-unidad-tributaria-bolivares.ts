/**
 * Valor de la Unidad Tributaria (U.T.) hoy en bolívares — convertidor U.T. ↔ Bs.
 *
 * La U.T. es la unidad de cuenta del SENIAT para tributos nacionales (ISLR,
 * multas, sanciones). Convierte una cantidad de U.T. a bolívares y viceversa.
 *
 * Datos: el valor de la U.T. se lee de src/lib/data/venezuela-2026.ts
 *   (VENEZUELA_2026.unidadTributaria = Bs. 43), NO se hardcodea.
 *   Fuente: SENIAT, Providencia SNAT/2025/000048 (Gaceta Oficial 43.140).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  cantidad?: number;   // cantidad a convertir
  direccion?: string;  // 'ut-bs' (U.T. → Bs) | 'bs-ut' (Bs → U.T.)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUT = (n: number): string =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' U.T.';

export function cuantoEsUnidadTributariaBolivares(i: Inputs): Outputs {
  const valorUt = VENEZUELA_2026.unidadTributaria; // Bs. por U.T.
  const cantidad = Math.max(0, Number(i.cantidad) || 0);
  const direccion = String(i.direccion ?? 'ut-bs') === 'bs-ut' ? 'bs-ut' : 'ut-bs';

  let resultadoNum: number;
  let resultadoStr: string;
  let entradaStr: string;

  if (direccion === 'ut-bs') {
    resultadoNum = cantidad * valorUt;
    resultadoStr = fmtVES(resultadoNum);
    entradaStr = fmtUT(cantidad);
  } else {
    resultadoNum = cantidad / valorUt;
    resultadoStr = fmtUT(resultadoNum);
    entradaStr = fmtVES(cantidad);
  }

  const narrativa = cantidad > 0
    ? `${entradaStr} equivalen a ${resultadoStr}, tomando el valor vigente de 1 U.T. = ${fmtVES(valorUt)}.`
    : `Hoy 1 Unidad Tributaria (U.T.) equivale a ${fmtVES(valorUt)} según el SENIAT. ` +
      `Ingresá una cantidad para convertir U.T. a bolívares o al revés.`;

  return {
    resultado: resultadoNum,
    valorUnidadTributaria: valorUt,
    detalle: cantidad > 0 ? `${entradaStr} = ${resultadoStr}` : 'Ingresá una cantidad para convertir',
    _insight: {
      type: 'highlight',
      icon: '📐',
      text: narrativa,
    },
    _table: {
      title: 'Equivalencias de la Unidad Tributaria (U.T.)',
      headers: ['Cantidad', 'En bolívares'],
      rows: [
        ['1 U.T.', fmtVES(valorUt)],
        ['5 U.T.', fmtVES(5 * valorUt)],
        ['10 U.T.', fmtVES(10 * valorUt)],
        ['100 U.T.', fmtVES(100 * valorUt)],
        ['1.000 U.T.', fmtVES(1000 * valorUt)],
      ],
      note: `Valor vigente: 1 U.T. = ${fmtVES(valorUt)} (Providencia SNAT/2025/000048, Gaceta Oficial 43.140). ` +
        `La U.T. se usa solo para tributos nacionales del SENIAT; está prohibida para beneficios laborales.`,
    },
  };
}
