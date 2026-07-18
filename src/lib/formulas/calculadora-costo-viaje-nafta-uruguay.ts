/**
 * Costo de un viaje en auto en Uruguay: nafta (ANCAP) + peajes (CVU/MTOP).
 *
 * litros = distanciaKm × (rendimientoL100km / 100)
 * costoCombustible = litros × precio del litro (Súper 95 o Gasoil 50S)
 * costoPeajes = cantidadPeajes × tarifa (Telepeaje $167 o efectivo $196,57, cat. 1)
 * total = costoCombustible + costoPeajes  (×2 si es ida y vuelta)
 *
 * Fuente: ANCAP/URSEA (combustibles, jul-2026) y CVU/MTOP (peajes, jun-2026).
 */
import { COMBUSTIBLE_UY, PEAJE_UY_2026, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Distancia solo ida, en km. */
  distanciaKm: number;
  /** ¿Ida y vuelta? */
  idaYVuelta: 'si' | 'no';
  /** Rendimiento del auto en litros cada 100 km. */
  rendimiento: number;
  /** Combustible. */
  tipoCombustible: 'super95' | 'gasoil50s';
  /** Cantidad de peajes por tramo (solo ida). */
  cantidadPeajes: number;
  /** ¿Pagás con Telepeaje? */
  telepeaje: 'si' | 'no';
}

export interface Outputs {
  total: string;
  costoCombustible: string;
  costoPeajes: string;
  litros: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const distancia = Math.max(0, Number(i.distanciaKm) || 0);
  const rendimiento = Math.max(0.1, Number(i.rendimiento) || 7);
  const cantidadPeajes = Math.max(0, Math.round(Number(i.cantidadPeajes) || 0));
  const ida = i.idaYVuelta === 'si' ? 2 : 1;
  const usaTele = i.telepeaje !== 'no';
  const esGasoil = i.tipoCombustible === 'gasoil50s';

  const precioLitro = esGasoil ? COMBUSTIBLE_UY.gasoil50s : COMBUSTIBLE_UY.super95;
  const tarifaPeaje = usaTele ? PEAJE_UY_2026.autoTelepeaje : PEAJE_UY_2026.autoEfectivo;

  const distanciaTotal = distancia * ida;
  const litros = distanciaTotal * (rendimiento / 100);
  const costoCombustible = litros * precioLitro;
  const costoPeajes = cantidadPeajes * ida * tarifaPeaje;
  const total = costoCombustible + costoPeajes;

  const nombreComb = esGasoil ? 'Gasoil 50S' : 'Nafta Súper 95';
  const detalle =
    `${distanciaTotal} km ${ida === 2 ? '(ida y vuelta)' : '(solo ida)'} a ${rendimiento} L/100 km = ${litros.toFixed(2)} litros. ` +
    `${litros.toFixed(2)} L × ${fmtUYU(precioLitro)} (${nombreComb}) = ${fmtUYU(costoCombustible)}. ` +
    `Peajes: ${cantidadPeajes * ida} × ${fmtUYU(tarifaPeaje)} (${usaTele ? 'Telepeaje' : 'efectivo'}) = ${fmtUYU(costoPeajes)}. ` +
    `Costo total del viaje: ${fmtUYU(total)}.`;

  const ahorroTele = cantidadPeajes * ida * (PEAJE_UY_2026.autoEfectivo - PEAJE_UY_2026.autoTelepeaje);

  return {
    total: fmtUYU(total),
    costoCombustible: fmtUYU(costoCombustible),
    costoPeajes: fmtUYU(costoPeajes),
    litros: `${litros.toFixed(2)} L`,
    detalle,
    _insight: {
      type: 'highlight',
      icon: '⛽',
      tone: 'info' as const,
      text:
        `El viaje de ${distanciaTotal} km cuesta unos **${fmtUYU(total)}**: ${fmtUYU(costoCombustible)} de ${nombreComb} y ${fmtUYU(costoPeajes)} de peajes. ` +
        (cantidadPeajes > 0
          ? `Con Telepeaje ahorrás **${fmtUYU(ahorroTele)}** frente a pagar los peajes en efectivo.`
          : `La Súper 95 está a ${fmtUYU(COMBUSTIBLE_UY.super95)}/L, de las más caras de la región.`),
    },
    _table: {
      title: 'Costo estimado por distancia (Súper 95, 7 L/100 km, sin peajes)',
      headers: ['Distancia (ida)', 'Litros', 'Nafta'],
      rows: [100, 200, 300, 500].map((km) => {
        const l = km * (7 / 100);
        return [`${km} km`, `${l.toFixed(1)} L`, fmtUYU(l * COMBUSTIBLE_UY.super95)];
      }),
      note:
        'Súper 95 a $88,67/L y Gasoil 50S a $58,68/L (ANCAP/URSEA, jul-2026). Peajes categoría 1: $167 Telepeaje / $196,57 efectivo (CVU/MTOP, jun-2026). Precios sujetos a ajuste.',
    },
  };
}
