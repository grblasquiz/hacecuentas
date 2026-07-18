/**
 * Costo del pasaporte colombiano 2026 — Resolución 03969 del 26-mar-2026 (rige 06-abr-2026).
 * Bogotá: libreta ($111.000 ordinario / $244.000 ejecutivo) + impuesto de timbre ($79.000).
 * Departamentos suman estampillas propias: Valle del Cauca llega a $343.700 (ordinario) / $476.700 (ejecutivo).
 * Tarifas importadas de la data país (NO hardcodear).
 */
import { PASAPORTE_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  tipo: 'ordinario' | 'ejecutivo';
  lugar: 'bogota' | 'valle_del_cauca' | 'otro_departamento';
  estampillas_departamentales?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; }

export function compute(i: Inputs): Outputs {
  const P = PASAPORTE_2026;
  const tipo = i.tipo === 'ejecutivo' ? 'ejecutivo' : 'ordinario';
  const lugar = i.lugar === 'valle_del_cauca' ? 'valle_del_cauca' : i.lugar === 'otro_departamento' ? 'otro_departamento' : 'bogota';

  const libreta = tipo === 'ejecutivo' ? P.bogota.ejecutivo : P.bogota.ordinario;
  const timbre = P.bogota.impuestoTimbre;
  const baseNacional = libreta + timbre;

  let estampillas = 0;
  let total = baseNacional;
  let lugarLabel = 'Bogotá (Cancillería)';

  if (lugar === 'valle_del_cauca') {
    total = tipo === 'ejecutivo' ? P.valleDelCauca.ejecutivoTotal : P.valleDelCauca.ordinarioTotal;
    estampillas = total - baseNacional;
    lugarLabel = 'Valle del Cauca';
  } else if (lugar === 'otro_departamento') {
    estampillas = Math.max(0, Number(i.estampillas_departamentales) || 0);
    total = baseNacional + estampillas;
    lugarLabel = 'otro departamento';
  }

  const _insight = {
    title: `Pasaporte ${tipo}: ${fmtCOP(total)}`,
    text: `El pasaporte **${tipo}** tramitado en **${lugarLabel}** cuesta **${fmtCOP(total)}**: libreta ${fmtCOP(libreta)} + impuesto de timbre ${fmtCOP(timbre)}${estampillas > 0 ? ` + estampillas departamentales ${fmtCOP(estampillas)}` : ''}. ${lugar === 'bogota' ? 'Bogotá no cobra estampillas adicionales.' : 'Las estampillas las fija cada asamblea departamental, por eso el mismo pasaporte cambia de precio según dónde lo saques.'} Tarifas vigentes desde el 06-abr-2026 (Resolución 03969 de la Cancillería).`,
    tone: 'neutral',
    icon: '🛂',
  };

  return {
    total_a_pagar: fmtCOP(total),
    libreta: fmtCOP(libreta),
    impuesto_timbre: fmtCOP(timbre),
    estampillas_depto: fmtCOP(estampillas),
    detalle: `${fmtCOP(libreta)} (libreta ${tipo}) + ${fmtCOP(timbre)} (timbre)${estampillas > 0 ? ` + ${fmtCOP(estampillas)} (estampillas ${lugarLabel})` : ''} = ${fmtCOP(total)}.`,
    _insight,
  };
}
