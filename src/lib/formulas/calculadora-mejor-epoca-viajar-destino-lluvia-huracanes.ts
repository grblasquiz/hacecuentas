/**
 * "¿A dónde querés viajar y es buena época?" — calculadora de clima/temporada por destino.
 *
 * El usuario elige un destino popular y un mes, y le decimos si es época de lluvias,
 * de huracanes (con el rango), la temporada turística (alta/media/baja), el clima
 * esperado (temp aprox + condición) y una recomendación honesta de si conviene ir.
 *
 * El hook compartible es la TABLA: el calendario ANUAL del destino (los 12 meses con
 * lluvia/seca, huracán y temporada), para ver de un vistazo la mejor época del año.
 *
 * Data = patrones climatológicos PROMEDIO (educativo, el clima varía año a año). Fuente:
 * guías de viaje + servicios meteorológicos. `dataUpdate.frequency` = yearly (revisar el
 * calendario de feriados/temporada alta cada enero). Devuelve outputs + _insight + _table.
 */

export interface EpocaViajeInputs {
  destino: string;
  mes: number | string;
  __lang?: string;
}

export interface EpocaViajeOutputs {
  epocaLluvias: string;
  epocaHuracanes: string;
  temporada: string;
  climaEsperado: string;
  recomendacion: string;
  _insight?: any;
  _table?: any;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Mapa de slug de mes -> índice 0..11 (acepta nombre o número).
const MES_INDEX: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, '11': 10, '12': 11,
};

// Por destino, para los 12 meses (índice 0=Enero … 11=Diciembre):
//   lluvia:   true si es mes de estación lluviosa / húmeda.
//   huracan:  true si cae dentro de la temporada de huracanes/ciclones de la región.
//   temp:     'alta' | 'media' | 'baja' — temporada TURÍSTICA.
//   tC:       temperatura máxima diurna típica (°C, aproximada).
//   cond:     condición climática resumida del mes.
// Hemisferio sur (AR/BR/UY): verano dic-feb, invierno jun-ago.
interface MesData { lluvia: boolean; huracan: boolean; temp: 'alta' | 'media' | 'baja'; tC: number; cond: string; }
interface Destino {
  nombre: string;
  emoji: string;
  hemisferio: 'norte' | 'sur';
  huracanes: string | null; // descripción del rango de temporada de huracanes, o null si no aplica
  resumen: string;          // mejor época en una frase
  meses: MesData[];
}

// Helper para construir 12 meses sin repetir tanto texto.
const m = (lluvia: boolean, huracan: boolean, temp: 'alta' | 'media' | 'baja', tC: number, cond: string): MesData => ({ lluvia, huracan, temp, tC, cond });

