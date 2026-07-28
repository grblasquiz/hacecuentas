import type { HubData } from './types';
import { getCalculatorDisclaimer } from '../disclaimers';
import dolarLive from '../../data/live/dolar.json';
import { panelSolarKwConsumoHogarAutoconsumo } from '../formulas/panel-solar-kw-consumo-hogar-autoconsumo';
import { panelesSolaresAmortizacionAnosArgentina } from '../formulas/paneles-solares-amortizacion-anos-argentina';
import { ahorroEnergiaSolarPaneles } from '../formulas/ahorro-energia-solar-paneles';
import { bancoBateriasSolarDiasAutonomia } from '../formulas/banco-baterias-solar-dias-autonomia';
import { compute as tarifaElectrica } from '../formulas/tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3';

/**
 * Hub de decisión — "¿Me conviene poner paneles solares?"
 *
 * Arquetipo: CÁLCULO DOMINANTE (sin `cases`). Una sola cadena de cuentas que
 * arranca en los kWh de la factura y termina en los AÑOS DE REPAGO.
 *
 * DE DÓNDE SALEN LOS NÚMEROS (ninguno está escrito a mano):
 *   dimensionamiento (paneles y kWp)     → panel-solar-kw-consumo-hogar-autoconsumo.ts
 *   eficiencia del sistema (0,80)        → ahorro-energia-solar-paneles.ts
 *   pago de la inyección a red (70%)     → paneles-solares-amortizacion-anos-argentina.ts
 *   generación de referencia kWh/kWp/año → paneles-solares-amortizacion-anos-argentina.ts
 *   m² de techo por panel                → panel-solar-kw-consumo-hogar-autoconsumo.ts
 *   banco de baterías del caso off-grid  → banco-baterias-solar-dias-autonomia.ts
 *   precio marginal del kWh con impuestos→ tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts
 *   tipo de cambio                       → src/data/live/dolar.json (DolarAPI, cron de datos)
 *
 * Lo que el hub agrega y ninguna calc suelta resolvía:
 *  1. encadena las tres cuentas: consumo → kWp → ahorro → repago, sin que el
 *     usuario tenga que copiar el resultado de una calculadora a la otra;
 *  2. la superficie de techo es un TOPE real: si no entran los paneles que
 *     pide tu consumo, el hub recorta el sistema y avisa qué cobertura queda;
 *  3. la orientación del techo castiga las horas de sol pico, que es la
 *     variable que más mueve el repago y ninguna calc pedía;
 *  4. separa on-grid (excedente pagado al 70% bajo Ley 27.424) de off-grid
 *     (excedente perdido + costo del banco de baterías).
 */

/* ────────────────────────────────────────────────────────────────────────────
 * 1. Constantes DERIVADAS de las fórmulas reales
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Eficiencia global del sistema (inversor, cableado, temperatura, suciedad).
 * Se despeja de `ahorro-energia-solar-paneles.ts`, donde vale 0,80 fijo:
 *   kwhMensual = kW × HSP × η × 30  →  η = kwhMensual / (kW × HSP × 30)
 */
export const EFICIENCIA = (() => {
  const out = ahorroEnergiaSolarPaneles({ potenciaKw: 100, horasSolPico: 1, tarifaKwh: 1, costoInstalacion: 1 });
  return Math.round((out.kwhMensual / (100 * 1 * 30)) * 1000) / 1000;
})();

/** Idem en porcentaje, que es como lo pide `panelSolarKwConsumoHogarAutoconsumo`. */
export const EFICIENCIA_PCT = Math.round(EFICIENCIA * 100);

/**
 * Generación anual de referencia por kWp instalado, según
 * `paneles-solares-amortizacion-anos-argentina.ts` (valor fijo, sin HSP).
 * El hub NO la usa para calcular: la usa para mostrar contra qué promedio
 * queda tu techo. Ver la nota de la FAQ sobre las HSP equivalentes.
 */
export const GEN_ANUAL_POR_KWP = (() => {
  const out = panelesSolaresAmortizacionAnosArgentina({
    consumoKwhMes: 1, tarifaArsKwh: 1, potenciaInstaladaKw: 1, costoInstalacionUsd: 1, tipoCambio: 1,
  });
  return out.generacionAnualKwh;
})();

