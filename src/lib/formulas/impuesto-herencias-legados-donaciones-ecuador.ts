/**
 * Impuesto a la renta sobre herencias, legados y donaciones (Ecuador) — tabla SRI 2026 + rebaja por parentesco.
 *
 * Base legal: Art. 36 lit. d) y artículo innumerado siguiente de la Ley Orgánica de Régimen Tributario
 *   Interno (LRTI). La tabla se actualiza cada año por la variación del IPC del INEC.
 * Tabla 2026: Resolución SRI NAC-DGERCGC25-00000043 (R.O. 194, 30-dic-2025).
 *   fuente: SRI, https://www.sri.gob.ec/impuesto-a-la-renta-de-ingresos-provenientes-de-herencias-legados-y-donaciones, 2026
 *   fuente: JEZL Auditores, https://www.jezl-auditores.com/index.php/tributario/131-tabla-de-ir-herencias-legados-y-donaciones-2026, 2026
 *
 * Rebaja por parentesco:
 *  - 1er grado de consanguinidad (hijos, padres): "las tarifas de la tabla precedente serán reducidas a la
 *    mitad" (Art. 36 lit. d LRTI) → 50% sobre el impuesto. Además, los hijos del causante menores de edad
 *    o con discapacidad están EXONERADOS del impuesto (no pagan).
 *  - 2do grado (hermanos, abuelos, nietos): reducción del 25% sobre el impuesto, aplicada en la práctica
 *    profesional por analogía; no está codificada expresamente en el Art. 36.
 *  - Sin parentesco / otros: tabla plena, sin reducción.
 *  - Cónyuge sobreviviente: NO es consanguinidad → tabla plena (usar 'sin-parentesco').
 * Nota histórica: la Ley de Desarrollo Económico (R.O. 587, 29-nov-2021) había exonerado por completo
 *   al 1er grado de consanguinidad y al cónyuge sin hijos, pero la Corte Constitucional la declaró
 *   inconstitucional (Sentencia 110-21-IN/22, 28-oct-2022). Desde entonces el impuesto volvió a aplicarse
 *   con la rebaja del 50% para el 1er grado; la exoneración total YA NO rige (vigente en 2026).
 * Ecuador está dolarizado → todos los montos en USD ("$").
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Tabla 2026 herencias/legados/donaciones (Resol. NAC-DGERCGC25-00000043). Montos en USD.
const TABLA_HLD_2026 = [
  { desde: 0,      hasta: 78527,    base: 0,      pct: 0.00 },
  { desde: 78527,  hasta: 157053,   base: 0,      pct: 0.05 },
  { desde: 157053, hasta: 314108,   base: 3926,   pct: 0.10 },
  { desde: 314108, hasta: 471193,   base: 19632,  pct: 0.15 },
  { desde: 471193, hasta: 628268,   base: 43195,  pct: 0.20 },
  { desde: 628268, hasta: 785321,   base: 74609,  pct: 0.25 },
  { desde: 785321, hasta: 942353,   base: 113873, pct: 0.30 },
  { desde: 942353, hasta: Infinity, base: 160982, pct: 0.35 },
] as const;

// Fracción básica desgravada (exenta) de la tabla de herencias/legados/donaciones 2026.
const FRACCION_BASICA_DESGRAVADA = 78527;

/** Impuesto según la tabla progresiva de herencias/legados/donaciones (sin rebaja por parentesco). */
function impuestoTablaHLD(baseImponible: number): number {
  const b = Math.max(0, baseImponible);
  for (const t of TABLA_HLD_2026) {
    if (b > t.desde && b <= t.hasta) return t.base + (b - t.desde) * t.pct;
  }
  const ult = TABLA_HLD_2026[TABLA_HLD_2026.length - 1];
  return ult.base + (b - ult.desde) * ult.pct;
}

