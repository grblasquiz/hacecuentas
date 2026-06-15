/**
 * Planilla de luz residencial — Ecuador (CNEL / EEQ), año 2026.
 * Estima el valor de la planilla eléctrica a partir del consumo en kWh:
 *   - Tarifa Dignidad ($0,04/kWh) si el consumo está dentro del límite regional
 *     (110 kWh Sierra / 130 kWh Costa-Oriente-Insular) y el abonado califica.
 *   - Tarifa residencial general por bloques crecientes (~$0,091/kWh primer bloque)
 *     más el cargo fijo de comercialización ($1,414/mes), si no califica al subsidio.
 *   - Alumbrado público: cargo municipal (GAD) opcional, modelado como % del cargo de
 *     energía (default 0%; los totales publicados por CNEL ya excluyen este rubro).
 * Montos en USD (Ecuador dolarizado, sin conversión de moneda).
 * Fuente: Pliego Tarifario SPEE 2026, Resolución ARCONEL-029/25; ARCONEL Tarifa Dignidad; CNEL EP.
 */
import { TARIFA_ELECTRICA_EC_2026 as T, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  /** Consumo del mes en kilovatios-hora (kWh). */
  consumoKwh: number;
  /** Región para el límite de la Tarifa Dignidad: 'costa' (130 kWh) o 'sierra' (110 kWh). */
  region?: 'costa' | 'sierra';
  /** ¿Califica a la Tarifa Dignidad? (estuvo bajo el límite 11 de los últimos 12 meses). */
  calificaDignidad?: boolean;
  /** Porcentaje de alumbrado público sobre el cargo de energía (default 0%; cargo municipal opcional). */
  alumbradoPct?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Calcula el cargo de energía residencial general por bloques crecientes (USD). */
function energiaPorBloques(kwh: number): number {
  let restante = kwh;
  let costo = 0;
  let pisoAnterior = 0;
  for (const b of T.bloques) {
    if (restante <= 0) break;
    const anchoBloque = b.hasta - pisoAnterior;
    const kwhEnBloque = Math.min(restante, anchoBloque);
    costo += kwhEnBloque * b.usdKwh;
    restante -= kwhEnBloque;
    pisoAnterior = b.hasta;
  }
  return costo;
}

export function compute(i: Inputs): Outputs {
  const kwh = Number(i.consumoKwh) || 0;
  if (kwh <= 0) throw new Error('Ingresá tu consumo del mes en kWh (debe ser mayor a 0).');

  const region = i.region === 'sierra' ? 'sierra' : 'costa';
  const limiteDignidad = region === 'sierra' ? T.limiteDignidadSierra : T.limiteDignidadCosta;
  const califica = i.calificaDignidad !== false; // por defecto asumimos que califica si está dentro del límite

  // Alumbrado público: % sobre el cargo de energía (default 0%; cargo municipal/GAD opcional,
  // no incluido en los totales de referencia publicados por CNEL EP).
  const alumbradoPctRaw = i.alumbradoPct;
  const alumbradoPct = (alumbradoPctRaw === undefined || alumbradoPctRaw === null || (alumbradoPctRaw as any) === '' || !Number.isFinite(Number(alumbradoPctRaw)))
    ? 0
    : Number(alumbradoPctRaw);
  const alumbradoFactor = Math.max(0, alumbradoPct) / 100;

  // ¿Se aplica la Tarifa Dignidad? Sólo si el consumo está dentro del límite Y el abonado califica.
  const dentroLimite = kwh <= limiteDignidad;
  const aplicaDignidad = dentroLimite && califica;

  let cargoEnergia: number;
  let comercializacion: number;
  let tarifaAplicada: string;
  let tarifaPromedioKwh: number;

  if (aplicaDignidad) {
    // Tarifa Dignidad: $0,04/kWh, sin cargo de comercialización separado.
    cargoEnergia = kwh * T.tarifaDignidad;
    comercializacion = 0;
    tarifaAplicada = 'Tarifa Dignidad ($0,04/kWh)';
    tarifaPromedioKwh = T.tarifaDignidad;
  } else {
    // Residencial general por bloques + cargo fijo de comercialización.
    cargoEnergia = energiaPorBloques(kwh);
    comercializacion = T.comercializacion;
    tarifaAplicada = 'Residencial general (por bloques)';
    tarifaPromedioKwh = cargoEnergia / kwh;
  }

  const alumbradoPublico = cargoEnergia * alumbradoFactor;
  const totalPlanilla = cargoEnergia + comercializacion + alumbradoPublico;
  const costoMedioPorKwh = totalPlanilla / kwh;

  // Cuánto pagaría con la otra tarifa (para el insight de pérdida del subsidio).
  let ahorroDignidad = 0;
  if (aplicaDignidad) {
    const energiaSinSubsidio = energiaPorBloques(kwh);
    const alumbradoSinSubsidio = energiaSinSubsidio * alumbradoFactor;
    const totalSinSubsidio = energiaSinSubsidio + T.comercializacion + alumbradoSinSubsidio;
    ahorroDignidad = totalSinSubsidio - totalPlanilla;
  }

  const _insight = aplicaDignidad
    ? {
        title: 'Estás dentro de la Tarifa Dignidad',
        text: `Con **${kwh} kWh** pagás **${fmtUSDec(totalPlanilla)}** a $0,04/kWh. Si te pasaras de **${limiteDignidad} kWh** perderías el subsidio y la misma planilla costaría cerca de **${fmtUSDec(totalPlanilla + ahorroDignidad)}**, o sea ${fmtUSDec(ahorroDignidad)} más. El subsidio se mantiene si estás bajo el límite en 11 de los últimos 12 meses.`,
        tone: 'positive',
        icon: '💡',
      }
    : {
        title: 'Tarifa residencial general',
        text: `Con **${kwh} kWh** tu planilla es **${fmtUSDec(totalPlanilla)}** (energía ${fmtUSDec(cargoEnergia)} + comercialización ${fmtUSDec(comercializacion)} + alumbrado ${fmtUSDec(alumbradoPublico)}). ${kwh > limiteDignidad ? `Estás por encima del límite de la Tarifa Dignidad (${limiteDignidad} kWh): bajar tu consumo a ${limiteDignidad} kWh o menos te llevaría a $0,04/kWh.` : `No estás aplicando la Tarifa Dignidad; verificá con CNEL si calificás.`}`,
        tone: kwh > limiteDignidad ? 'warning' : 'neutral',
        icon: '🔌',
      };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Energía consumida', value: Math.round(cargoEnergia * 100) / 100 },
      { label: 'Comercialización (fijo)', value: Math.round(comercializacion * 100) / 100 },
      { label: 'Alumbrado público', value: Math.round(alumbradoPublico * 100) / 100 },
    ],
    ariaLabel: `Energía ${fmtUSDec(cargoEnergia)}, comercialización ${fmtUSDec(comercializacion)} y alumbrado público ${fmtUSDec(alumbradoPublico)}.`,
  };

  return {
    totalPlanilla: fmtUSDec(totalPlanilla),
    cargoEnergia: fmtUSDec(cargoEnergia),
    comercializacion: fmtUSDec(comercializacion),
    alumbradoPublico: fmtUSDec(alumbradoPublico),
    tarifaAplicada,
    costoMedioPorKwh: fmtUSDec(costoMedioPorKwh) + '/kWh',
    detalle: `Consumo ${kwh} kWh · ${tarifaAplicada} (${fmtUSDec(tarifaPromedioKwh)}/kWh) · Energía ${fmtUSDec(cargoEnergia)} + Comercialización ${fmtUSDec(comercializacion)} + Alumbrado ${fmtUSDec(alumbradoPublico)} = ${fmtUSDec(totalPlanilla)}.`,
    _insight,
    _chart,
  };
}
