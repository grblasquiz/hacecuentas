import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me cuesta la casa además del alquiler o la cuota?"
 *
 * Absorbe 6 URLs (ver hub.replaces): expensas, mantenimiento anual, seguro de
 * hogar, vida útil de electrodomésticos y las DOS calculadoras de mudanza.
 *
 * QUEDAN AFUERA a propósito y tienen hub propio: la factura de luz
 * (/hogar/factura-de-luz) y el gas y el agua (/hogar/gas-y-agua). Este hub las
 * toma como un único renglón "servicios" en la rama de mantenimiento y lo dice
 * en el copy: el número de acá NO desglosa las boletas de servicios.
 *
 * UNIFICACIÓN DE LAS DOS MUDANZAS (decisión de criterio, ver reporte):
 *   - costo-mudanza cobra por AMBIENTES + km + recargo de piso, y distingue
 *     con y sin ascensor.
 *   - mudanza-precio-kilometros-m3-cuadro cobra base fija $350.000 + $2.500/km
 *     + $20.000/m³, con recargo de piso 1 / 1,05 / 1,12 / 1,20 que ignora si
 *     hay ascensor.
 *   Se adopta el motor por ambientes (costo-mudanza) porque el usuario sabe
 *   cuántos ambientes tiene, no cuántos m³, y porque sus recargos de piso CON
 *   ascensor (1,05 / 1,10 / 1,15) son prácticamente los del cuadro por m³:
 *   el modelo por ambientes es un superconjunto del otro.
 *   Para no perder la entrada por volumen se agrega un campo de m³: la base del
 *   ambiente se escala por (m³ ingresados / m³ típicos del ambiente), de modo
 *   que quien venía de la calculadora por m³ sigue teniendo su palanca.
 *   NO se adopta la base fija de $350.000 + $20.000/m³ porque cobra dos veces
 *   el volumen (la base ya lo contiene) y da ~5x el resultado del otro modelo
 *   en el caso típico.
 */

/** Disclaimer textual de `getCalculatorDisclaimer` para estas calcs (dominio 'general', categoría 'vida'). */
const D =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