export interface Inputs {
  valorRecibido: number;       // valor del bien/derecho heredado, legado o donado (USD)
  parentesco?: string;         // 'primer-grado' | 'segundo-grado' | 'sin-parentesco'
  deducciones?: number;        // gastos deducibles (deudas hereditarias, funeral, etc.) — solo herencias/legados
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorRecibido) || 0;
  if (valor <= 0) throw new Error('Ingresá el valor heredado, legado o donado');

  const parentesco = String(i.parentesco || 'sin-parentesco');
  const deducciones = Math.max(0, Number(i.deducciones) || 0);

  // Base imponible = valor recibido − deducciones admitidas (no puede ser negativa).
  const baseImponible = Math.max(0, valor - deducciones);

  // Impuesto según tabla (antes de la rebaja por parentesco).
  const impuestoSegunTabla = impuestoTablaHLD(baseImponible);

  // Rebaja por grado de parentesco.
  let factorRebaja = 0;            // fracción del impuesto que se rebaja
  let etiquetaParentesco = 'Sin parentesco (tabla plena)';
  if (parentesco === 'primer-grado') {
    factorRebaja = 0.50;           // Art. 36 LRTI: tarifas reducidas a la mitad
    etiquetaParentesco = '1er grado (hijos, padres): −50%';
  } else if (parentesco === 'segundo-grado') {
    factorRebaja = 0.25;           // reducción del 25% (práctica profesional)
    etiquetaParentesco = '2do grado (hermanos, abuelos, nietos): −25%';
  }

  const rebaja = impuestoSegunTabla * factorRebaja;
  const impuestoAPagar = Math.max(0, impuestoSegunTabla - rebaja);

  const exento = baseImponible <= FRACCION_BASICA_DESGRAVADA;
  const tasaEfectiva = valor > 0 ? (impuestoAPagar / valor) * 100 : 0;
  const valorNeto = valor - impuestoAPagar;

  const _insight = {
    title: exento ? 'No pagás impuesto' : 'Impuesto a pagar',
    text: exento
      ? `Una base imponible de **${fmtUSDec(baseImponible)}** está **por debajo de la fracción básica desgravada** (${fmtUSDec(FRACCION_BASICA_DESGRAVADA)} en 2026): **no se paga impuesto** a herencias, legados ni donaciones.`
      : `Sobre una base imponible de **${fmtUSDec(baseImponible)}**, el impuesto según la tabla del SRI es **${fmtUSDec(impuestoSegunTabla)}**${factorRebaja > 0 ? `, menos la rebaja por parentesco (${(factorRebaja * 100).toFixed(0)}% = ${fmtUSDec(rebaja)})` : ''}. **A pagar: ${fmtUSDec(impuestoAPagar)}** (tasa efectiva ${tasaEfectiva.toFixed(1)}%). Te quedan ${fmtUSDec(valorNeto)} netos.`,
    tone: exento || impuestoAPagar === 0 ? 'good' : 'neutral',
    icon: '⚖️',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Te queda (neto)', value: Math.round(valorNeto * 100) / 100 },
      { label: 'Impuesto SRI', value: Math.round(impuestoAPagar * 100) / 100 },
    ].filter((s) => s.value > 0),
    ariaLabel: `De ${fmtUSDec(valor)} recibidos, ${fmtUSDec(impuestoAPagar)} van al impuesto y ${fmtUSDec(valorNeto)} quedan netos.`,
  };

  return {
    impuestoAPagar: fmtUSDec(impuestoAPagar),
    baseImponible: fmtUSDec(baseImponible),
    impuestoSegunTabla: fmtUSDec(impuestoSegunTabla),
    rebajaParentesco: fmtUSDec(rebaja),
    valorNeto: fmtUSDec(valorNeto),
    tasaEfectiva: tasaEfectiva.toFixed(1) + '%',
    detalle: exento
      ? `Base ${fmtUSDec(baseImponible)} ≤ fracción exenta ${fmtUSDec(FRACCION_BASICA_DESGRAVADA)} → impuesto $0,00.`
      : `Valor ${fmtUSDec(valor)}${deducciones > 0 ? ` − deducciones ${fmtUSDec(deducciones)}` : ''} = base ${fmtUSDec(baseImponible)} → tabla ${fmtUSDec(impuestoSegunTabla)}${factorRebaja > 0 ? ` − rebaja ${etiquetaParentesco} (${fmtUSDec(rebaja)})` : ''} = ${fmtUSDec(impuestoAPagar)}.`,
    _insight,
    _chart,
  };
}