/** HSP que hacen falta para llegar a ese promedio con la eficiencia del repo. */
export const HSP_EQUIVALENTE_PROMEDIO = Math.round((GEN_ANUAL_POR_KWP / (365 * EFICIENCIA)) * 100) / 100;

/**
 * Qué porcentaje de la tarifa se paga por el kWh inyectado a la red bajo el
 * régimen de generación distribuida. Se despeja de la fórmula de amortización:
 *   ahorro = autoconsumido × tarifa + inyectado × tarifa × f
 * Con consumo ínfimo, autoconsumido = 1 kWh/año y el resto es inyección.
 */
export const FACTOR_INYECCION = (() => {
  const out = panelesSolaresAmortizacionAnosArgentina({
    consumoKwhMes: 1 / 12, tarifaArsKwh: 1, potenciaInstaladaKw: 1, costoInstalacionUsd: 1, tipoCambio: 1,
  });
  const inyectado = GEN_ANUAL_POR_KWP - 1;
  return Math.round(((out.ahorroAnualArs - 1) / inyectado) * 100) / 100;
})();

/**
 * m² de techo que ocupa cada panel. Sale del propio texto de
 * `panel-solar-kw-consumo-hogar-autoconsumo.ts`, que estima la superficie
 * necesaria como `paneles × 2,2`. Se lee del insight en vez de duplicarlo.
 */
