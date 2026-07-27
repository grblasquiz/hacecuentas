import type { HubData } from './types';

/**
 * Hub de decisión — "Neumáticos, aceite y service: ¿cuándo y cuánto?"
 * Absorbe 7 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Acá NADA es plata. Todas las filas declaran `format: 'unit'` o `'plain'`
 *    con su unidad. El runtime hace Object.assign(base, over): una fila sin
 *    `format` propio no hereda el del resultado y saldría con "$".
 *  - `chart.type: 'scale'`: cada rama devuelve SUS PROPIAS franjas (from/to) y
 *    su `position`, porque la magnitud cambia por rama (% de desviación, PSI,
 *    % del intervalo consumido, CCA, ml de aceite por litro).
 *
 * EXACTITUD (regla dura de este hub, igual que en `presion-y-gases.ts`):
 * los factores de presión son exactos por definición, no redondeos.
 *   1 psi = 6894,757293168 Pa   (exacto: lbf/in² con lbf y pulgada definidas)
 *   1 bar = 100 000 Pa          (exacto, por definición)
 *   1 kPa = 1 000 Pa            (exacto, SI)
 * De ahí: 1 psi = 0,06894757293168 bar y 1 bar = 14,503773800721815 psi.
 *
 * OJO: `src/lib/formulas/presion-neumaticos-psi-bar.ts` usaba 0,0689476
 * (redondeado) y `presion-neumatico-psi-bar-auto.ts` usaba 14,504. Este hub
 * usa el exacto, igual que `/ciencia/presion-y-gases`, para que las dos
 * páginas del sitio no devuelvan números distintos para la misma conversión.
 * `/ciencia/presion-y-gases` cubre la conversión de presión GENÉRICA
 * (atmósferas, hidrostática, gases ideales) y NO reclama ninguna URL de
 * presión de neumáticos: acá la conversión viene con el contexto del auto
 * (rango recomendado, inflado en frío, etiqueta del vehículo).
 */

/** Factor exacto a pascales de cada unidad de presión. */
export const A_PASCAL = {
  psi: 6894.757293168,
  bar: 100000,
  kpa: 1000,
} as const;

/** Intervalo de cambio de aceite, en km, por tipo de lubricante. */
export const ACEITE: Record<string, { label: string; km: number }> = {
  mineral: { label: 'Mineral', km: 5000 },
  semi: { label: 'Semisintético', km: 7500 },
  sint: { label: 'Sintético', km: 10000 },
  sintLong: { label: 'Sintético long-life', km: 20000 },
};

/**
 * Intervalo de cambio de correa de distribución, en km.
 * 0 = el motor usa cadena y no tiene cambio programado.
 */
export const CORREA: Record<string, { label: string; km: number }> = {
  generico: { label: 'Genérico / no sé', km: 80000 },
  vw: { label: 'Volkswagen', km: 90000 },
  ford: { label: 'Ford', km: 100000 },
  toyota: { label: 'Toyota (cadena)', km: 0 },
};

/** Relaciones de mezcla habituales para motores de 2 tiempos. */
export const MEZCLAS = ['25:1', '30:1', '40:1', '50:1'];

const DISCLAIMER =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

const ETIQUETA =
  'El valor que manda es el de la etiqueta del vehículo (parante de la puerta del conductor o tapa del tanque), no el máximo grabado en el flanco del neumático.';

