/**
 * Calculadora de Millas United (MileagePlus) — Saver awards aproximados 2026.
 *
 * Matriz millas: destino × cabina × tipoViaje. Antes el código tenía un bug:
 * usaba una tupla [ida, ida-vuelta, business] y si el usuario elegía
 * business + ida-vuelta, ignoraba la ida-vuelta y devolvía el valor de
 * business (que ya era ida-vuelta en realidad). Ahora los 4 casos explícitos.
 *
 * Valor promedio de milla United: 1,3 centavos USD (ver "The Points Guy" 2026).
 */

export interface MillasUnitedMileageplusInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
}
export interface MillasUnitedMileageplusOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
  cabinaAplicada: string;
  tipoViajeAplicado: string;
  _insight?: any;
}

interface TarifaMillas {
  economyIda: number;
  economyIdaVuelta: number;
  businessIda: number;
  businessIdaVuelta: number;
}

const DEST_MILES: Record<string, TarifaMillas> = {
  nyc:     { economyIda: 10_000, economyIdaVuelta: 20_000, businessIda: 35_000,  businessIdaVuelta: 70_000 },
  la:      { economyIda: 10_000, economyIdaVuelta: 20_000, businessIda: 35_000,  businessIdaVuelta: 70_000 },
  londres: { economyIda: 30_000, economyIdaVuelta: 60_000, businessIda: 60_000,  businessIdaVuelta: 120_000 },
  paris:   { economyIda: 30_000, economyIdaVuelta: 60_000, businessIda: 60_000,  businessIdaVuelta: 120_000 },
  tokio:   { economyIda: 35_000, economyIdaVuelta: 70_000, businessIda: 80_000,  businessIdaVuelta: 160_000 },
  sydney:  { economyIda: 40_000, economyIdaVuelta: 80_000, businessIda: 85_000,  businessIdaVuelta: 170_000 },
};

/** Valor cents por milla United (ref. The Points Guy Monthly Valuations 2026). */
const VALOR_CENTAVOS_POR_MILLA = 1.3;

export function millasUnitedMileageplus(i: MillasUnitedMileageplusInputs): MillasUnitedMileageplusOutputs {
  const dest = String(i.destino || '').toLowerCase();
  const cab = String(i.cabina || 'economy').toLowerCase();
  const viaje = String(i.tipoViaje || 'ida-vuelta').toLowerCase();

  const tarifa = DEST_MILES[dest];
  if (!tarifa) throw new Error('Destino inválido');
  if (cab !== 'economy' && cab !== 'business') throw new Error('Cabina debe ser economy o business');
  if (viaje !== 'ida' && viaje !== 'ida-vuelta') throw new Error('Tipo de viaje debe ser ida o ida-vuelta');

  let millas: number;
  if (cab === 'business' && viaje === 'ida-vuelta') millas = tarifa.businessIdaVuelta;
  else if (cab === 'business') millas = tarifa.businessIda;
  else if (viaje === 'ida-vuelta') millas = tarifa.economyIdaVuelta;
  else millas = tarifa.economyIda;

  const valor = (millas * VALOR_CENTAVOS_POR_MILLA) / 100;

  const cabLabel = cab === 'business' ? 'Business' : 'Economy';
  const viajeLabel = viaje === 'ida-vuelta' ? 'ida y vuelta' : 'solo ida';

  return {
    millasRequeridas: millas,
    impuestos: 'USD 140–300 aprox según ruta (tasas y fees). No se pueden cubrir con millas.',
    valorEstimadoUsd: Number(valor.toFixed(2)),
    cabinaAplicada: cab === 'business' ? 'Business' : 'Economy',
    tipoViajeAplicado: viaje === 'ida-vuelta' ? 'Ida y vuelta' : 'Solo ida',
    _insight: {
      title: 'Lo que rinde este canje',
      text: `Para ${cabLabel} ${viajeLabel} necesitás **${millas.toLocaleString('es-AR')} millas MileagePlus**, un canje valuado en **USD ${valor.toFixed(2)}** (a 1,3¢ por milla, ref. The Points Guy). Las tasas e impuestos (USD 140-300) se pagan en plata, no con millas.`,
      tone: 'neutral',
      icon: '✈️'
    },
  };
}
