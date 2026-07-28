import type { HubData } from './types';
import { costoM2Construccion } from '../formulas/costo-m2-construccion';
import { costoMedianeraMuroLindero } from '../formulas/costo-medianera-muro-lindero';
import dolarLive from '../../data/live/dolar.json';

/**
 * Hub de decisión — "¿Cuánto sale construir una casa?"
 *
 * Arquetipo: CÁLCULO DOMINANTE (sin `cases`; usa `answer`).
 *
 * IMPORTANTE — de dónde sale el valor del m²:
 * NO se hardcodea acá. Se DERIVA llamando a la fórmula real
 * `src/lib/formulas/costo-m2-construccion.ts` con m2 = 1, que es la misma que
 * alimenta a /calculadora-costo-m2-construccion-argentina. Esa fórmula tiene
 * como fuente el índice CAC / CPIC / ICC de INDEC (ver dataUpdate del JSON
 * costo-m2-construccion.json). Cuando se refresque el índice ahí, este hub se
 * actualiza solo: acá no hay ningún número de m² escrito a mano.
 *
 * Lo mismo con el precio del m² de muro: sale de
 * `src/lib/formulas/costo-medianera-muro-lindero.ts`.
 */

/** Categorías que expone el hub, mapeadas a las tipologías de la fórmula. */
const TIPO_POR_CATEGORIA: Record<string, string> = {
  economica: 'economico',
  estandar: 'estandar',
  media: 'medio',
  alta: 'alto',
  premium: 'premium',
  ampliacion: 'ampliacion',
  reforma: 'reforma',
};

const ZONAS = [
  { value: 'caba', label: 'CABA' },
  { value: 'gba_norte', label: 'GBA norte' },
  { value: 'gba_sur', label: 'GBA sur / oeste' },
  { value: 'cordoba', label: 'Córdoba' },
  { value: 'rosario', label: 'Rosario / Santa Fe' },
  { value: 'mendoza', label: 'Mendoza' },
  { value: 'interior', label: 'Interior del país' },
  { value: 'patagonia_norte', label: 'Patagonia norte (Neuquén, Río Negro)' },
  { value: 'patagonia_austral', label: 'Patagonia austral (Santa Cruz)' },
  { value: 'tierra-del-fuego', label: 'Tierra del Fuego' },
];

/**
 * Tipo de cambio.
 *
 * La fórmula `costo-m2-construccion.ts` tiene el dólar hardcodeado en $1.200
 * ("blue/MEP ~abril 2026"), así que su `costoPorM2ARS` quedó viejo. Acá NO se
 * toca la fórmula: se toma su valor en USD (que es el dato real, los costos de
 * obra en Argentina se cotizan en dólares) y se pasa a pesos con la cotización
 * viva de `src/data/live/dolar.json` (DolarAPI, la misma fuente de /dolar-hoy,
 * que refresca varias veces por día). Se usa el MEP (bolsa) por ser el tipo de
 * cambio de referencia para obra; si faltara, cae al blue y por último al 1.200
 * histórico. En cualquier caso se muestra en pantalla a qué dólar está hecha la
 * cuenta y de qué fecha es.
 */
const FX_FALLBACK = 1200;
const _quotes: Record<string, { venta?: number; compra?: number }> = (dolarLive as any)?.quotes || {};
const _fetchedAt: string | undefined = (dolarLive as any)?._meta?.fetchedAt;

function _pickFx(): { value: number; casa: string; label: string; live: boolean } {
  const mep = Number(_quotes.bolsa?.venta) || 0;
  if (mep > 0) return { value: mep, casa: 'bolsa', label: 'dólar MEP', live: true };
  const blue = Number(_quotes.blue?.venta) || 0;
  if (blue > 0) return { value: blue, casa: 'blue', label: 'dólar blue', live: true };
  return { value: FX_FALLBACK, casa: 'estimado', label: 'dólar estimado', live: false };
}

const _fx = _pickFx();

