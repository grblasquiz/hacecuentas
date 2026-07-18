/**
 * Gasto de gasolina en un viaje — República Dominicana. El combustible se vende
 * por GALÓN (galón estadounidense). Estima cuánto gastás según la distancia, el
 * rendimiento del vehículo (km por galón) y el precio del galón (editable; el
 * MICM lo publica cada semana). Opcional: ida y vuelta, y peajes.
 *   galones = distancia ÷ rendimiento (km/galón)
 *   costoCombustible = galones × precioGalón
 *   costoTotal = costoCombustible + peajes
 * Moneda: peso dominicano (RD$).
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  distanciaKm: number;    // distancia de un tramo (km)
  rendimiento: number;    // km por galón
  precioGalon: number;    // RD$ por galón (editable, MICM)
  idaVuelta?: string;     // 'si' => duplica la distancia
  peajes?: number;        // RD$ de peajes (opcional)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const tramo = Math.max(0, num(i.distanciaKm, 0));
  const rendimiento = num(i.rendimiento, 0);
  const precioGalon = num(i.precioGalon, 0);
  if (!(tramo > 0)) throw new Error('Ingresá la distancia del viaje en km');
  if (!(rendimiento > 0)) throw new Error('Ingresá el rendimiento del vehículo en km por galón');
  if (!(precioGalon > 0)) throw new Error('Ingresá el precio del galón en RD$');

  const idaVuelta = String(i.idaVuelta || 'no') === 'si';
  const km = idaVuelta ? tramo * 2 : tramo;
  const peajes = Math.max(0, num(i.peajes, 0));

  const galones = km / rendimiento;
  const costoCombustible = galones * precioGalon;
  const costoTotal = costoCombustible + peajes;
  const costoPorKm = km > 0 ? costoTotal / km : 0;

  const detalle =
    `${km.toLocaleString('de-DE')} km ÷ ${rendimiento} km/galón = ${galones.toFixed(1)} galones. ` +
    `Combustible ${fmtDOP(costoCombustible)}` +
    (peajes > 0 ? ` + peajes ${fmtDOP(peajes)}` : '') +
    ` = ${fmtDOP(costoTotal)}` +
    (idaVuelta ? ` (ida y vuelta).` : `.`);

  const _insight = {
    title: `Viaje estimado: ${fmtDOP(costoTotal)}`,
    text:
      `Recorriendo **${km.toLocaleString('de-DE')} km**${idaVuelta ? ' (ida y vuelta)' : ''} con un rendimiento de **${rendimiento} km/galón**, ` +
      `vas a usar unos **${galones.toFixed(1)} galones** de combustible: **${fmtDOP(costoCombustible)}** a ${fmtDOP(precioGalon)} el galón` +
      (peajes > 0 ? `, más ${fmtDOP(peajes)} de peajes` : '') +
      `. En total, **${fmtDOP(costoTotal)}** (~${fmtDOP(costoPorKm)} por km). El precio del galón lo publica el MICM cada semana: ajustalo al valor vigente.`,
    tone: 'neutral' as const,
    icon: '⛽',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Combustible', value: Math.round(costoCombustible) },
      ...(peajes > 0 ? [{ label: 'Peajes', value: Math.round(peajes) }] : []),
    ],
    prefix: 'RD$',
    centerValue: fmtDOP(costoTotal),
    centerLabel: 'Costo del viaje',
    ariaLabel: 'Composición del costo del viaje: combustible y peajes',
  };

  return {
    galones: `${galones.toFixed(1)} galones`,
    costoCombustible: fmtDOP(costoCombustible),
    costoTotal: fmtDOP(costoTotal),
    costoPorKm: fmtDOP(costoPorKm),
    detalle,
    _insight,
    _chart,
  };
}