const DESTINOS: Record<string, Destino> = {
  // ── Caribe / Atlántico tropical (huracanes jun-nov, pico ago-oct; seca dic-abr) ──
  'punta-cana': {
    nombre: 'Punta Cana / Caribe', emoji: '🏝️', hemisferio: 'norte',
    huracanes: 'temporada de huracanes del Atlántico, 1 jun – 30 nov (pico ago-oct)',
    resumen: 'Mejor de diciembre a abril (seca, sin huracanes). Evitá agosto-octubre.',
    meses: [
      m(false, false, 'alta', 29, 'soleado y seco'),   // ene
      m(false, false, 'alta', 29, 'soleado y seco'),   // feb
      m(false, false, 'alta', 30, 'soleado y seco'),   // mar
      m(false, false, 'alta', 30, 'cálido y seco'),    // abr
      m(true,  false, 'media', 31, 'calor, lluvias aisladas'), // may
      m(true,  true,  'baja', 31, 'húmedo, riesgo ciclónico'), // jun
      m(true,  true,  'baja', 31, 'húmedo, riesgo ciclónico'), // jul
      m(true,  true,  'baja', 32, 'pico de huracanes'),        // ago
      m(true,  true,  'baja', 32, 'pico de huracanes'),        // sep
      m(true,  true,  'baja', 31, 'pico de huracanes'),        // oct
      m(true,  true,  'media', 30, 'lluvias, fin de temporada ciclónica'), // nov
      m(false, false, 'alta', 29, 'soleado y seco'),   // dic
    ],
  },
  'cancun': {
    nombre: 'Cancún / Riviera Maya', emoji: '🏖️', hemisferio: 'norte',
    huracanes: 'temporada de huracanes del Atlántico, 1 jun – 30 nov (pico ago-oct)',
    resumen: 'Mejor de diciembre a abril (seca). Pico de huracanes y calor: agosto-octubre.',
    meses: [
      m(false, false, 'alta', 28, 'soleado y seco'),   // ene
      m(false, false, 'alta', 29, 'soleado y seco'),   // feb
      m(false, false, 'alta', 30, 'soleado, seco'),    // mar
      m(false, false, 'alta', 31, 'cálido y seco'),    // abr
      m(true,  false, 'media', 32, 'calor, primeras lluvias'), // may
      m(true,  true,  'baja', 32, 'húmedo, riesgo ciclónico'), // jun
      m(true,  true,  'media', 32, 'lluvias de tarde'),        // jul
      m(true,  true,  'baja', 33, 'pico de huracanes'),        // ago
      m(true,  true,  'baja', 32, 'pico de huracanes, máx. lluvia'), // sep
      m(true,  true,  'baja', 31, 'pico de huracanes'),        // oct
      m(true,  true,  'media', 29, 'lluvias en baja, fin ciclónico'), // nov
      m(false, false, 'alta', 28, 'soleado y seco'),   // dic
    ],
  },
  'miami': {
    nombre: 'Miami / Florida', emoji: '🌴', hemisferio: 'norte',
    huracanes: 'temporada de huracanes del Atlántico, 1 jun – 30 nov (pico ago-oct)',
    resumen: 'Mejor de noviembre a abril (seco, agradable). Húmedo y ciclónico: junio-octubre.',
    meses: [
      m(false, false, 'alta', 25, 'seco y templado'),  // ene
      m(false, false, 'alta', 25, 'seco y templado'),  // feb
      m(false, false, 'alta', 27, 'seco, agradable'),  // mar
      m(false, false, 'media', 28, 'cálido y seco'),   // abr
      m(true,  false, 'media', 30, 'calor, primeras lluvias'), // may
      m(true,  true,  'baja', 31, 'húmedo, riesgo ciclónico'), // jun
      m(true,  true,  'media', 32, 'calor y tormentas de tarde'), // jul
      m(true,  true,  'media', 32, 'pico de huracanes'),       // ago
      m(true,  true,  'baja', 31, 'pico de huracanes'),        // sep
      m(true,  true,  'media', 29, 'pico de huracanes'),       // oct
      m(false, false, 'alta', 26, 'seco, ideal'),      // nov
      m(false, false, 'alta', 24, 'seco y templado'),  // dic
    ],
  },
  // ── Brasil (Río / NE) — hemisferio sur, verano dic-mar = lluvioso y caluroso ──
  'brasil-rio': {
    nombre: 'Brasil (Río / Nordeste)', emoji: '🇧🇷', hemisferio: 'sur',
    huracanes: null,
    resumen: 'Verano (dic-mar) = playa + Carnaval, pero caluroso y con lluvias. Otoño (abr-jun) más estable.',
    meses: [
      m(true,  false, 'alta', 35, 'verano, calor y chaparrones'),  // ene
      m(true,  false, 'alta', 35, 'Carnaval, calor y lluvias'),    // feb
      m(true,  false, 'media', 33, 'fin de verano, lluvias'),      // mar
      m(false, false, 'media', 31, 'otoño, agradable y seco'),     // abr
      m(false, false, 'media', 29, 'otoño, templado y seco'),      // may
      m(false, false, 'media', 27, 'invierno suave, seco'),        // jun
      m(false, false, 'alta', 26, 'invierno, seco (vacaciones)'),  // jul
      m(false, false, 'media', 27, 'invierno suave, seco'),        // ago
      m(false, false, 'media', 28, 'primavera, agradable'),        // sep
      m(false, false, 'media', 29, 'primavera, cálido'),           // oct
      m(true,  false, 'media', 31, 'calor creciente, lluvias'),    // nov
      m(true,  false, 'alta', 34, 'verano, calor y chaparrones'),  // dic
    ],
  },
  // ── Buenos Aires — hemisferio sur; sin estación seca marcada ──
  'buenos-aires': {
    nombre: 'Buenos Aires', emoji: '🇦🇷', hemisferio: 'sur',
    huracanes: null,
    resumen: 'Mejor en primavera (oct-nov) y otoño (mar-may): templado. Verano caluroso, invierno fresco.',
    meses: [
      m(false, false, 'media', 30, 'verano caluroso y húmedo'),   // ene
      m(false, false, 'media', 29, 'verano caluroso'),            // feb
      m(false, false, 'alta', 26, 'otoño templado, ideal'),       // mar
      m(false, false, 'alta', 23, 'otoño agradable'),             // abr
      m(false, false, 'media', 19, 'fresco, otoñal'),             // may
      m(false, false, 'baja', 15, 'invierno fresco'),             // jun
      m(false, false, 'baja', 15, 'invierno fresco'),             // jul
      m(false, false, 'baja', 17, 'fin de invierno, fresco'),     // ago
      m(false, false, 'media', 19, 'primavera templada'),         // sep
      m(false, false, 'alta', 22, 'primavera, ideal'),            // oct
      m(false, false, 'alta', 26, 'primavera cálida, ideal'),     // nov
      m(false, false, 'media', 29, 'inicio de verano'),           // dic
    ],
  },
  // ── Patagonia (El Calafate / Ushuaia) — hemisferio sur; verano = temporada alta ──
  'patagonia': {
    nombre: 'Patagonia (Calafate / Ushuaia)', emoji: '🏔️', hemisferio: 'sur',
    huracanes: null,
    resumen: 'Mejor en verano (dic-feb): trekking y días largos. Invierno frío y muchos servicios cerrados.',
    meses: [
      m(false, false, 'alta', 18, 'verano, ideal para trekking'),  // ene
      m(false, false, 'alta', 18, 'verano, ideal para trekking'),  // feb
      m(false, false, 'media', 15, 'otoño, colores y menos gente'), // mar
      m(false, false, 'media', 12, 'otoño fresco, viento'),        // abr
      m(true,  false, 'baja', 8, 'frío, primeras nieves'),         // may
      m(true,  false, 'baja', 5, 'invierno, frío y corto de día'), // jun
      m(true,  false, 'baja', 4, 'invierno crudo'),                // jul
      m(true,  false, 'baja', 6, 'invierno, frío'),                // ago
      m(false, false, 'media', 10, 'primavera, viento fuerte'),    // sep
      m(false, false, 'media', 13, 'primavera, mejora el clima'),  // oct
      m(false, false, 'alta', 16, 'primavera-verano, ideal'),      // nov
      m(false, false, 'alta', 18, 'verano, días muy largos'),      // dic
    ],
  },
  // ── Nueva York — hemisferio norte; clima continental ──
  'nueva-york': {
    nombre: 'Nueva York', emoji: '🗽', hemisferio: 'norte',
    huracanes: 'cola de la temporada del Atlántico (ago-oct), rara vez impacto directo',
    resumen: 'Mejor primavera (abr-jun) y otoño (sep-nov). Verano húmedo, invierno con nieve y frío.',
    meses: [
      m(false, false, 'baja', 4, 'invierno frío, posible nieve'),  // ene
      m(false, false, 'baja', 5, 'invierno frío, posible nieve'),  // feb
      m(false, false, 'media', 9, 'fin de invierno, fresco'),      // mar
      m(false, false, 'alta', 16, 'primavera agradable'),          // abr
      m(false, false, 'alta', 21, 'primavera, ideal'),             // may
      m(false, false, 'alta', 26, 'inicio de verano, agradable'),  // jun
      m(false, true,  'alta', 29, 'verano caluroso y húmedo'),     // jul
      m(false, true,  'alta', 28, 'verano húmedo, tormentas'),     // ago
      m(false, true,  'alta', 24, 'otoño, ideal'),                 // sep
      m(false, true,  'alta', 18, 'otoño dorado, ideal'),          // oct
      m(false, false, 'media', 11, 'otoño fresco'),                // nov
      m(false, false, 'media', 6, 'invierno, luces navideñas'),    // dic
    ],
  },
  // ── Madrid / España — hemisferio norte; mediterráneo continental ──
  'madrid': {
    nombre: 'Madrid / España', emoji: '🇪🇸', hemisferio: 'norte',
    huracanes: null,
    resumen: 'Mejor primavera (abr-jun) y otoño (sep-oct). Verano muy caluroso, invierno frío y seco.',
    meses: [
      m(false, false, 'baja', 10, 'invierno frío y seco'),         // ene
      m(false, false, 'baja', 12, 'invierno fresco'),              // feb
      m(false, false, 'media', 16, 'primavera, templado'),         // mar
      m(true,  false, 'alta', 18, 'primavera, lluvias ocasionales'), // abr
      m(true,  false, 'alta', 22, 'primavera, ideal'),             // may
      m(false, false, 'alta', 28, 'inicio de verano, caluroso'),   // jun
      m(false, false, 'media', 33, 'verano muy caluroso y seco'),  // jul
      m(false, false, 'media', 33, 'verano muy caluroso y seco'),  // ago
      m(false, false, 'alta', 28, 'inicio de otoño, ideal'),       // sep
      m(false, false, 'alta', 21, 'otoño agradable'),              // oct
      m(true,  false, 'media', 14, 'otoño fresco, lluvias'),       // nov
      m(false, false, 'media', 10, 'invierno, mercados navideños'), // dic
    ],
  },
  // ── París / Europa occidental — hemisferio norte; oceánico, lluvia repartida ──
  'paris': {
    nombre: 'París / Europa', emoji: '🗼', hemisferio: 'norte',
    huracanes: null,
    resumen: 'Mejor de mayo a septiembre (templado, días largos). Invierno frío, gris y con lluvia.',
    meses: [
      m(true,  false, 'baja', 7, 'invierno frío y gris'),          // ene
      m(true,  false, 'baja', 8, 'invierno frío'),                 // feb
      m(true,  false, 'media', 12, 'primavera temprana, variable'), // mar
      m(true,  false, 'media', 15, 'primavera, lluvias'),          // abr
      m(true,  false, 'alta', 19, 'primavera, agradable'),         // may
      m(false, false, 'alta', 23, 'inicio de verano, ideal'),      // jun
      m(false, false, 'alta', 25, 'verano, alta turística'),       // jul
      m(false, false, 'alta', 25, 'verano, alta turística'),       // ago
      m(false, false, 'alta', 21, 'otoño, ideal'),                 // sep
      m(true,  false, 'media', 16, 'otoño, lluvias'),              // oct
      m(true,  false, 'media', 10, 'otoño gris y lluvioso'),       // nov
      m(true,  false, 'media', 7, 'invierno, mercados navideños'), // dic
    ],
  },
  // ── Tailandia / Sudeste Asiático — hemisferio norte; monzón may-oct ──
  'tailandia': {
    nombre: 'Tailandia / Sudeste Asiático', emoji: '🛕', hemisferio: 'norte',
    huracanes: null,
    resumen: 'Mejor de noviembre a marzo (fresca y seca). Monzón con lluvias: mayo a octubre.',
    meses: [
      m(false, false, 'alta', 32, 'seco y soleado, ideal'),        // ene
      m(false, false, 'alta', 33, 'seco y soleado'),               // feb
      m(false, false, 'media', 34, 'calor, fin de la seca'),       // mar
      m(false, false, 'media', 35, 'muy caluroso (pre-monzón)'),   // abr
      m(true,  false, 'baja', 34, 'inicio del monzón, lluvias'),   // may
      m(true,  false, 'baja', 33, 'monzón, lluvias de tarde'),     // jun
      m(true,  false, 'baja', 32, 'monzón, lluvias'),              // jul
      m(true,  false, 'media', 32, 'monzón, lluvias'),             // ago
      m(true,  false, 'baja', 32, 'monzón, máx. de lluvia'),       // sep
      m(true,  false, 'baja', 31, 'fin del monzón, aún lluvioso'), // oct
      m(false, false, 'alta', 31, 'inicio de la seca, ideal'),     // nov
      m(false, false, 'alta', 31, 'seco y fresco, ideal'),         // dic
    ],
  },
  // ── Perú / Cusco-Machu Picchu — hemisferio sur; lluvias nov-mar, seca may-sep ──
  'peru-cusco': {
    nombre: 'Perú (Cusco / Machu Picchu)', emoji: '⛰️', hemisferio: 'sur',
    huracanes: null,
    resumen: 'Mejor de mayo a septiembre (seca, ideal para trekking). Lluvias: noviembre a marzo.',
    meses: [
      m(true,  false, 'media', 19, 'lluvioso, verde y con barro'),  // ene
      m(true,  false, 'baja', 19, 'máx. lluvia (Camino Inca cerrado)'), // feb
      m(true,  false, 'media', 20, 'lluvias decreciendo'),          // mar
      m(false, false, 'alta', 20, 'fin de lluvias, ideal'),         // abr
      m(false, false, 'alta', 20, 'seca, ideal'),                   // may
      m(false, false, 'alta', 20, 'seca, alta turística'),          // jun
      m(false, false, 'alta', 20, 'seca, alta (noches frías)'),     // jul
      m(false, false, 'alta', 21, 'seca, alta turística'),          // ago
      m(false, false, 'alta', 21, 'seca, ideal y menos gente'),     // sep
      m(true,  false, 'media', 21, 'primeras lluvias'),             // oct
      m(true,  false, 'media', 21, 'lluvias, paisaje verde'),       // nov
      m(true,  false, 'media', 20, 'lluvioso, fiestas locales'),    // dic
    ],
  },
  // ── Cataratas del Iguazú — hemisferio sur; subtropical, lluvia todo el año, más en verano ──
  'iguazu': {
    nombre: 'Cataratas del Iguazú', emoji: '💦', hemisferio: 'sur',
    huracanes: null,
    resumen: 'Mejor en otoño-primavera (mar-may, sep-nov): caudal y clima templado. Verano húmedo y caluroso.',
    meses: [
      m(true,  false, 'alta', 33, 'verano, calor húmedo y caudal alto'), // ene
      m(true,  false, 'alta', 32, 'verano húmedo y caluroso'),     // feb
      m(true,  false, 'media', 30, 'otoño, templado, buen caudal'), // mar
      m(false, false, 'alta', 27, 'otoño agradable, ideal'),       // abr
      m(false, false, 'media', 24, 'fresco, agradable'),           // may
      m(false, false, 'media', 22, 'invierno suave'),              // jun
      m(false, false, 'alta', 23, 'invierno, vacaciones'),         // jul
      m(false, false, 'media', 25, 'fin de invierno, seco'),       // ago
      m(false, false, 'media', 27, 'primavera templada, ideal'),   // sep
      m(true,  false, 'media', 29, 'primavera, lluvias y caudal'), // oct
      m(true,  false, 'media', 30, 'cálido, caudal alto'),         // nov
      m(true,  false, 'alta', 32, 'verano, calor y caudal alto'),  // dic
    ],
  },
  // ── Bariloche — hemisferio sur; ski jul-ago, trekking dic-feb ──
  'bariloche': {
    nombre: 'Bariloche', emoji: '🎿', hemisferio: 'sur',
    huracanes: null,
    resumen: 'Doble pico: invierno (jul-ago) para ski y verano (dic-feb) para trekking y lagos.',
    meses: [
      m(false, false, 'alta', 24, 'verano, trekking y lagos'),     // ene
      m(false, false, 'alta', 24, 'verano, trekking y lagos'),     // feb
      m(false, false, 'media', 20, 'otoño, colores y menos gente'), // mar
      m(true,  false, 'media', 15, 'otoño, lluvias'),              // abr
      m(true,  false, 'baja', 10, 'frío, lluvioso'),               // may
      m(true,  false, 'media', 7, 'inicio de temporada de nieve'), // jun
      m(true,  false, 'alta', 6, 'invierno, ski (vacaciones)'),    // jul
      m(true,  false, 'alta', 7, 'invierno, mejor nieve para ski'), // ago
      m(true,  false, 'media', 11, 'primavera, deshielo'),         // sep
      m(false, false, 'media', 15, 'primavera, mejora el clima'),  // oct
      m(false, false, 'media', 19, 'primavera, ideal'),            // nov
      m(false, false, 'alta', 22, 'inicio de verano, ideal'),      // dic
    ],
  },
  // ── Orlando — hemisferio norte; lluvias verano, ciclónico jun-nov ──
  'orlando': {
    nombre: 'Orlando', emoji: '🎢', hemisferio: 'norte',
    huracanes: 'temporada de huracanes del Atlántico, 1 jun – 30 nov (pico ago-oct)',
    resumen: 'Mejor de noviembre a abril (seco, fresco, parques agradables). Verano: calor, tormentas y ciclones.',
    meses: [
      m(false, false, 'alta', 22, 'seco y templado'),              // ene
      m(false, false, 'alta', 24, 'seco y agradable'),             // feb
      m(false, false, 'alta', 27, 'primavera, ideal'),             // mar
      m(false, false, 'alta', 29, 'cálido y seco'),                // abr
      m(true,  false, 'media', 31, 'calor, primeras tormentas'),   // may
      m(true,  true,  'media', 32, 'lluvias de tarde, riesgo ciclónico'), // jun
      m(true,  true,  'alta', 33, 'calor, tormentas diarias'),     // jul
      m(true,  true,  'alta', 33, 'pico de calor y huracanes'),    // ago
      m(true,  true,  'baja', 32, 'pico de huracanes'),            // sep
      m(true,  true,  'media', 29, 'lluvias decreciendo'),         // oct
      m(false, false, 'alta', 25, 'seco y agradable, ideal'),      // nov
      m(false, false, 'alta', 22, 'seco, fresco (Navidad)'),       // dic
    ],
  },
  // ── Punta del Este — hemisferio sur; balneario, verano = temporada alta ──
  'punta-del-este': {
    nombre: 'Punta del Este', emoji: '⛱️', hemisferio: 'sur',
    huracanes: null,
    resumen: 'Mejor en verano (dic-feb): playas y movida. Fuera de temporada queda muy tranquilo.',
    meses: [
      m(false, false, 'alta', 28, 'verano, playa y movida'),       // ene
      m(false, false, 'alta', 27, 'verano, playa (más tranquilo)'), // feb
      m(false, false, 'media', 24, 'fin de verano, agradable'),    // mar
      m(false, false, 'baja', 20, 'otoño, tranquilo'),             // abr
      m(false, false, 'baja', 16, 'fresco, fuera de temporada'),   // may
      m(false, false, 'baja', 13, 'invierno, muy tranquilo'),      // jun
      m(false, false, 'baja', 12, 'invierno, muy tranquilo'),      // jul
      m(false, false, 'baja', 14, 'fin de invierno, tranquilo'),   // ago
      m(false, false, 'baja', 16, 'primavera, despertando'),       // sep
      m(false, false, 'media', 19, 'primavera, agradable'),        // oct
      m(false, false, 'media', 22, 'primavera, pre-temporada'),    // nov
      m(false, false, 'alta', 25, 'inicio de verano, se llena'),   // dic
    ],
  },
};

