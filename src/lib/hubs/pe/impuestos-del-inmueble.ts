import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "Tengo, compro o vendo un inmueble: ¿qué impuestos pago?"
 *
 * Absorbe cuatro calculadoras sueltas de /pe/: predial, arbitrios municipales,
 * alcabala e impuesto por venta de inmueble (renta de segunda categoría).
 *
 * Cálculo espejado de src/lib/formulas/impuesto-predial-peru.ts,
 * arbitrios-municipales-peru.ts, impuesto-alcabala-peru.ts e
 * impuesto-venta-inmueble-renta-segunda-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const UIT = PERU_2026.uit;
export const UIT_ANIO = PERU_2026.anio;

/**
 * Escala del impuesto predial, progresiva acumulativa sobre el autovalúo.
 * Art. 13 del TUO de la Ley de Tributación Municipal (DS 156-2004-EF).
 * `Infinity` no sobrevive a define:vars: viaja como null y se reconstruye.
 */
export const PREDIAL_TRAMOS = PERU_2026.predial.tramos.map((t) => ({
  hastaUit: Number.isFinite(t.hastaUit) ? t.hastaUit : null,
  tasa: t.tasa,
}));
/** Impuesto mínimo: 0,6% de la UIT (Art. 13). */
export const PREDIAL_MINIMO_UIT = PERU_2026.predial.minimoUit;
/** Deducción de 50 UIT del autovalúo para pensionista o adulto mayor con vivienda única (Art. 19). */
export const PREDIAL_DEDUCCION_UIT = PERU_2026.predial.deduccionPensionistaUit;

/**
 * Arbitrios municipales: NO hay tasa nacional. Los fija cada municipalidad distrital
 * por ordenanza, en función del costo real del servicio (criterio del Tribunal
 * Constitucional, EXP. 0053-2004-AI/TC). Las tarifas de abajo son REFERENCIALES por
 * distrito, en S/ por m² al año para uso casa habitación, y sirven para dar un orden
 * de magnitud: el monto exacto sale del recibo o de la ordenanza vigente.
 */
export const ARBITRIOS_TARIFAS: Array<{ id: string; nombre: string; solM2Anual: number }> = [
  { id: 'san_isidro', nombre: 'San Isidro', solM2Anual: 30 },
  { id: 'miraflores', nombre: 'Miraflores', solM2Anual: 28 },
  { id: 'santiago_surco', nombre: 'Santiago de Surco', solM2Anual: 24 },
  { id: 'la_molina', nombre: 'La Molina', solM2Anual: 22 },
  { id: 'otro', nombre: 'Otro distrito (promedio de Lima)', solM2Anual: 18 },
  { id: 'sjl', nombre: 'San Juan de Lurigancho', solM2Anual: 12 },
  { id: 'comas', nombre: 'Comas', solM2Anual: 10 },
];
/** Reparto referencial del arbitrio entre los tres servicios y recargo por uso comercial. */
export const ARBITRIOS_MIX = { limpieza: 0.4, parques: 0.22, serenazgo: 0.38 };
export const ARBITRIOS_FACTOR_COMERCIO = 2.2;

/** Alcabala: 3% sobre el exceso de las primeras 10 UIT inafectas (Art. 25 TUO LTM). */
export const ALCABALA = { tasa: 0.03, uitInafectas: 10 };

