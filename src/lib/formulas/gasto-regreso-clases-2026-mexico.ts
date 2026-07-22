/**
 * Gasto de regreso a clases 2026 — México (ciclo escolar 2026-2027, inicia lunes 31-ago-2026).
 * Presupuesto por alumno desglosado en 4 rubros: útiles, uniformes, mochila+calzado, cuotas/inscripción,
 * según nivel (preescolar/primaria/secundaria/prepa) y tipo de escuela (pública/privada).
 * Referencias 2026: lista de útiles SEP cuesta $300-600 según Profeco, pero el gasto real por alumno
 * de primaria ronda los $3,000 al sumar uniformes, mochila, calzado y cuotas (sondeos Profeco/ANPEC).
 * Feria de Regreso a Clases Profeco: 15-16 de agosto de 2026.
 */
import { fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  hijos: number;              // número de hijos que entran a clases
  nivel?: string;             // 'preescolar' | 'primaria' | 'secundaria' | 'prepa'
  tipoEscuela?: string;       // 'publica' | 'privada'
  incluyeUniformes?: string;  // 'si' | 'no' (algunas escuelas no exigen o ya los tienen)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

// Costos por alumno 2026 (MXN, promedios de sondeos Profeco / ANPEC — orientativos)
// [útiles, uniformes, mochila+calzado, cuotas/inscripción]
const COSTOS: Record<string, Record<string, [number, number, number, number]>> = {
  publica: {
    preescolar: [450, 1100, 900, 300],
    primaria: [600, 1300, 1000, 400],
    secundaria: [900, 1500, 1100, 500],
    prepa: [1100, 1600, 1200, 600],
  },
  privada: {
    preescolar: [2000, 2500, 1400, 5000],
    primaria: [3000, 2800, 1600, 6500],
    secundaria: [4000, 3200, 1800, 8000],
    prepa: [4800, 3500, 2000, 10000],
  },
};

const NIVEL_LABEL: Record<string, string> = {
  preescolar: 'preescolar',
  primaria: 'primaria',
  secundaria: 'secundaria',
  prepa: 'prepa / bachillerato',
};

export function compute(i: Inputs): Outputs {
  const hijos = Math.max(1, Math.min(10, Math.round(num(i.hijos, 1))));
  const nivel = String(i.nivel || 'primaria');
  const tipo = String(i.tipoEscuela || 'publica');
  const conUniformes = String(i.incluyeUniformes || 'si') === 'si';

  const fila = (COSTOS[tipo] || COSTOS.publica)[nivel] || COSTOS.publica.primaria;
  const [utiles, uniformes, mochilaCalzado, cuotas] = fila;

  const uniformesAplicado = conUniformes ? uniformes : 0;
  const porAlumno = utiles + uniformesAplicado + mochilaCalzado + cuotas;
  const total = porAlumno * hijos;

  const _insight = {
    title: 'Tu presupuesto de regreso a clases 2026',
    text: `Para **${hijos} ${hijos === 1 ? 'alumno' : 'alumnos'}** de **${NIVEL_LABEL[nivel] || nivel}** en escuela **${tipo === 'privada' ? 'privada' : 'pública'}**, presupuestá **${fmtMXN(total)}** (${fmtMXN(porAlumno)} por alumno). La lista de útiles SEP sola cuesta $300-600, pero el gasto real se multiplica con uniformes, mochila, calzado y cuotas. Tip: la **Feria de Regreso a Clases de Profeco (15-16 de agosto)** y comparar precios por internet pueden ahorrarte 15-30%. El ciclo 2026-2027 arranca el **lunes 31 de agosto**.`,
    tone: total > 10000 ? 'warn' : 'good',
    icon: '🎒',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Útiles', value: utiles * hijos },
      { label: 'Uniformes', value: uniformesAplicado * hijos },
      { label: 'Mochila y calzado', value: mochilaCalzado * hijos },
      { label: 'Cuotas / inscripción', value: cuotas * hijos },
    ],
    ariaLabel: `Desglose del gasto de regreso a clases: útiles ${fmtMXN(utiles * hijos)}, uniformes ${fmtMXN(uniformesAplicado * hijos)}, mochila y calzado ${fmtMXN(mochilaCalzado * hijos)}, cuotas ${fmtMXN(cuotas * hijos)}.`,
  };

  return {
    total: fmtMXN(total),
    porAlumno: fmtMXN(porAlumno),
    utiles: fmtMXN(utiles * hijos),
    uniformes: conUniformes ? fmtMXN(uniformesAplicado * hijos) : 'No incluidos',
    mochilaCalzado: fmtMXN(mochilaCalzado * hijos),
    cuotas: fmtMXN(cuotas * hijos),
    detalle: `${hijos} ${hijos === 1 ? 'alumno' : 'alumnos'} · ${NIVEL_LABEL[nivel] || nivel} · escuela ${tipo === 'privada' ? 'privada' : 'pública'}${conUniformes ? '' : ' · sin uniformes'} · ciclo 2026-2027 (inicia 31-ago).`,
    _insight,
    _chart,
  };
}