export const hub: HubData = {
  slug: 'hogar/gastos-de-la-casa',
  title: '¿Cuánto me cuesta la casa además del alquiler o la cuota?',
  description:
    'Expensas, mantenimiento anual, seguro de hogar, cuándo reemplazar un electrodoméstico y cuánto sale mudarte. Cinco cálculos en una sola página para saber qué te cuesta la casa por fuera del alquiler o la cuota.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'El costo real de vivir ahí',
  h1: '¿Cuánto me cuesta la casa además del alquiler o la cuota?',
  lede:
    'El alquiler o la cuota es la mitad de la historia. Arrancamos por las expensas, que es lo primero que aparece, y abajo cambiás al gasto que te interese: mantenimiento anual, seguro, reponer un electrodoméstico o mudarte.',
  stamps: ['Expensas, mantenimiento, seguro, equipos y mudanza', 'La luz y el gas van aparte', '6 calculadoras adentro'],

  resultLabel: 'Tu estimación',

  cases: {
    title: '¿Qué gasto querés estimar?',
    intro: 'Partimos del más frecuente. Si el tuyo es otro, cambialo.',
    items: [
      {
        id: 'expensas',
        label: '¿Cuánto voy a pagar de expensas?',
        hint: 'Antes de firmar',
        answer: 'Las expensas se estiman por metro cuadrado y suben mucho con los amenities.',
        yes: [
          'Expensa mensual estimada según superficie, zona y amenities del edificio',
          'Costo por metro cuadrado que te está saliendo el edificio',
          'Rango razonable (de -25% a +30%) para comparar con lo que te dicen',
        ],
        warn: [
          D,
          'Los amenities completos (pileta, gimnasio, seguridad) suman un 65% sobre la expensa base: es el factor que más pesa.',
          'Las expensas extraordinarias por obra no entran acá y pueden duplicar un mes puntual.',
        ],
        plazo: 'antes de firmar, pedí los últimos 3 balances y el acta de la última asamblea: ahí se ven las obras votadas.',
      },
      {
        id: 'mantenimiento',
        label: '¿Cuánto me sale mantener la casa en un año?',
        hint: 'Todos los rubros juntos',
        answer: 'Sumando todos los rubros, mantener la casa suele costar bastante más de lo que se estima de memoria.',
        yes: [
          'Total anual sumando expensas, servicios, impuestos, seguro, reparaciones, limpieza y jardinería',
          'El promedio mensual y el costo por día que representa',
          'Qué rubro te está comiendo la mayor parte del presupuesto',
        ],
        warn: [
          D,
          'Los servicios van como un solo renglón: para desglosar la boleta de luz o la de gas y agua tenemos páginas aparte.',
          'Las reparaciones son el rubro más traicionero: entran a golpes (una bomba, un termotanque) y conviene provisionarlas todos los meses.',
        ],
        plazo: 'guardá el 1% del valor de la propiedad por año como fondo de reparaciones y no vas a tener sorpresas.',
      },
      {
        id: 'seguro',
        label: '¿Cuánto sale el seguro de hogar?',
        hint: 'Prima según suma asegurada',
        answer: 'La prima sale de la suma asegurada por una tasa que depende de la cobertura y del riesgo de la zona.',
        yes: [
          'Prima mensual y anual estimadas según edificio, contenido, zona y tipo de cobertura',
          'Cuánto sube pasar de cobertura básica a intermedia o completa',
          'Qué parte de la suma asegurada es el edificio y qué parte el contenido',
        ],
        warn: [
          D,
          'La suma asegurada del edificio se calcula a valor de RECONSTRUCCIÓN, no al precio de venta: incluye materiales y mano de obra, no el terreno.',
          'Si asegurás por menos de lo que vale, en un siniestro parcial la compañía puede aplicar infraseguro y pagarte una proporción.',
        ],
        plazo: 'revisá la suma asegurada una vez por año: con inflación, una póliza vieja queda corta sin que te enteres.',
      },
      {
        id: 'electro',
        label: '¿Reparo o reemplazo el electrodoméstico?',
        hint: 'No es plata: es % de vida útil',
        answer: 'Antes del 50% de la vida útil conviene reparar; después del 80%, reemplazar.',
        yes: [
          'Porcentaje de vida útil consumido según el tipo de aparato y sus años de uso',
          'Años que le quedan a ese equipo según su vida útil típica',
          'El umbral de gasto en reparación a partir del cual deja de convenir',
        ],
        warn: [
          D,
          'Esta rama no devuelve pesos: devuelve el porcentaje de vida útil consumido. Los montos de reparación los ponés vos comparándolos contra el precio de uno nuevo.',
          'La vida útil típica supone uso doméstico normal y mantenimiento razonable. Un equipo maltratado o en zona de tensión inestable dura menos.',
        ],
        plazo: 'antes del 50% de vida útil, reparar conviene si sale menos del 30% de uno nuevo; entre el 50% y el 80%, el umbral es el 40%.',
      },
      {
        id: 'mudanza',
        label: '¿Cuánto sale mudarme?',
        hint: 'Ambientes, volumen, km y piso',
        answer: 'La mudanza se cotiza por volumen y distancia, pero lo que más la encarece es la escalera.',
        yes: [
          'Costo estimado del flete según ambientes, metros cúbicos, kilómetros y piso',
          'Cuánto pesa cada componente: base, kilómetros y recargo de altura',
          'El precio implícito por metro cúbico y por kilómetro, para comparar presupuestos',
        ],
        warn: [
          D,
          'Sin ascensor el recargo llega al 50%: es, lejos, el factor que más encarece una mudanza.',
          'El precio no incluye embalaje, desarme de muebles, guardamuebles ni seguro de la carga: pedilos cotizados aparte.',
        ],
        plazo: 'pedí al menos 3 presupuestos por escrito, con seguro de la carga incluido y fecha cerrada.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada caso usa sólo los campos que necesita. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    // — Expensas —
    { id: 'superficieM2', label: 'Superficie del departamento (m²)', type: 'number', min: 10, max: 500, value: 45 },
    {
      id: 'zona',
      label: 'Zona',
      type: 'select',
      value: 'caba-media',
      options: [
        { value: 'caba-premium', label: 'CABA Premium (Palermo, Belgrano, Recoleta)' },
        { value: 'caba-media', label: 'CABA Media (Caballito, Almagro, Villa Crespo)' },
        { value: 'caba-sur', label: 'CABA Sur (Barracas, La Boca, Parque Patricios)' },
        { value: 'gba-norte', label: 'GBA Norte (Olivos, Vicente López, San Isidro)' },
        { value: 'gba-oeste-sur', label: 'GBA Oeste / Sur' },
        { value: 'interior', label: 'Interior del país' },
      ],
    },
    {
      id: 'amenities',
      label: '¿Tiene amenities?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No (edificio simple)' },
        { value: 'basico', label: 'Básicos (SUM, laundry)' },
        { value: 'completo', label: 'Completos (pileta, gimnasio, SUM, seguridad)' },
      ],
    },
    {
      id: 'unidades',
      label: 'Unidades del edificio',
      type: 'number',
      min: 1,
      max: 500,
      value: 20,
      help: 'Más unidades reparten los gastos fijos entre más vecinos y bajan la expensa por departamento.',
    },

    // — Mantenimiento anual —
    { id: 'expensasMensual', label: 'Expensas mensuales', prefix: '$', value: '0', thousands: true },
    {
      id: 'serviciosMensual',
      label: 'Servicios mensuales (luz, gas, agua, internet)',
      prefix: '$',
      value: '60.000',
      thousands: true,
      help: 'Va como un solo renglón. Para desglosar la boleta de luz o la de gas y agua tenemos páginas dedicadas.',
    },
    { id: 'impuestosAnual', label: 'Impuestos anuales (ABL, inmobiliario)', prefix: '$', value: '0', thousands: true },
    { id: 'seguroAnual', label: 'Seguro de hogar anual', prefix: '$', value: '0', thousands: true },
    { id: 'reparacionesAnual', label: 'Reparaciones estimadas por año', prefix: '$', value: '200.000', thousands: true },
    { id: 'limpiezaMensual', label: 'Limpieza mensual', prefix: '$', value: '0', thousands: true },
    { id: 'jardineriaMensual', label: 'Jardinería y exterior mensual', prefix: '$', value: '0', thousands: true },
    { id: 'otrosAnual', label: 'Otros gastos anuales', prefix: '$', value: '0', thousands: true },

    // — Seguro de hogar —
    { id: 'metrosCuadrados', label: 'Metros cuadrados a asegurar', type: 'number', min: 1, max: 2000, value: 70 },
    {
      id: 'valorM2',
      label: 'Valor de reconstrucción por m²',
      prefix: '$',
      value: '800.000',
      thousands: true,
      help: 'Lo que costaría volver a construir, sin el terreno.',
    },
    { id: 'valorContenido', label: 'Valor del contenido (muebles, electrónica)', prefix: '$', value: '5.000.000', thousands: true },
    {
      id: 'zonaRiesgo',
      label: 'Riesgo de la zona',
      type: 'select',
      value: 'media',
      options: [
        { value: 'baja', label: 'Bajo (barrio cerrado, edificio con seguridad)' },
        { value: 'media', label: 'Medio (zona urbana estándar)' },
        { value: 'alta', label: 'Alto (zona inundable o insegura)' },
      ],
    },
    {
      id: 'cobertura',
      label: 'Tipo de cobertura',
      type: 'select',
      value: 'intermedia',
      options: [
        { value: 'basica', label: 'Básica (incendio + responsabilidad civil)' },
        { value: 'intermedia', label: 'Intermedia (+ robo y daño por agua)' },
        { value: 'completa', label: 'Completa (todo riesgo)' },
      ],
    },

    // — Reparar o reemplazar —
    {
      id: 'aparato',
      label: 'Electrodoméstico',
      type: 'select',
      value: 'heladera',
      options: [
        { value: 'heladera', label: 'Heladera' },
        { value: 'lavarropas', label: 'Lavarropas' },
        { value: 'microondas', label: 'Microondas' },
        { value: 'aire', label: 'Aire acondicionado' },
        { value: 'tv', label: 'TV o monitor' },
        { value: 'horno', label: 'Horno eléctrico' },
        { value: 'lavavajillas', label: 'Lavavajillas' },
        { value: 'secarropas', label: 'Secarropas' },
        { value: 'termotanque', label: 'Termotanque' },
      ],
    },
    { id: 'edadAnios', label: 'Años de uso que tiene', type: 'number', min: 0, max: 60, step: 0.5, value: 5 },

    // — Mudanza —
    {
      id: 'ambientes',
      label: 'Tamaño de la casa a mudar',
      type: 'select',
      value: '2-dormitorios',
      options: [
        { value: 'monoambiente', label: 'Monoambiente (~8 m³)' },
        { value: '1-dormitorio', label: '1 dormitorio, 2 ambientes (~12 m³)' },
        { value: '2-dormitorios', label: '2 dormitorios, 3 ambientes (~20 m³)' },
        { value: '3-dormitorios', label: '3 dormitorios, 4 ambientes (~30 m³)' },
        { value: '4-o-mas', label: '4+ dormitorios (~45 m³)' },
      ],
    },
    {
      id: 'm3Carga',
      label: 'Metros cúbicos de carga (0 = usar el típico del tamaño elegido)',
      type: 'number',
      min: 0,
      max: 200,
      value: 0,
      help: 'Si ya te midieron el volumen, ponelo acá: la base se ajusta en proporción al m³ típico de ese tamaño de casa.',
    },
    { id: 'distanciaKm', label: 'Distancia entre origen y destino (km)', type: 'number', min: 1, max: 3000, value: 10 },
    {
      id: 'piso',
      label: 'Piso',
      type: 'select',
      value: 'pb',
      options: [
        { value: 'pb', label: 'Planta baja o casa' },
        { value: '1-3', label: 'Piso 1 a 3' },
        { value: '4-6', label: 'Piso 4 a 6' },
        { value: '7-mas', label: 'Piso 7 o más' },
      ],
    },
    {
      id: 'ascensor',
      label: '¿Hay ascensor?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Los valores de referencia del mercado se revisan periódicamente y pueden quedar desfasados por inflación.',

  chart: {
    type: 'bars',
    title: 'Cómo se reparte el gasto',
    caption:
      'Cada barra muestra el peso de un componente dentro del total: los rubros del gasto anual, las zonas comparadas, los niveles de cobertura o los años de vida del equipo.',
  },
  breakdownTitle: 'El detalle de tu caso',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuánto se paga de expensas por metro cuadrado?',
      a: 'Depende muchísimo de la zona y del edificio. Como referencia, un edificio simple de CABA media ronda los $950 por m² al mes, CABA premium unos $1.200 y el interior del país cerca de $500. Un departamento de 45 m² sin amenities en CABA media queda entonces en el orden de los $43.000 mensuales, con un rango razonable entre -25% y +30%.',
    },
    {
      q: '¿Cuánto suben las expensas si el edificio tiene amenities?',
      a: 'Los amenities básicos (SUM, laundry) suman alrededor de un 25% sobre la expensa base. Los completos —pileta, gimnasio, SUM y seguridad— suman un 65%, porque implican personal, mantenimiento de la pileta y consumo de energía todo el año, se usen o no.',
    },
    {
      q: '¿Por qué en un edificio grande las expensas son más baratas?',
      a: 'Porque los gastos fijos del consorcio (administración, encargado, seguros, ascensores) se reparten entre más unidades. Arriba de 40 unidades la expensa por departamento baja alrededor de un 15% respecto de un edificio mediano; abajo de 10 unidades sube cerca de un 15%.',
    },
    {
      q: '¿Cuánto cuesta mantener una casa por año?',
      a: 'Se suman expensas, servicios, impuestos, seguro, reparaciones, limpieza, jardinería y otros gastos. Una casa con $60.000 mensuales de servicios y $200.000 anuales de reparaciones ya arranca en $920.000 al año, unos $76.700 por mes o $2.520 por día, sin contar expensas ni impuestos.',
    },
    {
      q: '¿La luz y el gas entran en este cálculo?',
      a: 'Entran como un único renglón de "servicios". Este hub responde qué te cuesta la casa por fuera del alquiler o la cuota: para desglosar la boleta de luz tramo por tramo, o la de gas y agua, tenemos páginas específicas en la misma sección de Hogar.',
    },
    {
      q: '¿Cuánto conviene provisionar por año para reparaciones?',
      a: 'Una regla práctica es reservar alrededor del 1% del valor de la propiedad por año. Las reparaciones no llegan parejas: un termotanque, una bomba o una filtración se llevan varios meses de presupuesto de una sola vez, así que conviene apartarlas todos los meses aunque no haya nada roto.',
    },
    {
      q: '¿Cómo se calcula la prima de un seguro de hogar?',
      a: 'Se suma el valor de reconstrucción del edificio (metros cuadrados por valor por m²) más el valor del contenido, y sobre esa suma asegurada se aplica una tasa anual: alrededor de 0,4% para cobertura básica, 0,8% para intermedia y 1,2% para todo riesgo. Después se ajusta por el riesgo de la zona: -20% en zona baja y +30% en zona alta.',
    },
    {
      q: '¿Qué valor pongo como suma asegurada de la vivienda?',
      a: 'El costo de RECONSTRUIR, no el precio de venta. El terreno no se incendia ni se inunda, así que no se asegura. Si ponés el valor de mercado vas a pagar de más; si ponés menos que el costo de reconstrucción, en un siniestro parcial la compañía puede aplicar la regla de infraseguro y pagarte sólo una proporción del daño.',
    },
    {
      q: '¿Cuándo conviene reparar un electrodoméstico y cuándo reemplazarlo?',
      a: 'Se mira qué porcentaje de su vida útil típica ya consumió. Por debajo del 50%, reparar conviene si el arreglo cuesta menos del 30% de un equipo nuevo. Entre el 50% y el 80%, el umbral baja al 40%. Por encima del 80% conviene reemplazar: el equipo está en la recta final y uno nuevo de clase A gasta bastante menos energía.',
    },
    {
      q: '¿Cuántos años dura una heladera o un lavarropas?',
      a: 'Como vida útil típica de uso doméstico se toman 13 años para una heladera, 15 para un horno eléctrico, 12 para un aire acondicionado, 10 para lavarropas, secarropas, lavavajillas y termotanque, 8 para un microondas y 7 para un televisor. Son promedios: el mantenimiento y la calidad de la instalación eléctrica mueven bastante el número.',
    },
    {
      q: '¿Cuánto sale una mudanza?',
      a: 'Una mudanza de 2 dormitorios (unos 20 m³) a 10 km, desde planta baja, ronda los $150.000 de flete. La distancia agrega alrededor de $1.000 por kilómetro dentro de los primeros 10 km y $2.000 por kilómetro de ahí en adelante. Embalaje, desarme de muebles, guardamuebles y seguro de la carga se cotizan aparte.',
    },
    {
      q: '¿Cuánto encarece mudarse de un piso alto sin ascensor?',
      a: 'Muchísimo: es el factor más caro de una mudanza. Con ascensor el recargo va del 5% al 15% según la altura. Sin ascensor arranca en 30% para los pisos 1 a 3, sube a 45% entre el 4 y el 6, y llega al 50% del piso 7 para arriba, porque todo se sube a pulso por escalera.',
    },
    {
      q: '¿Conviene cotizar la mudanza por ambientes o por metros cúbicos?',
      a: 'Los dos criterios sirven y en esta página se combinan: elegís el tamaño de la casa y, si ya te midieron el volumen, ajustás los metros cúbicos y la base se corrige en proporción. Las empresas serias cotizan por volumen tras una visita o videollamada; una cotización telefónica sin ver la carga suele terminar con adicionales el día de la mudanza.',
    },
  ],

  sources: [
    {
      name: 'Código Civil y Comercial de la Nación — Propiedad Horizontal (arts. 2037 a 2072): expensas comunes y ordinarias',
      url: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Registro Público de Administradores de Consorcios — Ley 941 (obligaciones de rendición y balance)',
      url: 'https://buenosaires.gob.ar/gcaba_historico/registro-publico-de-administradores-de-consorcios/marco-legal',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
    {
      name: 'Superintendencia de Seguros de la Nación — seguros de combinado familiar y hogar',
      url: 'https://www.argentina.gob.ar/ssn',
      publisher: 'SSN',
    },
    {
      name: 'Ley 17.418 de Seguros — suma asegurada e infraseguro (arts. 61 y 65)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/63479/norma.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'ABL — Alumbrado, Barrido y Limpieza: consulta de boletas y saldos',
      url: 'https://buenosaires.gob.ar/tramites/inmobiliario-abl-consulta-de-boletas-saldos-y-deuda',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
    {
      name: 'Índice del Costo de la Construcción (ICC) — referencia para el valor de reconstrucción por m²',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-6-32',
      publisher: 'INDEC',
    },
    {
      name: 'Eficiencia energética de artefactos del hogar — vida útil y etiquetado',
      url: 'https://www.inti.gob.ar/areas/servicios-regulados/energia/eficiencia-energetica',
      publisher: 'INTI',
    },
    {
      name: 'Comisión Nacional de Regulación del Transporte — habilitación de transportistas de carga',
      url: 'https://www.argentina.gob.ar/cnrt',
      publisher: 'CNRT',
    },
    {
      name: 'Defensa y Protección al Consumidor — contratación de servicios de mudanza',
      url: 'https://buenosaires.gob.ar/defensaconsumidor',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
  ],

  replaces: [
    '/calculadora-expensas-departamento-estimado',
    '/calculadora-costo-mantenimiento-hogar-anual',
    '/calculadora-seguro-hogar-estimacion-cobertura',
    '/calculadora-vida-util-electrodomestico-anos',
    '/calculadora-costo-estimado-mudanza',
    '/calculadora-mudanza-precio-kilometros-m3-cuadro',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/* ───────────────────────── Constantes espejadas de las fórmulas ───────────────────────── */

/** $/m² de expensas por zona. Espejo de expensas-departamento-estimado.ts. */
export const EXPENSAS_BASE_M2: Record<string, number> = {
  'caba-premium': 1200,
  'caba-media': 950,
  'caba-sur': 750,
  'gba-norte': 850,
  'gba-oeste-sur': 600,
  interior: 500,
};

export const EXPENSAS_ZONA_LABEL: Record<string, string> = {
  'caba-premium': 'CABA Premium',
  'caba-media': 'CABA Media',
  'caba-sur': 'CABA Sur',
  'gba-norte': 'GBA Norte',
  'gba-oeste-sur': 'GBA Oeste/Sur',
  interior: 'Interior',
};

/** Multiplicador por amenities. Espejo de expensas-departamento-estimado.ts. */
export const EXPENSAS_AMENITIES: Record<string, number> = { no: 1, basico: 1.25, completo: 1.65 };

/** Tasa anual del seguro sobre la suma asegurada. Espejo de seguro-hogar-estimacion-cobertura.ts. */
export const SEGURO_TASA: Record<string, number> = { basica: 0.004, intermedia: 0.008, completa: 0.012 };
export const SEGURO_ZONA: Record<string, number> = { baja: 0.8, media: 1.0, alta: 1.3 };
export const SEGURO_COBERTURA_LABEL: Record<string, string> = {
  basica: 'Básica',
  intermedia: 'Intermedia',
  completa: 'Completa',
};

/** Vida útil típica en años. Espejo de vida-util-electrodomestico.ts. */
export const VIDA_UTIL: Record<string, number> = {
  heladera: 13,
  lavarropas: 10,
  microondas: 8,
  aire: 12,
  tv: 7,
  horno: 15,
  lavavajillas: 10,
  secarropas: 10,
  termotanque: 10,
};

export const APARATO_LABEL: Record<string, string> = {
  heladera: 'heladera',
  lavarropas: 'lavarropas',
  microondas: 'microondas',
  aire: 'aire acondicionado',
  tv: 'TV',
  horno: 'horno eléctrico',
  lavavajillas: 'lavavajillas',
  secarropas: 'secarropas',
  termotanque: 'termotanque',
};

/** Base del flete por tamaño de casa. Espejo de costo-mudanza.ts. */
export const MUDANZA_BASE: Record<string, number> = {
  monoambiente: 70000,
  '1-dormitorio': 100000,
  '2-dormitorios': 140000,
  '3-dormitorios': 220000,
  '4-o-mas': 320000,
};

/**
 * m³ típicos por tamaño de casa. Puente entre el modelo por ambientes y el
 * modelo por volumen que traía mudanza-precio-kilometros-m3-cuadro.
 */
export const MUDANZA_M3_TIPICO: Record<string, number> = {
  monoambiente: 8,
  '1-dormitorio': 12,
  '2-dormitorios': 20,
  '3-dormitorios': 30,
  '4-o-mas': 45,
};

export const MUDANZA_AMB_LABEL: Record<string, string> = {
  monoambiente: 'monoambiente',
  '1-dormitorio': '1 dormitorio',
  '2-dormitorios': '2 dormitorios',
  '3-dormitorios': '3 dormitorios',
  '4-o-mas': '4+ dormitorios',
};

/** Recargo por altura, con y sin ascensor. Espejo de costo-mudanza.ts. */
export const MUDANZA_PISO_CON_ASC: Record<string, number> = { pb: 1, '1-3': 1.05, '4-6': 1.1, '7-mas': 1.15 };
export const MUDANZA_PISO_SIN_ASC: Record<string, number> = { pb: 1, '1-3': 1.3, '4-6': 1.45, '7-mas': 1.5 };
export const MUDANZA_PISO_LABEL: Record<string, string> = {
  pb: 'planta baja o casa',
  '1-3': 'piso 1 a 3',
  '4-6': 'piso 4 a 6',
  '7-mas': 'piso 7 o más',
};

/** Tarifa por km: los primeros 10 km más baratos. Espejo de costo-mudanza.ts. */
export const MUDANZA_KM_CERCA = 1000;
export const MUDANZA_KM_LEJOS = 2000;
