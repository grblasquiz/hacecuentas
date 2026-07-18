/**
 * Deducción adicional de hasta 3 UIT — rentas de trabajo, Perú (SUNAT, ejercicio 2026).
 * Además de las 7 UIT automáticas, puedes deducir hasta 3 UIT (S/ 16.500 con UIT 2026
 * de S/ 5.500) por gastos sustentados con comprobante electrónico vinculado a tu DNI:
 *   - Restaurantes, bares y hoteles: 15% del consumo
 *   - Alquiler de vivienda: 30% del monto pagado
 *   - Honorarios de médicos y odontólogos: 30%
 *   - Servicios de otras profesiones y oficios (4ta categoría): 30%
 *   - Aportes EsSalud de trabajadores del hogar: 100%
 * El ahorro real depende de tu tasa marginal de renta (8% a 30%).
 * Fuente: SUNAT — personas.sunat.gob.pe. Verificado 2026-07-18.
 */
import { DEDUCCION_3UIT_2026, PERU_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  restaurantes?: number | string;   // gasto anual en restaurantes/hoteles (S/)
  alquiler?: number | string;       // alquiler anual pagado (S/)
  medicos?: number | string;        // honorarios médicos/odontólogos anuales (S/)
  profesionales?: number | string;  // otros servicios de 4ta categoría (S/)
  essaludHogar?: number | string;   // aportes EsSalud trabajador del hogar (S/)
  tasa?: string;                    // tasa marginal: '8' | '14' | '17' | '20' | '30'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const rest = Math.max(0, Number(i.restaurantes) || 0);
  const alq = Math.max(0, Number(i.alquiler) || 0);
  const med = Math.max(0, Number(i.medicos) || 0);
  const prof = Math.max(0, Number(i.profesionales) || 0);
  const hogar = Math.max(0, Number(i.essaludHogar) || 0);
  const tasa = ([8, 14, 17, 20, 30].includes(Number(i.tasa)) ? Number(i.tasa) : 8) / 100;

  const { pct, topeUit } = DEDUCCION_3UIT_2026;
  const tope = topeUit * PERU_2026.uit; // 16.500

  const dRest = rest * pct.restaurantesHoteles;
  const dAlq = alq * pct.alquiler;
  const dMed = med * pct.medicosOdontologos;
  const dProf = prof * pct.otrosProfesionales;
  const dHogar = hogar * pct.essaludHogar;

  const deduccionBruta = dRest + dAlq + dMed + dProf + dHogar;
  const deduccion = Math.min(deduccionBruta, tope);
  const topeado = deduccionBruta > tope;
  const ahorro = deduccion * tasa;

  const _insight = {
    title: `Deducción de ${fmtPEN2(deduccion)} → ahorro de ${fmtPEN2(ahorro)}`,
    text: `Tus gastos generan una deducción de **${fmtPEN2(deduccion)}**${topeado ? ` (aplicó el tope de 3 UIT = ${fmtPEN2(tope)}; sin tope serían ${fmtPEN2(deduccionBruta)})` : ''}. Con una tasa marginal del **${(tasa * 100).toFixed(0)}%**, eso baja tu impuesto anual en **${fmtPEN2(ahorro)}** — que suele volver como devolución de oficio de SUNAT entre marzo y abril. Clave: pide siempre **boleta electrónica con tu DNI**; los comprobantes de papel no cuentan.`,
    tone: ahorro > 0 ? 'good' : 'neutral',
    icon: '🧾',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Restaurantes/hoteles (15%)', value: Math.round(dRest * 100) / 100 },
      { label: 'Alquiler (30%)', value: Math.round(dAlq * 100) / 100 },
      { label: 'Médicos/odontólogos (30%)', value: Math.round(dMed * 100) / 100 },
      { label: 'Otros profesionales (30%)', value: Math.round(dProf * 100) / 100 },
      { label: 'EsSalud hogar (100%)', value: Math.round(dHogar * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN2(deduccion),
    centerLabel: 'Deducción',
    ariaLabel: `Deducción adicional total de ${fmtPEN2(deduccion)} sobre un tope de ${fmtPEN2(tope)}.`,
  };

  return {
    deduccionTotal: fmtPEN2(deduccion),
    ahorroEstimado: fmtPEN2(ahorro),
    usoDelTope: `${((deduccion / tope) * 100).toFixed(1)}% de las 3 UIT (${fmtPEN2(tope)})`,
    detalle: `15% × ${fmtPEN2(rest)} + 30% × ${fmtPEN2(alq)} + 30% × ${fmtPEN2(med)} + 30% × ${fmtPEN2(prof)} + 100% × ${fmtPEN2(hogar)} = ${fmtPEN2(deduccionBruta)}${topeado ? ` → tope 3 UIT: ${fmtPEN2(tope)}` : ''} · ahorro ≈ ${fmtPEN2(ahorro)} (tasa ${(tasa * 100).toFixed(0)}%).`,
    _insight,
    _chart,
  };
}
