import type { HubData } from './types';

export const hub: HubData = {
  slug: 'auto/tramites',
  title: 'Trámites del auto 2026: transferencia, patentamiento, licencia y multas',
  description:
    'Cuánto sale cada trámite del auto en Argentina: transferir un usado, patentar un 0km, sacar o renovar la licencia de conducir y pagar una multa. Arancel DNRPA, sellos provinciales, formularios y gestoría, con el desglose de quién cobra qué.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Guía y estimación de costos',
  h1: 'Transferencia, licencia y multas: ¿cuánto sale cada trámite?',
  lede:
    'Casi todo lo que pagás en el registro son dos cosas: un arancel nacional de la DNRPA y un impuesto provincial de sellos que se mueve con el valor del auto. Arrancamos por la transferencia, que es el trámite más consultado, y lo cambiás por el tuyo.',
  stamps: ['Actualizado 27-07-2026', 'DNRPA · Ley 24.449 · sellos provinciales', '7 calculadoras adentro'],

  resultLabel: 'Costo estimado del trámite',

  cases: {
    title: '¿Qué trámite estás haciendo?',
    intro: 'Partimos de la transferencia, que es la consulta más frecuente. Si el tuyo es otro, cambialo.',
    items: [
      {
        id: 'transferir',
        label: 'Transferir un auto usado',
        hint: 'El trámite más consultado',
        answer: 'La transferencia sale alrededor del 2,5% de la valuación fiscal más los gastos fijos del registro.',
        yes: [
          'Arancel de la DNRPA sobre la valuación fiscal del vehículo (~1,5%)',
          'Impuesto de sellos provincial sobre la misma valuación (~1%)',
          'Verificación policial del vehículo, formularios 08/12 e informe de dominio',
          'Si el auto cambia de provincia, el registro suma el costo de la nueva radicación',
        ],
        warn: [
          'La base es la VALUACIÓN FISCAL de la tabla del registro, no el precio que pagaste: si comprás barato igual pagás sobre la tabla',
          'El certificado de libre deuda de patentes y de infracciones se pide aparte y tiene que estar vigente el día de la firma',
          'La gestoría es opcional pero real: sumá entre $80.000 y $200.000 si no hacés el trámite vos',
          'Sin la transferencia hecha, las multas y la responsabilidad civil siguen cayendo en el vendedor',
        ],
        plazo:
          'el comprador tiene 10 días hábiles desde la firma del 08 para presentar el trámite; el vendedor puede hacer la denuncia de venta si el otro no lo presenta.',
      },
      {
        id: 'patentar',
        label: 'Patentar un 0km',
        hint: 'Inscripción inicial DNRPA',
        answer: 'Inscribir un 0km sale un arancel fijo más un 0,8% del valor y los sellos de tu provincia.',
        yes: [
          'Arancel de inscripción inicial de la DNRPA: una parte fija más un 0,8% del valor de fábrica',
          'Impuesto de sellos provincial: 1,5% en CABA y 2% en la provincia de Buenos Aires',
          'Chapas patente, cédula verde y título del automotor',
          'Lo suele gestionar la concesionaria, pero lo pagás vos y va aparte del precio de lista',
        ],
        warn: [
          'El precio de lista publicado casi nunca incluye gastos de patentamiento: preguntá el total antes de señar',
          'La alícuota de sellos cambia por provincia y hay regímenes promocionales para autos nacionales',
          'Si vas a radicar el auto en otra provincia que la del concesionario, los sellos se pagan en la de radicación',
        ],
        plazo:
          'la inscripción inicial se presenta dentro de los plazos que fija la concesionaria; sin ella no podés circular con chapas definitivas.',
      },
      {
        id: 'licencia',
        label: 'Sacar o renovar la licencia',
        hint: 'Categorías A a E',
        answer: 'Una licencia nueva categoría B ronda los $40.000; las categorías profesionales pagan un recargo.',
        yes: [
          'Arancel municipal del trámite: cambia si es licencia nueva, renovación, duplicado o ampliación',
          'Recargo por categoría: la C (carga) y la D (transporte de pasajeros) exigen exámenes extra',
          'Curso teórico obligatorio, examen psicofísico y examen práctico',
          'Certificado de Legalidad de la ANSV, que se emite al terminar el trámite',
        ],
        warn: [
          'El arancel lo fija cada municipio: dos ciudades vecinas pueden diferir bastante',
          'Las categorías profesionales piden además libreta sanitaria y antecedentes penales',
          'La vigencia es de 5 años para la primera licencia y baja a 3 o 1 año a partir de los 65',
          'Si tenés multas firmes impagas en el sistema, el municipio puede frenarte la renovación',
        ],
        plazo:
          'podés renovar desde 180 días antes del vencimiento; vencida, hay que rendir de nuevo el examen teórico.',
      },
      {
        id: 'multa',
        label: 'Pagar una multa',
        hint: 'Unidades Fijas y puntos',
        answer: 'La multa se mide en Unidades Fijas: el monto es la cantidad de UF por el valor vigente de la UF.',
        yes: [
          'Cantidad de Unidades Fijas de la infracción según la Ley 24.449 y su decreto reglamentario',
          'Valor de la UF vigente en tu jurisdicción, atado al precio de la nafta premium',
          'Puntos que se descuentan del Scoring: son 20 y a los 20 te suspenden la licencia',
          'Descuento por pago voluntario, que en la mayoría de las jurisdicciones llega al 50%',
        ],
        warn: [
          'El rango de UF de cada infracción es amplio: el juez de faltas fija el monto exacto dentro del rango',
          'La reincidencia duplica el monto y, en las infracciones graves, agrega inhabilitación',
          'Pagar la multa es reconocer la infracción: si la vas a apelar, no pagues el voluntario',
          'Las multas impagas frenan la transferencia, la renovación de la licencia y la VTV',
        ],
        plazo:
          'el pago voluntario con descuento suele vencer a los 30 días de notificada; después va a juzgado de faltas.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada trámite usa los campos que le corresponden; el resto podés dejarlos como están.',
  fields: [
    {
      id: 'valor',
      label: 'Valuación fiscal o valor del auto',
      prefix: '$',
      value: '15.000.000',
      thousands: true,
      help: 'Para transferencia: la valuación de la tabla del registro. Para 0km: el valor de fábrica.',
    },
    {
      id: 'provincia',
      label: 'Provincia donde se radica el auto',
      type: 'select',
      value: 'caba',
      options: [
        { value: 'caba', label: 'CABA' },
        { value: 'pba', label: 'Buenos Aires' },
        { value: 'cba', label: 'Córdoba' },
        { value: 'sfe', label: 'Santa Fe' },
      ],
      help: 'Define la alícuota de sellos y el costo del libre deuda.',
    },
    {
      id: 'radicacion',
      label: '¿El auto cambia de jurisdicción?',
      type: 'select',
      value: 'misma',
      options: [
        { value: 'misma', label: 'No, sigue en el mismo registro' },
        { value: 'cambio', label: 'Sí, cambia de radicación' },
      ],
      help: 'Solo para transferencia: el cambio de radicación suma costo.',
    },
    {
      id: 'licenciaTipo',
      label: 'Tipo de trámite de licencia',
      type: 'select',
      value: 'nueva',
      options: [
        { value: 'nueva', label: 'Licencia nueva' },
        { value: 'renov', label: 'Renovación' },
        { value: 'duplicado', label: 'Duplicado' },
        { value: 'ampliacion', label: 'Ampliación de categoría' },
      ],
    },
    {
      id: 'licenciaCat',
      label: 'Categoría de licencia',
      type: 'select',
      value: 'b',
      options: [
        { value: 'a', label: 'A — motos' },
        { value: 'b', label: 'B — auto particular' },
        { value: 'c', label: 'C — camiones' },
        { value: 'd', label: 'D — transporte de pasajeros' },
        { value: 'e', label: 'E — maquinaria especial' },
      ],
    },
    {
      id: 'infraccion',
      label: 'Infracción cometida',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Exceso de velocidad leve (hasta 20 km/h)' },
        { value: '2', label: 'Exceso de velocidad grave (20 a 40 km/h)' },
        { value: '3', label: 'Cruzar semáforo en rojo' },
        { value: '4', label: 'Estacionar en lugar prohibido' },
        { value: '5', label: 'Sin cinturón o usar el celular' },
        { value: '6', label: 'Alcoholemia positiva (más de 0,5 g/l)' },
        { value: '7', label: 'VTV vencida' },
        { value: '8', label: 'Sin seguro obligatorio' },
      ],
    },
    {
      id: 'valorUf',
      label: 'Valor de la Unidad Fija (UF)',
      type: 'number',
      min: 100,
      step: 50,
      value: 500,
      help: 'Equivale al litro de nafta premium: varía por jurisdicción, ~$400 a $600 en 2026.',
    },
  ],
  fineprint:
    'Es una estimación de referencia. Los aranceles de la DNRPA, las alícuotas de sellos y los aranceles municipales de licencia cambian por jurisdicción y se actualizan varias veces al año.',

  chart: {
    type: 'donut',
    title: 'Quién cobra qué',
    caption:
      'El gráfico parte el costo del trámite entre los organismos que efectivamente lo cobran: el arancel nacional de la DNRPA, el impuesto de sellos de tu provincia, los formularios y verificaciones, y la gestoría si la contratás.',
  },
  breakdownTitle: 'Cómo se arma el costo del trámite',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande del trámite.',

  faq: [
    {
      q: '¿Cuánto sale transferir un auto en 2026?',
      a: 'Como referencia, alrededor del 2,5% de la valuación fiscal más los gastos fijos del registro. Sobre un auto valuado en $15.000.000 son unos $225.000 entre arancel DNRPA (~1,5%) y sellos provinciales (~1%), más unos $60.000 de verificación policial, formularios 08 y 12 e informe de dominio. Si además cambia la radicación, sumá el costo de la nueva jurisdicción.',
    },
    {
      q: '¿Quién paga la transferencia, el comprador o el vendedor?',
      a: 'La ley no lo impone: es materia de acuerdo entre las partes. En la práctica el comprador paga el trámite completo porque es quien necesita el título a su nombre, y el vendedor asume la verificación y el libre deuda. Lo importante para el vendedor es que el trámite se presente: hasta que no se inscribe, las multas y la responsabilidad civil siguen a su nombre.',
    },
    {
      q: '¿Sobre qué valor se calculan el arancel y los sellos?',
      a: 'Sobre la valuación fiscal que figura en la tabla del registro automotor, no sobre el precio que aparece en el 08. Si el precio pactado es mayor que la valuación, varias provincias liquidan sellos sobre el mayor de los dos. Por eso conviene consultar la valuación antes de cerrar la operación.',
    },
    {
      q: '¿Cuánto cuesta patentar un 0km?',
      a: 'El arancel de inscripción inicial de la DNRPA tiene una parte fija de aproximadamente $85.000 más un 0,8% del valor del vehículo, y encima va el impuesto de sellos provincial: 1,5% en CABA y 2% en la provincia de Buenos Aires. Sobre un auto de $30.000.000 eso da cerca de $775.000 en CABA. El precio de lista publicado casi nunca lo incluye.',
    },
    {
      q: '¿Cuánto sale la licencia de conducir y cada cuánto se renueva?',
      a: 'El arancel lo fija cada municipio. Como referencia, una licencia nueva categoría B ronda los $40.000 y una renovación unos $25.000; las categorías profesionales C y D pagan un recargo del 40% al 50% por los exámenes adicionales. La primera licencia dura 5 años, y a partir de los 65 años la vigencia baja a 3 años y luego a 1.',
    },
    {
      q: '¿Cómo se calcula el monto de una multa de tránsito?',
      a: 'Las multas se expresan en Unidades Fijas (UF), y cada UF equivale al precio de un litro de nafta premium en la jurisdicción. El monto es la cantidad de UF de la infracción por el valor vigente de la UF. Cada infracción tiene un rango: un semáforo en rojo va de 100 a 500 UF, así que con la UF a $500 la multa cae entre $50.000 y $250.000, y el juez de faltas fija el punto exacto.',
    },
    {
      q: '¿Cuántos puntos me descuentan y cuándo pierdo la licencia?',
      a: 'El Scoring nacional arranca con 20 puntos. Estacionar mal descuenta 1, el exceso leve o el celular 3, el semáforo en rojo o el exceso grave 5 y la alcoholemia positiva 10. Al llegar a 20 puntos descontados la licencia queda inhabilitada. Los puntos se recuperan a los dos años sin infracciones nuevas.',
    },
    {
      q: '¿Qué es el certificado de libre deuda y cuánto cuesta?',
      a: 'Es la constancia de que el auto no tiene patentes ni infracciones impagas, y el registro la exige vigente al momento de firmar la transferencia. Cuesta entre $14.000 y $18.000 según la provincia y se tramita online en 24 a 48 horas. Pedilo cerca de la fecha de la firma: suele tener validez corta.',
    },
    {
      q: 'Si el auto cambia de provincia, ¿qué trámite extra hay que hacer?',
      a: 'Hay que recaratular el legajo en el registro de la nueva jurisdicción. Se paga un arancel fijo de alrededor de $85.000 más el impuesto de sellos de la provincia de destino sobre el valor del auto, y el legajo tarda entre 5 y 15 días en viajar. Recién cuando llega te entregan la cédula y las chapas nuevas.',
    },
    {
      q: '¿Puedo hacer los trámites del auto sin gestor?',
      a: 'Sí. La transferencia, el libre deuda y el cambio de radicación se pueden hacer directamente en el registro seccional con turno previo, y el trámite de licencia es siempre personal. La gestoría cuesta entre $80.000 y $200.000 y lo que compra es tiempo: sirve sobre todo cuando el legajo tiene observaciones o hay que cambiar de jurisdicción.',
    },
    {
      q: '¿Qué pasa si no transfiero el auto que vendí?',
      a: 'Seguís figurando como titular registral, así que las multas, las patentes y la responsabilidad civil por accidentes te siguen alcanzando. La herramienta para cortar eso es la denuncia de venta, que se presenta en el registro con el 08 firmado y limita tu responsabilidad hacia adelante, aunque no transfiere el dominio.',
    },
  ],

  sources: [
    {
      name: 'Aranceles vigentes del Registro Automotor',
      url: 'https://www.argentina.gob.ar/dnrpa/aranceles',
      publisher: 'DNRPA — Ministerio de Justicia',
    },
    {
      name: 'Transferencia de automotor — requisitos y formularios',
      url: 'https://www.argentina.gob.ar/dnrpa/tramites/transferencia',
      publisher: 'DNRPA',
    },
    {
      name: 'Ley 24.449 de Tránsito y Seguridad Vial — régimen de sanciones y Unidades Fijas',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/35000-39999/38287/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Licencia Nacional de Conducir — categorías, vigencia y Certificado de Legalidad',
      url: 'https://www.argentina.gob.ar/seguridadvial/licencianacionaldeconducir',
      publisher: 'Agencia Nacional de Seguridad Vial',
    },
    {
      name: 'Sistema Nacional de Antecedentes de Tránsito (Scoring) — puntos por infracción',
      url: 'https://www.argentina.gob.ar/seguridadvial/sinat',
      publisher: 'Agencia Nacional de Seguridad Vial',
    },
    {
      name: 'Impuesto de sellos y libre deuda de patentes — CABA',
      url: 'https://www.agip.gob.ar/impuestos/sellos',
      publisher: 'AGIP',
    },
    {
      name: 'Impuesto automotor y libre deuda — Provincia de Buenos Aires',
      url: 'https://www.arba.gov.ar/',
      publisher: 'ARBA',
    },
  ],

  replaces: [
    '/calculadora-transfer-auto-costo-registro',
    '/calculadora-registro-dnrpa-auto-0km-arancel',
    '/calculadora-licencia-conducir-costo-categoria-b1-a',
    '/calculadora-multa-transito-valor',
    '/calculadora-multa-transito-puntos-licencia',
    '/calculadora-titularidad-caratular-auto-trasladar-provincia',
    '/calculadora-certificado-libre-deuda-auto-costo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Constantes de cada trámite, calcadas de las fórmulas que este hub absorbe.
 * No se hardcodean números sueltos en compute(): salen de acá.
 */
export const TRAMITE_MATH = {
  /** src/lib/formulas/transfer-auto-costo-registro.ts */
  transferencia: {
    arancelPct: 0.015,
    selladoPct: 0.01,
    verificacionPolicial: 35000,
    formularios: 15000,
    informeDominio: 10000,
    extraRadicacion: 50000,
  },
  /** src/lib/formulas/registro-dnrpa-auto-0km-arancel.ts */
  patentamiento: {
    dnrpaFijo: 85000,
    dnrpaPct: 0.008,
    /** Alícuota de sellos del 0km: PBA 2%, resto 1,5% (fórmula original). */
    sellosPct: { caba: 0.015, pba: 0.02, cba: 0.015, sfe: 0.015 } as Record<string, number>,
  },
  /** src/lib/formulas/licencia-conducir-costo-categoria-b1-a.ts */
  licencia: {
    base: { nueva: 40000, renov: 25000, duplicado: 15000, ampliacion: 30000 } as Record<string, number>,
    mult: { a: 1, b: 1, c: 1.4, d: 1.5, e: 1.3 } as Record<string, number>,
  },
  /** src/lib/formulas/titularidad-caratular-auto-trasladar-provincia.ts */
  radicacion: {
    fijo: 85000,
    sellosPct: { caba: 0.015, pba: 0.02, cba: 0.02, sfe: 0.018 } as Record<string, number>,
    sellosDefault: 0.02,
  },
  /** src/lib/formulas/certificado-libre-deuda-auto-costo.ts */
  libreDeuda: { caba: 15000, pba: 18000, cba: 14000, sfe: 15000 } as Record<string, number>,
} as const;

/** Infracciones y puntos — calcado de src/lib/formulas/multa-transito-puntos-licencia.ts */
export const INFRACCIONES: Record<string, { nombre: string; ufMin: number; ufMax: number; puntos: number }> = {
  '1': { nombre: 'Exceso de velocidad leve (hasta 20 km/h de más)', ufMin: 100, ufMax: 300, puntos: 3 },
  '2': { nombre: 'Exceso de velocidad grave (+20-40 km/h)', ufMin: 300, ufMax: 1000, puntos: 5 },
  '3': { nombre: 'Cruzar semáforo en rojo', ufMin: 100, ufMax: 500, puntos: 5 },
  '4': { nombre: 'Estacionar en lugar prohibido', ufMin: 50, ufMax: 200, puntos: 1 },
  '5': { nombre: 'Sin cinturón de seguridad / usar celular', ufMin: 50, ufMax: 300, puntos: 3 },
  '6': { nombre: 'Alcoholemia positiva (>0.5 g/L)', ufMin: 300, ufMax: 1000, puntos: 10 },
  '7': { nombre: 'VTV vencida', ufMin: 100, ufMax: 300, puntos: 2 },
  '8': { nombre: 'Sin seguro obligatorio', ufMin: 200, ufMax: 500, puntos: 4 },
};

/** Tope del Scoring nacional (ANSV): a los 20 puntos descontados se suspende la licencia. */
export const SCORING_TOPE = 20;