/** Cotización usada para pasar los USD/m² de la fórmula a pesos. */
export const FX = {
  value: Math.round(_fx.value),
  casa: _fx.casa,
  label: _fx.label,
  live: _fx.live,
  /** Fecha del dato, en formato dd-mm-aaaa (es-AR). */
  date: (() => {
    const d = _fx.live && _fetchedAt ? new Date(_fetchedAt) : null;
    return d && !isNaN(d.getTime())
      ? new Intl.DateTimeFormat('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(d)
      : 'abril 2026';
  })(),
};

/** Un m² de cada combinación categoría × zona, calculado por la fórmula real. */
function m2Unitario(categoria: string, zona: string) {
  return costoM2Construccion({ m2: 1, tipo: TIPO_POR_CATEGORIA[categoria], provincia: zona });
}

/** Tabla USD/m² (de la fórmula) y ARS/m² (USD × cotización viva). */
export const M2: Record<string, Record<string, { ars: number; usd: number }>> = Object.fromEntries(
  Object.keys(TIPO_POR_CATEGORIA).map((cat) => [
    cat,
    Object.fromEntries(
      ZONAS.map((z) => {
        const u = m2Unitario(cat, z.value);
        return [z.value, { ars: Math.round(u.costoPorM2USD * FX.value), usd: u.costoPorM2USD }];
      }),
    ),
  ]),
);

/** Reparto materiales / mano de obra / honorarios / permisos, tomado de la fórmula. */
const _muestra = costoM2Construccion({ m2: 1000, tipo: 'estandar', provincia: 'gba_sur' });
export const SHARES: Array<{ label: string; share: number }> = _muestra._chart.slices.map(
  (s: { label: string; value: number }) => ({
    label: s.label,
    share: s.value / _muestra.costoTotalUSD,
  }),
);

/** ARS por m² de muro medianero (ladrillo hueco 18 + revoque), desde su fórmula. */
export const MURO_ARS_M2 = costoMedianeraMuroLindero({ largoM: 1, alturaM: 1 }).costoTotal;

const USD_M2_ESTANDAR = M2.estandar.gba_sur.usd;

export const hub: HubData = {
  slug: 'construccion/costo-por-m2',
  title: '¿Cuánto sale construir una casa? Costo por m² 2026 (Argentina)',
  description:
    'Calculá cuánto sale construir tu casa: costo por m² según categoría (económica, estándar o premium) y zona, con el desglose real de materiales, mano de obra, honorarios y permisos.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Guía y estimación de obra',
  h1: '¿Cuánto sale construir una casa?',
  lede:
    'Poné los metros que querés levantar, elegí la categoría de terminación y la zona: te decimos el costo por m², el total de obra y —lo que casi nadie te muestra— en qué se te va la plata.',
  stamps: [
    'Actualizado 27-07-2026',
    `Referencia estándar US$${USD_M2_ESTANDAR}/m² (CAC · CPIC · ICC INDEC)`,
    `Pesos calculados al ${FX.label} $${FX.value.toLocaleString('es-AR')} (${FX.date})`,
    '7 calculadoras adentro',
  ],

  resultLabel: 'Costo total estimado de obra',

  inputsTitle: 'Contanos qué vas a construir',
  inputsIntro:
    'Los semicubiertos (galería, cochera, quincho abierto) computan al 50%, igual que en la mayoría de los municipios y en los presupuestos de obra.',
  fields: [
    { id: 'cubiertos', label: 'm² cubiertos', suffix: 'm²', value: '120', thousands: true },
    { id: 'semi', label: 'm² semicubiertos (computan al 50%)', type: 'number', min: 0, value: 20 },
    {
      id: 'categoria',
      label: 'Categoría de construcción',
      type: 'select',
      value: 'estandar',
      options: [
        { value: 'economica', label: 'Económica (vivienda social, casa de campo)' },
        { value: 'estandar', label: 'Estándar (casa media urbana)' },
        { value: 'media', label: 'Media alta (clase media, GBA/CABA)' },
        { value: 'alta', label: 'Alta categoría (country, barrio cerrado)' },
        { value: 'premium', label: 'Premium (alta gama, domótica, mármol)' },
        { value: 'ampliacion', label: 'Ampliación sobre obra existente' },
        { value: 'reforma', label: 'Reforma integral con estructura' },
      ],
    },
    { id: 'zona', label: 'Zona', type: 'select', value: 'gba_sur', options: ZONAS },
    { id: 'medianera', label: 'Metros de medianera a levantar (0 si no hay)', type: 'number', min: 0, value: 0 },
    { id: 'cuotas', label: 'En cuántos meses pensás pagar la obra', type: 'number', min: 1, max: 120, value: 24 },
  ],
  fineprint:
    `Es una estimación de obra llave en mano, sin terreno, sin escritura y sin intereses de financiación. Los costos por m² se manejan en dólares y se pasan a pesos ${
      FX.live
        ? `con la cotización del ${FX.label} de venta al ${FX.date}: $${FX.value.toLocaleString('es-AR')} por dólar (fuente DolarAPI, la misma de /dolar-hoy)`
        : `a un dólar estimado de $${FX.value.toLocaleString('es-AR')} (${FX.date}): si el tipo de cambio se movió, ajustá el total en la misma proporción`
    }. Un presupuesto firmado por tu director de obra manda siempre sobre esta cuenta.`,

  chart: {
    type: 'stacked',
    title: '¿En qué se te va la plata?',
    caption:
      'Una sola barra partida en cuatro: materiales, mano de obra, honorarios profesionales y permisos más contingencias. Es el reparto típico de una obra nueva en Argentina; en reformas la mano de obra pesa más y los materiales menos.',
  },
  breakdownTitle: 'Cómo se reparte el costo de tu obra',
  breakdownIntro: 'Las barras comparan cada rubro con el más grande, que casi siempre son los materiales.',

  answer: {
    title: 'La cuenta corta: metros computables × costo del m² de tu categoría y tu zona.',
    copy:
      'Los semicubiertos entran a la mitad, la zona corrige el m² por logística y clima, y a eso se le suma tu mitad de la medianera si la hay.',
    yes: [
      'Materiales: alrededor de la mitad del costo total de la obra',
      'Mano de obra: gremios, contratistas y cargas sociales del personal de obra',
      'Honorarios profesionales: proyecto, dirección técnica y visado del colegio (CPIC / CPAU / colegios provinciales)',
      'Permisos, derechos de construcción, agrimensura y contingencias',
      'Tu mitad de la medianera, si levantás muro sobre el eje divisorio',
    ],
    warn: [
      'El terreno NO está incluido: en CABA y GBA norte suele valer tanto o más que la obra',
      'Los valores por m² son de obra nueva llave en mano; una ampliación paga sobrecosto por trabajar sobre lo existente',
      'La contingencia del 10% no es opcional: casi ninguna obra en Argentina cierra al presupuesto original',
      'Si financiás en cuotas, el costo se ajusta por índice CAC y la cuota final crece con la inflación',
    ],
    plazo:
      'el permiso de obra tarda entre 2 y 6 meses según el municipio; presentá los planos antes de comprar el primer palet de ladrillos.',
  },

  faq: [
    {
      q: '¿Cuánto sale el m² de construcción en Argentina en 2026?',
      a: `Una casa estándar en GBA ronda los <b>US$${USD_M2_ESTANDAR} por m²</b> llave en mano. Una vivienda económica arranca cerca de US$${M2.economica.gba_sur.usd}/m² y una premium supera los US$${M2.premium.gba_sur.usd}/m². En CABA sumá alrededor de un 25% y en Tierra del Fuego hasta un 40% por logística y aislamiento obligatorio.`,
    },
    {
      q: '¿Qué diferencia hay entre construcción económica, estándar y premium?',
      a: 'La económica usa mampostería simple, aberturas de chapa o aluminio básico, pisos cerámicos y una instalación mínima. La estándar suma revoques finos, aberturas de aluminio con DVH parcial, porcelanato y calefacción. La premium incluye estructura de hormigón visto o steel de alta prestación, carpintería a medida, climatización central, domótica y terminaciones importadas: por eso el m² se triplica.',
    },
    {
      q: '¿El costo por m² incluye el terreno?',
      a: 'No. Todos los valores del hub son de obra: materiales, mano de obra, honorarios y permisos. El terreno, la escritura, los sellos y la conexión de servicios van aparte y en zonas urbanas pueden representar entre el 30% y el 60% de la inversión total.',
    },
    {
      q: '¿Cómo se cuentan los m² semicubiertos y los balcones?',
      a: 'La práctica de obra y la mayoría de los códigos de edificación municipales computan galerías, cocheras techadas y balcones al 50% de su superficie, porque no llevan cerramientos completos ni todas las instalaciones. Este hub aplica ese 50% automáticamente.',
    },
    {
      q: '¿Cuánto tengo que pagar de la medianera y cuánto el vecino?',
      a: `El Código Civil y Comercial (arts. 2006 a 2036) establece que el muro divisorio es común: el lindero está obligado a aportar la mitad del costo. Con precios de referencia de ladrillo hueco 18 cm más revoque, el m² de muro ronda los $${MURO_ARS_M2.toLocaleString('es-AR')}, y en una medianera de 3 metros de alto la mitad que te toca sale de ahí. Acordá el reparto por escrito antes de empezar para poder reclamar el cobro de medianería.`,
    },
    {
      q: '¿Cuánta tierra tengo que excavar para los cimientos?',
      a: 'El volumen se calcula como largo × ancho × profundidad, y al resultado se le suma entre un 20% y un 30% de esponjamiento, porque la tierra removida ocupa más que la tierra compactada. Ese sobrante es el que tenés que pagar para retirar en camión: es el costo escondido más habitual del inicio de obra.',
    },
    {
      q: '¿Cuántos ladrillos, bolsas de cemento y arena necesito por m²?',
      a: 'Como referencia de obra argentina: un muro de ladrillo hueco 18×18×33 lleva unos 16 ladrillos por m², y el mortero de asiento consume alrededor de media bolsa de cemento y 0,03 m³ de arena por m² de pared. Para un contrapiso de hormigón pobre se usa una dosificación 1:3:6 (cemento, arena, canto rodado). Pedí siempre un 8% extra por roturas y desperdicio.',
    },
    {
      q: '¿Cómo calculo la superficie de un terreno irregular?',
      a: 'Con la fórmula de Shoelace o de Gauss: se cargan las coordenadas de cada vértice del polígono en orden y la fórmula devuelve el área exacta, sin necesidad de dividirlo en triángulos. Para trámites municipales igual vas a necesitar la mensura firmada por un agrimensor matriculado.',
    },
    {
      q: '¿Conviene entrar a un fideicomiso al costo en vez de construir solo?',
      a: 'El fideicomiso al costo reparte la obra en cuotas mensuales ajustadas por índice CAC y te evita adelantar todo el capital, pero no fija el precio final: si el índice se dispara, la cuota sigue. Construyendo por tu cuenta tenés control total y no pagás honorarios de administración fiduciaria, pero asumís todo el riesgo de sobrecostos y de gestión de gremios.',
    },
    {
      q: '¿Cuánto cobran los honorarios de proyecto y dirección de obra?',
      a: 'Los aranceles de referencia de los colegios profesionales (CPIC, CPAU y colegios provinciales) ubican proyecto más dirección técnica en el orden del 8% al 12% del costo de obra, escalonado según la envergadura. En este hub esa porción está dentro del rubro de honorarios profesionales.',
    },
    {
      q: '¿Por qué el costo por m² se actualiza por el índice CAC?',
      a: 'La Cámara Argentina de la Construcción publica un índice mensual del costo de la construcción, y el INDEC publica el ICC para el Gran Buenos Aires. Los contratos de obra y los fideicomisos al costo se ajustan por alguno de esos dos índices porque reflejan la variación real de materiales y mano de obra, muy distinta de la inflación general.',
    },
  ],

  sources: [
    {
      name: 'Índice del Costo de la Construcción (ICC) en el Gran Buenos Aires',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-20',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Índice del Costo de la Construcción — Cámara Argentina de la Construcción',
      url: 'https://www.camarco.org.ar/',
      publisher: 'CAMARCO',
      date: 'publicación mensual',
    },
    {
      name: 'Aranceles y honorarios de proyecto y dirección de obra',
      url: 'https://www.cpic.org.ar/',
      publisher: 'Consejo Profesional de Ingeniería Civil (CPIC)',
    },
    {
      name: 'Código Civil y Comercial de la Nación — muros medianeros, arts. 2006 a 2036',
      url: 'http://www.saij.gob.ar/nuevo-codigo-civil-comercial-nacion',
      publisher: 'SAIJ · Ministerio de Justicia',
    },
    {
      name: 'Reglamento CIRSOC — normativa argentina de estructuras',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/construcciones-e-infraestructura/cirsoc',
      publisher: 'INTI',
    },
  ],

  replaces: [
    '/calculadora-costo-m2-construccion-argentina',
    '/calculadora-costo-medianera-muro-lindero',
    '/calculadora-volumen-excavacion-m3-tierra',
    '/calculadora-materiales-construccion',
    '/calculadora-m2-casa-planos-total-construido',
    '/calculadora-metros-cuadrados-terreno-irregular-poligono',
    '/calculadora-fideicomiso-construccion-aporte-cuotas',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-propiedad-tasacion-m2-barrio-caba-promedio',
    '/calculadora-proyectos-hogar',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
