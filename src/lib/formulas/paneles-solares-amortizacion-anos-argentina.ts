/** Años para amortizar una instalación solar on-grid en Argentina.
 *
 *  QUÉ ESTABA MAL: la generación estaba CLAVADA en 1.500 kWh/año por kWp
 *  instalado para todo el país, ignorando las horas de sol pico de la región y
 *  la orientación del techo. Con eso, un sistema de 4,95 kWp en Patagonia sur
 *  con el techo mirando al sur declaraba 7.425 kWh/año contra unos 3.100
 *  reales: prometía repago en 5,7 años cuando el número honesto es más del
 *  doble. Era el error más caro de la calculadora, porque el repago es
 *  exactamente lo que el usuario viene a mirar.
 *
 *  AHORA: generación = kWp × HSP × factor_orientación × 365 × η
 *  con η = 0,80 (misma eficiencia global de sistema que usa
 *  `ahorro-energia-solar-paneles.ts`: inversor, cableado, temperatura, suciedad).
 *
 *  La tabla de HSP por región y los factores de orientación son los mismos
 *  criterios ya adoptados por el hub `/construccion/paneles-solares`
 *  (`src/lib/hubs/paneles-solares.ts`), con la misma fuente: Global Solar Atlas
 *  (ESMAP / Banco Mundial / Solargis) para la irradiación y la metodología
 *  PVWatts (NREL) corregida al hemisferio sur para la orientación —acá el sol
 *  pasa por el NORTE, así que el techo bueno mira al norte.
 *
 *  NOTA para quien mantenga esto: el hub declara su propia copia de estas dos
 *  tablas. Cuando se pueda tocar el hub, debería importarlas de acá y borrar la
 *  copia, para que no se separen con el tiempo.
 *
 *  DEFAULT: si no se elige región ni orientación se asume GBA con techo al
 *  norte (4,3 HSP × 1,0), que da 1.256 kWh/kWp/año. El viejo 1.500 equivalía a
 *  5,14 HSP: optimista incluso para el NOA con techo perfecto.
 */

/** Horas de sol pico diarias, promedio anual sobre plano inclinado. Global Solar Atlas. */
export const REGIONES_HSP: Record<string, { label: string; hsp: number }> = {
  gba: { label: 'CABA, GBA y provincia de Buenos Aires', hsp: 4.3 },
  litoral: { label: 'Litoral (Santa Fe, Entre Ríos, Corrientes, Misiones)', hsp: 4.5 },
  cordoba: { label: 'Córdoba y centro del país', hsp: 4.8 },
  cuyo: { label: 'Cuyo (Mendoza, San Juan, San Luis)', hsp: 5.4 },
  noa: { label: 'NOA (Salta, Tucumán, Catamarca, La Rioja, Santiago)', hsp: 5.8 },
  puna: { label: 'Puna y alta montaña (Jujuy, oeste de Salta)', hsp: 6.2 },
  patagoniaN: { label: 'Patagonia norte (Neuquén, Río Negro, La Pampa)', hsp: 4.4 },
  patagoniaS: { label: 'Patagonia sur (Chubut, Santa Cruz, Tierra del Fuego)', hsp: 3.6 },
};

/** Castigo por orientación e inclinación del techo. PVWatts (NREL), hemisferio sur. */
export const ORIENTACIONES_FACTOR: Record<string, { label: string; factor: number }> = {
  norte_optima: { label: 'Al norte, con inclinación pareja al techo', factor: 1 },
  norte_plano: { label: 'Al norte pero techo plano o casi plano', factor: 0.95 },
  diagonal: { label: 'Al noreste o al noroeste', factor: 0.93 },
  este_oeste: { label: 'Al este o al oeste', factor: 0.82 },
  sombra: { label: 'Con sombra parcial (árbol, medianera, tanque)', factor: 0.75 },
  sur: { label: 'Al sur (la peor orientación en Argentina)', factor: 0.6 },
};

/** Eficiencia global del sistema (inversor + cableado + temperatura + suciedad). */
export const EFICIENCIA_SISTEMA = 0.80;

/** Porcentaje de la tarifa que se reconoce por el kWh inyectado (Ley 27.424). */
export const FACTOR_INYECCION_RED = 0.7;

