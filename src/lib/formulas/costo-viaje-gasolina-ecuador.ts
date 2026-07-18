/**
 * Costo de gasolina de un viaje — Ecuador (en dólares, combustible por GALÓN).
 *
 * En Ecuador el combustible se vende por galón. El usuario elige el combustible (Extra, Ecopaís,
 * Súper o Diésel) y la calculadora carga el precio oficial vigente del período (editable, por si
 * cambió con las bandas), la distancia del viaje, el rendimiento del auto en km por galón y los
 * peajes. Devuelve galones necesarios, costo de combustible, costo total y costo por km.
 *
 * Precios importados de la data país (NO hardcodear).
 */
import { COMBUSTIBLES_EC_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  distanciaKm: number;    // distancia del viaje (km)
  kmPorGalon: number;     // rendimiento del vehículo (km por galón)
  combustible?: string;   // 'extra' | 'ecopais' | 'super' | 'diesel'
  precioGalon?: number;   // precio USD/galón (opcional: pisa el precio cargado)
  peajes?: number;        // peajes del viaje (USD)
  idaVuelta?: string;     // 'si' duplica la distancia
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const P = COMBUSTIBLES_EC_2026.precios;
  const key = (i.combustible && P[i.combustible as keyof typeof P]) ? i.combustible as keyof typeof P : 'extra';
  const comb = P[key];

  let distancia = Math.max(0, Number(i.distanciaKm) || 0);
  if (distancia <= 0) throw new Error('Ingresá la distancia del viaje en kilómetros.');
  if ((i.idaVuelta ?? 'no') === 'si') distancia *= 2;

  const kmGal = Math.max(0, Number(i.kmPorGalon) || 0);
  if (kmGal <= 0) throw new Error('Ingresá el rendimiento del vehículo en km por galón (por ejemplo 40).');

  const precioRaw = i.precioGalon;
  const precio = (precioRaw !== undefined && precioRaw !== null && (precioRaw as any) !== '' && Number(precioRaw) > 0)
    ? Number(precioRaw)
    : comb.usdGalon;

  const peajes = Math.max(0, Number(i.peajes) || 0);

  const galones = distancia / kmGal;
  const costoCombustible = galones * precio;
  const costoTotal = costoCombustible + peajes;
  const costoPorKm = distancia > 0 ? costoTotal / distancia : 0;

  const _insight = {
    title: `Este viaje te cuesta ${fmtUSDec(costoTotal)}`,
    text: `Recorrer **${distancia.toLocaleString('es-EC')} km** con un rendimiento de **${kmGal} km/galón** consume **${galones.toFixed(2)} galones** de ${comb.label}. A **${fmtUSDec(precio)}/galón** son **${fmtUSDec(costoCombustible)}** de combustible${peajes > 0 ? ` más ${fmtUSDec(peajes)} de peajes` : ''}, o sea **${fmtUSDec(costoTotal)}** en total (**${fmtUSDec(costoPorKm)} por km**).`,
    tone: 'neutral',
    icon: '⛽',
  };

  const _chart = peajes > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Combustible', value: Math.round(costoCombustible * 100) / 100 },
      { label: 'Peajes', value: Math.round(peajes * 100) / 100 },
    ],
    prefix: '$ ',
    centerValue: fmtUSDec(costoTotal),
    centerLabel: 'Costo del viaje',
    ariaLabel: `Combustible ${fmtUSDec(costoCombustible)} más peajes ${fmtUSDec(peajes)} = ${fmtUSDec(costoTotal)}.`,
  } : undefined;

  return {
    galones: Math.round(galones * 100) / 100,
    costoCombustible: fmtUSDec(costoCombustible),
    costoTotal: fmtUSDec(costoTotal),
    costoPorKm: fmtUSDec(costoPorKm),
    detalle: `${distancia.toLocaleString('es-EC')} km ÷ ${kmGal} km/galón = ${galones.toFixed(2)} galones × ${fmtUSDec(precio)} = ${fmtUSDec(costoCombustible)}${peajes > 0 ? ` + ${fmtUSDec(peajes)} peajes` : ''} = ${fmtUSDec(costoTotal)} (${comb.label}).`,
    _insight,
    _chart,
  };
}
