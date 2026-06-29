/**
 * Tope imponible y cotizaciones — Chile 2026.
 * Topes (Superintendencia de Pensiones, en UF, vigentes desde feb-2026):
 *   - AFP / salud / ISL: 90,0 UF
 *   - Seguro de cesantía (AFC): 135,2 UF
 * Cotizaciones del trabajador dependiente:
 *   - AFP: 10% obligatorio (DL 3.500) + comisión de la administradora (varía ~0,49%–1,45%).
 *   - Salud: 7% legal (Fonasa; en isapre el plan puede costar más).
 *   - AFC: 0,6% del trabajador SOLO en contrato indefinido (Ley 19.728); en plazo fijo el
 *     trabajador no cotiza AFC (lo paga el empleador).
 * UF es input con default (UF jun-2026 = $40.812); NO se hardcodea adentro.
 */

export interface Inputs {
  sueldoImponible: number;
  tasaAFP: number;       // comisión AFP en %, default 1,44
  tipoContrato: 'indefinido' | 'plazo_fijo';
  valorUF: number;       // default 40812
}

export interface Outputs {
  baseAFPsalud: number;
  baseAFC: number;
  cotizAFP: number;
  cotizSalud: number;
  cotizAFC: number;
  totalDescuentos: number;
  _insight?: any;
  _table?: any;
}

const UF_DEFAULT = 40812;
const AFP_OBLIGATORIO = 0.10;
const SALUD = 0.07;
const AFC_TRABAJADOR_INDEFINIDO = 0.006;
const TOPE_AFP_SALUD_UF = 90.0;
const TOPE_AFC_UF = 135.2;

export function compute(i: Inputs): Outputs {
  const uf = i.valorUF && i.valorUF > 0 ? i.valorUF : UF_DEFAULT;
  const sueldo = Math.max(0, i.sueldoImponible || 0);
  const comisionAFP = (i.tasaAFP && i.tasaAFP > 0 ? i.tasaAFP : 1.44) / 100;
  const esIndefinido = i.tipoContrato !== 'plazo_fijo';

  const topeAFPsalud = TOPE_AFP_SALUD_UF * uf;
  const topeAFC = TOPE_AFC_UF * uf;

  const baseAFPsalud = Math.min(sueldo, topeAFPsalud);
  const baseAFC = Math.min(sueldo, topeAFC);

  const cotizAFP = Math.round(baseAFPsalud * (AFP_OBLIGATORIO + comisionAFP));
  const cotizSalud = Math.round(baseAFPsalud * SALUD);
  const tasaAFCtrab = esIndefinido ? AFC_TRABAJADOR_INDEFINIDO : 0;
  const cotizAFC = Math.round(baseAFC * tasaAFCtrab);

  const totalDescuentos = cotizAFP + cotizSalud + cotizAFC;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const topeado = sueldo > topeAFPsalud;

  const _insight = {
    title: topeado ? 'Tu sueldo supera el tope imponible' : 'Cotizaciones sobre tu sueldo imponible',
    text: topeado
      ? `Con un imponible de **${fmt(sueldo)}**, AFP y salud sólo cotizan hasta el tope de 90 UF (**${fmt(topeAFPsalud)}**). Descuentos previsionales: **${fmt(totalDescuentos)}** (AFP ${fmt(cotizAFP)} + salud ${fmt(cotizSalud)} + cesantía ${fmt(cotizAFC)}).`
      : `Con un imponible de **${fmt(sueldo)}**, tus descuentos previsionales suman **${fmt(totalDescuentos)}**: AFP ${fmt(cotizAFP)}, salud ${fmt(cotizSalud)} y cesantía ${fmt(cotizAFC)}.`,
    tone: 'info' as const,
    icon: '🧮',
  };

  // Tabla: cómo aplican los topes a distintos niveles de sueldo (en UF y en pesos).
  const niveles = [
    Math.round(30 * uf),
    Math.round(60 * uf),
    Math.round(TOPE_AFP_SALUD_UF * uf),
    Math.round(TOPE_AFC_UF * uf),
    Math.round(150 * uf),
  ];
  if (sueldo > 0 && !niveles.includes(sueldo)) niveles.push(sueldo);
  const nivelesUnicos = Array.from(new Set(niveles)).sort((a, b) => a - b);
  const rows = nivelesUnicos.map((s) => {
    const bAFP = Math.min(s, topeAFPsalud);
    const bAFC = Math.min(s, topeAFC);
    const cAFP = Math.round(bAFP * (AFP_OBLIGATORIO + comisionAFP));
    const cSalud = Math.round(bAFP * SALUD);
    const cAFC = Math.round(bAFC * tasaAFCtrab);
    return [
      `${fmt(s)}${s === sueldo ? ' (tu caso)' : ''}`,
      `${(s / uf).toFixed(1)} UF`,
      fmt(bAFP),
      fmt(cAFP + cSalud + cAFC),
    ];
  });
  const _table = {
    title: `Cotizaciones según sueldo imponible (UF ${fmt(uf)}, contrato ${esIndefinido ? 'indefinido' : 'plazo fijo'})`,
    headers: ['Sueldo imponible', 'En UF', 'Base AFP/salud (tope 90 UF)', 'Descuentos previsionales'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'Topes 2026 (Superintendencia de Pensiones): AFP/salud 90 UF; seguro de cesantía 135,2 UF. AFP 10% + comisión, salud 7%, cesantía 0,6% (sólo contrato indefinido).',
  };

  return {
    baseAFPsalud,
    baseAFC,
    cotizAFP,
    cotizSalud,
    cotizAFC,
    totalDescuentos,
    _insight,
    _table,
  };
}
