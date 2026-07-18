/**
 * Casetas + gasolina México 2026 — costo total de un viaje en carretera.
 * Unidades mexicanas: km por LITRO y pesos MXN (el motor de peajes CO usa
 * galones/COP, por eso esta fórmula es propia). El total de casetas lo ingresa
 * el usuario desde Traza tu Ruta (SICT) o las tarifas vigentes de CAPUFE;
 * default de gasolina desde src/lib/data/mexico-2026.ts (magna promedio jul-2026).
 */
import { GASOLINA_MAGNA_LITRO_JUL_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  distanciaKm: number;        // distancia de ida
  rendimientoKmL?: number;    // km por litro del vehículo
  precioLitro?: number;       // $/litro (editable; default magna promedio)
  totalCasetas?: number;      // suma de casetas de IDA (Traza tu Ruta / CAPUFE)
  tipoViaje?: string;         // 'ida' | 'ida-vuelta'
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const distancia = num(i.distanciaKm, 0);
  if (!(distancia > 0)) throw new Error('Ingresa la distancia de tu ruta en kilómetros');
  const rendimiento = num(i.rendimientoKmL, 12);
  if (!(rendimiento > 0)) throw new Error('Ingresa el rendimiento de tu vehículo en km por litro');
  const precioLitro = Math.max(0, num(i.precioLitro, GASOLINA_MAGNA_LITRO_JUL_2026));
  const casetasIda = Math.max(0, num(i.totalCasetas, 0));
  const trayectos = String(i.tipoViaje || 'ida-vuelta') === 'ida' ? 1 : 2;

  const kmTotales = distancia * trayectos;
  const litros = kmTotales / rendimiento;
  const costoGasolina = round2(litros * precioLitro);
  const costoCasetas = round2(casetasIda * trayectos);
  const total = round2(costoGasolina + costoCasetas);
  const costoPorKm = kmTotales > 0 ? round2(total / kmTotales) : 0;

  const fmtL = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 1 });
  const detalle = `${fmtL(kmTotales)} km ${trayectos === 2 ? '(ida y vuelta)' : '(solo ida)'} ÷ ${fmtL(rendimiento)} km/L = ${fmtL(litros)} L × ${fmtMXN(precioLitro)} = ${fmtMXN(costoGasolina)} de gasolina + ${fmtMXN(costoCasetas)} de casetas = ${fmtMXN(total)}.`;

  const _insight = {
    title: 'Costo total de tu viaje en carretera',
    text: `El viaje de **${fmtL(kmTotales)} km** requiere unos **${fmtL(litros)} litros** de gasolina (**${fmtMXN(costoGasolina)}**) más **${fmtMXN(costoCasetas)}** de casetas: **${fmtMXN(total)}** en total, es decir **${fmtMXN(costoPorKm)} por km**. ${casetasIda === 0 ? 'No ingresaste casetas: si vas por autopista de cuota, suma las de tu ruta con Traza tu Ruta de la SICT.' : 'Si van varios, divide el total entre los pasajeros para comparar contra el autobús.'}`,
    tone: 'neutral',
    icon: '🛣️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Gasolina', value: Math.round(costoGasolina) },
      { label: 'Casetas', value: Math.round(costoCasetas) },
    ].filter((s) => s.value > 0),
    centerValue: fmtMXN(total),
    centerLabel: 'Costo del viaje',
    prefix: '$ ',
    ariaLabel: `Gasolina ${fmtMXN(costoGasolina)} y casetas ${fmtMXN(costoCasetas)}: total ${fmtMXN(total)}.`,
  };

  return {
    distanciaTotal: `${fmtL(kmTotales)} km ${trayectos === 2 ? '(ida y vuelta)' : '(solo ida)'}`,
    gasolinaEstimada: `${fmtL(litros)} L — ${fmtMXN(costoGasolina)}`,
    casetasTotales: fmtMXN(costoCasetas),
    costoTotalViaje: fmtMXN(total),
    costoPorKm: fmtMXN(costoPorKm),
    detalle,
    _insight,
    _chart,
  };
}
