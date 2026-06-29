// Indemnización por años de servicio (IAS) en Chile — Art. 161 y 163 Código del Trabajo.
// Base = última remuneración mensual con tope de 90 UF. Tope de 11 años de servicio.
// Indemnización sustitutiva del aviso previo = 1 mes de remuneración (misma base topada).
export interface Inputs {
  sueldoBase: number;
  aniosServicio: number;
  mesesAdicionales: number;
  sinAvisoPrevio: string; // "si" | "no"
  valorUF: number;
}

export interface Outputs {
  aniosComputables: number;
  baseCalculo: number;
  ias: number;
  avisoPrevio: number;
  total: number;
  _insight?: any;
  _chart?: any;
}

const TOPE_UF = 90;       // tope legal de la base imponible (90 UF)
const TOPE_ANIOS = 11;    // tope legal de años computables

export function compute(i: Inputs): Outputs {
  const sueldo = Math.max(0, i.sueldoBase || 0);
  const uf = i.valorUF && i.valorUF > 0 ? i.valorUF : 40812;
  const aniosRaw = Math.max(0, i.aniosServicio || 0);
  const mesesAdic = Math.max(0, Math.min(11, i.mesesAdicionales || 0));

  // Fracción superior a 6 meses se cuenta como un año completo (Art. 163 CT).
  const aniosComputables = Math.min(aniosRaw + (mesesAdic > 6 ? 1 : 0), TOPE_ANIOS);

  const topeBase = TOPE_UF * uf;            // 90 UF en pesos
  const baseCalculo = Math.round(Math.min(sueldo, topeBase));

  const ias = Math.round(baseCalculo * aniosComputables);
  const avisoPrevio = i.sinAvisoPrevio === 'si' ? baseCalculo : 0;
  const total = ias + avisoPrevio;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const topado = sueldo > topeBase;

  const _insight = {
    title: `Indemnización total: ${fmt(total)}`,
    text: `Con ${aniosComputables} año${aniosComputables !== 1 ? 's' : ''} computable${aniosComputables !== 1 ? 's' : ''} y una base de **${fmt(baseCalculo)}**${topado ? ` (topada en 90 UF = ${fmt(topeBase)})` : ''}, te corresponden **${fmt(ias)}** por años de servicio${avisoPrevio > 0 ? ` más **${fmt(avisoPrevio)}** por indemnización sustitutiva del aviso previo (1 mes)` : ''}. Total: **${fmt(total)}**.`,
    tone: 'good' as const,
    icon: '⚖️',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Años de servicio', value: ias, color: '#2563eb', colorDark: '#3b82f6' },
      { label: 'Aviso previo', value: avisoPrevio, color: '#16a34a', colorDark: '#22c55e' },
    ],
    valueFormat: 'currency',
    ariaLabel: `Composición de la indemnización: ${fmt(ias)} por años de servicio y ${fmt(avisoPrevio)} por aviso previo.`,
  };

  return { aniosComputables, baseCalculo, ias, avisoPrevio, total, _insight, _chart };
}