export const M2_POR_PANEL = (() => {
  const out = panelSolarKwConsumoHogarAutoconsumo({ consumo_kwh: 1000, potencia_wp: 400, hsp: 4, eficiencia: 80 });
  const paneles = Number(out.resultado);
  const m = /\(~(\d+(?:[.,]\d+)?) m²/.exec(String(out._insight?.text || ''));
  if (!m || !paneles) return 2.2;
  return Math.round((Number(m[1].replace(',', '.')) / paneles) * 100) / 100;
})();

/**
 * Precio marginal del kWh, impuestos incluidos: lo que REALMENTE dejás de
 * pagar por cada kWh que no le comprás a la distribuidora. Se obtiene como
 * diferencia de dos facturas del módulo tarifario real (400 kWh − 300 kWh),
 * así entran alumbrado público, IVA del 27% y Ley 25.413.
 */
export const TARIFA_MARGINAL = (() => {
  const base = { distribuidora: 'edenor', condicion: 'sin_subsidio', temporada: 'alta_demanda' };
  const a = tarifaElectrica({ ...base, consumo_kwh: 300 } as any);
  const b = tarifaElectrica({ ...base, consumo_kwh: 400 } as any);
  return Math.round((b.total_factura - a.total_factura) / 100);
})();

/** Tipo de cambio: dólar oficial (venta), el mismo que usa el resto del sitio. */
export const DOLAR = Math.round(Number((dolarLive as any).quotes?.oficial?.venta) || 0);

/** Vida útil de referencia del panel: 25 años (la que citan las dos fórmulas). */
export const VIDA_UTIL_ANOS = 25;

/* ────────────────────────────────────────────────────────────────────────────
 * 2. Tablas propias del hub (con fuente declarada en `sources`)
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Horas de sol pico (HSP) diarias, promedio anual sobre plano inclinado.
 * Valores del Global Solar Atlas (ESMAP / Banco Mundial) y del SIG de la
 * Secretaría de Energía para las regiones argentinas.
 */
export const REGIONES: Record<string, { label: string; hsp: number }> = {
  gba: { label: 'CABA, GBA y provincia de Buenos Aires', hsp: 4.3 },
  litoral: { label: 'Litoral (Santa Fe, Entre Ríos, Corrientes, Misiones)', hsp: 4.5 },
  cordoba: { label: 'Córdoba y centro del país', hsp: 4.8 },
  cuyo: { label: 'Cuyo (Mendoza, San Juan, San Luis)', hsp: 5.4 },
  noa: { label: 'NOA (Salta, Tucumán, Catamarca, La Rioja, Santiago)', hsp: 5.8 },
  puna: { label: 'Puna y alta montaña (Jujuy, oeste de Salta)', hsp: 6.2 },
  patagoniaN: { label: 'Patagonia norte (Neuquén, Río Negro, La Pampa)', hsp: 4.4 },
  patagoniaS: { label: 'Patagonia sur (Chubut, Santa Cruz, Tierra del Fuego)', hsp: 3.6 },
};

/**
 * Castigo por orientación e inclinación del techo, sobre las HSP de la región.
 * Factores típicos de la metodología PVWatts (NREL) para el hemisferio sur:
 * acá el sol viene del NORTE, así que el techo bueno mira al norte.
 */
export const ORIENTACIONES: Record<string, { label: string; factor: number }> = {
  norte_optima: { label: 'Al norte, con inclinación pareja al techo', factor: 1 },
  norte_plano: { label: 'Al norte pero techo plano o casi plano', factor: 0.95 },
  diagonal: { label: 'Al noreste o al noroeste', factor: 0.93 },
  este_oeste: { label: 'Al este o al oeste', factor: 0.82 },
  sombra: { label: 'Con sombra parcial (árbol, medianera, tanque)', factor: 0.75 },
  sur: { label: 'Al sur (la peor orientación en Argentina)', factor: 0.6 },
};

export const ESQUEMAS: Record<string, { label: string }> = {
  ongrid: { label: 'On-grid: conectado a la red, con inyección (Ley 27.424)' },
  offgrid: { label: 'Off-grid: aislado, con banco de baterías' },
};

/** Disclaimer textual del proyecto para una decisión de inversión. */
export const DISCLAIMER = getCalculatorDisclaimer({
  slug: 'construccion/paneles-solares',
  title: 'inversión en paneles solares: amortización y ahorro',
});

/* ────────────────────────────────────────────────────────────────────────────
 * 3. Cifras de ejemplo que citan las FAQ (recalculadas, nunca escritas a mano)
 * ──────────────────────────────────────────────────────────────────────── */

const nAr = (v: number, d = 0) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

/** Caso testigo: 350 kWh/mes en GBA, techo al norte, panel de 550 Wp. */
const DEMO_HSP = REGIONES.gba.hsp * ORIENTACIONES.norte_optima.factor;
export const DEMO_DIM = panelSolarKwConsumoHogarAutoconsumo({
  consumo_kwh: 350, potencia_wp: 550, hsp: DEMO_HSP, eficiencia: EFICIENCIA_PCT,
});
export const DEMO_KWP = Number(DEMO_DIM.potencia_kwp);
export const DEMO_AHORRO = ahorroEnergiaSolarPaneles({
  potenciaKw: DEMO_KWP, horasSolPico: DEMO_HSP, tarifaKwh: TARIFA_MARGINAL, costoInstalacion: DEMO_KWP * 1200 * DOLAR,
});
export const DEMO_AMORT = panelesSolaresAmortizacionAnosArgentina({
  consumoKwhMes: 350, tarifaArsKwh: TARIFA_MARGINAL, potenciaInstaladaKw: DEMO_KWP,
  costoInstalacionUsd: DEMO_KWP * 1200, tipoCambio: DOLAR,
});
/** Banco de baterías de un día de autonomía para ese mismo consumo. */
export const DEMO_BANCO = bancoBateriasSolarDiasAutonomia({
  kwhDia: 350 / 30, dias: 1, v: 48, dod: 80, eficiencia: 90,
});

const REND_M2 = Math.round((DEMO_KWP * 1000) / (Number(DEMO_DIM.resultado) * M2_POR_PANEL));

export const hub: HubData = {
  slug: 'construccion/paneles-solares',
  title: '¿Me conviene poner paneles solares? Cuántos kW, cuánto ahorrás y en cuántos años se paga',
  description:
    'Poné los kWh de tu factura y te decimos cuántos paneles y cuántos kW necesitás, cuánta plata ahorrás por mes y en cuántos años se paga la instalación. On-grid con inyección bajo la Ley 27.424 u off-grid con baterías.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Energía y obra',
  h1: '¿Me conviene poner paneles solares?',
  lede:
    'La respuesta son tres números encadenados: cuántos kW te pide tu consumo, cuánto de la factura te sacás de encima y en cuántos años el ahorro devuelve la inversión. Cargá los kWh de tu boleta, la región y cómo mira tu techo, y salís con el plazo de repago contra los 25 años de vida útil del panel.',
  stamps: [
    'Actualizado 27-07-2026',
    'Ley 27.424 de generación distribuida',
    `Inyección pagada al ${Math.round(FACTOR_INYECCION * 100)}% de la tarifa`,
    `Dólar oficial $${nAr(DOLAR)}`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Años en los que se paga la instalación',

  inputsTitle: 'Tu consumo, tu techo y el precio de la instalación',
  inputsIntro:
    'Los kWh están en tu factura, arriba del importe, como "consumo del período". Si te llega bimestral, dividí por dos. El precio del kWh viene precargado con el costo marginal real de un usuario sin subsidio de Edenor, impuestos incluidos: cambialo por el tuyo si lo sacás de tu boleta (importe total ÷ kWh del período).',
  fields: [
    {
      id: 'consumo',
      label: 'Consumo mensual (kWh)',
      type: 'number',
      min: 0,
      value: 350,
      thousands: true,
      help: 'Una casa familiar en GBA sin aire acondicionado ronda los 300 kWh; con aire, 500 o más.',
    },
    {
      id: 'precioKwh',
      label: 'Precio del kWh, con impuestos ($)',
      type: 'number',
      min: 0,
      value: TARIFA_MARGINAL,
      thousands: true,
      help: 'Sacalo de tu factura: importe total dividido los kWh del período.',
    },
    {
      id: 'region',
      label: '¿Dónde está la casa?',
      type: 'select',
      value: 'gba',
      options: Object.entries(REGIONES).map(([value, r]) => ({ value, label: `${r.label} — ${nAr(r.hsp, 1)} HSP` })),
    },
    {
      id: 'orientacion',
      label: '¿Hacia dónde mira el techo?',
      type: 'select',
      value: 'norte_optima',
      options: Object.entries(ORIENTACIONES).map(([value, o]) => ({ value, label: o.label })),
    },
    {
      id: 'esquema',
      label: 'Tipo de instalación',
      type: 'select',
      value: 'ongrid',
      options: Object.entries(ESQUEMAS).map(([value, e]) => ({ value, label: e.label })),
    },
    {
      id: 'techoM2',
      label: 'Techo libre y sin sombra (m²)',
      type: 'number',
      min: 0,
      step: 1,
      value: 30,
      help: `Cada panel ocupa ${nAr(M2_POR_PANEL, 1)} m² con su estructura. Si no entran todos, el hub achica el sistema.`,
    },
    {
      id: 'potenciaPanel',
      label: 'Potencia de cada panel (Wp)',
      type: 'number',
      min: 100,
      max: 800,
      step: 10,
      value: 550,
      help: 'Los paneles residenciales que se consiguen hoy en Argentina van de 450 a 600 Wp.',
    },
    {
      id: 'usdKwp',
      label: 'Costo de la instalación llave en mano (USD por kWp)',
      type: 'number',
      min: 0,
      value: 1200,
      thousands: true,
      help: 'Paneles, inversor, estructura, protecciones, mano de obra y trámite. Pedí dos o tres presupuestos y poné el tuyo.',
    },
    {
      id: 'dolar',
      label: 'Tipo de cambio ($ por USD)',
      type: 'number',
      min: 0,
      value: DOLAR,
      thousands: true,
      help: 'Viene con el dólar oficial de hoy. El equipamiento se cotiza en dólares y la tarifa se paga en pesos.',
    },
    {
      id: 'autonomia',
      label: 'Días de autonomía sin sol (sólo off-grid)',
      type: 'number',
      min: 0,
      max: 7,
      step: 1,
      value: 1,
      help: 'Cuántos días seguidos nublados tiene que aguantar el banco de baterías.',
    },
    {
      id: 'usdKwhBateria',
      label: 'Costo de la batería (USD por kWh, sólo off-grid)',
      type: 'number',
      min: 0,
      value: 350,
      thousands: true,
      help: 'Litio (LiFePO4) ronda los 300-400 USD/kWh instalado; plomo-ácido sale menos pero dura un tercio.',
    },
  ],
  fineprint: `${DISCLAIMER} Los kWh generados son una estimación estadística sobre promedios anuales de irradiación: un mes nublado rinde menos y uno de verano, más. La instalación on-grid la tiene que ejecutar un instalador habilitado y aprobarla tu distribuidora antes de conectar: sin esa aprobación no hay medidor bidireccional y la energía que inyectes no se te reconoce.`,

  chart: {
    type: 'progress',
    title: 'El repago contra los 25 años de vida útil del panel',
    caption:
      'La barra mide qué parte de la vida útil del sistema se te va en devolver la inversión. Mientras estés en la franja verde el panel te va a regalar más años de energía gratis que los que tardó en pagarse; si te vas al rojo, el equipo se muere antes de haberte devuelto mucho.',
    bands: [
      { label: 'Se paga rápido (hasta 6 años)', from: 0, to: 24, tone: 'good' },
      { label: 'Razonable (6 a 10 años)', from: 24, to: 40, tone: 'warn' },
      { label: 'Repago largo (más de 10 años)', from: 40, to: 100, tone: 'bad' },
    ],
  },
  breakdownTitle: 'De los kWh de la factura a los años de repago',
  breakdownIntro:
    'Las barras comparan cada valor con el mayor del listado. Mirá la unidad de cada fila: hay kWh, kWp, m², años y pesos mezclados.',

  answer: {
    title: 'Cuándo conviene y cuándo no',
    copy:
      'Los paneles solares no son una apuesta: son una compra anticipada de energía. Pagás hoy, en dólares, los kWh que ibas a consumir durante los próximos veinticinco años. Conviene cuando el ahorro anual en pesos devuelve esos dólares en bastante menos que la vida útil del equipo, y eso depende de cuatro cosas: cuánta luz consumís, cuánto te cobran el kWh, cuánto sol pega en tu techo y cuánto cuesta la instalación. Si te sobra techo al norte, tenés consumo alto y no tenés subsidio, el número da bien. Si tu consumo es chico, el techo mira al sur o pagás la tarifa subsidiada, el repago se estira hasta dejar de tener sentido.',
    yes: [
      'Cuántos paneles y cuántos kWp te pide tu consumo, con la fórmula de dimensionamiento del repo',
      'La superficie de techo como tope real: si no entran, el sistema se achica y baja la cobertura',
      'La generación mensual y anual con las horas de sol pico de tu región, castigadas por la orientación del techo',
      `El ahorro en pesos: lo que autoconsumís vale la tarifa plena y lo que inyectás se paga al ${Math.round(FACTOR_INYECCION * 100)}% bajo la Ley 27.424`,
      'La inversión total en dólares y en pesos, y los años que tarda el ahorro en devolverla',
      'En off-grid, el banco de baterías que hace falta para los días sin sol y lo que suma al costo',
    ],
    warn: [
      DISCLAIMER,
      'La instalación on-grid no la podés hacer vos: la ejecuta un instalador habilitado y la aprueba la distribuidora, que recién ahí cambia el medidor por uno bidireccional',
      'Sobredimensionar es el error más caro: cada kWh que inyectás se paga menos que el que autoconsumís, así que un sistema más grande que tu consumo alarga el repago en vez de acortarlo',
      'El repago se calcula con la tarifa de hoy: si el kWh sube, se acorta; si aparece un subsidio o cambia el esquema, se alarga',
      'El inversor no dura 25 años como el panel: contá un recambio a los 10-15 años, que en este cálculo no está incluido',
      'La sombra no es proporcional: un solo panel sombreado puede tirar abajo la producción de toda la serie si no hay optimizadores',
      'Los paneles pierden alrededor de medio punto de rendimiento por año; a los 25 años entregan cerca del 85% de lo original',
    ],
    plazo:
      'el trámite de generación distribuida arranca con la solicitud de conexión ante la distribuidora y suele tardar entre 30 y 90 días hasta el cambio de medidor. Pedí el certificado de instalador habilitado antes de firmar el presupuesto: sin él la distribuidora no aprueba nada.',
  },

  faq: [
    {
      q: '¿Cuántos paneles solares necesito para mi casa?',
      a: `Sale de dividir tu consumo mensual por lo que genera un panel en un mes: <b>paneles = consumo ÷ (kWp del panel × HSP × 30 × ${nAr(EFICIENCIA, 2)})</b>. Para un consumo de 350 kWh/mes en el conurbano bonaerense (${nAr(REGIONES.gba.hsp, 1)} horas de sol pico) con paneles de 550 Wp, la cuenta da <b>${DEMO_DIM.resultado} paneles</b>, o sea ${nAr(DEMO_KWP, 2)} kWp instalados. El ${nAr(EFICIENCIA_PCT)}% no es capricho: es lo que sobrevive después del inversor, el cableado, la temperatura del panel y la suciedad del vidrio.`,
    },
    {
      q: '¿Cuántos kW de paneles necesito por cada 100 kWh de consumo?',
      a: `Depende del sol de tu zona, y por eso el número cambia tanto entre provincias. Con las horas de sol pico del Global Solar Atlas, cada kWp instalado genera unos ${nAr(REGIONES.gba.hsp * 30 * EFICIENCIA)} kWh al mes en Buenos Aires, ${nAr(REGIONES.cuyo.hsp * 30 * EFICIENCIA)} en Cuyo y ${nAr(REGIONES.puna.hsp * 30 * EFICIENCIA)} en la Puna, pero apenas ${nAr(REGIONES.patagoniaS.hsp * 30 * EFICIENCIA)} en Santa Cruz o Tierra del Fuego. Traducido: 100 kWh mensuales necesitan alrededor de ${nAr(100 / (REGIONES.gba.hsp * 30 * EFICIENCIA), 2)} kWp en GBA y ${nAr(100 / (REGIONES.puna.hsp * 30 * EFICIENCIA), 2)} kWp en el norte. El mismo consumo, casi el doble de equipo.`,
    },
    {
      q: '¿Cuánto ahorro por mes con paneles solares?',
      a: `El ahorro es la energía que dejás de comprarle a la distribuidora por el precio real del kWh con impuestos, que hoy ronda los <b>$${nAr(TARIFA_MARGINAL)} por kWh</b> para un usuario sin subsidio de Edenor. El sistema de ${nAr(DEMO_KWP, 2)} kWp del ejemplo genera unos ${nAr(DEMO_AHORRO.kwhMensual)} kWh por mes y ahorra alrededor de <b>$${nAr(DEMO_AHORRO.ahorroMensual)} mensuales</b>, o $${nAr(DEMO_AHORRO.ahorroAnual)} al año. Ojo con un detalle que casi nadie mira: lo que importa no es el precio promedio del kWh sino el marginal, el del último bloque, que es el que efectivamente dejás de pagar.`,
    },
    {
      q: '¿En cuántos años se pagan los paneles solares en Argentina?',
      a: `Con una instalación llave en mano de USD 1.200 por kWp, el ejemplo de ${nAr(DEMO_KWP, 2)} kWp cuesta unos USD ${nAr(DEMO_KWP * 1200)} y se paga en alrededor de <b>${nAr(DEMO_AMORT.anosAmortizacion, 1)} años</b>, contra una vida útil de ${VIDA_UTIL_ANOS} años. Dicho de otro modo: pasado ese plazo te quedan unos ${nAr(VIDA_UTIL_ANOS - DEMO_AMORT.anosAmortizacion, 1)} años de energía prácticamente gratis. El plazo es muy sensible a dos variables que no controlás: el precio del kWh y el tipo de cambio. Si el kWh sube en dólares, el repago se acorta; si la tarifa se vuelve a subsidiar, se estira.`,
    },
    {
      q: '¿Cuánto me pagan por la energía que inyecto a la red?',
      a: `La Ley 27.424 de generación distribuida te habilita a inyectar el excedente y recibir un crédito en tu factura, pero ese crédito vale menos que la energía que comprás: se reconoce aproximadamente el <b>${Math.round(FACTOR_INYECCION * 100)}% de la tarifa final</b>, porque el precio de inyección se calcula sobre el valor mayorista de la energía y no incluye los cargos de distribución ni los impuestos. Por eso conviene autoconsumir: cada kWh que usás en el momento en que se genera vale el 100%, y cada kWh que se te va a la red vale ${Math.round(FACTOR_INYECCION * 100)}%.`,
    },
    {
      q: '¿Conviene sobredimensionar la instalación para vender energía?',
      a: `No, y es el error más caro que se comete. Como la inyección se paga al ${Math.round(FACTOR_INYECCION * 100)}% de la tarifa, cada kWp que ponés por encima de tu consumo rinde un ${100 - Math.round(FACTOR_INYECCION * 100)}% menos que los anteriores, mientras que cuesta exactamente lo mismo. Además, la Ley 27.424 limita la potencia del usuario-generador a la potencia contratada con la distribuidora: no podés instalar más de lo que tu conexión soporta. La regla práctica es dimensionar para cubrir entre el 90% y el 100% del consumo anual, no más.`,
    },
    {
      q: '¿Cuánto techo hace falta para poner paneles solares?',
      a: `Cada panel con su estructura ocupa alrededor de <b>${nAr(M2_POR_PANEL, 1)} m²</b>, así que un sistema residencial típico de ${DEMO_DIM.resultado} paneles pide unos ${nAr(Number(DEMO_DIM.resultado) * M2_POR_PANEL)} m² de techo libre, sin sombra y con la orientación correcta. En rendimiento por superficie, eso son cerca de ${nAr(REND_M2)} Wp por metro cuadrado. Si tu techo no da, el hub recorta el sistema al que entra y te muestra qué porcentaje de la factura te cubre: sigue siendo un ahorro, sólo que parcial.`,
    },
    {
      q: '¿Hacia dónde tienen que mirar los paneles en Argentina?',
      a: `Al <b>norte</b>. En el hemisferio sur el sol pasa por el norte, así que la orientación que en Europa o Estados Unidos es la buena, acá es la peor. Un techo al norte con inclinación pareja rinde el 100%; al noreste o noroeste perdés un ${Math.round((1 - ORIENTACIONES.diagonal.factor) * 100)}%; al este u oeste, un ${Math.round((1 - ORIENTACIONES.este_oeste.factor) * 100)}%; y al sur te quedás con apenas el ${Math.round(ORIENTACIONES.sur.factor * 100)}% de la producción. La inclinación ideal es aproximadamente igual a la latitud del lugar, aunque en techo plano se resuelve con estructura triangular.`,
    },
    {
      q: '¿Off-grid con baterías o on-grid conectado a la red?',
      a: `On-grid, salvo que no tengas red. Las baterías son la parte más cara y la que menos dura: para cubrir un consumo de 350 kWh mensuales durante un solo día sin sol hace falta un banco de <b>${DEMO_BANCO.ah}</b> (unos ${DEMO_BANCO.whTotal} útiles), que a precios de litio suma varios miles de dólares y hay que reponer a los 10 años, no a los 25. En on-grid la red hace de batería gratis: inyectás de día y consumís de noche. El off-grid tiene sentido en campo, chacras y casas sin conexión, donde la alternativa no es la tarifa sino el grupo electrógeno.`,
    },
    {
      q: '¿Qué trámite hay que hacer para conectar los paneles a la red?',
      a: 'Bajo la Ley 27.424 el circuito es siempre el mismo: se presenta una solicitud de conexión ante la distribuidora (Edenor, Edesur, EPEC, EPE, según la provincia) con el proyecto firmado por un <b>instalador calificado registrado</b>, la distribuidora evalúa la capacidad del alimentador y aprueba, se ejecuta la obra y recién entonces se cambia el medidor por uno bidireccional y se firma el contrato de usuario-generador. Sin ese contrato podés tener paneles funcionando, pero la energía que inyectes no se te reconoce. Los plazos habituales van de 30 a 90 días y varían mucho por provincia y por distribuidora.',
    },
    {
      q: '¿Cuánto cuesta instalar paneles solares en una casa?',
      a: `El mercado argentino cotiza llave en mano en dólares por kilovatio pico instalado, y el rango razonable va de USD 1.000 a USD 1.500 por kWp según marca del inversor, tipo de estructura y complejidad del techo. El precio incluye paneles, inversor, estructura, protecciones, cableado, mano de obra y el trámite ante la distribuidora. Con el dólar oficial de hoy ($${nAr(DOLAR)}), el sistema de ${nAr(DEMO_KWP, 2)} kWp del ejemplo cuesta cerca de $${nAr(DEMO_KWP * 1200 * DOLAR)}. Pedí siempre dos o tres presupuestos y fijate que estén cotizando la misma potencia: comparar "precio total" sin mirar los kWp no dice nada.`,
    },
    {
      q: '¿Los paneles solares andan con días nublados o en invierno?',
      a: `Sí, pero mucho menos. Un día muy nublado deja pasar entre el 10% y el 25% de la irradiación, y el invierno tiene menos horas de sol y el sol más bajo. Por eso este cálculo usa <b>horas de sol pico promedio anual</b>: un número que ya promedia los días buenos y los malos del año, para que la cuenta de repago no dependa de la semana en que la hagas. En on-grid ese vaivén no es problema, porque en los meses buenos generás de más y el crédito se compensa contra los meses malos. La referencia que usan las calculadoras del sitio es de ${nAr(GEN_ANUAL_POR_KWP)} kWh por kWp al año, equivalente a ${nAr(HSP_EQUIVALENTE_PROMEDIO, 1)} horas de sol pico: bastante optimista para Buenos Aires y corta para el NOA.`,
    },
    {
      q: '¿Qué mantenimiento necesitan los paneles solares?',
      a: 'Muy poco, pero no cero. Limpieza del vidrio una o dos veces al año (la tierra y los excrementos de pájaros bajan el rendimiento más de lo que la gente cree), revisión de las conexiones y del ajuste de la estructura, y control de que no haya crecido un árbol o una construcción que empezó a hacer sombra. Lo único que se reemplaza en serio es el inversor, que dura entre 10 y 15 años y cuesta alrededor de un 15% del sistema: si vas a comparar el repago contra la vida útil completa del panel, sumá ese recambio.',
    },
  ],

  sources: [
    {
      name: 'Ley 27.424 — Régimen de Fomento a la Generación Distribuida de Energía Renovable',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-27424-315943',
      publisher: 'InfoLEG · Ministerio de Justicia',
    },
    {
      name: 'Generación Distribuida — trámite de usuario-generador e instaladores calificados',
      url: 'https://www.argentina.gob.ar/economia/energia/generacion-distribuida',
      publisher: 'Secretaría de Energía de la Nación',
    },
    {
      name: 'Cuadros tarifarios de Edenor y Edesur',
      url: 'https://www.argentina.gob.ar/enre/cuadros_tarifarios',
      publisher: 'ENRE',
      date: 'actualización periódica',
    },
    {
      name: 'Global Solar Atlas — irradiación y horas de sol pico por localidad',
      url: 'https://globalsolaratlas.info/',
      publisher: 'ESMAP · Banco Mundial · Solargis',
    },
    {
      name: 'PVWatts Calculator — metodología de estimación de generación fotovoltaica',
      url: 'https://pvwatts.nrel.gov/',
      publisher: 'NREL · Departamento de Energía de EE. UU.',
    },
    {
      name: 'PVGIS — Photovoltaic Geographical Information System (cobertura de Sudamérica)',
      url: 'https://re.jrc.ec.europa.eu/pvg_tools/es/',
      publisher: 'Comisión Europea · JRC',
    },
    {
      name: 'IRESUD — Interconexión de sistemas fotovoltaicos a la red eléctrica en ambientes urbanos',
      url: 'https://www.inti.gob.ar/',
      publisher: 'INTI · CNEA · UNSAM',
    },
    {
      name: 'Cotización del dólar oficial',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
      date: (dolarLive as any)?._meta?.fetchedAt?.slice(0, 10) || 'actualización diaria',
    },
  ],

  replaces: [
    '/calculadora-panel-solar-kw-consumo-hogar-autoconsumo',
    '/calculadora-paneles-solares-amortizacion-anos-argentina',
    '/calculadora-ahorro-energia-solar-paneles',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-banco-baterias-solar-dias-autonomia',
    '/calculadora-panel-solar-kwh-dimensionar',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