export const hub: HubData = {
  slug: 'auto/mantenimiento',
  title: 'Neumáticos, aceite y service: ¿cuándo y cuánto? — Calculadora de mantenimiento',
  description:
    'Medida equivalente de neumático con el porcentaje de desviación del velocímetro, conversión exacta de presión PSI/bar/kPa, intervalo de aceite y de correa de distribución, CCA de batería y mezcla de 2 tiempos.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Mantenimiento del auto',
  h1: 'Neumáticos, aceite y service: ¿cuándo y cuánto?',
  lede:
    'Arrancamos por la pregunta más frecuente: qué otra medida de neumático te entra sin arruinar el velocímetro. Abajo cambiás al caso que necesites: presión, aceite, correa, batería o mezcla de 2 tiempos.',
  stamps: ['Tolerancia de ±3% de diámetro', 'Factores de presión exactos', '7 calculadoras adentro'],

  resultLabel: 'Resultado',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro: 'Partimos por la medida equivalente de neumático. Si tu caso es otro, cambialo.',
    items: [
      {
        id: 'medida',
        label: 'Qué medida de neumático me entra',
        hint: 'Equivalencia y velocímetro',
        answer: 'Una medida es equivalente si el diámetro no se va más de 3%.',
        yes: [
          'Se calcula el diámetro total de cada medida: 2 × (ancho × perfil ÷ 100) + llanta × 25,4 mm',
          'Se compara la alternativa contra la original y se muestra el porcentaje de desviación',
          'Hasta ±1,5% la equivalencia es excelente; hasta ±3% es aceptable; más que eso queda fuera de tolerancia',
        ],
        warn: [
          DISCLAIMER,
          'La desviación de diámetro se traslada directo al velocímetro y al odómetro: con +3% el tablero te marca de menos y sumás menos kilómetros de los que hacés',
          'El diámetro no es lo único: hay que verificar que el ancho de la nueva medida entre en el ancho de llanta y no roce con suspensión, guardabarros ni pinzas de freno',
          'Cambiar de medida puede afectar la verificación técnica y la cobertura del seguro si el auto queda fuera de la homologación del fabricante',
        ],
        plazo: 'antes de comprar, confirmá la medida homologada en el manual o en la etiqueta de la puerta.',
      },
      {
        id: 'presion',
        label: 'Pasar la presión de PSI a bar o kPa',
        hint: 'Conversión exacta',
        answer: 'La conversión es exacta: 1 psi = 0,06894757293168 bar.',
        yes: [
          'Se convierte entre PSI, bar y kPa con los factores exactos por definición, sin redondeos intermedios',
          'Se ubica el valor en el rango habitual: por debajo de 28 PSI es baja para un auto de pasajeros, de 28 a 36 es lo normal, de 36 a 45 es propio de SUV o pickup con carga',
        ],
        warn: [
          DISCLAIMER,
          ETIQUETA,
          'Medí siempre en frío: un neumático rodando levanta entre 2 y 6 PSI y la lectura te miente',
          'Subinflar desgasta los hombros del neumático, sube el consumo y aumenta el riesgo de reventón por calentamiento',
        ],
        plazo: 'controlá la presión al menos una vez por mes y antes de cada viaje largo.',
      },
      {
        id: 'aceite',
        label: 'Cuándo toca el cambio de aceite',
        hint: 'Según el tipo de lubricante',
        answer: 'El intervalo lo fija el tipo de aceite, de 5.000 a 20.000 km.',
        yes: [
          'Mineral: 5.000 km · semisintético: 7.500 km · sintético: 10.000 km · sintético long-life: 20.000 km',
          'Se muestra el kilometraje del próximo cambio y cuánto del intervalo ya consumiste',
        ],
        warn: [
          DISCLAIMER,
          'El intervalo del fabricante manda sobre estos valores generales: si el manual pide menos, hacé lo que dice el manual',
          'El aceite también vence por tiempo: si hacés pocos kilómetros, cambialo igual una vez al año',
          'Uso severo (ciudad con mucho ralentí, tierra, remolque, taxi) recorta el intervalo cerca de la mitad',
        ],
        plazo: 'guardá la factura del service: muchas garantías piden el comprobante.',
      },
      {
        id: 'correa',
        label: 'Cuándo cambio la correa de distribución',
        hint: 'O si tengo cadena',
        answer: 'La correa se cambia por kilometraje; la cadena no tiene plan de cambio.',
        yes: [
          'Se calcula el próximo múltiplo del intervalo de la marca y cuántos kilómetros te faltan',
          'Si el motor usa cadena de distribución, no hay cambio programado: se actúa sólo ante ruido o testigo',
        ],
        warn: [
          DISCLAIMER,
          'Una correa cortada en un motor interferente destruye válvulas y pistones: el ahorro de postergarla no existe',
          'La correa también vence por tiempo, normalmente entre 5 y 7 años, aunque no llegues al kilometraje',
          'Cambiá siempre el kit completo (correa, tensor y rodillos) y evaluá la bomba de agua en el mismo trabajo',
        ],
        plazo: 'a menos de 5.000 km del intervalo, agendá el cambio ya.',
      },
      {
        id: 'bateria',
        label: 'Qué batería le va a mi auto',
        hint: 'CCA según cilindrada',
        answer: 'Los CCA se estiman por cilindrada, y un diésel pide casi el doble.',
        yes: [
          'Se estima el CCA mínimo a partir de la cilindrada y del tipo de motor, y un valor recomendado un 20% arriba',
          'Un motor diésel necesita aproximadamente el doble de corriente de arranque que uno nafta de la misma cilindrada',
        ],
        warn: [
          DISCLAIMER,
          'Es una estimación por cilindrada: el valor que manda es el que indica el manual del vehículo',
          'En zonas frías conviene ir directo al valor recomendado o por encima: el frío baja la capacidad real de la batería',
          'Además del CCA hay que respetar el tamaño de caja y la posición de bornes, o la batería no entra o no llega el cable',
        ],
        plazo: 'una batería de auto dura entre 3 y 5 años: pasado ese tiempo, hacela medir antes del invierno.',
      },
      {
        id: 'mezcla',
        label: 'Mezcla de nafta y aceite 2 tiempos',
        hint: 'Motosierra, desmalezadora, náutico',
        answer: 'La relación X:1 son X partes de nafta por 1 de aceite.',
        yes: [
          'Se calcula los mililitros de aceite: litros de nafta × 1.000 ÷ la relación',
          'Con 5 litros a 50:1 van 100 ml de aceite',
        ],
        warn: [
          DISCLAIMER,
          'Respetá la relación que indica el fabricante del equipo: con poco aceite se funde el motor, con demasiado ensucia la bujía y humea',
          'Usá aceite específico para 2 tiempos, nunca aceite de motor de 4 tiempos',
          'La mezcla se degrada: preparala en cantidades que uses en pocas semanas y guardala en bidón cerrado',
        ],
        plazo: 'mezclá primero el aceite con un poco de nafta y recién ahí completá el bidón.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Cada caso usa los campos que necesita; los demás quedan de referencia. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'medidaOriginal',
      label: 'Medida original del neumático',
      type: 'text',
      value: '205/55 R16',
      help: 'Formato ancho/perfil Rllanta, como figura en el flanco.',
    },
    {
      id: 'medidaNueva',
      label: 'Medida que querés poner',
      type: 'text',
      value: '215/50 R17',
    },
    {
      id: 'presionValor',
      label: 'Presión a convertir',
      type: 'number',
      min: 0,
      step: 0.1,
      value: 32,
    },
    {
      id: 'presionUnidad',
      label: 'Unidad de esa presión',
      type: 'select',
      value: 'psi',
      options: [
        { value: 'psi', label: 'PSI (libras por pulgada cuadrada)' },
        { value: 'bar', label: 'bar' },
        { value: 'kpa', label: 'kPa (kilopascales)' },
      ],
    },
    {
      id: 'kmActual',
      label: 'Kilómetros que tiene el auto hoy',
      value: '85.000',
      thousands: true,
    },
    {
      id: 'tipoAceite',
      label: 'Tipo de aceite que usás',
      type: 'select',
      value: 'semi',
      options: Object.entries(ACEITE).map(([value, a]) => ({ value, label: a.label + ' — cada ' + a.km.toLocaleString('es-AR') + ' km' })),
    },
    {
      id: 'kmUltimoCambio',
      label: 'Kilómetros del último cambio de aceite',
      value: '80.000',
      thousands: true,
    },
    {
      id: 'marcaCorrea',
      label: 'Marca para el intervalo de correa',
      type: 'select',
      value: 'generico',
      options: Object.entries(CORREA).map(([value, c]) => ({ value, label: c.label })),
      help: 'Si tu marca no está, usá genérico y confirmá el intervalo real en el manual.',
    },
    {
      id: 'cilindrada',
      label: 'Cilindrada del motor (cc)',
      type: 'number',
      min: 0,
      value: 1600,
    },
    {
      id: 'tipoMotor',
      label: 'Tipo de motor',
      type: 'select',
      value: 'nafta',
      options: [
        { value: 'nafta', label: 'Nafta' },
        { value: 'diesel', label: 'Diésel' },
      ],
    },
    {
      id: 'litrosNafta',
      label: 'Litros de nafta a mezclar',
      type: 'number',
      min: 0,
      step: 0.5,
      value: 5,
    },
    {
      id: 'relacionMezcla',
      label: 'Relación de mezcla',
      type: 'select',
      value: '50:1',
      options: MEZCLAS.map((m) => ({ value: m, label: m + ' — ' + m.split(':')[0] + ' partes de nafta por 1 de aceite' })),
    },
  ],
  fineprint: DISCLAIMER + ' ' + ETIQUETA,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu caso',
    caption:
      'La barra cambia según el caso elegido: porcentaje de desviación del diámetro, PSI de inflado, porcentaje del intervalo de service consumido, CCA de batería o mililitros de aceite por litro de nafta. El marcador es tu valor.',
  },
  breakdownTitle: 'El detalle del cálculo',
  breakdownIntro: 'Cada fila trae su unidad: milímetros, porcentaje, PSI, kilómetros, CCA o mililitros.',

  faq: [
    {
      q: '¿Cómo se calcula el diámetro total de un neumático?',
      a: 'La altura del flanco es el ancho en milímetros por el perfil dividido 100. El diámetro total es dos veces esa altura más el diámetro de la llanta pasado a milímetros, multiplicando las pulgadas por 25,4. Un 205/55 R16 da 2 × 112,75 + 406,4 = 631,9 mm.',
    },
    {
      q: '¿Cuánta desviación de diámetro se puede aceptar?',
      a: 'Hasta ±1,5% la equivalencia es excelente y el velocímetro casi no se entera. Hasta ±3% se considera aceptable y es la tolerancia que se usa como límite práctico. Más allá de ±3% la medida no es equivalente: el velocímetro, el odómetro y los sistemas que leen velocidad de rueda quedan desfasados.',
    },
    {
      q: '¿Un neumático más grande hace que el velocímetro marque de menos?',
      a: 'Sí. Con un diámetro mayor la rueda avanza más por vuelta, así que el tablero muestra menos velocidad de la real y el odómetro suma menos kilómetros. Con un diámetro menor pasa al revés: el velocímetro exagera.',
    },
    {
      q: '¿Cuántos bar son 32 PSI?',
      a: '32 PSI son 2,21 bar, o 220,6 kPa. El factor exacto es 1 psi = 0,06894757293168 bar, porque un psi equivale por definición a 6.894,757293168 pascales y un bar a exactamente 100.000 pascales.',
    },
    {
      q: '¿Qué presión le pongo a mis neumáticos?',
      a: 'La que indica la etiqueta del vehículo, normalmente en el parante de la puerta del conductor o en la tapa del tanque. El número grabado en el flanco del neumático es la presión máxima que soporta, no la recomendada. En autos de pasajeros lo habitual está entre 28 y 36 PSI.',
    },
    {
      q: '¿Cada cuánto se cambia el aceite del motor?',
      a: 'Depende del lubricante: mineral cada 5.000 km, semisintético cada 7.500 km, sintético cada 10.000 km y sintético long-life hasta 20.000 km. Si el manual del fabricante pide un intervalo menor, ese manda. Con uso severo conviene recortar el intervalo cerca de la mitad.',
    },
    {
      q: '¿El aceite se vence aunque no use el auto?',
      a: 'Sí. El aceite se oxida y acumula humedad y ácidos aunque el auto esté parado. Si hacés pocos kilómetros al año, cambialo igual una vez por año aunque no llegues al kilometraje del intervalo.',
    },
    {
      q: '¿Cada cuánto se cambia la correa de distribución?',
      a: 'Según la marca y el motor, entre 80.000 y 100.000 km. Además hay un vencimiento por tiempo, normalmente de 5 a 7 años. Conviene cambiar el kit completo, correa más tensor y rodillos, y evaluar la bomba de agua en el mismo trabajo.',
    },
    {
      q: '¿Qué pasa si mi motor tiene cadena en vez de correa?',
      a: 'La cadena de distribución no tiene un kilometraje de cambio programado: está pensada para durar la vida del motor. Se interviene sólo si aparece ruido de cascabeleo, un testigo de distribución o un salto de sincronismo, y la lubricación correcta es lo que la mantiene sana.',
    },
    {
      q: '¿Cuántos CCA necesita la batería de mi auto?',
      a: 'Como referencia, alrededor de 300 CCA por litro de cilindrada en un motor nafta y cerca del doble en un diésel, más un margen del 20% para el valor recomendado. Un 1.600 cc nafta necesita unos 480 CCA como mínimo y unos 576 CCA recomendados. El manual del vehículo tiene la última palabra.',
    },
    {
      q: '¿Cuánto aceite lleva la mezcla de 2 tiempos?',
      a: 'Los mililitros de aceite salen de multiplicar los litros de nafta por 1.000 y dividir por el primer número de la relación. Con 5 litros a 50:1 van 100 ml de aceite; a 25:1, 200 ml. Usá siempre la relación que indica el fabricante del equipo.',
    },
    {
      q: '¿Puedo usar aceite de auto en un motor de 2 tiempos?',
      a: 'No. Los motores de 2 tiempos queman el aceite junto con la nafta y necesitan un lubricante formulado para eso, con muy baja ceniza. El aceite de motor de 4 tiempos deja depósitos, ensucia la bujía y el escape y puede terminar arruinando el motor.',
    },
  ],

  sources: [
    {
      name: 'Especificación de designación de neumáticos y cálculo de dimensiones',
      url: 'https://www.ustires.org/tire-basics',
      publisher: 'U.S. Tire Manufacturers Association',
    },
    {
      name: 'Inflado, presión en frío y etiqueta del vehículo',
      url: 'https://www.nhtsa.gov/equipment/tires',
      publisher: 'NHTSA — National Highway Traffic Safety Administration',
    },
    {
      name: 'NIST Special Publication 811 — factores de conversión exactos (psi, bar, pascal)',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'NIST',
    },
    {
      name: 'El Sistema Internacional de Unidades (SI), 9ª edición',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'BIPM',
    },
    {
      name: 'Mantenimiento del vehículo: aceite, correa y batería',
      url: 'https://www.argentina.gob.ar/seguridadvial',
      publisher: 'Agencia Nacional de Seguridad Vial',
    },
  ],

  replaces: [
    '/calculadora-neumaticos-medida-equivalente',
    '/calculadora-presion-neumaticos-psi-bar',
    '/calculadora-presion-neumatico-psi-bar-auto',
    '/calculadora-mezcla-2-tiempos-nafta-aceite',
    '/calculadora-cca-bateria-auto-temperatura-motor',
    '/calculadora-correa-distribucion-cambio-intervalo-km',
    '/calculadora-aceite-motor-capacidad-cambio-km',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