const NOMBRE_TEMP: Record<string, string> = { alta: 'alta', media: 'media', baja: 'baja' };

function recomendar(d: MesData): { texto: string; nivel: 'buena' | 'regular' | 'evitar' } {
  // Lógica honesta: huracán pesa más que cualquier cosa; luego lluvia; la temporada
  // alta NO es necesariamente buena (precios/gente) pero suele coincidir con buen clima.
  if (d.huracan && d.lluvia) {
    return { texto: 'Época a evitar: cae en temporada de huracanes y de lluvias. Si vas, contratá seguro y seguí los partes meteorológicos.', nivel: 'evitar' };
  }
  if (d.huracan) {
    return { texto: 'Con cuidado: estás dentro de la temporada de huracanes. El riesgo de un evento puntual existe; conviene seguro de viaje.', nivel: 'regular' };
  }
  if (d.lluvia && d.temp === 'baja') {
    return { texto: 'Temporada baja y lluviosa: encontrás mejores precios y menos gente, pero contá con días de lluvia.', nivel: 'regular' };
  }
  if (d.lluvia) {
    return { texto: 'Buena época con reparos: clima principalmente lluvioso, pero suele despejar en parte del día. Llevá ropa impermeable.', nivel: 'regular' };
  }
  if (d.temp === 'alta') {
    return { texto: '¡Muy buena época! Clima favorable y temporada alta de turismo (reservá con tiempo, va a haber gente y precios más altos).', nivel: 'buena' };
  }
  if (d.temp === 'baja') {
    return { texto: 'Buena oportunidad: clima seco y temporada baja, así que vas a encontrar mejores precios y menos multitudes.', nivel: 'buena' };
  }
  return { texto: 'Buena época: clima estable y temporada media (buen equilibrio entre clima, precios y cantidad de gente).', nivel: 'buena' };
}

