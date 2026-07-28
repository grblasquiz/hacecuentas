import type { HubData } from '../types';
import {
  PERU_2026,
  PASAPORTE_PERU_2026,
  BREVETE_PERU_2026,
  MULTAS_ELECTORALES_2026,
} from '../../data/peru-2026';

/**
 * Hub de decisión PE — "¿Cuánto me cuesta ese trámite o esa multa?"
 *
 * Absorbe: costo del pasaporte electrónico, costo del brevete A-I, papeletas de tránsito
 * y multa por no votar.
 *
 * Todas las tasas salen de src/lib/data/peru-2026.ts (PASAPORTE_PERU_2026, BREVETE_PERU_2026,
 * MULTAS_ELECTORALES_2026) y las papeletas de la UIT, que es como las fija el Reglamento
 * Nacional de Tránsito.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa basada en los parámetros indicados. No constituye asesoramiento financiero ni de inversión; verificá las condiciones vigentes con tu entidad antes de decidir.';

export const UIT = PERU_2026.uit;
export const PASAPORTE = PASAPORTE_PERU_2026;
export const BREVETE = BREVETE_PERU_2026;
export const ELECTORALES = MULTAS_ELECTORALES_2026;

/**
 * Tramos de la Tabla de Infracciones del Reglamento Nacional de Tránsito: el monto de
 * cada papeleta es un porcentaje de la UIT, más puntos en el récord del conductor.
 * El código exacto de tu papeleta define el tramo: está en el reverso del acta.
 */
export const PAPELETA_TRAMOS: Array<{ id: string; pct: number; puntos: number; label: string; ejemplo: string }> = [
  { id: 'm100', pct: 1.0, puntos: 100, label: 'Muy grave, 100% de la UIT', ejemplo: 'Conducir en estado de ebriedad' },
  { id: 'm50', pct: 0.5, puntos: 50, label: 'Muy grave, 50% de la UIT', ejemplo: 'Negarse al dosaje etílico o circular sin revisión técnica vigente' },
  { id: 'g24', pct: 0.24, puntos: 50, label: 'Grave, 24% de la UIT', ejemplo: 'Pasar la luz roja del semáforo' },
  { id: 'g18', pct: 0.18, puntos: 40, label: 'Grave, 18% de la UIT', ejemplo: 'Estacionar en zona rígida o adelantar indebidamente' },
  { id: 'g12', pct: 0.12, puntos: 30, label: 'Grave, 12% de la UIT', ejemplo: 'No respetar la señal de PARE' },
  { id: 'g8', pct: 0.08, puntos: 20, label: 'Grave, 8% de la UIT', ejemplo: 'No usar cinturón de seguridad' },
  { id: 'l4', pct: 0.04, puntos: 0, label: 'Leve, 4% de la UIT', ejemplo: 'Falta leve sin puntos' },
];

/**
 * Descuento por pago voluntario dentro del plazo. Se aplica a infracciones graves y leves;
 * las muy graves no tienen descuento. La fórmula vieja de papeletas le daba 50% de descuento
 * a las muy graves, en contradicción con la propia calculadora de revisión técnica, que las
 * describe como "sin descuento": acá se mantiene el criterio estricto.
 */
export const DESCUENTO_PRONTO_PAGO = 0.83;

const sol2 = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return 'S/ ' + new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: Number.isInteger(r) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(r);
};

