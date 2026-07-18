/**
 * Costo de viaje en gasolina — Perú (GALONES, como se vende en los grifos).
 * Galones = km del viaje ÷ rendimiento (km por galón) · Costo = galones × precio por galón.
 * En julio 2026 el gasohol 90 en Lima ronda S/ 15,70-21,50 por galón según el grifo
 * (consulta el precio exacto en Facilito de Osinergmin). Un auto sedán promedio rinde
 * 35-50 km/galón en carretera.
 */
import { fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  km?: number | string;          // distancia del viaje (solo ida)
  rendimiento?: number | string; // km por galón
  precio?: number | string;      // precio por galón (S/)
  idaVuelta?: string;            // 'no' | 'si'
  peajes?: number | string;      // peajes totales del recorrido (S/)
  pasajeros?: number | string;   // para dividir el gasto
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const kmBase = Math.max(0, Number(i.km) || 0);
  const rendimiento = Math.max(1, Number(i.rendimiento) || 40);
  const precio = Math.max(0, Number(i.precio) || 0);
  const idaVuelta = String(i.idaVuelta || 'no') === 'si';
  const peajes = Math.max(0, Number(i.peajes) || 0);
  const pasajeros = Math.max(1, Math.floor(Number(i.pasajeros) || 1));

  const km = idaVuelta ? kmBase * 2 : kmBase;
  const galones = km / rendimiento;
  const combustible = galones * precio;
  const total = combustible + peajes;
  const porPasajero = total / pasajeros;
  const porKm = km > 0 ? total / km : 0;

  const _insight = {
    title: 'Tu gasto de viaje',
    text: `${idaVuelta ? 'Ida y vuelta' : 'Solo ida'} de **${km.toLocaleString('de-DE')} km** consume **${galones.toFixed(2)} galones** (a ${rendimiento} km/galón): **${fmtPEN2(combustible)}** de combustible${peajes > 0 ? ` + ${fmtPEN2(peajes)} de peajes = **${fmtPEN2(total)}** en total` : ''}${pasajeros > 1 ? `, o sea **${fmtPEN2(porPasajero)} por persona** entre ${pasajeros}` : ''}. Antes de salir, compara precios por grifo en Facilito (Osinergmin): entre el grifo más caro y el más barato de Lima hay más de S/ 5 por galón de diferencia.`,
    tone: 'neutral',
    icon: '⛽',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Combustible', value: Math.round(combustible * 100) / 100 },
      ...(peajes > 0 ? [{ label: 'Peajes', value: Math.round(peajes * 100) / 100 }] : []),
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN2(total),
    centerLabel: pasajeros > 1 ? `${fmtPEN2(porPasajero)} c/u` : 'Total',
    ariaLabel: `Viaje de ${km} km: ${fmtPEN2(combustible)} de combustible${peajes > 0 ? ` y ${fmtPEN2(peajes)} de peajes` : ''}.`,
  };

  return {
    galones: `${galones.toFixed(2)} galones`,
    costoCombustible: fmtPEN2(combustible),
    costoTotal: fmtPEN2(total),
    porPasajero: pasajeros > 1 ? fmtPEN2(porPasajero) : fmtPEN2(total),
    costoPorKm: `${fmtPEN2(porKm)}/km`,
    detalle: `${km.toLocaleString('de-DE')} km ÷ ${rendimiento} km/galón = ${galones.toFixed(2)} gal × ${fmtPEN2(precio)} = ${fmtPEN2(combustible)}${peajes > 0 ? ` + peajes ${fmtPEN2(peajes)} = ${fmtPEN2(total)}` : ''}${pasajeros > 1 ? ` (${fmtPEN2(porPasajero)} por pasajero)` : ''}.`,
    _insight,
    _chart,
  };
}
