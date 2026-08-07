import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántas millas necesito para este destino?"
 * Arquetipo CATÁLOGO: el programa de millas es un campo `select`, no un caso.
 * Reemplaza 5 calculadoras sueltas (ver hub.replaces).
 *
 * Las tablas de millas están centralizadas acá (antes vivían duplicadas en
 * src/lib/formulas/millas-*.ts). Los números son EXACTAMENTE los mismos que
 * servían esas calcs; ver PROGRAMAS.tablaRevisada para la fecha de revisión.
 */

export type Cabina = 'economy' | 'business';
export type TipoViaje = 'ida' | 'ida-vuelta';

/** Millas por destino en las 4 combinaciones cabina × tipo de viaje. */
export interface TarifaMillas {
  economyIda: number;
  economyIdaVuelta: number;
  businessIda: number;
  businessIdaVuelta: number;
}

export interface Programa {
  id: string;
  label: string;
  /** Aerolínea / alianza dueña del programa. */
  aerolinea: string;
  /** Valor de referencia editorial de la milla, en centavos de USD. NO es dato oficial. */
  centavosPorMilla: number;
  /** Tasas y fees típicos que se pagan en plata aunque el pasaje sea con millas. */
  tasasDefaultUsd: number;
  tasasRango: string;
  /** Fecha de la última revisión de la tabla de millas de ESTE programa. */
  tablaRevisada: string;
  /** Aclaración de cómo publica (o no) su tabla el programa. */
  nota: string;
  tabla: Record<string, TarifaMillas>;
}

/**
 * OJO — fidelidad con las calcs viejas: salvo United, las tablas originales
 * guardaban una tupla [economy ida, economy ida y vuelta, business] y usaban
 * el tercer valor para business SIN mirar el tipo de viaje. Se respeta esa
 * lectura (businessIda === businessIdaVuelta) para no cambiar ningún número
 * que ya estaba publicado. United sí tenía las 4 combinaciones explícitas.
 */
