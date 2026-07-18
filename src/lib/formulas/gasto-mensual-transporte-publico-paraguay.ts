/**
 * Gasto mensual en transporte público — Paraguay (billetaje electrónico).
 *
 * Calcula cuánto gastás por mes en pasajes de colectivo (viajes por día × días ×
 * tarifa) y, opcionalmente, lo compara con el costo de hacer el mismo recorrido en
 * auto (combustible). En el área metropolitana de Asunción el pago es 100% con
 * billetaje electrónico (tarjetas JAHA / MÁS).
 *
 * Tarifa por defecto editable (referencia metropolitana). Moneda: guaraníes (PYG).
 */
import { fmtPYG, PETROPAR_2026 as PP } from '../data/paraguay-2026.ts';

export interface Inputs {
  viajesDia?: number;   // viajes por día (ida + vuelta = 2)
  diasMes?: number;     // días que viajás al mes
  tarifa?: number;      // precio del pasaje (Gs.)
  // Comparación opcional con auto:
  kmDia?: number;       // km recorridos por día en auto
  rend?: number;        // rendimiento del auto (km/L)
  precioLitro?: number; // precio del litro (Gs.) — default nafta 93 Petropar
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const viajesDia = Math.max(1, Number(i.viajesDia ?? 2));
  const diasMes = Math.max(1, Number(i.diasMes ?? 22));
  const tarifa = Number(i.tarifa) > 0 ? Number(i.tarifa) : 3400;

  const pasajesMes = viajesDia * diasMes;
  const gastoMes = Math.round(pasajesMes * tarifa);
  const gastoAnual = gastoMes * 12;

  // Comparación con auto (opcional).
  const kmDia = Math.max(0, Number(i.kmDia) || 0);
  const rend = Math.max(0, Number(i.rend) || 0);
  const precioLitro = Number(i.precioLitro) > 0 ? Number(i.precioLitro) : PP.nafta93;
  let compara = false;
  let gastoAuto = 0;
  let ahorro = 0;
  if (kmDia > 0 && rend > 0) {
    compara = true;
    const litrosMes = (kmDia * diasMes) / rend;
    gastoAuto = Math.round(litrosMes * precioLitro);
    ahorro = gastoAuto - gastoMes;
  }

  const _table = {
    title: 'Tarifas de referencia del transporte público (área metropolitana)',
    headers: ['Servicio', 'Tarifa'],
    rows: [
      ['Convencional (metropolitano)', fmtPYG(2300)],
      ['Diferencial (con aire)', fmtPYG(3400)],
      ['Interno de Asunción (permisionarias)', fmtPYG(2800)],
      ['Ciudad del Este', fmtPYG(5000)],
    ],
    note: 'Tarifas de referencia; el pago es con billetaje electrónico (tarjetas JAHA / MÁS). La tarjeta cuesta aparte (~Gs. 25.000). Ajustá la tarifa a la línea que usás.',
  };

  const _insight = {
    type: 'highlight',
    icon: '🚌',
    text: `Con **${viajesDia} viajes por día**, **${diasMes} días al mes** y una tarifa de **${fmtPYG(tarifa)}**, gastás **${fmtPYG(gastoMes)} por mes** (${fmtPYG(gastoAnual)} al año) en ${pasajesMes} pasajes.` +
      (compara ? ` En auto el mismo mes te costaría ~${fmtPYG(gastoAuto)} de combustible: ${ahorro >= 0 ? `el colectivo te ahorra ${fmtPYG(ahorro)}` : `el auto sale ${fmtPYG(-ahorro)} más`}.` : ''),
  };

  const out: Outputs = {
    gastoMensual: fmtPYG(gastoMes),
    gastoAnual: fmtPYG(gastoAnual),
    pasajesMes: `${pasajesMes} pasajes`,
    detalle: `${viajesDia} viajes/día × ${diasMes} días × ${fmtPYG(tarifa)} = ${fmtPYG(gastoMes)}/mes (${fmtPYG(gastoAnual)}/año).` +
      (compara ? ` En auto: ${fmtPYG(gastoAuto)}/mes de combustible → ${ahorro >= 0 ? `ahorro de ${fmtPYG(ahorro)}` : `${fmtPYG(-ahorro)} más caro`}.` : ''),
    _insight,
    _table,
  };
  if (compara) {
    out.gastoAuto = fmtPYG(gastoAuto);
    out.ahorroVsAuto = fmtPYG(Math.abs(ahorro)) + (ahorro >= 0 ? ' a favor del colectivo' : ' a favor del auto');
  }
  return out;
}
