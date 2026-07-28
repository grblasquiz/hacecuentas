import type { HubData } from './types';
import { NAFTA_NACIONAL, NAFTA_META } from '../data/nafta-precios';

/**
 * Hub de decisión — "¿Me conviene un auto eléctrico (o GNC) en vez de nafta?"
 *
 * Arquetipo RAMIFICADO. La pregunta no tiene una sola respuesta numérica: cambia
 * según qué estés evaluando. Las ramas son las cuatro decisiones reales:
 *   1. paso a un eléctrico (BEV)  → ahorro anual + repago del sobreprecio + TCO 5 años
 *   2. convierto a GNC            → ahorro anual + amortización del equipo
 *   3. me quedo con nafta         → cuánto gasto y cuánto estoy dejando sobre la mesa
 *   4. sólo quiero saber cuánto contamino → g CO2/km, toneladas/año y árboles
 *
 * Por qué ramificado y no un `select` de "con qué lo comparo": el eléctrico y el
 * GNC no se deciden con la misma cuenta. En el eléctrico la variable que manda es
 * el SOBREPRECIO de compra (años de repago, TCO a 5 años); en el GNC es el COSTO
 * DEL EQUIPO (meses de amortización) y el auto es el mismo. Meter las dos en un
 * solo flujo obliga a mostrar filas que no aplican. Además la rama de CO2 devuelve
 * kilos, no pesos, y necesita su propio formato de resultado.
 *
 * Absorbe 7 calculadoras (ver hub.replaces).
 *
 * DE DÓNDE SALEN LOS NÚMEROS
 *  - Factor de consumo del GNC (1,3 m³ por cada litro de nafta):
 *    `src/lib/formulas/comparar-nafta-vs-gnc-ahorro.ts`.
 *  - Factores de emisión 2,31 kg CO2/L nafta · 2,68 kg/L gasoil · 1,88 kg/m³ GNC:
 *    `src/lib/formulas/emision-co2-auto-combustible.ts` y `huella-carbono-auto-anual.ts`.
 *  - Árbol = 22 kg CO2 absorbidos por año: mismas fórmulas.
 *  - Tasas del TCO a 5 años (depreciación, mantenimiento, patente, seguro):
 *    `src/lib/formulas/auto-electrico-vs-nafta-tco-5-anos-argentina.ts`.
 *  - Precio del litro por defecto: snapshot oficial de la Secretaría de Energía
 *    (`src/lib/data/nafta-precios.ts`), el mismo que usan los otros hubs de Auto.
 *
 * NOTAS DE CONTRATO
 *  - `Object.assign` copia `undefined`: una fila sin `format` propio se imprime en
 *    pesos. Litros, m³, kWh, kg, gramos, años, meses, %, árboles y $/km llevan su
 *    `format` explícito. TODAS las filas de este hub lo declaran.
 *  - El resultado de la rama de CO2 declara `format: 'unit'` para que la leyenda
 *    del gráfico muestre kilos y no pesos.
 */

/** Copiado textual de getCalculatorDisclaimer() — dominio 'finance'. */
const DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

const NAFTA_SUPER = NAFTA_NACIONAL['Nafta Súper'] ?? 1425;
/**
 * El m³ de GNC no está en el snapshot de la Secretaría de Energía (que sólo
 * releva líquidos). Se usa como valor de arranque el 45% del litro de nafta
 * súper, que es la relación que sostiene el surtidor argentino desde hace años.
 * Es un campo editable: el número que manda es el de tu estación.
 */
const GNC_M3 = Math.round(NAFTA_SUPER * 0.45);

const miles = (n: number) => Math.round(n).toLocaleString('es-AR');