/** Venta de inmueble: renta de 2da, 6,25% sobre la renta neta (80%) = 5% efectivo. */
export const VENTA = { tasaEfectiva: 0.05, tasaRentaNeta: 0.0625, deduccion: 0.2 };

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/impuestos/impuestos-del-inmueble',
  title: 'Impuestos de un inmueble en Perú: predial, arbitrios, alcabala y venta',
  description:
    'Calcula el impuesto predial y los arbitrios que pagas como propietario, la alcabala del 3% que paga el comprador y el impuesto de segunda categoría por vender, con la deducción de 50 UIT para pensionistas y adultos mayores.',
  silo: 'Impuestos',
  siloHref: '/pe/impuestos',
  locale: 'pe',

  eyebrow: 'Perú · tributación municipal · SUNAT',
  h1: 'Tengo, compro o vendo un inmueble: ¿qué impuestos pago?',
  lede:
    'Un inmueble genera impuestos en tres momentos distintos y con tres cobradores distintos: la municipalidad distrital cobra el predial y los arbitrios todos los años mientras seas dueño, la municipalidad provincial cobra la alcabala cuando compras, y SUNAT cobra la renta de segunda cuando vendes con ganancia. Elige en qué momento estás.',
  stamps: [
    `UIT ${UIT_ANIO}: ${sol(UIT)}`,
    'TUO de la Ley de Tributación Municipal, DS 156-2004-EF',
    `Alcabala: ${ALCABALA.tasa * 100}% sobre el exceso de ${ALCABALA.uitInafectas} UIT`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Impuesto estimado',

  cases: {
    title: '¿En qué momento estás?',
    intro:
      'El predial y los arbitrios se pagan todos los años; la alcabala, una sola vez al comprar; la renta de segunda, una sola vez al vender. Ninguno reemplaza al otro.',
    items: [
      {
        id: 'propietario',
        label: 'Soy propietario: pago predial y arbitrios todos los años',
        hint: 'Impuesto predial + arbitrios · municipalidad distrital',
        answer:
          'El predial se calcula sobre el autovalúo con una escala progresiva del 0,2%, 0,6% y 1%; los arbitrios se cobran aparte y los fija cada municipalidad por ordenanza.',
        yes: [
          `Escala progresiva acumulativa sobre el autovalúo: 0,2% hasta 15 UIT, 0,6% de 15 a 60 UIT y 1% sobre el exceso de 60 UIT (Art. 13 del TUO)`,
          `Impuesto mínimo del ${(PREDIAL_MINIMO_UIT * 100).toString().replace('.', ',')}% de la UIT, o sea ${sol(PREDIAL_MINIMO_UIT * UIT)} al año`,
          'Se puede pagar al contado hasta el último día hábil de febrero o en cuatro cuotas trimestrales',
          'Los arbitrios de limpieza pública, parques y jardines y serenazgo se cobran por separado, normalmente en el mismo recibo',
          'Si tienes varios predios en el mismo distrito, el autovalúo se suma para determinar el tramo de la escala',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los arbitrios NO tienen tasa nacional: cada municipalidad los fija por ordenanza según el costo real del servicio. La estimación de acá usa tarifas referenciales por distrito y solo sirve como orden de magnitud, nunca como liquidación',
          'El autovalúo no es el valor de mercado: sale de los valores arancelarios y unitarios de construcción que publica el Ministerio de Vivienda, y suele ser bastante menor que el precio de venta',
          'La declaración jurada anual de autovalúo se presenta aunque no haya cambios: no presentarla genera multa',
        ],
        plazo: 'el pago al contado y la declaración jurada vencen el último día hábil de febrero; las cuotas trimestrales, en febrero, mayo, agosto y noviembre.',
      },
      {
        id: 'comprador',
        label: 'Estoy comprando: me toca la alcabala',
        hint: `Alcabala ${ALCABALA.tasa * 100}% · municipalidad provincial o SAT`,
        answer: `La alcabala es del ${ALCABALA.tasa * 100}% sobre lo que exceda las primeras ${ALCABALA.uitInafectas} UIT del valor, es decir ${sol(ALCABALA.uitInafectas * UIT)}, y la paga el comprador.`,
        yes: [
          `Las primeras ${ALCABALA.uitInafectas} UIT del valor del inmueble están inafectas: ${sol(ALCABALA.uitInafectas * UIT)}`,
          `Sobre el exceso se aplica el ${ALCABALA.tasa * 100}% (Art. 25 del TUO de la Ley de Tributación Municipal)`,
          'La base imponible es el mayor entre el valor de transferencia y el autovalúo del año ajustado por el IPM (Art. 24)',
          'Es de cargo exclusivo del comprador y no admite pacto en contrario',
          'En la primera venta que hace una empresa constructora solo está gravado el valor del terreno: la construcción está inafecta',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Sin el pago de la alcabala los Registros Públicos no inscriben la transferencia: no es un trámite opcional',
          'La transferencia entre cónyuges o por anticipo de legítima tiene reglas propias de inafectación: conviene consultarlas antes de firmar',
          'La cuenta de acá usa el valor que cargues; si el autovalúo ajustado por IPM es mayor que el precio pactado, la base es el autovalúo y el impuesto sube',
        ],
        plazo: 'vence el último día hábil del mes calendario siguiente a la fecha de la transferencia.',
      },
      {
        id: 'vendedor',
        label: 'Estoy vendiendo: pago renta de segunda categoría',
        hint: 'Ganancia de capital · SUNAT · 5% efectivo',
        answer: `Se paga ${VENTA.tasaEfectiva * 100}% efectivo sobre la ganancia (${VENTA.tasaRentaNeta * 100}% sobre la renta neta), salvo que el inmueble califique como casa habitación.`,
        yes: [
          `Ganancia = precio de venta menos costo computable, y el costo se actualiza con el Índice de Corrección Monetaria que publica el MEF cada mes`,
          `Sobre esa ganancia corre el ${VENTA.tasaRentaNeta * 100}% de la renta neta, equivalente al ${VENTA.tasaEfectiva * 100}% efectivo`,
          'Es un pago definitivo de segunda categoría: no se acumula con tus rentas de trabajo ni te sube de tramo',
          'Está exonerada la venta de la casa habitación: el inmueble tiene que haber permanecido en propiedad del vendedor al menos dos años y no estar destinado a comercio, industria u oficina',
          'También quedan fuera los inmuebles adquiridos antes del 1 de enero de 2004',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Sin comprobante de la compra original el costo computable puede quedar en cero y toda la venta se vuelve ganancia gravada: guarda la escritura y los comprobantes de mejoras',
          'El notario exige acreditar el pago o la exoneración antes de elevar la minuta a escritura pública',
          'Si vendes de forma habitual (tercera venta en el mismo ejercicio) SUNAT puede considerarlo renta de tercera categoría, con una carga muy distinta',
        ],
        plazo: 'el pago se hace dentro del mes siguiente al de la percepción de la renta, según el cronograma de SUNAT.',
      },
      {
        id: 'pensionista',
        label: 'Soy pensionista o adulto mayor con vivienda única',
        hint: `Deducción de ${PREDIAL_DEDUCCION_UIT} UIT del autovalúo · Art. 19`,
        answer: `Se descuentan ${PREDIAL_DEDUCCION_UIT} UIT del autovalúo antes de aplicar la escala: ${sol(PREDIAL_DEDUCCION_UIT * UIT)} fuera de la base.`,
        yes: [
          `Deducción de ${PREDIAL_DEDUCCION_UIT} UIT de la base imponible del predial (Art. 19 del TUO)`,
          'Aplica a pensionistas y, desde la Ley 30490, también a adultos mayores no pensionistas que cumplan los requisitos',
          'La vivienda debe ser única a nombre propio o de la sociedad conyugal, y estar destinada a vivienda',
          'Se admite el uso parcial para fines productivos, comerciales o profesionales con aprobación de la municipalidad',
          'El ingreso bruto del beneficiario no debe exceder una UIT mensual',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La deducción NO es automática: hay que solicitarla en la municipalidad distrital y acreditar la condición cada vez que la comuna lo pida',
          'La deducción alcanza al impuesto predial, no a los arbitrios: esos se siguen pagando, aunque muchas municipalidades tienen descuentos propios para adultos mayores',
          'Tener un segundo predio, aunque sea pequeño, hace perder el beneficio completo',
        ],
        plazo: 'la solicitud conviene presentarla antes del vencimiento de febrero para que impacte en la liquidación del año.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu inmueble',
  inputsIntro:
    'Cada rama usa solo lo que necesita. El autovalúo sale de tu declaración jurada o del recibo del predial; no es el valor de mercado.',
  fields: [
    {
      id: 'autovaluo',
      label: 'Autovalúo del predio (S/)',
      type: 'number',
      prefix: 'S/',
      value: 180000,
      min: 0,
      step: 1000,
      help: 'Valor del autovalúo que figura en tu declaración jurada municipal. Si tienes varios predios en el mismo distrito, súmalos.',
    },
    {
      id: 'areaM2',
      label: 'Área del predio (m²)',
      type: 'number',
      value: 120,
      min: 0,
      step: 5,
      suffix: 'm²',
      help: 'Se usa solo para estimar los arbitrios, que se cobran por metro cuadrado según la ordenanza del distrito.',
    },
    {
      id: 'distrito',
      label: 'Distrito (tarifa referencial de arbitrios)',
      type: 'select',
      value: 'otro',
      options: ARBITRIOS_TARIFAS.map((t) => ({ value: t.id, label: `${t.nombre} — ${t.solM2Anual} S/ por m² al año` })),
      help: 'Tarifas referenciales para dar un orden de magnitud. El monto exacto lo fija la ordenanza de tu municipalidad.',
    },
    {
      id: 'uso',
      label: 'Uso del predio',
      type: 'select',
      value: 'casa',
      options: [
        { value: 'casa', label: 'Casa habitación' },
        { value: 'comercio', label: 'Comercial o de servicios' },
      ],
      help: 'El uso comercial paga un arbitrio mayor: acá se estima con un factor referencial.',
    },
    {
      id: 'valorCompra',
      label: 'Valor de transferencia de la compra (S/)',
      type: 'number',
      prefix: 'S/',
      value: 320000,
      min: 0,
      step: 5000,
      help: 'Precio pactado en la compraventa. Si el autovalúo ajustado por IPM es mayor, la base de la alcabala es ese autovalúo.',
    },
    {
      id: 'valorVenta',
      label: 'Precio al que vendes (S/)',
      type: 'number',
      prefix: 'S/',
      value: 420000,
      min: 0,
      step: 5000,
      help: 'Precio de venta pactado, en soles.',
    },
    {
      id: 'costoAdquisicion',
      label: 'Lo que pagaste cuando lo compraste (S/)',
      type: 'number',
      prefix: 'S/',
      value: 300000,
      min: 0,
      step: 5000,
      help: 'Valor de adquisición original según la escritura. Sin comprobante, el costo computable puede quedar en cero.',
    },
    {
      id: 'icm',
      label: 'Índice de Corrección Monetaria (MEF)',
      type: 'number',
      value: 1,
      min: 1,
      step: 0.01,
      help: 'Factor que publica el MEF cada mes para actualizar el costo de adquisición. Búscalo en la resolución ministerial del mes de la venta; con 1 el costo no se actualiza.',
    },
    {
      id: 'casaHabitacion',
      label: '¿Es tu casa habitación?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No: es una segunda propiedad o una inversión' },
        { value: 'si', label: 'Sí: la tuve al menos dos años como vivienda' },
      ],
      help: 'La venta de la casa habitación está exonerada de la renta de segunda categoría.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el costo tributario',
    caption:
      'Compara el tramo del valor que queda fuera del impuesto con lo que efectivamente se paga, y en la rama de propietario, cuánto pesa el predial frente a los arbitrios.',
  },
  breakdownTitle: 'La liquidación, línea por línea',
  breakdownIntro:
    'Cada fila cita el artículo del que sale. Los arbitrios van marcados como estimación referencial porque dependen de la ordenanza de tu distrito.',

  faq: [
    {
      q: '¿Cómo se calcula el impuesto predial en el Perú?',
      a: `Con una escala progresiva acumulativa sobre el autovalúo del predio: 0,2% sobre el tramo hasta 15 UIT, 0,6% sobre el tramo de 15 a 60 UIT y 1% sobre lo que exceda las 60 UIT. Con la UIT en ${sol(UIT)}, los cortes están en ${sol(15 * UIT)} y ${sol(60 * UIT)}. Como es acumulativa, cada tasa grava solo su porción: nadie paga 1% de todo el autovalúo. Además hay un impuesto mínimo del ${(PREDIAL_MINIMO_UIT * 100).toString().replace('.', ',')}% de la UIT, ${sol(PREDIAL_MINIMO_UIT * UIT)} al año.`,
    },
    {
      q: '¿Qué diferencia hay entre el impuesto predial y los arbitrios?',
      a: 'El predial es un impuesto: se paga por ser propietario y no tiene contraprestación directa. Los arbitrios son tasas: se pagan por servicios concretos que presta la municipalidad, que son limpieza pública, parques y jardines y serenazgo. El predial tiene escala nacional fijada por ley; los arbitrios los fija cada municipalidad distrital por ordenanza según el costo real del servicio, y por eso el mismo departamento paga muy distinto en San Isidro que en Comas.',
    },
    {
      q: '¿Por qué la estimación de arbitrios no coincide con mi recibo?',
      a: 'Porque no hay una fórmula nacional de arbitrios. Cada ordenanza distrital reparte el costo del servicio según criterios propios: metros cuadrados construidos, ubicación en la zona, uso del predio, frontis, cantidad de habitantes o hasta el valor del predio. La estimación de acá usa una tarifa promedio por metro cuadrado y sirve para tener un orden de magnitud antes de comprar o alquilar, no para reemplazar la liquidación municipal.',
    },
    {
      q: '¿Quién paga la alcabala, el comprador o el vendedor?',
      a: `El comprador, de manera exclusiva y sin que valga pacto en contrario. Es el ${ALCABALA.tasa * 100}% sobre lo que exceda las primeras ${ALCABALA.uitInafectas} UIT del valor del inmueble, o sea ${sol(ALCABALA.uitInafectas * UIT)} inafectos. La base imponible es el mayor entre el valor de transferencia pactado y el autovalúo del ejercicio ajustado por el Índice de Precios al por Mayor.`,
    },
    {
      q: '¿La alcabala se paga si el departamento vale menos de 10 UIT?',
      a: `No hay impuesto a pagar, pero igual conviene presentar la liquidación en la municipalidad provincial o el SAT, porque los Registros Públicos piden acreditar el cumplimiento para inscribir la transferencia. Con la UIT en ${sol(UIT)}, ese piso está en ${sol(ALCABALA.uitInafectas * UIT)}: un inmueble por debajo de ese valor no genera alcabala.`,
    },
    {
      q: '¿Cuánto pago de impuestos si vendo mi departamento?',
      a: `El ${VENTA.tasaEfectiva * 100}% efectivo de la ganancia, si la hay. Técnicamente es el ${VENTA.tasaRentaNeta * 100}% de la renta neta, que es el 80% de la ganancia, lo que da el mismo resultado. La ganancia es el precio de venta menos el costo computable, y el costo se actualiza con el Índice de Corrección Monetaria que el MEF publica todos los meses. Si el inmueble es tu casa habitación, no pagas nada.`,
    },
    {
      q: '¿Qué requisitos tiene la exoneración de casa habitación?',
      a: 'Que el inmueble haya permanecido en propiedad del vendedor por lo menos dos años, que haya estado destinado a vivienda y no a comercio, industria, oficina, almacén o similar, y que el vendedor no sea habitual en la venta de inmuebles. Si tienes más de una propiedad, la que califica como casa habitación es aquella donde efectivamente vives; la otra venta sí paga.',
    },
    {
      q: '¿Qué es el Índice de Corrección Monetaria y de dónde lo saco?',
      a: 'Es el factor que permite actualizar el costo de adquisición de un inmueble para que la inflación no infle artificialmente la ganancia gravada. El Ministerio de Economía y Finanzas lo publica todos los meses mediante resolución ministerial, con una tabla por año y mes de adquisición. Se busca la fila del mes en que compraste y esa columna del mes en que vendes: ese factor multiplica el valor de compra.',
    },
    {
      q: '¿Cuánto ahorra un pensionista con la deducción de 50 UIT?',
      a: `Con la UIT en ${sol(UIT)}, la deducción saca ${sol(PREDIAL_DEDUCCION_UIT * UIT)} de la base imponible del predial. Para la mayoría de las viviendas eso significa que la base cae a cero o a un monto muy chico, y el impuesto queda en el mínimo legal de ${sol(PREDIAL_MINIMO_UIT * UIT)}. La deducción no es automática: hay que pedirla en la municipalidad distrital acreditando la condición de pensionista o adulto mayor, la vivienda única y el nivel de ingresos.`,
    },
    {
      q: '¿Cuándo se paga cada uno de estos impuestos?',
      a: 'El predial se declara y paga al contado hasta el último día hábil de febrero, o en cuatro cuotas trimestrales que vencen en febrero, mayo, agosto y noviembre. Los arbitrios suelen seguir el mismo calendario, aunque algunas municipalidades los cobran mensualmente. La alcabala vence el último día hábil del mes siguiente a la transferencia. La renta de segunda por la venta se paga dentro del mes siguiente al cobro, según el cronograma de SUNAT.',
    },
    {
      q: '¿El autovalúo es lo mismo que el valor de mercado?',
      a: 'No, y suele ser bastante menor. El autovalúo se arma con los valores arancelarios de terrenos y los valores unitarios oficiales de edificación que publica el Ministerio de Vivienda, ajustados por antigüedad, estado de conservación y materiales. Un departamento que se vende en el mercado por cierto precio puede tener un autovalúo que es una fracción de eso, y por eso el predial resulta relativamente bajo frente al valor real del inmueble.',
    },
    {
      q: '¿Qué pasa si nunca declaré mi predio en la municipalidad?',
      a: 'Corresponde presentar la declaración jurada de inscripción y regularizar los ejercicios no prescritos, con los intereses moratorios y la multa por la infracción de no presentar la declaración. La deuda de tributos municipales prescribe a los cuatro años, o a los seis si no se presentó la declaración jurada. Muchas municipalidades abren amnistías con condonación de intereses y multas: conviene esperar una para regularizar.',
    },
  ],

  sources: [
    { name: 'TUO de la Ley de Tributación Municipal — DS 156-2004-EF', url: 'https://www.mef.gob.pe/es/normatividad-sp-9322/por-tema/tributacion-municipal', publisher: 'Ministerio de Economía y Finanzas del Perú' },
    { name: 'SAT de Lima — Impuesto predial', url: 'https://www.sat.gob.pe/websitev9/TributosMultas/PredialyArbitrios/Informacion', publisher: 'Servicio de Administración Tributaria de Lima' },
    { name: 'SAT de Lima — Impuesto de alcabala', url: 'https://www.sat.gob.pe/websitev9/TributosMultas/Alcabala/Informacion', publisher: 'Servicio de Administración Tributaria de Lima' },
    { name: 'SUNAT — Rentas de segunda categoría por venta de inmuebles', url: 'https://personas.sunat.gob.pe/vendo-mi-casa/rentas-segunda-categoria', publisher: 'SUNAT' },
    { name: 'MEF — Índice de Corrección Monetaria para la enajenación de inmuebles', url: 'https://www.mef.gob.pe/es/normatividad-sp-9322/por-instrumento/resoluciones-ministeriales', publisher: 'Ministerio de Economía y Finanzas del Perú' },
    { name: 'Ministerio de Vivienda — Valores arancelarios y unitarios de edificación', url: 'https://www.gob.pe/vivienda', publisher: 'Ministerio de Vivienda, Construcción y Saneamiento' },
  ],

  replaces: [
    '/pe/calculadora-impuesto-predial-peru',
    '/pe/calculadora-arbitrios-municipales-peru',
    '/pe/calculadora-impuesto-alcabala-peru',
    '/pe/calculadora-impuesto-venta-inmueble-renta-segunda-peru',
  ],

  lastReviewed: '2026-07-28',
};
