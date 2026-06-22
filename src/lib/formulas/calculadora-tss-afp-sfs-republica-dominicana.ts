/**
 * Calculadora de descuento TSS (AFP + SFS) — República Dominicana 2026.
 *
 * Descuentos del TRABAJADOR a la Tesorería de la Seguridad Social (TSS):
 *   - AFP (pensiones): 2,87% del salario cotizable.
 *   - SFS (salud, SeNaSa/ARS): 3,04% del salario cotizable.
 *   - Total empleado: 5,91%.
 *
 * Topes de cotización (feb-2026): sobre el exceso NO se cotiza.
 *   - SFS: tope RD$232.230 (10 salarios mínimos cotizables).
 *   - AFP: tope RD$464.460 (20 salarios mínimos cotizables).
 *
 * La regalía pascual NO cotiza a la TSS (excluida de esta base).
 *
 * Data: src/lib/data/republica-dominicana-2026.ts (tss.*).
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface TssInputs {
  /** Salario cotizable mensual en RD$ (salario ordinario, sin regalía). */
  salario?: number | string;
}

export interface TssOutputs {
  afp: number;
  sfs: number;
  totalTss: number;
  neto: number;
  afpTexto: string;
  sfsTexto: string;
  totalTexto: string;
  netoTexto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraTssAfpSfsRepublicaDominicana(i: TssInputs): TssOutputs {
  const d = REPUBLICA_DOMINICANA_2026.tss;
  const salario = Math.max(0, Number(i.salario) || 0);

  // Bases topeadas: sobre el exceso del tope no se cotiza.
  const baseAfp = Math.min(salario, d.topeAfp);
  const baseSfs = Math.min(salario, d.topeSfs);
  const afp = baseAfp * d.afpEmpleado;
  const sfs = baseSfs * d.sfsEmpleado;
  const totalTss = afp + sfs;
  const neto = salario - totalTss;

  const tocaTopeSfs = salario > d.topeSfs;
  const tocaTopeAfp = salario > d.topeAfp;

  const detalle = `AFP ${(d.afpEmpleado * 100).toFixed(2)}% (${fmtDOP(afp)}) + SFS ${(d.sfsEmpleado * 100).toFixed(2)}% (${fmtDOP(sfs)}) = ${fmtDOP(totalTss)} de descuento TSS. Salario menos TSS: ${fmtDOP(neto)}.`;

  const _insight = {
    title: `La TSS te descuenta ${fmtDOP(totalTss)} al mes`,
    text: `Sobre un salario de **${fmtDOP(salario)}**, la TSS descuenta **${fmtDOP(afp)}** de AFP (pensiones, ${(d.afpEmpleado * 100).toFixed(2)}%) y **${fmtDOP(sfs)}** de SFS (salud, ${(d.sfsEmpleado * 100).toFixed(2)}%), un total de **${fmtDOP(totalTss)}** (**${(d.totalEmpleado * 100).toFixed(2)}%**).${(tocaTopeSfs || tocaTopeAfp) ? ` Tu salario supera ${tocaTopeAfp ? 'los topes de cotización' : 'el tope de SFS'}, así que sobre el exceso no se cotiza.` : ''} Esto es solo el aporte del trabajador: el empleador aporta además por su cuenta.`,
    tone: 'info' as const,
    icon: '🏥',
  };

  // Tabla: desglose de los descuentos del trabajador.
  const _table = {
    title: 'Descuentos de la TSS sobre el salario del trabajador',
    headers: ['Concepto', 'Tasa', 'Base cotizable', 'Descuento'],
    rows: [
      ['AFP (pensiones)', (d.afpEmpleado * 100).toFixed(2) + '%', fmtDOP(baseAfp), fmtDOP(afp)],
      ['SFS (salud)', (d.sfsEmpleado * 100).toFixed(2) + '%', fmtDOP(baseSfs), fmtDOP(sfs)],
      ['Total empleado', (d.totalEmpleado * 100).toFixed(2) + '%', fmtDOP(salario), fmtDOP(totalTss)],
    ],
    note: `Topes de cotización feb-2026: SFS ${fmtDOP(d.topeSfs)} (10 salarios mínimos cotizables) y AFP ${fmtDOP(d.topeAfp)} (20). Sobre el exceso no se cotiza. La regalía pascual no cotiza a la TSS. Aparte, el empleador aporta AFP ${(d.afpPatronal * 100).toFixed(2)}% + SFS ${(d.sfsPatronal * 100).toFixed(2)}% + riesgos laborales.`,
  };

  return {
    afp: Math.round(afp * 100) / 100,
    sfs: Math.round(sfs * 100) / 100,
    totalTss: Math.round(totalTss * 100) / 100,
    neto: Math.round(neto * 100) / 100,
    afpTexto: fmtDOP(afp),
    sfsTexto: fmtDOP(sfs),
    totalTexto: fmtDOP(totalTss),
    netoTexto: fmtDOP(neto),
    detalle,
    _insight,
    _table,
  };
}