export const hub: HubData = {
  slug: 'auto/electrico-vs-nafta',
  title: '¿Conviene un auto eléctrico o GNC en vez de nafta? — Calculadora de ahorro y TCO',
  description:
    'Cuánto sale cargar un eléctrico contra llenar el tanque, cuánto ahorrás por año, en cuántos años se repaga el sobreprecio del eléctrico, en cuántos meses se amortiza un equipo de GNC y cuánto CO2 emite tu auto. Con precios de combustible oficiales.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Comparador de costo de uso',
  h1: '¿Me conviene un eléctrico o GNC en vez de nafta?',
  lede:
    'Cargar es más barato que llenar el tanque: eso casi nunca está en discusión. La pregunta real es si el ahorro alcanza para pagar el sobreprecio del auto eléctrico o el equipo de GNC, y en cuánto tiempo. Elegí qué estás evaluando y la cuenta se arma sola.',
  stamps: [
    'Actualizado 27-07-2026',
    `Nafta súper $${miles(NAFTA_SUPER)}/L — Secretaría de Energía ${NAFTA_META.mes}`,
    '7 calculadoras adentro',
  ],

  resultLabel: 'Resultado de tu caso',

  cases: {
    title: '¿Qué estás evaluando?',
    intro: 'Partimos del caso más buscado: pasarse a un eléctrico. Si tu situación es otra, cambiala.',
    items: [
      {
        id: 'electrico',
        label: 'Paso de nafta a un auto eléctrico',
        hint: 'BEV · el caso más consultado',
        answer: 'El eléctrico gana en el uso; la pregunta es en cuántos años recuperás el sobreprecio.',
        yes: [
          'Costo anual de cargar contra costo anual de llenar el tanque, con tus km y tus precios',
          'Años de repago: el sobreprecio del eléctrico dividido por el ahorro anual en energía',
          'Costo total de propiedad a 5 años: depreciación, energía, mantenimiento, patente y seguro',
          'Costo por kilómetro de cada opción, que es la comparación más honesta',
          'Emisiones: las del tubo de escape contra las de la red eléctrica que te carga',
        ],
        warn: [
          DISCLAIMER,
          'Cargar en un cargador rápido público puede costar el doble o el triple que cargar en casa de noche: el número de arriba supone carga domiciliaria',
          'La batería es el componente caro del auto. Un recambio fuera de garantía se come varios años de ahorro',
          'El mercado de usados eléctricos en Argentina todavía es chico: la reventa es más lenta y más imprevisible que la de un nafta',
          'Si no tenés dónde enchufarlo todas las noches, el ahorro teórico no se materializa',
        ],
        plazo:
          'si el repago te da más años de los que pensás tener el auto, la cuenta no cierra por más barato que sea cargar.',
      },
      {
        id: 'gnc',
        label: 'Convierto mi auto a GNC',
        hint: 'Equipo + tubo · mismo auto',
        answer: 'Con GNC el ahorro por kilómetro es grande y el equipo se amortiza en meses, no en años.',
        yes: [
          'Gasto mensual y anual con nafta contra el mismo recorrido con GNC',
          'Consumo de GNC estimado en 1,3 m³ por cada litro de nafta que gasta tu auto',
          'Meses de amortización del equipo: lo que salió dividido por el ahorro mensual',
          'Emisiones de CO2 del GNC contra las de la nafta',
        ],
        warn: [
          DISCLAIMER,
          'El equipo pide oblea de revisión periódica y el tubo tiene vida útil limitada: son costos recurrentes que no están en la amortización',
          'El tubo se come buena parte del baúl y suma entre 40 y 70 kg al auto',
          'Con GNC el motor entrega menos potencia y el consumo real sube en ciudad y con el aire acondicionado prendido',
          'No todas las rutas tienen estaciones con GNC: para viajes largos vas a seguir cargando nafta',
        ],
        plazo:
          'la oblea de habilitación del equipo se renueva periódicamente; sin oblea vigente la estación no te carga.',
      },
      {
        id: 'nafta',
        label: 'Me quedo con nafta: quiero saber cuánto gasto',
        hint: 'Nafta o gasoil',
        answer: 'Primero poné número al gasto actual: es el que después vas a comparar.',
        yes: [
          'Litros por año y gasto anual y mensual en combustible',
          'Costo por kilómetro con los precios de hoy',
          'Cuánto estarías ahorrando por año si el mismo recorrido lo hicieras con GNC o con un eléctrico',
        ],
        warn: [
          DISCLAIMER,
          'El precio del litro se mueve varias veces al año: la cuenta anual es una proyección, no una certeza',
          'El consumo declarado por el fabricante suele ser optimista: en ciudad, sumale entre 15% y 25%',
          'El combustible es sólo una parte del costo del auto: seguro, patente, service y depreciación pesan más de lo que parece',
        ],
        plazo: 'anotá los litros de dos o tres tanques seguidos: es la única forma de saber tu consumo real.',
      },
      {
        id: 'co2',
        label: 'Sólo quiero saber cuánto contamina mi auto',
        hint: 'Huella de carbono anual',
        answer: 'Tu huella al volante son los litros que quemás por el factor de emisión del combustible.',
        yes: [
          'Gramos de CO2 por kilómetro y en qué franja de emisión cae tu auto',
          'Kilos y toneladas de CO2 al año según los kilómetros que hacés',
          'Cuántos árboles harían falta un año entero para absorber esa cantidad',
          'Comparación con lo que emitiría el mismo recorrido en GNC o en eléctrico',
        ],
        warn: [
          DISCLAIMER,
          'Un eléctrico no emite cero: emite lo que emitió la red que lo cargó. En Argentina buena parte de la generación es térmica',
          'El cálculo cubre el tubo de escape, no la fabricación del auto ni la de la batería',
          'Los factores de emisión son valores de referencia por litro o por m³; el número real varía con el corte de biocombustible',
        ],
        plazo: 'para compensar de verdad, la palanca más fuerte no es el combustible: es hacer menos kilómetros.',
      },
    ],
  },

  inputsTitle: 'Tus kilómetros, tus consumos y tus precios',
  inputsIntro:
    'Los precios vienen cargados con el promedio nacional, pero el número que manda es el de tu estación y el de tu factura de luz.',
  fields: [
    {
      id: 'kmAnio',
      label: 'Kilómetros que hacés por año',
      type: 'number',
      suffix: 'km',
      min: 0,
      max: 200000,
      step: 500,
      value: 15000,
      help: 'Un auto particular en Argentina promedia entre 12.000 y 18.000 km al año.',
    },
    {
      id: 'consumoNafta',
      label: 'Consumo de tu auto a nafta',
      type: 'number',
      suffix: 'L/100km',
      min: 2,
      max: 30,
      step: 0.1,
      value: 8,
      help: 'Un auto chico ronda 6,5 L/100km; un SUV mediano, 9 a 10; una pick-up, 11 o más.',
    },
    {
      id: 'precioNafta',
      label: 'Precio del litro',
      prefix: '$',
      value: miles(NAFTA_SUPER),
      thousands: true,
      help: `Promedio nacional de nafta súper del relevamiento oficial de ${NAFTA_META.mes}. Si cargás gasoil o premium, cambialo.`,
    },
    {
      id: 'combustible',
      label: 'Combustible que usás hoy',
      type: 'select',
      value: 'nafta',
      options: [
        { value: 'nafta', label: 'Nafta (2,31 kg CO2 por litro)' },
        { value: 'gasoil', label: 'Gasoil / diésel (2,68 kg CO2 por litro)' },
      ],
      help: 'Cambia el factor de emisión que se usa en el cálculo de CO2.',
    },
    {
      id: 'consumoEV',
      label: 'Consumo del eléctrico que estás mirando',
      type: 'number',
      suffix: 'kWh/100km',
      min: 5,
      max: 50,
      step: 0.5,
      value: 16,
      help: 'Un compacto eléctrico ronda 14 a 16 kWh/100km; un SUV eléctrico, 18 a 20; un utilitario, 22.',
    },
    {
      id: 'precioKwh',
      label: 'Precio del kWh en tu factura',
      prefix: '$',
      type: 'number',
      min: 0,
      max: 100000,
      step: 1,
      value: 130,
      help: 'Sacalo de tu boleta: importe total del período dividido por los kWh consumidos, así incluye cargos e impuestos.',
    },
    {
      id: 'precioGnc',
      label: 'Precio del m³ de GNC',
      prefix: '$',
      value: miles(GNC_M3),
      thousands: true,
      help: 'Valor de arranque tomado como el 45% del litro de nafta súper. Ponele el de tu estación.',
    },
    {
      id: 'precioElectrico',
      label: 'Precio del auto eléctrico',
      prefix: '$',
      value: '48.000.000',
      thousands: true,
      help: 'Precio de lista o el que te pasaron. Se usa para el sobreprecio y para el TCO a 5 años.',
    },
    {
      id: 'precioNaftaAuto',
      label: 'Precio del auto a nafta equivalente',
      prefix: '$',
      value: '34.000.000',
      thousands: true,
      help: 'El auto de tamaño y equipamiento parecido que comprarías si no fuera eléctrico.',
    },
    {
      id: 'costoEquipoGnc',
      label: 'Costo del equipo de GNC instalado',
      prefix: '$',
      value: '2.500.000',
      thousands: true,
      help: 'Equipo de quinta generación con tubo, instalación y oblea. Varía mucho por taller y capacidad del tubo.',
    },
    {
      id: 'tipoCambio',
      label: 'Dólar que usás de referencia',
      prefix: '$',
      value: '1.400',
      thousands: true,
      help: 'Sólo para el TCO: el mantenimiento anual de referencia está expresado en dólares.',
    },
  ],
  fineprint: `${DISCLAIMER} El precio del litro por defecto es el promedio nacional de la Secretaría de Energía (${NAFTA_META.mes}); el consumo de GNC se estima en 1,3 m³ por litro de nafta y las emisiones usan factores de referencia por litro y por m³.`,

  chart: {
    type: 'bars',
    title: 'Nafta, eléctrico y GNC en el mismo recorrido',
    caption:
      'Las tres porciones comparan lo que cuesta —o lo que emite, si estás en la rama de CO2— hacer exactamente los mismos kilómetros con cada energía. No es una composición de un total: es la misma cuenta hecha tres veces para que la diferencia se vea de una.',
  },
  breakdownTitle: 'La cuenta, línea por línea',
  breakdownIntro:
    'Las filas en pesos son plata; las de litros, m³, kWh, kilos de CO2, años, meses y porcentajes llevan su unidad. Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿Cuánto sale cargar un auto eléctrico comparado con llenar el tanque?',
      a: 'La cuenta es directa: el eléctrico consume kWh cada 100 km por el precio de tu kWh; el de nafta, litros cada 100 km por el precio del litro. Con un eléctrico de 16 kWh/100km a $130 el kWh, 100 km salen unos $2.080. El mismo recorrido en un auto de 8 L/100km con nafta a $1.425 el litro son 8 litros, cerca de $11.400. La diferencia por kilómetro suele ser de tres a cinco veces a favor del eléctrico, siempre que cargues en casa.',
    },
    {
      q: '¿En cuántos años se recupera el sobreprecio de un auto eléctrico?',
      a: 'Se divide la diferencia de precio entre el eléctrico y el auto a nafta equivalente por el ahorro anual en energía. Si el eléctrico sale 14 millones más y ahorrás 1,4 millones por año en combustible, el repago está en 10 años. Ese es el número que decide: si pensás tener el auto menos tiempo que eso, el ahorro de uso no alcanza a pagar el sobreprecio, por más barato que sea cargar.',
    },
    {
      q: '¿Qué es el TCO y por qué no alcanza con mirar el combustible?',
      a: 'El TCO es el costo total de propiedad: todo lo que te saca el auto mientras lo tenés. A cinco años son cinco rubros, y el combustible casi nunca es el más grande. Pesan más la depreciación —lo que perdés al venderlo—, el seguro y la patente, que se calculan sobre el valor del auto y por lo tanto castigan al eléctrico, que sale más caro. El mantenimiento, en cambio, juega a favor del eléctrico: sin aceite, filtros, bujías ni embrague, ronda la mitad.',
    },
    {
      q: '¿Cuánto GNC consume un auto que hace 8 litros de nafta cada 100 km?',
      a: 'Se estima en 1,3 m³ de GNC por cada litro de nafta, así que unos 10,4 m³ cada 100 km. El GNC tiene menos densidad energética que la nafta, por eso el consumo en volumen es mayor; lo que lo hace conveniente es que el m³ cuesta bastante menos de la mitad que el litro.',
    },
    {
      q: '¿En cuánto tiempo se paga un equipo de GNC?',
      a: 'Se divide el costo del equipo instalado por el ahorro mensual. La variable que manda no es el precio del equipo sino cuánto manejás: con 1.000 km por mes la amortización se estira, con 3.000 km por mes suele caer bajo el año. Por eso el GNC es la conversión típica de quien usa el auto para trabajar y no la de quien lo saca los fines de semana.',
    },
    {
      q: '¿Contamina un auto eléctrico?',
      a: 'No por el tubo de escape, pero sí por la red que lo carga. Emite lo que emitió generar los kWh que consumió, y eso depende de la matriz eléctrica del país: donde la generación es mayormente hidráulica o nuclear, las emisiones son muy bajas; donde es térmica a gas, no tanto. Aun así, en la mayoría de los escenarios el eléctrico emite bastante menos por kilómetro que un auto a nafta equivalente, porque el motor eléctrico es mucho más eficiente que el de combustión.',
    },
    {
      q: '¿Cuánto CO2 emite mi auto por kilómetro?',
      a: 'Los litros que consume cada 100 km por el factor de emisión del combustible: 2,31 kg de CO2 por litro de nafta y 2,68 por litro de gasoil. Un auto de 8 L/100km a nafta emite unos 185 g de CO2 por kilómetro. Por debajo de 130 g/km se considera muy baja emisión; entre 180 y 230 g/km, emisión promedio; arriba de 300 g/km, muy alta.',
    },
    {
      q: '¿El GNC contamina menos que la nafta?',
      a: 'Sí, aunque menos de lo que sugiere la diferencia de factores. El GNC emite 1,88 kg de CO2 por m³ contra 2,31 por litro de nafta, pero como consume 1,3 m³ por cada litro, la ventaja real ronda el 15% a 20% menos de CO2 por kilómetro, no el 20% que aparenta a primera vista. La ventaja mayor del GNC está en las partículas y el material particulado, no tanto en el CO2.',
    },
    {
      q: '¿Cuántos árboles hacen falta para compensar lo que emite mi auto?',
      a: 'Un árbol absorbe alrededor de 22 kg de CO2 por año. Un auto que emite 2,8 toneladas anuales necesitaría unos 127 árboles trabajando un año entero para compensarse. Es una referencia útil para dimensionar, no un mecanismo de compensación real: la absorción depende de la especie, la edad del árbol y el clima.',
    },
    {
      q: '¿Conviene cargar el eléctrico en casa o en un cargador público?',
      a: 'En casa, sin ninguna duda, y de noche si tenés tarifa diferenciada. La carga rápida pública cuesta bastante más por kWh porque paga la potencia contratada y la infraestructura del punto de carga. Si dependés sólo de cargadores públicos, el ahorro contra la nafta se achica mucho y el cálculo de repago del sobreprecio se estira. Todos los números de este hub suponen carga domiciliaria.',
    },
    {
      q: '¿Cuánto dura la batería de un auto eléctrico?',
      a: 'Las garantías típicas de fábrica cubren ocho años o entre 160.000 y 200.000 km, con un umbral mínimo de capacidad remanente —habitualmente 70%—. La degradación normal es de uno a dos puntos porcentuales por año y se acelera con carga rápida frecuente y con temperaturas extremas. El riesgo económico no es que la batería muera, es que el recambio fuera de garantía cuesta una fracción importante del auto.',
    },
    {
      q: '¿Y un híbrido común, sin enchufe?',
      a: 'Es una tercera vía que no pide ni sobreprecio de infraestructura ni equipo: reduce el consumo entre 20% y 35% en ciudad recuperando energía al frenar, y en ruta casi no aporta. Para estimarlo con este hub, cargá el consumo real del híbrido en el campo de consumo de nafta y usá la rama "me quedo con nafta": la comparación contra tu consumo actual te da el ahorro.',
    },
  ],

  sources: [
    {
      name: 'Precios en surtidor — relevamiento oficial de combustibles',
      url: 'http://datos.energia.gob.ar/dataset/precios-en-surtidor',
      publisher: 'Secretaría de Energía (Res. 314/2016)',
      date: NAFTA_META.mes,
    },
    {
      name: 'Cuadros tarifarios de energía eléctrica (precio del kWh)',
      url: 'https://www.argentina.gob.ar/enre/cuadros-tarifarios',
      publisher: 'ENRE',
    },
    {
      name: 'Gas Natural Comprimido — normativa, obleas y estaciones de carga',
      url: 'https://www.enargas.gob.ar/secciones/gnc/gnc.php',
      publisher: 'ENARGAS',
    },
    {
      name: 'Inventario Nacional de Gases de Efecto Invernadero — factores de emisión',
      url: 'https://inventariogei.ambiente.gob.ar/',
      publisher: 'Ministerio de Ambiente y Desarrollo Sostenible',
    },
    {
      name: 'IPCC Guidelines for National Greenhouse Gas Inventories — Mobile Combustion',
      url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html',
      publisher: 'IPCC',
      date: '2006',
    },
    {
      name: 'Informe mensual del sector eléctrico (composición de la generación)',
      url: 'https://cammesaweb.cammesa.com/informe-anual/',
      publisher: 'CAMMESA',
    },
    {
      name: 'Patentamientos y precios de referencia del mercado automotor',
      url: 'https://www.acara.org.ar/estadisticas',
      publisher: 'ACARA',
    },
  ],

  replaces: [
    '/calculadora-ahorro-auto-electrico-vs-nafta-anual',
    '/calculadora-auto-electrico-vs-nafta-tco-5-anos-argentina',
    '/calculadora-costo-cargar-auto-electrico-vs-nafta',
    '/calculadora-comparar-nafta-vs-gnc-ahorro',
    '/calculadora-emision-co2-auto-combustible',
    '/calculadora-emisiones-co2-auto-g-km-anual',
    '/calculadora-huella-carbono-auto-anual',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Constantes del cálculo. Todas salen de las fórmulas que el hub absorbe,
 * salvo CO2_KWH, que es el factor de emisión de la red eléctrica argentina
 * (ninguna de las fórmulas viejas modelaba las emisiones del eléctrico).
 */
export const PARAMS = {
  /** m³ de GNC por cada litro de nafta. Fuente: comparar-nafta-vs-gnc-ahorro.ts */
  FACTOR_GNC: 1.3,
  /** kg de CO2 por litro de nafta. Fuente: emision-co2-auto-combustible.ts */
  CO2_NAFTA: 2.31,
  /** kg de CO2 por litro de gasoil. Fuente: huella-carbono-auto-anual.ts */
  CO2_GASOIL: 2.68,
  /** kg de CO2 por m³ de GNC. Fuente: emision-co2-auto-combustible.ts */
  CO2_GNC: 1.88,
  /** kg de CO2 por kWh de la red argentina (factor de referencia, mix térmico-hidro-nuclear). */
  CO2_KWH: 0.35,
  /** kg de CO2 que absorbe un árbol en un año. Fuente: las tres fórmulas de huella. */
  ARBOL_KG: 22,
  /** Horizonte del TCO. Fuente: auto-electrico-vs-nafta-tco-5-anos-argentina.ts */
  ANOS: 5,
  DEP_ELECTRICO: 0.45,
  DEP_NAFTA: 0.55,
  /** Mantenimiento anual de referencia, en USD. */
  MANT_ELECTRICO_USD: 300,
  MANT_NAFTA_USD: 600,
  /** Patente: 1,5% anual sobre un valor fiscal que promedia el 70% del de compra. */
  PATENTE_TASA: 0.015,
  PATENTE_FACTOR_FISCAL: 0.7,
  /** Seguro: 2,5% anual sobre un valor que promedia el 75% del de compra. */
  SEGURO_TASA: 0.025,
  SEGURO_FACTOR_VALOR: 0.75,
};

/** Franjas de emisión en g CO2/km. Fuente: emision-co2-auto-combustible.ts */
export const FRANJAS_CO2 = [
  { nombre: 'Muy baja', max: 130 },
  { nombre: 'Baja', max: 180 },
  { nombre: 'Promedio', max: 230 },
  { nombre: 'Alta', max: 300 },
  // Sin tope real. Se usa un número grande porque `define:vars` serializa a JSON
  // y `Infinity` viajaría como `null`.
  { nombre: 'Muy alta', max: 100000 },
];