export const hub: HubData = {
  slug: 'pe/tramites/tramites-del-estado',
  title: 'Cuánto cuesta un trámite o una multa en el Perú: pasaporte, brevete, papeletas y multa electoral',
  description:
    'Calcula el costo real del pasaporte electrónico, del brevete de conducir, de una papeleta de tránsito según su código de infracción y de la multa por no votar, con las tasas oficiales y la UIT vigente.',
  silo: 'Trámites',
  siloHref: '/pe/tramites',
  locale: 'pe',

  eyebrow: 'Perú · Migraciones, MTC, SAT y JNE',
  h1: '¿Cuánto me cuesta ese trámite o esa multa?',
  lede:
    'Casi todo lo que el Estado peruano cobra está indexado a la UIT o fijado como tasa en un TUPA, así que el precio se puede saber de antemano y no depende de a quién le preguntes. Acá están las cuatro cuentas que más se buscan: el pasaporte, el brevete, la papeleta y la multa electoral, que además bloquea otros trámites mientras no la pagues.',
  stamps: [
    `UIT ${sol2(UIT)} · las multas van en porcentaje de la UIT`,
    `Pasaporte ${sol2(PASAPORTE.tasa)} a toda edad · brevete: emisión desde ${sol2(BREVETE.emisionElectronica)}`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Costo del trámite',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro:
      'Cada trámite tiene su propia lógica: unos son una tasa fija, otros una suma de tasas, y las multas son un porcentaje de la UIT que cambia según el caso.',
    items: [
      {
        id: 'pasaporte',
        label: 'Sacar el pasaporte',
        hint: 'Tasa única · vigencia según edad',
        answer: `El pasaporte electrónico cuesta ${sol2(PASAPORTE.tasa)} por persona a cualquier edad: lo que cambia es cuántos años dura.`,
        yes: [
          `Tasa única de ${sol2(PASAPORTE.tasa)} por persona, sin importar la edad`,
          `Vigencia de ${PASAPORTE.vigenciaAnios.adulto} años para mayores de edad`,
          `Vigencia de ${PASAPORTE.vigenciaAnios.de12a17} años entre los 12 y los 17`,
          `Vigencia de ${PASAPORTE.vigenciaAnios.menor12} años para menores de 12`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'La tasa es la misma a toda edad, pero el pasaporte de un niño dura mucho menos: el costo por año de vigencia de un menor de 12 es más del triple que el de un adulto',
          'Tener una multa electoral impaga bloquea la emisión del pasaporte: hay que regularizarla antes',
          'El pago se hace con el código de tasa correspondiente antes de ir a la sede; llegar sin el pago hecho es la causa más común de tener que volver otro día',
        ],
        plazo: 'para viajar, muchos países exigen que el pasaporte tenga al menos seis meses de vigencia al momento del ingreso: revisa la fecha antes de comprar el pasaje.',
      },
      {
        id: 'brevete',
        label: 'Sacar el brevete',
        hint: 'Examen médico + evaluaciones + emisión',
        answer: 'El brevete no es una sola tasa: es la suma del examen médico, las evaluaciones y la emisión, y el médico es lo más caro y lo que más varía.',
        yes: [
          'Examen médico en un centro autorizado: el rubro que más cambia de una clínica a otra',
          `Evaluación de conocimientos y evaluación de manejo`,
          `Emisión de la licencia: física ${sol2(BREVETE.emisionFisica)} o electrónica ${sol2(BREVETE.emisionElectronica)}`,
          'Clases de manejo, si las necesitas, que son opcionales y van por fuera',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Las tasas de las evaluaciones dependen de la entidad que las toma y de si el trámite es en Lima o en provincia: los valores cargados son referencias y se pueden editar',
          'El examen médico es el rubro donde más plata se puede ahorrar cotizando en dos o tres centros autorizados antes de pagar',
          'Reprobar una evaluación implica volver a pagarla, así que el costo real de un brevete no siempre es el del primer intento',
        ],
        plazo: 'la licencia de clase A-I se tramita en la autoridad competente de tu jurisdicción; el examen médico tiene una vigencia limitada, así que conviene hacerlo cuando ya tienes fecha para las evaluaciones.',
      },
      {
        id: 'papeleta',
        label: 'Me pusieron una papeleta',
        hint: 'Porcentaje de la UIT según el código',
        answer: 'El monto de la papeleta no depende del policía sino del código de infracción: cada código es un porcentaje fijo de la UIT.',
        yes: [
          'Monto de la papeleta según el porcentaje de UIT que le corresponde al código',
          'Puntos que se acumulan en el récord del conductor',
          `Descuento por pago voluntario dentro del plazo, del ${(DESCUENTO_PRONTO_PAGO * 100).toFixed(0)}% en infracciones graves y leves`,
          'El código exacto figura en el reverso del acta de la papeleta',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Las infracciones muy graves no tienen descuento por pago voluntario: se pagan completas',
          'Los puntos importan tanto como la plata: acumular puntos en el récord puede terminar en suspensión o cancelación de la licencia',
          'Las infracciones muy graves suelen traer aparejadas también la retención de la licencia y el internamiento del vehículo, que se cobra aparte',
          'Los montos y códigos se actualizan por norma: verifica el código de tu acta en la entidad que la emitió antes de pagar',
        ],
        plazo: 'el descuento por pago voluntario corre desde que se impone la papeleta y vence en pocos días: es la diferencia entre pagar una fracción o el total.',
      },
      {
        id: 'electoral',
        label: 'No fui a votar',
        hint: 'Porcentaje de UIT según el distrito',
        answer: 'La multa por no votar depende de la clasificación de pobreza del distrito donde estás inscrito, no de tu situación personal.',
        yes: [
          `Distrito no pobre: ${sol2(ELECTORALES.omisionSufragio.noPobre)} por elección`,
          `Distrito pobre no extremo: ${sol2(ELECTORALES.omisionSufragio.pobreNoExtremo)} por elección`,
          `Distrito de pobreza extrema: ${sol2(ELECTORALES.omisionSufragio.pobreExtremo)} por elección`,
          `Miembro de mesa designado que no asistió: ${sol2(ELECTORALES.miembroMesaAusente)}, que se suma a la anterior`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'Cada elección genera su propia multa: si hubo dos vueltas y no votaste en ninguna, son dos multas',
          'La multa por no asistir como miembro de mesa es independiente y se acumula a la de omisión al sufragio',
          'Mientras la multa siga impaga no puedes renovar el DNI, tramitar el pasaporte ni firmar ante notario: el bloqueo administrativo es lo que más incomoda, más que el monto',
          'El porcentaje que se aplica depende del distrito donde figura tu dirección en el DNI, no de dónde vives realmente',
        ],
        plazo: 'la multa se paga en el Banco de la Nación o por la plataforma de pagos del Estado, y el levantamiento del impedimento no siempre es inmediato: no lo dejes para el día antes de un trámite.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Cada rama usa solo los campos que le corresponden. Los valores cargados son referencias: si ya tienes la cotización del examen médico o el código exacto de tu papeleta, cámbialos.',
  fields: [
    {
      id: 'personas',
      label: 'Cuántos pasaportes vas a tramitar',
      type: 'number',
      value: 1,
      min: 1,
      max: 20,
      step: 1,
      help: 'La tasa es por persona y es la misma para adultos y menores.',
    },
    {
      id: 'edadPasaporte',
      label: 'Edad de quien saca el pasaporte',
      type: 'select',
      value: 'adulto',
      options: [
        { value: 'adulto', label: 'Mayor de edad' },
        { value: 'de12a17', label: 'Entre 12 y 17 años' },
        { value: 'menor12', label: 'Menor de 12 años' },
      ],
      help: 'No cambia la tasa, pero sí la vigencia y por lo tanto el costo por año de pasaporte.',
    },
    {
      id: 'medico',
      label: 'Examen médico para el brevete (S/)',
      type: 'number',
      prefix: 'S/',
      value: 300,
      min: 0,
      step: 10,
      help: 'Es el rubro más caro y el que más varía entre centros autorizados: el rango típico va de 200 a 400 soles. Cotiza antes de pagar.',
    },
    {
      id: 'conocimientos',
      label: 'Evaluación de conocimientos (S/)',
      type: 'number',
      prefix: 'S/',
      value: BREVETE.conocimientosLima,
      min: 0,
      step: 1,
      help: 'Tasa de la evaluación teórica. Varía según la entidad que la toma y la jurisdicción.',
    },
    {
      id: 'manejo',
      label: 'Evaluación de manejo (S/)',
      type: 'number',
      prefix: 'S/',
      value: BREVETE.manejoLima,
      min: 0,
      step: 1,
      help: 'Tasa de la evaluación práctica. Algunos centros autorizados cobran un pago único que cubre ambas evaluaciones con dos oportunidades.',
    },
    {
      id: 'clases',
      label: 'Clases de manejo (S/)',
      type: 'number',
      prefix: 'S/',
      value: 0,
      min: 0,
      step: 50,
      help: 'Opcionales. Un cero acá es un dato legítimo si ya sabes conducir y se respeta como tal.',
    },
    {
      id: 'emision',
      label: 'Tipo de emisión de la licencia',
      type: 'select',
      value: 'fisica',
      options: [
        { value: 'fisica', label: 'Licencia física' },
        { value: 'electronica', label: 'Licencia electrónica' },
      ],
      help: 'La emisión electrónica es más barata, pero su disponibilidad depende de la entidad y del momento: confirma antes de pagar la tasa.',
    },
    {
      id: 'papeleta',
      label: 'Código de infracción de tu papeleta',
      type: 'select',
      value: 'g24',
      options: PAPELETA_TRAMOS.map((t) => ({ value: t.id, label: t.label + ' — ' + t.ejemplo })),
      help: 'El código exacto está en el reverso del acta. Si no lo encuentras, búscalo en la entidad que impuso la papeleta antes de pagar.',
    },
    {
      id: 'prontoPago',
      label: '¿Vas a pagar dentro del plazo de pago voluntario?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, dentro del plazo' },
        { value: 'no', label: 'No, ya venció el plazo' },
      ],
      help: 'El descuento por pago voluntario solo aplica a infracciones graves y leves; las muy graves se pagan completas.',
    },
    {
      id: 'distrito',
      label: 'Clasificación de tu distrito para la multa electoral',
      type: 'select',
      value: 'no_pobre',
      options: [
        { value: 'no_pobre', label: 'Distrito no pobre' },
        { value: 'pobre_no_extremo', label: 'Distrito pobre no extremo' },
        { value: 'pobre_extremo', label: 'Distrito de pobreza extrema' },
      ],
      help: 'La clasificación es la del distrito donde figura tu dirección en el DNI, según la información del INEI que usa el JNE.',
    },
    {
      id: 'elecciones',
      label: 'En cuántas elecciones no votaste',
      type: 'number',
      value: 2,
      min: 1,
      max: 6,
      step: 1,
      help: 'Cada elección genera su propia multa. Una elección general con segunda vuelta cuenta como dos.',
    },
    {
      id: 'miembroMesa',
      label: '¿Eras miembro de mesa designado?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, y no asistí' },
      ],
      help: 'La multa por no asistir como miembro de mesa es independiente y se suma a la de omisión al sufragio.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el costo',
    caption:
      'En el brevete se ve claro que el examen médico pesa más que todas las tasas oficiales juntas. En las multas, cuánto de lo que pagas es la infracción y cuánto te ahorra el pago dentro del plazo.',
  },
  breakdownTitle: 'El trámite, línea por línea',
  breakdownIntro:
    'Cada componente por separado, y las referencias que conviene tener a mano antes de ir a pagar.',

  faq: [
    {
      q: '¿Cuánto cuesta el pasaporte peruano?',
      a: `La tasa es de ${sol2(PASAPORTE.tasa)} por persona y es la misma a cualquier edad. Lo que cambia es la vigencia: ${PASAPORTE.vigenciaAnios.adulto} años para mayores de edad, ${PASAPORTE.vigenciaAnios.de12a17} años entre los 12 y los 17, y ${PASAPORTE.vigenciaAnios.menor12} años para menores de 12. Visto por año de vigencia, el pasaporte de un adulto sale ${sol2(PASAPORTE.tasa / PASAPORTE.vigenciaAnios.adulto)} al año y el de un niño más del triple.`,
    },
    {
      q: '¿Por qué el pasaporte de mi hijo cuesta lo mismo que el mío si dura menos?',
      a: 'Porque la tasa es única y no está escalonada por edad: se cobra por la emisión del documento, no por los años que dura. La vigencia menor en menores responde a que los rasgos faciales cambian rápido y la fotografía deja de ser útil para la identificación biométrica. En la práctica, el pasaporte de un menor termina siendo bastante más caro por año de uso.',
    },
    {
      q: '¿Cuánto cuesta sacar el brevete en total?',
      a: `Las tasas oficiales son la parte chica: entre las evaluaciones y la emisión de la licencia se va una fracción del total. El grueso es el examen médico en un centro autorizado, que suele estar entre 200 y 400 soles según la clínica, y las clases de manejo si las necesitas. La emisión de la licencia va de ${sol2(BREVETE.emisionElectronica)} en formato electrónico a ${sol2(BREVETE.emisionFisica)} en formato físico.`,
    },
    {
      q: '¿Dónde conviene ahorrar en el trámite del brevete?',
      a: 'En el examen médico, que es el único rubro con precio libre y con diferencias grandes entre centros autorizados. Las tasas de evaluación y emisión están fijadas y no se negocian. Cotizar en dos o tres centros antes de pagar es lo único que mueve la aguja, y puede ser una diferencia de más de cien soles por el mismo examen.',
    },
    {
      q: '¿Cuánto cuesta una papeleta de tránsito?',
      a: `Depende exclusivamente del código de infracción, porque el monto está fijado como porcentaje de la UIT. Una falta leve del 4% de la UIT son ${sol2(UIT * 0.04)}; una grave del 24% son ${sol2(UIT * 0.24)}; y una muy grave del 100% de la UIT son ${sol2(UIT)}. El código exacto está en el reverso del acta, y es el dato que hay que mirar antes que cualquier otro.`,
    },
    {
      q: '¿Hay descuento por pagar la papeleta rápido?',
      a: `Sí, el pago voluntario dentro del plazo tiene un descuento del ${(DESCUENTO_PRONTO_PAGO * 100).toFixed(0)}% en infracciones graves y leves, que es muchísimo: convierte una papeleta grave en una fracción de su monto. Las infracciones muy graves no tienen ese beneficio y se pagan completas. El plazo es corto y corre desde que se impone la papeleta, así que dejarla para después es literalmente pagar varias veces lo mismo.`,
    },
    {
      q: '¿Qué son los puntos del récord del conductor?',
      a: 'Cada infracción, además de la multa en dinero, suma puntos en tu récord de conductor. Las muy graves suman cien o cincuenta puntos, las graves entre veinte y cincuenta, y las leves no suman. Acumular puntos dentro de los plazos que fija la norma puede llevar a la suspensión o incluso a la cancelación de la licencia, y eso no se arregla pagando: los puntos no se compran de vuelta.',
    },
    {
      q: '¿Cuánto es la multa por no votar?',
      a: `Depende de la clasificación de pobreza del distrito donde estás inscrito: ${sol2(ELECTORALES.omisionSufragio.noPobre)} en un distrito no pobre, ${sol2(ELECTORALES.omisionSufragio.pobreNoExtremo)} en uno pobre no extremo y ${sol2(ELECTORALES.omisionSufragio.pobreExtremo)} en uno de pobreza extrema. Corresponden al 2%, el 1% y el 0,5% de la UIT respectivamente, así que suben cada vez que sube la UIT.`,
    },
    {
      q: '¿Si hubo dos vueltas y no voté en ninguna, pago doble?',
      a: `Sí. Cada acto electoral genera su propia multa por omisión al sufragio, así que una elección general con segunda vuelta en la que no participaste implica dos multas del mismo monto. No hay tope ni acumulación con descuento: se suman.`,
    },
    {
      q: '¿Cuánto es la multa si me designaron miembro de mesa y no fui?',
      a: `${sol2(ELECTORALES.miembroMesaAusente)}, equivalentes al 5% de la UIT, y es independiente de la multa por no votar: si no asististe como miembro de mesa, tampoco votaste, así que se pagan las dos. Es con diferencia la multa electoral más cara y la que más sorprende a quien no se enteró de la designación.`,
    },
    {
      q: '¿Qué pasa si no pago la multa electoral?',
      a: 'Queda registrado un impedimento administrativo que bloquea varios trámites: no puedes renovar el DNI, no puedes tramitar el pasaporte, no puedes firmar escrituras ante notario ni realizar ciertos actos registrales. Para la mayoría de la gente ese bloqueo es un problema mucho mayor que el monto de la multa, y aparece justo cuando se necesita el trámite con urgencia.',
    },
    {
      q: '¿Por qué todas estas multas suben cada año?',
      a: 'Porque están fijadas como porcentaje de la UIT y no como un monto en soles. La UIT se actualiza cada año por decreto supremo del Ministerio de Economía y Finanzas, así que al cambiar la UIT cambian automáticamente todas las multas indexadas: papeletas, multas electorales, el piso del impuesto vehicular y buena parte de las sanciones administrativas del país.',
    },
  ],

  sources: [
    { name: 'Migraciones — Pasaporte electrónico', url: 'https://www.gob.pe/193-obtener-pasaporte-electronico', publisher: 'Superintendencia Nacional de Migraciones' },
    { name: 'MTC — Licencia de conducir de clase A categoría I', url: 'https://www.gob.pe/241-obtener-licencia-de-conducir-para-vehiculos-particulares', publisher: 'Ministerio de Transportes y Comunicaciones' },
    { name: 'SAT de Lima — Papeletas de tránsito y récord del conductor', url: 'https://www.sat.gob.pe/websitev9/TributosMultas/PapeletasyMultas/Informacion', publisher: 'Servicio de Administración Tributaria de Lima' },
    { name: 'JNE — Multas electorales', url: 'https://portal.jne.gob.pe/', publisher: 'Jurado Nacional de Elecciones' },
    { name: 'SUNAT — Unidad Impositiva Tributaria (UIT) por año', url: 'https://www.sunat.gob.pe/indicestasas/uit.html', publisher: 'SUNAT' },
  ],

  replaces: [
    '/pe/calculadora-costo-pasaporte-peruano-2026',
    '/pe/calculadora-costo-brevete-licencia-conducir-peru-2026',
    '/pe/calculadora-papeletas-transito-peru',
    '/pe/calculadora-multa-no-votar-elecciones-2026-peru',
  ],

  lastReviewed: '2026-07-28',
};
