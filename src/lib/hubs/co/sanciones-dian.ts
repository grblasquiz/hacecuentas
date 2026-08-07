import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Me atrasé o me equivoqué con la DIAN: ¿cuánto me cuesta?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts. Nada de memoria.
 *
 * Reemplaza 5 calculadoras sueltas de sanciones e intereses. La quinta
 * (conversión UVT/UVR) entra como herramienta del hub porque toda sanción del
 * Estatuto Tributario está escrita en UVT y la gente necesita traducirla.
 *
 * 🔴 Bug heredado, NO replicado acá: la fórmula vieja
 * `conversion-uvt-uvr-colombia-actualizacion-2026.ts` traía
 * `UVR_APROXIMADO_2026 = 34567.89`, un valor inventado (la UVR real ronda los
 * $400, no los $34.567). Acá la UVR es un campo que carga el usuario con el
 * valor certificado del día por el Banco de la República, sin default con
 * pretensión de autoridad.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UVT del año en curso — Resolución DIAN 000238 del 15-12-2025. */
export const UVT = COLOMBIA_2026.uvt;
/** UVT del año gravable 2025, con la que se miden los topes de la declaración que se presenta este año. */
export const UVT_ANTERIOR = COLOMBIA_2026.uvt2025;

/** Sanciones del Estatuto Tributario. Espejo de COLOMBIA_2026.sanciones. */
export const SANCIONES = {
  /** Art. 641 ET: 5% del impuesto a cargo por mes o fracción, antes de emplazamiento. */
  extemporaneidadPorMes: COLOMBIA_2026.sanciones.extemporaneidadPorMes,
  /** Art. 642 ET: 10% por mes o fracción, después del emplazamiento para declarar. */
  extemporaneidadConEmplazamientoPorMes: COLOMBIA_2026.sanciones.extemporaneidadConEmplazamientoPorMes,
  /** Tope del art. 641: 100% del impuesto. El del art. 642 es el doble. */
  topeSinEmplazamiento: COLOMBIA_2026.sanciones.extemporaneidadTope,
  topeConEmplazamiento: COLOMBIA_2026.sanciones.extemporaneidadTope * 2,
  /** Art. 639 ET: piso de toda sanción, en UVT. */
  minimaUvt: COLOMBIA_2026.sanciones.minimaUvt,
};

/** Art. 644 ET — sanción por corrección: 10% voluntaria, 20% tras emplazamiento para corregir. */
export const CORRECCION = { voluntaria: 0.1, conEmplazamiento: 0.2 };

/** Art. 640 ET — reducciones de sanción por buen comportamiento tributario. */
export const REDUCCIONES = [
  { pct: 0, factor: 1 },
  { pct: 50, factor: 0.5 },
  { pct: 75, factor: 0.25 },
];

/**
 * Intereses de mora — art. 635 ET (redacción de la Ley 1819/2016).
 * Tasa = usura de consumo y ordinario certificada por la Superfinanciera MENOS 2 puntos,
 * y la diaria sale por división simple sobre 365, NO por conversión geométrica
 * (el (1+EA)^(1/365)−1 es el método pre-2017 que la Ley 1819 derogó).
 */
