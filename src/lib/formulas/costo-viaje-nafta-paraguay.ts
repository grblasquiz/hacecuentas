/**
 * Costo de un viaje en auto — Paraguay (nafta/diésel Petropar).
 *
 * Calcula litros y costo de combustible de un viaje a partir de la distancia, el
 * rendimiento del vehículo (km por litro) y el precio del litro. Trae como defaults
 * los precios vigentes de Petropar (snapshot 1-jul-2026), pero el precio es editable
 * para usar el surtidor de tu preferencia. Suma peajes y reparte por pasajero.
 *
 * Moneda: guaraníes (PYG). Precios de referencia: PETROPAR_2026.
 */
import { fmtPYG, PETROPAR_2026 as PP } from '../data/paraguay-2026.ts';

export interface Inputs {
  km?: number;            // distancia (km)
  rend?: number;          // rendimiento (km por litro)
  combustible?: string;   // '88' | '93' | '97' | 'diesel' — determina el precio default
  precio?: number;        // precio del litro (Gs.) — si se deja vacío usa el de Petropar
  idaVuelta?: string;     // 'si' duplica la distancia
  pasajeros?: number;     // para repartir el costo
  peajes?: number;        // gasto en peajes (Gs.)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function precioDefault(comb: string): number {
  switch (comb) {
    case '88': return PP.nafta88;
    case '97': return PP.nafta97;
    case 'diesel': return PP.dieselPora;
    case '93':
    default: return PP.nafta93;
  }
}

export function compute(i: Inputs): Outputs {
  const kmBase = Math.max(0, Number(i.km) || 0);
  if (kmBase <= 0) throw new Error('Ingresá la distancia del viaje en kilómetros');
  const rend = Number(i.rend) || 0;
  if (rend <= 0) throw new Error('Ingresá el rendimiento del vehículo (km por litro)');
  const comb = String(i.combustible || '93');
  const precio = Number(i.precio) > 0 ? Number(i.precio) : precioDefault(comb);
  const idaVuelta = String(i.idaVuelta || 'no') === 'si';
  const pasajeros = Math.max(1, Math.floor(Number(i.pasajeros) || 1));
  const peajes = Math.max(0, Number(i.peajes) || 0);

  const km = idaVuelta ? kmBase * 2 : kmBase;
  const litros = km / rend;
  const costoNafta = litros * precio;
  const total = costoNafta + peajes;
  const porPasajero = total / pasajeros;
  const porKm = km > 0 ? total / km : 0;

  const nombreComb = comb === 'diesel' ? 'Diésel Porã' : `Nafta ${comb}`;

  const _table = {
    title: 'Precios de referencia Petropar (Gs./litro, 1-jul-2026)',
    headers: ['Combustible', 'Precio por litro'],
    rows: [
      ['Nafta Kape (88)', fmtPYG(PP.nafta88)],
      ['Nafta Oikoite (93)', fmtPYG(PP.nafta93)],
      ['Nafta Aratiri (97)', fmtPYG(PP.nafta97)],
      ['Diésel Porã', fmtPYG(PP.dieselPora)],
      ['Diésel Mbarete', fmtPYG(PP.dieselMbarete)],
    ],
    note: 'Precios de Petropar vigentes al 1-jul-2026. En estaciones privadas (Copetrol, Puma, Shell, etc.) suelen ser algo distintos: usá el precio editable de tu surtidor.',
  };

  const _insight = {
    type: 'highlight',
    icon: '⛽',
    text: `${idaVuelta ? 'Ida y vuelta' : 'Solo ida'} de **${km.toLocaleString('de-DE')} km** con un rendimiento de ${rend} km/L consume **${litros.toFixed(1)} litros** de ${nombreComb}: **${fmtPYG(costoNafta)}** de combustible` +
      (peajes > 0 ? ` (+ ${fmtPYG(peajes)} de peajes = ${fmtPYG(total)})` : '') +
      (pasajeros > 1 ? `, **${fmtPYG(porPasajero)} por pasajero** entre ${pasajeros}` : '') + '.',
  };

  return {
    litros: `${litros.toFixed(1)} L`,
    costoNafta: fmtPYG(costoNafta),
    total: fmtPYG(total),
    porPasajero: fmtPYG(porPasajero),
    porKm: `${fmtPYG(porKm)}/km`,
    detalle: `${km.toLocaleString('de-DE')} km ÷ ${rend} km/L = ${litros.toFixed(1)} L × ${fmtPYG(precio)}/L = ${fmtPYG(costoNafta)}` +
      (peajes > 0 ? ` + ${fmtPYG(peajes)} peajes = ${fmtPYG(total)}` : '') +
      (pasajeros > 1 ? ` (${fmtPYG(porPasajero)} por pasajero)` : '') + '.',
    _insight,
    _table,
  };
}
