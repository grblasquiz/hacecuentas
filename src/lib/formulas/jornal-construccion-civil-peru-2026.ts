/**
 * Jornal de construcción civil — Perú 2026 (convenio FTCCP-CAPECO, R.M. 197-2025-TR,
 * tablas vigentes 1-ene → 31-dic-2026).
 * Jornales básicos diarios: Operario S/ 89,30 · Oficial S/ 69,75 · Peón S/ 62,80.
 * BUC: 32% (operario) / 30% (oficial y peón) del jornal básico, por día laborado.
 * Movilidad acumulada: S/ 8,60 por día laborado.
 * Dominical (DSO): 1 jornal básico si labora los 6 días (proporcional a días trabajados).
 * Asignación por escolaridad: 30 jornales básicos al año por hijo (30/360 por día laborado).
 * Fuente: FTCCP / CAPECO. Verificado 2026-07-18.
 */
import { CONSTRUCCION_CIVIL_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  categoria?: string;           // 'operario' | 'oficial' | 'peon'
  dias?: number | string;       // días laborados en la semana (1-6)
  hijos?: number | string;      // hijos en edad escolar (asignación por escolaridad)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const LABELS: Record<string, string> = { operario: 'Operario', oficial: 'Oficial', peon: 'Peón' };

export function compute(i: Inputs): Outputs {
  const categoria = (['operario', 'oficial', 'peon'].includes(String(i.categoria)) ? String(i.categoria) : 'operario') as 'operario' | 'oficial' | 'peon';
  const dias = Math.max(1, Math.min(6, Math.floor(Number(i.dias) || 6)));
  const hijos = Math.max(0, Math.min(10, Math.floor(Number(i.hijos) || 0)));

  const { jornal, bucPct, movilidadDia, escolaridadJornalesAnio } = CONSTRUCCION_CIVIL_2026;
  const j = jornal[categoria];
  const bucDia = j * bucPct[categoria];

  const basicoSemanal = j * dias;
  const bucSemanal = bucDia * dias;
  const movilidadSemanal = movilidadDia * dias;
  const dominical = j * (dias / 6);
  const escolaridadDia = (j * escolaridadJornalesAnio) / 360; // 30 jornales/año ÷ 360 días
  const escolaridadSemanal = escolaridadDia * dias * hijos;

  const totalSemanal = basicoSemanal + bucSemanal + movilidadSemanal + dominical + escolaridadSemanal;
  const mensualEstimado = totalSemanal * 52 / 12;

  const _insight = {
    title: `${LABELS[categoria]}: tu semana en obra`,
    text: `Como **${LABELS[categoria]}** (jornal 2026 de **${fmtPEN2(j)}**), por ${dias} día(s) la semana suma **${fmtPEN2(totalSemanal)}**: básico ${fmtPEN2(basicoSemanal)} + BUC ${(bucPct[categoria] * 100).toFixed(0)}% ${fmtPEN2(bucSemanal)} + movilidad ${fmtPEN2(movilidadSemanal)} + dominical ${fmtPEN2(dominical)}${hijos ? ` + escolaridad ${fmtPEN2(escolaridadSemanal)}` : ''}. Al mes son unos **${fmtPEN2(mensualEstimado)}** brutos (sin horas extras ni bonificaciones por altura o especialización).`,
    tone: 'neutral',
    icon: '👷',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Jornal básico', value: Math.round(basicoSemanal * 100) / 100 },
      { label: 'BUC', value: Math.round(bucSemanal * 100) / 100 },
      { label: 'Movilidad', value: Math.round(movilidadSemanal * 100) / 100 },
      { label: 'Dominical', value: Math.round(dominical * 100) / 100 },
      ...(escolaridadSemanal > 0 ? [{ label: 'Escolaridad', value: Math.round(escolaridadSemanal * 100) / 100 }] : []),
    ],
    prefix: 'S/ ',
    centerValue: fmtPEN2(totalSemanal),
    centerLabel: 'Semana',
    ariaLabel: `Semana de ${LABELS[categoria]} en construcción civil: ${fmtPEN2(totalSemanal)}.`,
  };

  return {
    jornalBasico: `${fmtPEN2(j)} por día`,
    totalSemanal: fmtPEN2(totalSemanal),
    mensualEstimado: `≈ ${fmtPEN2(mensualEstimado)}`,
    desglose: `Básico ${fmtPEN2(basicoSemanal)} · BUC ${fmtPEN2(bucSemanal)} · Movilidad ${fmtPEN2(movilidadSemanal)} · Dominical ${fmtPEN2(dominical)}${hijos ? ` · Escolaridad ${fmtPEN2(escolaridadSemanal)}` : ''}`,
    detalle: `${LABELS[categoria]} 2026: jornal ${fmtPEN2(j)} × ${dias} días + BUC ${(bucPct[categoria] * 100).toFixed(0)}% + movilidad ${fmtPEN2(movilidadDia)}/día + dominical proporcional = ${fmtPEN2(totalSemanal)}/semana (R.M. 197-2025-TR).`,
    _insight,
    _chart,
  };
}