export const MORA = {
  puntosMenos: 0.02,
  baseDias: 365,
  /** Usura de consumo y ordinario certificada para junio de 2026 (Res. Superfinanciera 0823 de 2026). */
  usuraReferenciaPct: 28.79,
  usuraReferenciaMes: 'junio de 2026',
};

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/impuestos/sanciones-dian',
  title: 'Sanción por extemporaneidad DIAN 2026: cálculo y mínima UVT',
  description:
    'Calculá la sanción por extemporaneidad DIAN 2026 (arts. 641 y 642 ET), la de corrección (art. 644), la sanción mínima de 10 UVT (art. 639) y los intereses de mora del art. 635, con la UVT y la tasa de usura vigentes.',
  silo: 'Impuestos',
  siloHref: '/co/impuestos',
  locale: 'co',

  eyebrow: 'Colombia · DIAN · Estatuto Tributario',
  h1: 'Me atrasé con la DIAN: ¿cuánto me va a costar ponerme al día?',
  lede:
    'Hay dos cuentas distintas que corren al mismo tiempo y casi nadie suma juntas: la sanción, que depende de cuánto te demoraste y de si la DIAN ya te escribió, y los intereses de mora, que corren día por día sobre el impuesto. Acá salen las dos, con el piso de la sanción mínima aplicado donde corresponde.',
  stamps: [
    `UVT vigente: ${cop(UVT)}`,
    'Arts. 634, 635, 639, 640, 641, 642 y 644 del Estatuto Tributario',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Total a pagar para ponerte al día',

  cases: {
    title: '¿En cuál de estas situaciones estás?',
    intro:
      'La tarifa cambia según una sola cosa: si te movés vos primero o si la DIAN te escribió antes. Esa diferencia vale el doble de sanción, literalmente. Partimos del caso más frecuente.',
    items: [
      {
        id: 'extemporanea',
        label: 'No presenté la declaración y la DIAN todavía no me ha escrito',
        hint: 'Art. 641 ET · 5% por mes, tope 100%',
        answer: 'Presentando por tu cuenta pagás 5% del impuesto por cada mes de retraso, con tope del 100%.',
        yes: [
          `${(SANCIONES.extemporaneidadPorMes * 100).toFixed(0)}% del impuesto a cargo por cada mes o fracción de mes de retraso`,
          `Tope de la sanción: ${(SANCIONES.topeSinEmplazamiento * 100).toFixed(0)}% del impuesto`,
          `Piso de la sanción: ${SANCIONES.minimaUvt} UVT (${cop(SANCIONES.minimaUvt * UVT)}), art. 639 ET`,
          'Intereses de mora del art. 635, que corren aparte y por día',
        ],
        warn: [
          DISCLAIMER_TAX,
          '"Mes o fracción" significa que un solo día de atraso ya cuenta como un mes completo: presentar el 2 del mes cuesta lo mismo que presentar el 30',
          'Si tu declaración no arroja impuesto a cargo, la DIAN puede liquidar la sanción sobre tus ingresos brutos o tu patrimonio líquido del período (art. 641 incisos 2 y 3): la mínima de 10 UVT es el piso, no siempre el resultado final',
        ],
        plazo: 'presentá antes de que llegue el emplazamiento: el día que te emplazan, la tarifa se duplica.',
      },
      {
        id: 'emplazado',
        label: 'La DIAN ya me emplazó para declarar',
        hint: 'Art. 642 ET · 10% por mes, tope 200%',
        answer: 'Después del emplazamiento la sanción se duplica: 10% por mes, con tope del 200%.',
        yes: [
          `${(SANCIONES.extemporaneidadConEmplazamientoPorMes * 100).toFixed(0)}% del impuesto a cargo por cada mes o fracción de retraso`,
          `Tope de la sanción: ${(SANCIONES.topeConEmplazamiento * 100).toFixed(0)}% del impuesto`,
          `El mismo piso de ${SANCIONES.minimaUvt} UVT del art. 639`,
          'Los intereses de mora siguen corriendo mientras no pagues',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El emplazamiento para declarar es una actuación formal notificada: si sólo recibiste un correo o un mensaje genérico de la DIAN invitándote a declarar, todavía estás en el caso anterior y te conviene apurarte',
          'Si ni siquiera respondés al emplazamiento, la DIAN puede liquidar de aforo y ahí la sanción es peor',
        ],
        plazo: 'el emplazamiento da un mes para responder; vencido, la DIAN puede seguir de oficio.',
      },
      {
        id: 'correccion',
        label: 'Ya declaré pero me equivoqué y quiero corregir yo mismo',
        hint: 'Art. 644 ET · 10% del mayor valor',
        answer: 'Corrigiendo voluntariamente pagás el 10% del mayor valor que resulte de la corrección.',
        yes: [
          `${(CORRECCION.voluntaria * 100).toFixed(0)}% del mayor valor a pagar (o del menor saldo a favor) que arroje la corrección`,
          `Piso de ${SANCIONES.minimaUvt} UVT`,
          'Intereses de mora sobre el mayor impuesto, desde el vencimiento original',
          `Posible reducción del art. 640 (50% o 75%) si no tenés sanciones previas del mismo tipo y subsanás en plazo`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'La sanción se calcula sobre el MAYOR VALOR que surge de corregir, no sobre el impuesto total de la declaración',
          'Si la corrección te deja un saldo a favor mayor o un menor impuesto, no hay sanción por corrección: ese trámite va por el art. 589 y tiene su propio procedimiento',
        ],
        plazo: 'la corrección que aumenta el impuesto se puede presentar dentro de los 3 años siguientes al vencimiento.',
      },
      {
        id: 'correccion-emplazada',
        label: 'La DIAN ya me emplazó para corregir',
        hint: 'Art. 644 ET · 20% del mayor valor',
        answer: 'Tras el emplazamiento para corregir, la sanción del art. 644 sube al 20% del mayor valor.',
        yes: [
          `${(CORRECCION.conEmplazamiento * 100).toFixed(0)}% del mayor valor a pagar que arroje la corrección`,
          `El mismo piso de ${SANCIONES.minimaUvt} UVT`,
          'Intereses de mora desde el vencimiento original de la declaración',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Corregir después del emplazamiento cuesta exactamente el doble que hacerlo por iniciativa propia: la diferencia sale del bolsillo, no del calendario',
          'Si dejás pasar también el requerimiento especial, la discusión sale del terreno de la corrección voluntaria y entra en el de la liquidación oficial de revisión, con sanción por inexactitud del 100% de la diferencia (art. 648 ET)',
        ],
        plazo: 'el emplazamiento para corregir da un mes; después viene el requerimiento especial.',
      },
    ],
  },

  inputsTitle: 'Tu situación en números',
  inputsIntro:
    'Cargá el impuesto de la declaración y cuánto te demoraste. Los campos que no aplican a tu caso se ignoran solos: el resultado se arma según la rama que elegiste arriba.',
  fields: [
    {
      id: 'impuesto',
      label: 'Impuesto a cargo de la declaración (COP)',
      prefix: '$',
      value: '4.000.000',
      thousands: true,
      help: 'El impuesto que arroja la declaración, no el saldo a pagar después de retenciones. Si da cero, mirá la advertencia de la primera rama.',
    },
    {
      id: 'mayorValor',
      label: 'Mayor valor a pagar por corregir (COP)',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'Sólo para las ramas de corrección: cuánto más te da a pagar la declaración corregida frente a la original.',
    },
    {
      id: 'meses',
      label: 'Meses de retraso en presentar',
      type: 'number',
      value: 3,
      min: 0,
      max: 60,
      step: 1,
      help: 'Contá mes o fracción: si te pasaste 2 meses y 4 días, son 3 meses.',
    },
    {
      id: 'diasMora',
      label: 'Días de mora en el pago',
      type: 'number',
      value: 95,
      min: 0,
      max: 3650,
      step: 1,
      help: 'Días calendario desde el vencimiento original hasta el día en que vas a pagar. Corren aunque hayas presentado a tiempo y pagado tarde.',
    },
    {
      id: 'usura',
      label: 'Tasa de usura vigente (% efectivo anual)',
      type: 'number',
      value: MORA.usuraReferenciaPct,
      min: 0,
      max: 80,
      step: 0.01,
      suffix: '% E.A.',
      help: `La certifica la Superfinanciera y cambia todos los meses. El valor cargado es el de ${MORA.usuraReferenciaMes}: reemplazalo por el del mes en que vas a pagar.`,
    },
    {
      id: 'reduccion',
      label: 'Reducción del art. 640 que te aplica',
      type: 'select',
      value: '0',
      options: [
        { value: '0', label: 'Ninguna' },
        { value: '50', label: 'Reducción del 50%' },
        { value: '75', label: 'Reducción del 75%' },
      ],
      help: 'Sólo si cumplís los requisitos del art. 640: no haber cometido la misma conducta en los años anteriores y subsanar y pagar en plazo.',
    },
    {
      id: 'uvr',
      label: 'UVR certificada del día (COP)',
      type: 'number',
      value: 0,
      min: 0,
      step: 0.0001,
      help: 'Opcional, y sólo para convertir montos expresados en UVR (créditos de vivienda). La UVR la certifica el Banco de la República todos los días y acá no hay ningún valor oficial precargado: copiá el del día. Dejalo en cero si no lo necesitás.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecho lo que le tenés que pagar a la DIAN',
    caption:
      'Separa el impuesto que siempre ibas a deber, la sanción que se disparó por el atraso y los intereses de mora que corren por día. Sólo las dos últimas porciones son evitables.',
  },
  breakdownTitle: 'La cuenta completa, concepto por concepto',
  breakdownIntro:
    'Primero la sanción con su porcentaje y su tope, después el piso del art. 639 por si la muerde, y al final los intereses del art. 635 con lo que te cuesta cada día extra.',

  faq: [
    {
      q: '¿Cuál es la sanción mínima de la DIAN en 2026, en UVT?',
      a: `${SANCIONES.minimaUvt} UVT, o sea ${cop(SANCIONES.minimaUvt * UVT)} con la UVT vigente (art. 639 del Estatuto Tributario). Es el piso de casi toda sanción tributaria: si la cuenta del porcentaje te da menos que eso, pagás igual la mínima. Se actualiza sola cada año porque está escrita en UVT y la DIAN fija el valor de la UVT en diciembre para el año siguiente.`,
    },
    {
      q: '¿Cuánto es la sanción por extemporaneidad de la DIAN en 2026?',
      a: `Depende de si te movés vos primero. Antes de que la DIAN te emplace, el art. 641 fija el ${(SANCIONES.extemporaneidadPorMes * 100).toFixed(0)}% del impuesto a cargo por cada mes o fracción de mes de retraso, con tope del ${(SANCIONES.topeSinEmplazamiento * 100).toFixed(0)}%. Después del emplazamiento, el art. 642 la duplica: ${(SANCIONES.extemporaneidadConEmplazamientoPorMes * 100).toFixed(0)}% por mes, con tope del ${(SANCIONES.topeConEmplazamiento * 100).toFixed(0)}%. En los dos casos rige el piso de ${SANCIONES.minimaUvt} UVT.`,
    },
    {
      q: '¿Qué quiere decir "mes o fracción de mes"?',
      a: 'Que no hay proporcionalidad: cualquier parte de un mes cuenta como mes entero. Si tu declaración vencía el 15 y la presentás el 16, ya liquidás un mes completo de sanción. Por eso, cuando estás a punto de cruzar un mes, presentar el día anterior puede ahorrarte un 5% del impuesto de una sola vez.',
    },
    {
      q: '¿La sanción y los intereses de mora son lo mismo?',
      a: 'No, y se suman. La sanción castiga la conducta (no declarar, declarar mal) y se calcula por meses. Los intereses de mora compensan a la Nación por no tener la plata a tiempo y corren por día calendario sobre el impuesto, según el art. 635. Podés deber intereses sin deber sanción, por ejemplo si presentaste en plazo pero pagaste después.',
    },
    {
      q: '¿Cómo se calculan los intereses de mora de la DIAN?',
      a: `Con la fórmula del art. 635 tal como quedó tras la Ley 1819 de 2016: se toma la tasa de usura de consumo y ordinario que certifica la Superfinanciera, se le restan ${(MORA.puntosMenos * 100).toFixed(0)} puntos, se divide entre ${MORA.baseDias} para sacar la tasa diaria y se multiplica por el capital y por los días de mora. Es interés simple, no compuesto: la conversión geométrica (1+EA)^(1/365)−1 era el método anterior a 2017 y quedó derogada. Con la usura de ${MORA.usuraReferenciaMes} (${MORA.usuraReferenciaPct.toString().replace('.', ',')}% E.A.), la tasa de mora es del ${(MORA.usuraReferenciaPct - MORA.puntosMenos * 100).toFixed(2).replace('.', ',')}% efectivo anual.`,
    },
    {
      q: '¿Cuánto cuesta corregir una declaración?',
      a: `El ${(CORRECCION.voluntaria * 100).toFixed(0)}% del mayor valor a pagar si corregís por tu cuenta, y el ${(CORRECCION.conEmplazamiento * 100).toFixed(0)}% si ya te emplazaron para corregir (art. 644 ET). Ojo con la base: es el mayor valor que resulta de la corrección, no el impuesto total. Si corregís y te da menos impuesto o más saldo a favor, no hay sanción por corrección: ese caso va por el art. 589, con solicitud ante la DIAN.`,
    },
    {
      q: '¿Se puede reducir la sanción?',
      a: 'Sí, con el art. 640, que premia el buen comportamiento tributario. La reducción es del 50% si en los dos años anteriores no cometiste la misma conducta sancionada, y del 75% si no la cometiste en los cuatro años anteriores, siempre que subsanes y pagues dentro del plazo. Hay reducciones específicas en otros artículos, como la del art. 709 cuando aceptás los hechos del requerimiento especial. La reducción se aplica sobre la sanción ya liquidada, y el piso de la mínima sigue mandando.',
    },
    {
      q: 'Mi declaración da cero impuesto. ¿Igual me sancionan por presentarla tarde?',
      a: `Sí. El art. 641 previó justamente ese caso: cuando no hay impuesto a cargo, la sanción se liquida sobre los ingresos brutos del período, y si tampoco hubo ingresos, sobre el patrimonio líquido del año anterior, con topes propios. Y por debajo de todo eso está la mínima de ${SANCIONES.minimaUvt} UVT (${cop(SANCIONES.minimaUvt * UVT)}). Declarar en ceros tarde no sale gratis.`,
    },
    {
      q: '¿Qué es la UVT y por qué la DIAN escribe todo en esa unidad?',
      a: `La Unidad de Valor Tributario es la unidad con la que el Estatuto Tributario expresa topes, tramos y sanciones para que se actualicen solos cada año sin reformar la ley. La vigente es de ${cop(UVT)}, fijada por la Resolución DIAN 000238 del 15 de diciembre de 2025. Un detalle que confunde: los topes de la declaración que estás presentando este año se miden con la UVT del año gravable declarado (${cop(UVT_ANTERIOR)}), no con la del año en que presentás.`,
    },
    {
      q: '¿La UVT y la UVR son lo mismo?',
      a: 'No, y confundirlas sale caro. La UVT es tributaria, la fija la DIAN una vez al año y sirve para leer el Estatuto Tributario. La UVR es la Unidad de Valor Real, la certifica el Banco de la República todos los días siguiendo el IPC y se usa en los créditos de vivienda de largo plazo. Sus valores no tienen nada que ver entre sí ni en orden de magnitud: si ves una calculadora que las trata como equivalentes o que trae una UVR "aproximada" hardcodeada, desconfiá y andá al dato certificado del día.',
    },
    {
      q: '¿Hasta cuándo me puede sancionar la DIAN?',
      a: 'La facultad de sancionar prescribe, pero los plazos son largos. La declaración queda en firme a los 3 años del vencimiento si nadie la cuestiona (art. 714 ET), y a los 5 años cuando hay compensación de pérdidas o precios de transferencia. Mientras no esté en firme, la DIAN puede revisarla y sancionar. Si nunca la presentaste, no empieza a correr ninguna firmeza: el atraso sigue vivo hasta que declares.',
    },
    {
      q: '¿Conviene declarar tarde o esperar a ver si la DIAN no se da cuenta?',
      a: 'Conviene declarar. La sanción del art. 641 tiene tope del 100% del impuesto y se congela ahí; los intereses, en cambio, corren indefinidamente y son los que terminan duplicando la deuda. Además, el día que la DIAN emplaza, la tarifa se duplica y perdés cualquier reducción del art. 640. Con información de terceros, reportes de bancos y facturación electrónica, la probabilidad de que no se den cuenta es cada vez más baja.',
    },
  ],

  sources: [
    {
      name: 'Estatuto Tributario, art. 635 — determinación de la tasa de interés moratorio',
      url: 'https://estatuto.co/635',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 639 — sanción mínima',
      url: 'https://estatuto.co/639',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 640 — aplicación de los principios de lesividad, proporcionalidad y gradualidad',
      url: 'https://estatuto.co/640',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 641 — extemporaneidad en la presentación',
      url: 'https://estatuto.co/641',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 642 — extemporaneidad posterior al emplazamiento',
      url: 'https://estatuto.co/642',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 644 — sanción por corrección de las declaraciones',
      url: 'https://estatuto.co/644',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
    {
      name: 'Superintendencia Financiera — certificación del interés bancario corriente y la tasa de usura',
      url: 'https://www.superfinanciera.gov.co/publicaciones/60961/tasas-de-interes-tasa-de-interes-bancario-corriente-60961/',
      publisher: 'Superintendencia Financiera de Colombia',
    },
    {
      name: 'Banco de la República — valor diario de la UVR',
      url: 'https://www.banrep.gov.co/es/estadisticas/unidad-valor-real-uvr',
      publisher: 'Banco de la República',
    },
  ],

  replaces: [
    '/co/calculadora-sancion-extemporaneidad-dian-2026',
    '/co/calculadora-sancion-correccion-declaracion-dian-colombia-2026',
    '/co/calculadora-sancion-minima-dian-colombia-2026-10-uvt',
    '/co/calculadora-interes-mora-dian-colombia-2026',
    '/co/calculadora-conversion-uvt-uvr-colombia-actualizacion-2026',
  ],

  lastReviewed: '2026-08-07',
};