export const PROGRAMAS: Programa[] = [
  {
    id: 'lifemiles',
    label: 'LifeMiles (Avianca)',
    aerolinea: 'Avianca · Star Alliance',
    centavosPorMilla: 1.6,
    tasasDefaultUsd: 220,
    tasasRango: 'USD 160–300 aprox según ruta',
    tablaRevisada: '2026-07-27',
    nota: 'LifeMiles no cobra fuel surcharges: en cabina premium suele ser el canje que más rinde de la región.',
    tabla: {
      bogota: { economyIda: 7500, economyIdaVuelta: 15000, businessIda: 30000, businessIdaVuelta: 30000 },
      'buenos-aires': { economyIda: 20000, economyIdaVuelta: 40000, businessIda: 70000, businessIdaVuelta: 70000 },
      lima: { economyIda: 10000, economyIdaVuelta: 20000, businessIda: 40000, businessIdaVuelta: 40000 },
      'sao-paulo': { economyIda: 17500, economyIdaVuelta: 35000, businessIda: 60000, businessIdaVuelta: 60000 },
      miami: { economyIda: 15000, economyIdaVuelta: 30000, businessIda: 55000, businessIdaVuelta: 55000 },
      madrid: { economyIda: 30000, economyIdaVuelta: 60000, businessIda: 100000, businessIdaVuelta: 100000 },
    },
  },
  {
    id: 'latam',
    label: 'LATAM Pass',
    aerolinea: 'LATAM · oneworld',
    centavosPorMilla: 1.2,
    tasasDefaultUsd: 190,
    tasasRango: 'USD 150–300 aprox según ruta',
    tablaRevisada: '2026-07-27',
    nota: 'LATAM Pass pasó a precio dinámico: la tabla es un piso de referencia, la cotización real puede subir en alta temporada.',
    tabla: {
      'buenos-aires': { economyIda: 7000, economyIdaVuelta: 14000, businessIda: 30000, businessIdaVuelta: 30000 },
      santiago: { economyIda: 7000, economyIdaVuelta: 14000, businessIda: 30000, businessIdaVuelta: 30000 },
      miami: { economyIda: 25000, economyIdaVuelta: 50000, businessIda: 85000, businessIdaVuelta: 85000 },
      madrid: { economyIda: 45000, economyIdaVuelta: 90000, businessIda: 150000, businessIdaVuelta: 150000 },
      londres: { economyIda: 55000, economyIdaVuelta: 110000, businessIda: 170000, businessIdaVuelta: 170000 },
      sydney: { economyIda: 60000, economyIdaVuelta: 120000, businessIda: 180000, businessIdaVuelta: 180000 },
    },
  },
  {
    id: 'aadvantage',
    label: 'AAdvantage (American)',
    aerolinea: 'American Airlines · oneworld',
    centavosPorMilla: 1.4,
    tasasDefaultUsd: 225,
    tasasRango: 'USD 150–300 aprox según ruta',
    tablaRevisada: '2026-07-27',
    nota: 'American ya no publica tabla fija: son niveles saver de referencia. La tarifa web arranca ahí y sube según demanda.',
    tabla: {
      miami: { economyIda: 7500, economyIdaVuelta: 15000, businessIda: 30000, businessIdaVuelta: 30000 },
      nyc: { economyIda: 12500, economyIdaVuelta: 25000, businessIda: 50000, businessIdaVuelta: 50000 },
      la: { economyIda: 12500, economyIdaVuelta: 25000, businessIda: 50000, businessIdaVuelta: 50000 },
      madrid: { economyIda: 30000, economyIdaVuelta: 60000, businessIda: 100000, businessIdaVuelta: 100000 },
      londres: { economyIda: 30000, economyIdaVuelta: 60000, businessIda: 100000, businessIdaVuelta: 100000 },
      tokio: { economyIda: 35000, economyIdaVuelta: 70000, businessIda: 120000, businessIdaVuelta: 120000 },
    },
  },
  {
    id: 'mileageplus',
    label: 'MileagePlus (United)',
    aerolinea: 'United · Star Alliance',
    centavosPorMilla: 1.3,
    tasasDefaultUsd: 220,
    tasasRango: 'USD 140–300 aprox según ruta',
    tablaRevisada: '2026-07-27',
    nota: 'Niveles saver 2026. United es el único de los cinco con ida y ida-vuelta separadas también en business.',
    tabla: {
      nyc: { economyIda: 10000, economyIdaVuelta: 20000, businessIda: 35000, businessIdaVuelta: 70000 },
      la: { economyIda: 10000, economyIdaVuelta: 20000, businessIda: 35000, businessIdaVuelta: 70000 },
      londres: { economyIda: 30000, economyIdaVuelta: 60000, businessIda: 60000, businessIdaVuelta: 120000 },
      paris: { economyIda: 30000, economyIdaVuelta: 60000, businessIda: 60000, businessIdaVuelta: 120000 },
      tokio: { economyIda: 35000, economyIdaVuelta: 70000, businessIda: 80000, businessIdaVuelta: 160000 },
      sydney: { economyIda: 40000, economyIdaVuelta: 80000, businessIda: 85000, businessIdaVuelta: 170000 },
    },
  },
  {
    id: 'skymiles',
    label: 'SkyMiles (Delta)',
    aerolinea: 'Delta · SkyTeam',
    centavosPorMilla: 1.1,
    tasasDefaultUsd: 200,
    tasasRango: 'USD 130–300 aprox según ruta',
    tablaRevisada: '2026-07-27',
    nota: 'SkyMiles es 100% dinámico y sin tabla oficial: son promedios observados. En económica el valor por milla es el más bajo de los cinco.',
    tabla: {
      nyc: { economyIda: 10000, economyIdaVuelta: 20000, businessIda: 35000, businessIdaVuelta: 35000 },
      atlanta: { economyIda: 9000, economyIdaVuelta: 18000, businessIda: 35000, businessIdaVuelta: 35000 },
      'ciudad-de-mexico': { economyIda: 11000, economyIdaVuelta: 22000, businessIda: 40000, businessIdaVuelta: 40000 },
      cartagena: { economyIda: 12000, economyIdaVuelta: 25000, businessIda: 45000, businessIdaVuelta: 45000 },
      amsterdam: { economyIda: 30000, economyIdaVuelta: 60000, businessIda: 100000, businessIdaVuelta: 100000 },
      tokio: { economyIda: 35000, economyIdaVuelta: 70000, businessIda: 125000, businessIdaVuelta: 125000 },
    },
  },
];