export interface Inputs {
  consumoKwhMes: number;
  tarifaArsKwh: number;
  potenciaInstaladaKw: number;
  costoInstalacionUsd: number;
  tipoCambio: number;
  /** Clave de REGIONES_HSP. Default 'gba'. */
  region?: string;
  /** Clave de ORIENTACIONES_FACTOR. Default 'norte_optima'. */
  orientacion?: string;
  /** HSP medidas del sitio. Si viene, pisa a región + orientación. */
  hspPersonalizado?: number;
}
export interface Outputs {
  generacionAnualKwh: number;
  hspEfectivas: number;
  ahorroAnualArs: number;
  ahorroAnualUsd: number;
  anosAmortizacion: number;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function panelesSolaresAmortizacionAnosArgentina(i: Inputs): Outputs {
  const consumo = Number(i.consumoKwhMes);
  const tarifa = Number(i.tarifaArsKwh);
  const kwInst = Number(i.potenciaInstaladaKw);
  const costo = Number(i.costoInstalacionUsd);
  const tc = Number(i.tipoCambio);
  if (!consumo || !tarifa || !kwInst || !costo || !tc) throw new Error('Completá todos los campos');

  const regionKey = REGIONES_HSP[String(i.region || '')] ? String(i.region) : 'gba';
  const orientKey = ORIENTACIONES_FACTOR[String(i.orientacion || '')] ? String(i.orientacion) : 'norte_optima';
  const region = REGIONES_HSP[regionKey];
  const orientacion = ORIENTACIONES_FACTOR[orientKey];

  const hspRaw = Number(i.hspPersonalizado);
  const hspEfectivas = Number.isFinite(hspRaw) && hspRaw > 0
    ? hspRaw
    : region.hsp * orientacion.factor;

  // Generación real: kWp × HSP efectivas × 365 días × eficiencia del sistema.
  // ANTES: `const generacionAnual = kwInst * 1500;` — constante nacional que
  // ignoraba el sol del lugar y la orientación del techo.
  const generacionAnual = kwInst * hspEfectivas * 365 * EFICIENCIA_SISTEMA;

  const consumoAnual = consumo * 12;
  const inyectado = Math.max(0, generacionAnual - consumoAnual);
  const autoconsumido = Math.min(generacionAnual, consumoAnual);
  // Inyección a red bajo Ley 27.424 se paga ~70% de la tarifa final
  const ahorroArs = autoconsumido * tarifa + inyectado * tarifa * FACTOR_INYECCION_RED;
  const ahorroUsd = ahorroArs / tc;
  const anos = costo / ahorroUsd;
  const anosR = Number(anos.toFixed(1));

  const tone: 'good' | 'warn' | 'neutral' = anosR <= 6 ? 'good' : (anosR <= 10 ? 'neutral' : 'warn');
  const cobertura = consumoAnual > 0 ? Math.round((generacionAnual / consumoAnual) * 100) : 0;
  const notaSol = `Cuenta hecha con ${hspEfectivas.toFixed(2)} horas de sol pico efectivas (${region.label}${orientKey === 'norte_optima' ? '' : `, techo ${orientacion.label.toLowerCase()}`}), o sea ${Math.round(generacionAnual / kwInst)} kWh por kWp al año.`;

  const insightText = anosR <= 6
    ? `Recuperás los **USD ${costo.toLocaleString('es-AR')}** en **${anosR} años** y el sistema dura 25+: amortización rápida para Argentina, con ahorro de **$${ahorroArs.toLocaleString('es-AR')}/año**. ${notaSol}`
    : (anosR <= 10
        ? `La inversión se paga en **${anosR} años** con un ahorro de **$${ahorroArs.toLocaleString('es-AR')}/año**. Razonable frente a una vida útil de 25+ años, pero sensible a la tarifa eléctrica y al tipo de cambio. ${notaSol}`
        : `La amortización tarda **${anosR} años**: la inyección a red se paga al ${Math.round(FACTOR_INYECCION_RED * 100)}% de la tarifa y el excedente generado (${cobertura}% de tu consumo) rinde menos. Revisá si conviene achicar la potencia instalada al consumo real. ${notaSol}`);

  return {
    generacionAnualKwh: Number(generacionAnual.toFixed(0)),
    hspEfectivas: Number(hspEfectivas.toFixed(2)),
    ahorroAnualArs: Number(ahorroArs.toFixed(0)),
    ahorroAnualUsd: Number(ahorroUsd.toFixed(2)),
    anosAmortizacion: anosR,
    explicacion: `Sistema de ${kwInst} kWp con ${hspEfectivas.toFixed(2)} HSP efectivas genera ${generacionAnual.toFixed(0)} kWh/año. Ahorro: $${ahorroArs.toLocaleString('es-AR')} ARS (USD ${ahorroUsd.toFixed(0)}). Amortización: ${anos.toFixed(1)} años.`,
    _insight: {
      title: 'Amortización de tu instalación solar',
      text: insightText,
      tone,
      icon: '☀️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Autoconsumo', value: Math.round(autoconsumido) },
        { label: 'Inyectado a red', value: Math.round(inyectado) },
      ],
      prefix: '',
      centerValue: `${generacionAnual.toFixed(0)} kWh`,
      centerLabel: 'Generación anual',
      ariaLabel: `Generación anual de ${generacionAnual.toFixed(0)} kWh: ${Math.round(autoconsumido)} kWh de autoconsumo y ${Math.round(inyectado)} kWh inyectados a la red`,
    },
  };
}
