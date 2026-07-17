// PGU — Pensión Garantizada Universal (Chile). Estima el monto según pensión base, edad y requisitos.
// Montos y umbrales vigentes desde febrero 2026 (Ley 21.190 y reforma Ley 21.735), fuente ChileAtiende/IPS.
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  edad: number;
  pensionBase: number;         // pensión autofinanciada mensual (CLP)
  cumpleResidencia: string;    // 'si' | 'no' — 20 años de residencia
  top10: string;               // 'si' | 'no' — pertenece al 10% más rico (PFP)
}
export interface Outputs {
  cumpleRequisitos: string;
  montoMaximo: number;
  pguEstimada: number;
  pensionFinal: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// ── Parámetros PGU vigentes desde febrero 2026 (referenciales, se reajustan por IPC) ──
const PGU_MAX_MAYOR = 250_275;      // 82 años o más (y 75+ desde septiembre 2026)
const PGU_MAX_BASE = 231_732;       // 65 a 81 años
const EDAD_MAYOR = 82;              // umbral de monto superior
const PENSION_BASE_TOPE_COMPLETA = 789_139;  // hasta acá se recibe la PGU completa
const PENSION_SUPERIOR = 1_252_602;          // desde acá NO corresponde PGU

export function compute(i: Inputs): Outputs {
  const edad = Math.max(0, Number(i.edad) || 0);
  const pensionBase = Math.max(0, Number(i.pensionBase) || 0);
  const residencia = String(i.cumpleResidencia || 'si') === 'si';
  const esTop10 = String(i.top10 || 'no') === 'si';

  const montoMaximo = edad >= EDAD_MAYOR ? PGU_MAX_MAYOR : PGU_MAX_BASE;

  // Requisitos: 65+ años, residencia acreditada y no pertenecer al 10% más rico.
  const cumpleEdad = edad >= 65;
  const elegible = cumpleEdad && residencia && !esTop10;

  let pguEstimada = 0;
  let motivo = '';
  if (!cumpleEdad) {
    motivo = `Aún no cumplís la edad mínima de 65 años (tenés ${edad}).`;
  } else if (!residencia) {
    motivo = 'No se acredita el requisito de 20 años de residencia en Chile.';
  } else if (esTop10) {
    motivo = 'Pertenecer al 10% más rico (según el Puntaje de Focalización Previsional) deja fuera de la PGU.';
  } else if (pensionBase <= PENSION_BASE_TOPE_COMPLETA) {
    pguEstimada = montoMaximo;
    motivo = `Tu pensión base (${fmtCLP(pensionBase)}) está bajo el umbral de ${fmtCLP(PENSION_BASE_TOPE_COMPLETA)}: recibís la PGU completa.`;
  } else if (pensionBase >= PENSION_SUPERIOR) {
    pguEstimada = 0;
    motivo = `Tu pensión base (${fmtCLP(pensionBase)}) iguala o supera la pensión superior (${fmtCLP(PENSION_SUPERIOR)}): no corresponde PGU.`;
  } else {
    // Tramo decreciente lineal entre el umbral de PGU completa y la pensión superior.
    const factor = montoMaximo / (PENSION_SUPERIOR - PENSION_BASE_TOPE_COMPLETA);
    pguEstimada = Math.max(0, Math.round(montoMaximo - factor * (pensionBase - PENSION_BASE_TOPE_COMPLETA)));
    motivo = `Tu pensión base está en el tramo intermedio: la PGU se reduce en proporción entre ${fmtCLP(PENSION_BASE_TOPE_COMPLETA)} y ${fmtCLP(PENSION_SUPERIOR)}.`;
  }

  const pensionFinal = pensionBase + pguEstimada;

  const cumpleRequisitos = elegible
    ? (pguEstimada > 0 ? 'Sí, tenés derecho a PGU' : 'Cumplís los requisitos, pero tu pensión supera el tope')
    : 'No cumplís los requisitos';

  const tone = pguEstimada > 0 ? 'good' : 'warn';
  const _insight = {
    title: pguEstimada > 0 ? `PGU estimada: ${fmtCLP(pguEstimada)} al mes` : 'Sin PGU con estos datos',
    text: pguEstimada > 0
      ? `Con una pensión base de **${fmtCLP(pensionBase)}** y ${edad} años, tu PGU estimada es **${fmtCLP(pguEstimada)}** al mes. Sumada a tu pensión, cobrarías alrededor de **${fmtCLP(pensionFinal)}**. ${motivo}`
      : motivo,
    tone,
    icon: '👵',
  };

  const _chart = pguEstimada > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Pensión base', value: Math.round(pensionBase) },
      { label: 'PGU', value: Math.round(pguEstimada) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCLP(pensionFinal),
    centerLabel: 'Pensión total',
    ariaLabel: `Pensión total ${fmtCLP(pensionFinal)}: pensión base ${fmtCLP(pensionBase)} más PGU ${fmtCLP(pguEstimada)}.`,
  } : undefined;

  return {
    cumpleRequisitos,
    montoMaximo,
    pguEstimada,
    pensionFinal,
    detalle: `${motivo} Monto máximo según tu edad: ${fmtCLP(montoMaximo)}.`,
    _insight,
    _chart,
  };
}