/** Nombre lindo de cada destino de la unión de las 5 tablas. */
export const DESTINOS: Array<{ value: string; label: string }> = [
  { value: 'buenos-aires', label: 'Buenos Aires' },
  { value: 'santiago', label: 'Santiago de Chile' },
  { value: 'bogota', label: 'Bogotá' },
  { value: 'lima', label: 'Lima' },
  { value: 'sao-paulo', label: 'São Paulo' },
  { value: 'cartagena', label: 'Cartagena' },
  { value: 'ciudad-de-mexico', label: 'Ciudad de México' },
  { value: 'miami', label: 'Miami' },
  { value: 'nyc', label: 'Nueva York' },
  { value: 'la', label: 'Los Ángeles' },
  { value: 'atlanta', label: 'Atlanta' },
  { value: 'madrid', label: 'Madrid' },
  { value: 'londres', label: 'Londres' },
  { value: 'paris', label: 'París' },
  { value: 'amsterdam', label: 'Ámsterdam' },
  { value: 'tokio', label: 'Tokio' },
  { value: 'sydney', label: 'Sídney' },
];

export const hub: HubData = {
  slug: 'viajes/millas',
  title: '¿Cuántas millas necesito? LifeMiles, LATAM Pass y más 2026',
  description:
    'Elegí el programa (LifeMiles, LATAM Pass, AAdvantage, MileagePlus o SkyMiles) y el destino: te decimos cuántas millas necesitás, cuántas te faltan y si conviene canjear o pagar cash.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Guía de canjes y millas',
  h1: '¿Cuántas millas necesito para este destino? LifeMiles, LATAM Pass y más',
  lede:
    'Poné el programa, el destino y las millas que ya tenés en la cuenta. Te decimos cuántas pide el canje, cuántas te faltan y si la cuenta cierra mejor con millas o pagando el pasaje.',
  stamps: ['Tablas revisadas 27-07-2026', '5 programas adentro', '17 destinos'],

  resultLabel: 'Millas que necesitás',

  inputsTitle: 'Tu canje',
  inputsIntro: 'Podés dejar los valores de ejemplo y ajustarlos después.',
  fields: [
    {
      id: 'programa',
      label: 'Programa de millas',
      type: 'select',
      value: 'lifemiles',
      options: PROGRAMAS.map((p) => ({ value: p.id, label: p.label })),
      help: 'Cada programa tiene su propia tabla y su propio valor por milla.',
    },
    {
      id: 'destino',
      label: 'Destino',
      type: 'select',
      value: 'miami',
      options: DESTINOS,
      help: 'Si el programa elegido no vuela (o no publica tarifa) a ese destino, te lo avisamos.',
    },
    {
      id: 'cabina',
      label: 'Cabina',
      type: 'select',
      value: 'economy',
      options: [
        { value: 'economy', label: 'Económica' },
        { value: 'business', label: 'Business / premium' },
      ],
    },
    {
      id: 'tipoViaje',
      label: 'Tipo de viaje',
      type: 'select',
      value: 'ida-vuelta',
      options: [
        { value: 'ida-vuelta', label: 'Ida y vuelta' },
        { value: 'ida', label: 'Solo ida' },
      ],
    },
    {
      id: 'millasTenes',
      label: 'Millas que tenés hoy en la cuenta',
      value: '25.000',
      thousands: true,
      help: 'La pregunta real: ¿me alcanza o me faltan?',
    },
    {
      id: 'precioPasaje',
      label: 'Precio del pasaje pagando en efectivo (USD)',
      type: 'number',
      min: 0,
      value: 900,
      help: 'Sirve para comparar: cuánto vale cada milla en ESTE canje. Dejá 0 si no lo sabés.',
    },
    {
      id: 'tasas',
      label: 'Tasas e impuestos del canje (USD)',
      type: 'number',
      min: 0,
      value: 220,
      help: 'Se pagan en plata aunque el pasaje salga con millas. Dejalo en 0 para usar el default del programa.',
    },
  ],
  fineprint:
    'Las tablas son de referencia. LATAM Pass, AAdvantage, MileagePlus y SkyMiles cotizan por precio dinámico: la cotización real del día puede ser mayor.',

  chart: {
    type: 'progress',
    title: 'Cuánto te falta para este canje',
    caption:
      'La barra compara las millas que ya tenés contra las que pide el canje elegido. Si llegás al 100%, el pasaje ya te lo podés sacar hoy.',
  },
  breakdownTitle: 'La cuenta del canje',
  breakdownIntro:
    'Cada fila trae su unidad al lado del número: millas para el canje, USD para lo que pagás en plata y ¢USD para lo que rinde cada milla.',

  answer: {
    title: 'Cómo leer el resultado',
    copy:
      'Las millas nunca alcanzan solas: el canje siempre lleva tasas e impuestos en plata. La decisión "millas o cash" se juega en cuántos centavos de dólar te rinde cada milla contra el valor de referencia del programa.',
    yes: [
      'Millas que pide la tabla del programa para ese destino, cabina y tipo de viaje',
      'Cuántas millas te faltan (o te sobran) contra tu saldo actual',
      'Cuántos centavos de USD rinde cada milla en este canje concreto',
      'Las tasas e impuestos que vas a pagar igual, en efectivo',
    ],
    warn: [
      'Cuatro de los cinco programas cotizan por precio dinámico: la tabla es un piso, no una promesa',
      'Si las tasas se acercan al precio cash del pasaje, el canje deja de tener sentido',
      'Las millas vencen: LifeMiles y LATAM Pass tienen reglas de expiración propias',
    ],
    plazo:
      'los canjes de alta temporada (enero, julio, diciembre) se agotan con 9 a 11 meses de anticipación: buscá apenas se abre la ventana de reservas.',
  },

  faq: [
    {
      q: '¿Cuántas millas necesito para volar a Miami?',
      a: 'Depende del programa. Con LifeMiles son 15.000 millas solo ida y 30.000 ida y vuelta en económica (55.000 en business). Con LATAM Pass el mismo tramo arranca en 25.000 solo ida y 50.000 ida y vuelta. Con AAdvantage, que tiene hub en Miami, baja a 7.500 solo ida y 15.000 ida y vuelta.',
    },
    {
      q: '¿Cuántas millas Avianca LifeMiles necesito para un vuelo?',
      a: 'Depende del destino y la cabina. Con LifeMiles de Avianca, un Bogotá ida y vuelta en económica pide 15.000 millas; Lima, 20.000; Miami, 30.000; São Paulo, 35.000; Buenos Aires, 40.000 y Madrid, 60.000. En business el mismo Miami sube a 55.000 y Madrid a 100.000. LifeMiles no cobra fuel surcharges, así que en cabina premium suele ser el canje que más rinde de la región; las tasas rondan USD 160–300 según la ruta. Elegí LifeMiles en el selector y la calculadora te dice cuántas te faltan con tu saldo actual.',
    },
    {
      q: '¿Cuántas millas LATAM Pass necesito según el destino?',
      a: 'La tabla de referencia de LATAM Pass en económica ida y vuelta arranca en 14.000 millas para Buenos Aires o Santiago, 50.000 para Miami, 90.000 para Madrid, 110.000 para Londres y 120.000 para Sídney. En business, Miami pide 85.000 y Madrid 150.000. Ojo: LATAM Pass pasó a precio dinámico, así que estos valores son un piso y en alta temporada la cotización real puede subir. Las tasas del canje van aparte, unos USD 150–300 según la ruta.',
    },
    {
      q: '¿Me alcanzan las millas que tengo?',
      a: 'Poné tu saldo en el campo "Millas que tenés hoy en la cuenta" y la barra te muestra el porcentaje cubierto. Si te falta poco, casi todos los programas te dejan comprar el faltante o completar con dinero, aunque comprar millas suele ser el peor negocio del canje.',
    },
    {
      q: '¿Las tasas e impuestos se pagan con millas?',
      a: 'No. Salvo excepciones, las tasas, impuestos y fees de emisión se pagan siempre en efectivo o con tarjeta: van entre USD 130 y USD 300 según la ruta y el programa. Por eso un canje "gratis" nunca es gratis.',
    },
    {
      q: '¿Cuánto vale una milla?',
      a: 'Como referencia editorial usamos 1,6 centavos de dólar para LifeMiles, 1,4 para AAdvantage, 1,3 para MileagePlus, 1,2 para LATAM Pass y 1,1 para SkyMiles. No son valores oficiales de los programas: son promedios de mercado que sirven de umbral para decidir.',
    },
    {
      q: '¿Cuándo conviene canjear millas y cuándo pagar el pasaje?',
      a: 'Restá las tasas al precio cash del pasaje y dividí ese ahorro neto por las millas que gastás. Si el resultado supera el valor de referencia del programa, el canje conviene. Si queda por debajo, pagás el pasaje y te guardás las millas para un canje mejor.',
    },
    {
      q: '¿Por qué la web del programa me cotiza más millas que esta calculadora?',
      a: 'Porque LATAM Pass, AAdvantage, MileagePlus y SkyMiles eliminaron la tabla fija y cotizan por demanda. Los valores de acá son el nivel saver o el piso observado: en fecha alta, feriado o vuelo lleno, la cotización real sube. LifeMiles es el que más se parece todavía a una tabla.',
    },
    {
      q: '¿Conviene canjear en económica o en business?',
      a: 'En business, casi siempre. La diferencia de precio cash entre económica y business es mucho mayor que la diferencia en millas, así que cada milla rinde más. En LifeMiles se nota más porque no cobra fuel surcharges sobre el canje.',
    },
    {
      q: '¿Puedo canjear millas de un programa en aviones de otra aerolínea?',
      a: 'Sí, dentro de la alianza o de los acuerdos bilaterales: LifeMiles y MileagePlus mueven Star Alliance, LATAM Pass y AAdvantage mueven oneworld y SkyMiles mueve SkyTeam. Las tarifas de socios suelen tener su propia tabla, distinta de la del vuelo propio.',
    },
    {
      q: '¿Cuándo vencen las millas?',
      a: 'Cada programa tiene su regla y la cambia seguido. AAdvantage y MileagePlus mantienen el saldo mientras haya actividad (o directamente sin vencimiento en el caso de United); LifeMiles y LATAM Pass tienen plazos propios que se reinician con acumulación. Confirmalo siempre en la cuenta antes de planificar un canje lejano.',
    },
    {
      q: '¿Conviene comprar las millas que me faltan?',
      a: 'Solo si el precio por milla que te cobran queda claramente por debajo de lo que ese canje te va a rendir. Como regla, comprar millas a más de 2 centavos de dólar para un canje en económica es mal negocio: te sale más barato pagar el pasaje.',
    },
  ],

  sources: [
    {
      name: 'LifeMiles — tabla de canjes y reglas del programa',
      url: 'https://www.lifemiles.com/use/redeem',
      publisher: 'Avianca LifeMiles',
      date: 'consultado 27-07-2026',
    },
    {
      name: 'LATAM Pass — canje de pasajes con millas',
      url: 'https://latampass.latam.com/es_ar/acumular-canjear/canjear-millas',
      publisher: 'LATAM Airlines',
      date: 'consultado 27-07-2026',
    },
    {
      name: 'AAdvantage — award travel y niveles de millas',
      url: 'https://www.aa.com/i18n/aadvantage-program/miles/redeem/award-travel/award-travel.jsp',
      publisher: 'American Airlines',
      date: 'consultado 27-07-2026',
    },
    {
      name: 'MileagePlus — Award Travel',
      url: 'https://www.united.com/en/us/fly/mileageplus/awards.html',
      publisher: 'United Airlines',
      date: 'consultado 27-07-2026',
    },
    {
      name: 'SkyMiles — cómo usar tus millas',
      url: 'https://www.delta.com/us/en/skymiles/how-to-use-miles/overview',
      publisher: 'Delta Air Lines',
      date: 'consultado 27-07-2026',
    },
  ],

  replaces: [
    '/calculadora-millas-avianca-lifemiles',
    '/calculadora-millas-latam-destino',
    '/calculadora-millas-american-aa-destino',
    '/calculadora-millas-united-mileageplus',
    '/calculadora-millas-delta-skymiles',
  ],

  lastReviewed: '2026-08-07',
  audience: 'global',
};

/** Mapa plano para el <script is:inline> de la página. */
export const PROGRAMAS_MAP: Record<string, Programa> = Object.fromEntries(
  PROGRAMAS.map((p) => [p.id, p]),
);

export const DESTINO_LABEL: Record<string, string> = Object.fromEntries(
  DESTINOS.map((d) => [d.value, d.label]),
);
