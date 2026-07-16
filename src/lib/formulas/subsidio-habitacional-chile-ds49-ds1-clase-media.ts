// Subsidio habitacional (Chile) — DS49 (Fondo Solidario) y DS1 (sectores medios, tramos 1/2/3).
// Verifica el ahorro mínimo, el tope de valor de la vivienda y estima el crédito hipotecario necesario.
// Topes de vivienda y ahorros mínimos verificados (MINVU/ChileAtiende 2026); montos de subsidio referenciales.
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  programa: string;        // 'ds49' | 'ds1t1' | 'ds1t2' | 'ds1t3'
  valorVivienda: number;   // en UF
  ahorro: number;          // ahorro acreditado, en UF
  subsidioUF: number;      // subsidio estimado/asignado, en UF (default por programa)
  valorUF: number;         // valor de la UF en pesos
}
export interface Outputs {
  subsidioAplicado: number;
  ahorroMinimo: number;
  cumpleAhorro: string;
  viviendaEnRango: string;
  creditoUF: number;
  creditoPesos: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Parámetros por programa (UF). Topes de vivienda y ahorro mínimo verificados; subsidio base referencial.
const PROGRAMAS: Record<string, { nombre: string; capUF: number; ahorroMin: number; subsidioDefault: number; conCredito: boolean }> = {
  ds49: { nombre: 'DS49 (Fondo Solidario)', capUF: 950, ahorroMin: 10, subsidioDefault: 314, conCredito: false },
  ds1t1: { nombre: 'DS1 Tramo 1 (hasta 1.100 UF)', capUF: 1100, ahorroMin: 30, subsidioDefault: 500, conCredito: true },
  ds1t2: { nombre: 'DS1 Tramo 2 (hasta 1.600 UF)', capUF: 1600, ahorroMin: 40, subsidioDefault: 350, conCredito: true },
  ds1t3: { nombre: 'DS1 Tramo 3 (hasta 2.200 UF)', capUF: 2200, ahorroMin: 80, subsidioDefault: 250, conCredito: true },
};

const UF_FALLBACK = 40_844.79;  // UF jul-2026 (mindicador.cl), fallback.

export function compute(i: Inputs): Outputs {
  const prog = PROGRAMAS[String(i.programa)] || PROGRAMAS.ds49;
  const vivienda = Math.max(0, Number(i.valorVivienda) || 0);
  const ahorro = Math.max(0, Number(i.ahorro) || 0);
  const uf = Number(i.valorUF) > 0 ? Number(i.valorUF) : UF_FALLBACK;
  const subsidioIngresado = Number(i.subsidioUF);
  const subsidio = subsidioIngresado > 0 ? subsidioIngresado : prog.subsidioDefault;

  // El subsidio no puede exceder el valor de la vivienda.
  const subsidioAplicado = Math.min(subsidio, vivienda);

  const cumpleAhorro = ahorro >= prog.ahorroMin;
  const enRango = vivienda > 0 && vivienda <= prog.capUF;

  // Crédito hipotecario necesario = vivienda − ahorro − subsidio (no negativo).
  const creditoUF = prog.conCredito
    ? Math.max(0, vivienda - ahorro - subsidioAplicado)
    : Math.max(0, vivienda - ahorro - subsidioAplicado);  // DS49 no usa crédito: idealmente 0

  const creditoPesos = Math.round(creditoUF * uf);

  const _insight = {
    title: `${prog.nombre}: crédito estimado ${creditoUF > 0 ? fmtCLP(creditoPesos) : '$0'}`,
    text: !enRango
      ? `La vivienda de **${vivienda.toLocaleString('es-CL')} UF** ${vivienda > prog.capUF ? `supera el tope de **${prog.capUF.toLocaleString('es-CL')} UF**` : 'no es válida'} para el ${prog.nombre}. Revisá el programa correcto según el valor.`
      : `Para una vivienda de **${vivienda.toLocaleString('es-CL')} UF**, con **${subsidioAplicado.toLocaleString('es-CL')} UF** de subsidio y **${ahorro.toLocaleString('es-CL')} UF** de ahorro, necesitás financiar **${creditoUF.toLocaleString('es-CL')} UF** (${fmtCLP(creditoPesos)}). ${cumpleAhorro ? 'Cumplís el ahorro mínimo.' : `Te falta ahorro: el mínimo es ${prog.ahorroMin} UF.`}`,
    tone: enRango && cumpleAhorro ? 'good' : 'warn',
    icon: '🏠',
  };

  const _chart = enRango ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ahorro', value: Math.round(ahorro * uf) },
      { label: 'Subsidio', value: Math.round(subsidioAplicado * uf) },
      { label: 'Crédito', value: creditoPesos },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCLP(Math.round(vivienda * uf)),
    centerLabel: 'Valor vivienda',
    ariaLabel: `Financiamiento de la vivienda: ahorro, subsidio y crédito hipotecario.`,
  } : undefined;

  return {
    subsidioAplicado: Math.round(subsidioAplicado),
    ahorroMinimo: prog.ahorroMin,
    cumpleAhorro: cumpleAhorro ? `Sí (tenés ${ahorro} UF, mínimo ${prog.ahorroMin} UF)` : `No (tenés ${ahorro} UF, faltan ${(prog.ahorroMin - ahorro).toLocaleString('es-CL')} UF)`,
    viviendaEnRango: enRango ? `Sí (tope ${prog.capUF.toLocaleString('es-CL')} UF)` : `No — máximo ${prog.capUF.toLocaleString('es-CL')} UF`,
    creditoUF: Math.round(creditoUF * 100) / 100,
    creditoPesos,
    detalle: `${prog.nombre}: subsidio ${subsidioAplicado.toLocaleString('es-CL')} UF + ahorro ${ahorro} UF → crédito ${creditoUF.toLocaleString('es-CL')} UF (${fmtCLP(creditoPesos)}).`,
    _insight,
    _chart,
  };
}
