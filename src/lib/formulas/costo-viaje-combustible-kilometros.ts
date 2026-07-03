export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function costoViajeCombustibleKilometros(i: Inputs): Outputs {
  const kmBase = Number(i.km) || 0;
  const r = Number(i.rend) || 1;
  const p = Number(i.precio) || 0;
  // --- Planificador integral (opcionales, backward-compatible) ---
  const idaVuelta = String(i.ida_vuelta ?? 'no') === 'si';
  const pasajeros = Math.max(1, Math.floor(Number(i.pasajeros) || 1));
  const peajes = Math.max(0, Number(i.peajes) || 0);
  const estacionamiento = Math.max(0, Number(i.estacionamiento) || 0);
  const comidas = Math.max(0, Number(i.comidas) || 0);
  const alojamiento = Math.max(0, Number(i.alojamiento) || 0);

  const km = idaVuelta ? kmBase * 2 : kmBase; // default 'no' → km == kmBase (sin cambios)
  const l = km / r;
  const c = l * p;
  const perKm = km > 0 ? c / km : 0;

  const extras = peajes + estacionamiento + comidas + alojamiento;
  const costoTotal = c + extras;
  const costoPorPasajero = costoTotal / pasajeros;

  const fmt = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  const _insight = {
    title: 'Tu costo de viaje',
    text:
      `${idaVuelta ? 'Ida y vuelta' : 'Solo ida'} de **${fmt(km)} km** consume **${l.toFixed(1)} L** ` +
      `(**$${fmt(c)}** de nafta)` +
      (extras > 0 ? `; con peajes y otros gastos, el viaje sale **$${fmt(costoTotal)}** en total` : '') +
      (pasajeros > 1 ? `, **$${fmt(costoPorPasajero)} por pasajero** entre ${pasajeros}` : '') +
      '.',
    tone: 'neutral',
    icon: '⛽',
  };

  return {
    litros: `${l.toFixed(1)} L`,
    costo: `$${fmt(c)}`,
    perKm: `$${perKm.toFixed(2)}/km`,
    costo_total: `$${fmt(costoTotal)}`,
    costo_por_pasajero: `$${fmt(costoPorPasajero)}`,
    resumen: `${fmt(km)} km${idaVuelta ? ' (ida y vuelta)' : ''} = ${l.toFixed(1)} L → $${fmt(c)} nafta${extras > 0 ? ` + $${fmt(extras)} extras = $${fmt(costoTotal)}` : ''}${pasajeros > 1 ? ` ($${fmt(costoPorPasajero)}/pasajero)` : ''}.`,
    _insight,
  };
}