export function calcularMejorEpocaViaje(inputs: EpocaViajeInputs): EpocaViajeOutputs {
  const destKey = String(inputs.destino || 'punta-cana').toLowerCase();
  const d = DESTINOS[destKey] || DESTINOS['punta-cana'];

  const mesRaw = String(inputs.mes ?? 'enero').toLowerCase().trim();
  const mi = MES_INDEX[mesRaw] ?? 0;
  const md = d.meses[mi];
  const mesNombre = MESES[mi];

  const rec = recomendar(md);

  // Etiquetas de salida.
  const epocaLluvias = md.lluvia ? 'Sí — estación de lluvias' : 'No — época seca';
  const epocaHuracanes = d.huracanes == null
    ? 'No aplica en este destino'
    : (md.huracan
        ? `Sí — dentro de la ${d.huracanes}`
        : `No (la ${d.huracanes})`);
  const temporada = `Temporada ${NOMBRE_TEMP[md.temp]} de turismo`;
  const climaEsperado = `~${md.tC}°C — ${md.cond}`;

  // ── Tabla: calendario ANUAL del destino (el hook compartible) ──
  const sigla = (t: 'alta' | 'media' | 'baja') => t === 'alta' ? 'Alta' : t === 'media' ? 'Media' : 'Baja';
  const tableRows = d.meses.map((x, i) => [
    (i === mi ? '▶ ' : '') + MESES[i],
    x.lluvia ? '🌧️ Lluvias' : '☀️ Seca',
    d.huracanes == null ? '—' : (x.huracan ? '🌀 Sí' : 'No'),
    sigla(x.temp),
    `~${x.tC}°C`,
  ]);

  // ── Insight narrativo ──
  const iconNivel = rec.nivel === 'buena' ? '✅' : rec.nivel === 'regular' ? '⚠️' : '🚫';
  let narrativa = `En ${d.nombre}, ${mesNombre} es `;
  const partes: string[] = [];
  partes.push(md.lluvia ? 'época de lluvias' : 'época seca');
  if (d.huracanes != null && md.huracan) partes.push('cae en temporada de huracanes');
  partes.push(`temporada turística ${NOMBRE_TEMP[md.temp]}`);
  partes.push(`con ~${md.tC}°C (${md.cond})`);
  narrativa += partes.join(', ') + '. ' + rec.texto + ' ' + d.resumen;

  return {
    epocaLluvias,
    epocaHuracanes,
    temporada,
    climaEsperado,
    recomendacion: rec.texto,
    _insight: { type: 'highlight', icon: iconNivel, text: narrativa },
    _table: {
      title: `Calendario anual de ${d.nombre} — ¿cuándo conviene ir?`,
      headers: ['Mes', 'Lluvia / seca', 'Huracanes', 'Temporada', 'Temp.'],
      rows: tableRows,
      note: 'Patrones climáticos PROMEDIO con fines orientativos — el clima varía año a año. La temporada turística "alta" suele traer buen clima pero también más gente y precios. Verificá el pronóstico antes de viajar.',
    },
  };
}
