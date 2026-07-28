import type { HubData } from '../types';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me cuesta al año tener el auto?"
 *
 * Absorbe 7 calculadoras sueltas del silo Auto de Chile: permiso de circulación,
 * SOAP, seguro voluntario, multas de tránsito, renovación de licencia, impuesto
 * verde del auto nuevo y crédito automotriz.
 *
 * UF y UTM son datos VIVOS (src/data/live/chile.json, mindicador.cl). El permiso de
 * circulación y las multas se expresan en UTM: acá NUNCA se hardcodean en pesos.
 *
 * DIFERENCIAS DELIBERADAS contra las fórmulas viejas (ver reporte):
 *  - El permiso de circulación NO es "tasación × tasa comunal": es la tabla progresiva
 *    en UTM del Art. 12 de la Ley 18.290. La tasa comunal no existe en la ley.
 *  - No existe el "descuento por pronto pago del 11,8%": el permiso se paga entero
 *    en marzo o en dos cuotas (marzo y agosto) por el mismo total.
 *  - Las coberturas del SOAP están en UF (Ley 18.490 Art. 25), no en UTA.
 *  - Las multas se mueven en el rango en UTM que fija el Art. 200 de la Ley 18.290;
 *    no existe recargo legal automático del 50% por pago tardío ni por reincidencia.
 *  - Renovar la licencia atrasado no tiene multa: la multa es por CONDUCIR con la
 *    licencia vencida (infracción grave, Art. 196 Ley 18.290).
 */

/** Disclaimers YMYL — copiados textuales de src/lib/disclaimers.ts. */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';
export const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

/** Indicadores vivos, con los mismos fallbacks que usan las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UTA = (clLive as any)?.uta?.valor ?? 858072;
export const UTM_FECHA = String((clLive as any)?.utm?.fecha ?? '').slice(0, 10);

/**
 * Permiso de circulación — Art. 12 Ley 18.290 (Ley de Tránsito).
 * Tabla progresiva sobre la TASACIÓN FISCAL del SII expresada en UTM.
 * Tramos continuos: en 60, 120, 250 y 400 UTM la parte fija empalma con la variable.
 * Mínimo legal: 0,5 UTM.
 */
export const PERMISO_TRAMOS: Array<{ desdeUtm: number; hastaUtm: number | null; fijoUtm: number; tasa: number }> = [
  { desdeUtm: 0, hastaUtm: 60, fijoUtm: 0, tasa: 0.01 },
  { desdeUtm: 60, hastaUtm: 120, fijoUtm: 0.6, tasa: 0.02 },
  { desdeUtm: 120, hastaUtm: 250, fijoUtm: 1.8, tasa: 0.03 },
  { desdeUtm: 250, hastaUtm: 400, fijoUtm: 5.7, tasa: 0.04 },
  { desdeUtm: 400, hastaUtm: null, fijoUtm: 11.7, tasa: 0.045 },
];
export const PERMISO_MINIMO_UTM = 0.5;

/**
 * Coberturas del SOAP en UF — Ley 18.490, Art. 25.
 * El precio de la prima NO está fijado por ley: cada compañía lo define y por eso
 * en el hub es un campo editable, no una constante.
 */
export const SOAP_PRECIO_FECHA = '2026-07-28';
export const SOAP_COBERTURAS_UF = {
  muerte: 300,
  invalidezPermanenteTotal: 300,
  invalidezPermanenteParcial: 200,
  incapacidadTemporal: 150,
  gastosMedicos: 300,
};

/**
 * Multas de tránsito — Art. 200 Ley 18.290. Rangos en UTM por clasificación.
 * El juez de policía local fija el monto dentro del rango.
 */
export const MULTA_RANGOS: Array<{ id: string; nombre: string; minUtm: number; maxUtm: number; ejemplo: string }> = [
  { id: 'leve', nombre: 'Leve', minUtm: 0.2, maxUtm: 0.5, ejemplo: 'no llevar el triángulo o el extintor, luces de posición apagadas' },
  { id: 'menos_grave', nombre: 'Menos grave', minUtm: 0.5, maxUtm: 1, ejemplo: 'estacionar en lugar prohibido, no portar los documentos del vehículo' },
  { id: 'grave', nombre: 'Grave', minUtm: 1, maxUtm: 1.5, ejemplo: 'usar el celular al volante, no usar cinturón, conducir con la licencia vencida' },
  { id: 'gravisima', nombre: 'Gravísima', minUtm: 1.5, maxUtm: 3, ejemplo: 'pasarse una luz roja, exceso de velocidad importante, conducir bajo influencia del alcohol' },
];

/**
 * Seguro voluntario — modelo de factores heredado de
 * src/lib/formulas/seguro-auto-chile-todo-riesgo-comparador-2026.ts.
 * Es una CALIBRACIÓN DE MERCADO, no una tarifa oficial: la prima real la fija cada
 * compañía. Se conserva para no romper la continuidad numérica de la calc absorbida.
 */
export const SEGURO_PRIMA_BASE_MENSUAL = 13_000;
export const SEGURO_COBERTURAS: Array<{ id: string; nombre: string; factor: number }> = [
  { id: 'ninguno', nombre: 'Sin seguro voluntario (solo SOAP)', factor: 0 },
  { id: 'terceros', nombre: 'Responsabilidad civil a terceros', factor: 1 },
  { id: 'terceros_completos', nombre: 'Terceros completos (incendio y robo)', factor: 2 },
  { id: 'todo_riesgo', nombre: 'Todo riesgo', factor: 3.1 },
];

/** Impuesto verde al vehículo nuevo — Art. 3° Ley 20.780, aplicado por el SII. */
export const IMPUESTO_VERDE_FACTOR_PRECIO = 0.00000006;
export const IMPUESTO_VERDE_CTE_RENDIMIENTO = 35;
export const IMPUESTO_VERDE_CTE_NOX = 120;

/** Tasa máxima convencional referencial (CMF) para créditos de consumo en pesos. */
export const TASA_MAXIMA_CONVENCIONAL_CMF = 32;

/**
 * Aranceles y vigencias de licencia de conducir.
 * OJO: el arancel de la licencia lo fija CADA MUNICIPALIDAD por ordenanza, no el SII
 * ni el Registro Civil. Por eso el hub lo pide como campo editable y este valor es
 * sólo un punto de partida.
 */
export const LICENCIA_ARANCEL_REFERENCIAL = 25_000;
export const LICENCIA_ARANCEL_FECHA = '2026-07-28';
export const LICENCIA_VIGENCIA: Array<{ id: string; nombre: string; anios: number }> = [
  { id: 'b_renovacion', nombre: 'Clase B — renovación', anios: 6 },
  { id: 'b_primera', nombre: 'Clase B — primera licencia', anios: 4 },
  { id: 'a_profesional', nombre: 'Clase A profesional (taxi, bus, camión)', anios: 4 },
  { id: 'mayor_65', nombre: 'Cualquier clase, conductor mayor de 65 años', anios: 2 },
];

/** Revisión técnica y análisis de gases — precio de mercado, varía por planta. */
export const REVISION_TECNICA_REFERENCIAL = 30_000;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/auto/cuanto-cuesta-tener-auto',
  title: 'Cuánto cuesta tener auto en Chile al año: permiso de circulación, SOAP, seguro y multas',
  description:
    'Suma lo que te cuesta el auto en un año en Chile: permiso de circulación según la tasación fiscal del SII y la tabla en UTM del Art. 12 de la Ley 18.290, SOAP, seguro voluntario, revisión técnica y renovación de la licencia. Y si estás comprando, el impuesto verde del auto nuevo y la cuota del crédito automotriz con su CAE.',
  silo: 'Auto',
  siloHref: '/cl/auto',
  locale: 'cl',

  eyebrow: 'Chile · costos del vehículo',
  h1: '¿Cuánto me cuesta al año tener el auto?',
  lede:
    'El auto no cuesta sólo la bencina. Cada año se van el permiso de circulación, el SOAP, la revisión técnica, el seguro voluntario y, cada cierto tiempo, la renovación de la licencia. Pon la tasación fiscal de tu vehículo y mira el total peso por peso. Si estás comprando uno nuevo o te llegó una multa, cambia el caso más abajo.',
  stamps: [
    `UTM del mes: ${fmt(UTM)}`,
    `UF de hoy: $${UF.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'Permiso de circulación: tabla en UTM del Art. 12 Ley 18.290',
    'SOAP: coberturas en UF, Ley 18.490 Art. 25',
    '7 cálculos en una sola página',
  ],

  resultLabel: 'Costo anual estimado del auto',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por el caso más común: ya tienes el auto y quieres saber cuánto se te va en un año sólo en mantenerlo legal y asegurado.',
    items: [
      {
        id: 'anual',
        label: 'Quiero saber cuánto me cuesta al año el auto que ya tengo',
        hint: 'Permiso de circulación, SOAP, revisión técnica y seguro voluntario, todo junto.',
        yes: [
          'Permiso de circulación calculado sobre la tasación fiscal del SII con la tabla progresiva en UTM del Art. 12 de la Ley 18.290',
          'SOAP anual: el precio que te cobra la compañía (es un campo editable, no una tarifa fija)',
          'Revisión técnica y análisis de gases, según la antigüedad de tu vehículo',
          'Seguro voluntario, si contratas uno: terceros, terceros completos o todo riesgo',
          'Prorrateo anual del costo de renovar la licencia de conducir',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El permiso de circulación se calcula sobre la TASACIÓN FISCAL que publica el SII cada año, no sobre lo que pagaste ni sobre el valor comercial del auto',
          'Ninguna municipalidad aplica una "tasa comunal" propia al permiso: la tabla es la misma en todo Chile y lo que cambia es a qué municipio le pagas',
          'No existe descuento por pronto pago: pagar todo en marzo o en dos cuotas (marzo y agosto) cuesta exactamente lo mismo',
          'El SOAP cubre sólo lesiones y muerte de personas, y sus topes están en UF: hasta 300 UF por muerte y hasta 300 UF en gastos médicos por persona, no cientos de millones de pesos',
          'El proyecto conocido como "Ley Jacinta" propone subir los gastos médicos del SOAP de 300 a 600 UF, pero está en tramitación: hoy no rige',
          'No entran acá la bencina, el TAG ni la mantención: eso se calcula en el hub del viaje',
        ],
        plazo:
          'el permiso de circulación vence el 31 de marzo; si pagas en dos cuotas, la segunda vence el 31 de agosto. El SOAP corre del 1 de abril al 31 de marzo del año siguiente.',
        answer:
          'El costo fijo anual de un auto en Chile es el permiso de circulación (una fracción de la tasación fiscal en UTM), el SOAP, la revisión técnica y, si lo tienes, el seguro voluntario.',
      },
      {
        id: 'comprar',
        label: 'Voy a comprar un auto nuevo',
        hint: 'Impuesto verde por única vez al inscribirlo, más la cuota del crédito automotriz.',
        yes: [
          'Impuesto verde del Art. 3° de la Ley 20.780: [(35 ÷ rendimiento urbano) + (120 × NOx)] × precio de venta × 0,00000006, expresado en UTM',
          'Cuota mensual del crédito automotriz por el sistema francés, a partir del monto financiado, el plazo y la CAE',
          'Total de intereses y costo total del auto sumando el pie',
          'El permiso de circulación del primer año, ya calculado sobre el precio del vehículo nuevo',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El impuesto verde se paga UNA sola vez, al inscribir el vehículo nuevo en el Registro Civil, y no se repite en los años siguientes',
          'Los vehículos eléctricos quedan exentos: sin consumo de combustible el término 35 ÷ rendimiento se anula y sin emisiones de NOx el impuesto da cero',
          'La CAE es lo único comparable entre financieras: incluye la tasa, los gastos y los seguros asociados. Pedirla por escrito es tu derecho',
          `Si la CAE supera la tasa máxima convencional que publica la CMF (referencia ${TASA_MAXIMA_CONVENCIONAL_CMF}% anual para este tramo), el crédito no puede pactarse legalmente a esa tasa`,
          'El seguro de desgravamen y el todo riesgo que exige la financiera suelen ir dentro de la cuota: pide el desglose antes de firmar',
        ],
        plazo:
          'el impuesto verde se paga al momento de inscribir el vehículo; el permiso de circulación del primer año se paga proporcional a los meses que restan hasta el 31 de marzo.',
        answer:
          'Comprar un auto nuevo suma el impuesto verde por única vez al inscribirlo, la cuota del crédito si lo financias, y desde el primer año el permiso de circulación y el SOAP.',
      },
      {
        id: 'multa',
        label: 'Me llegó una multa de tránsito',
        hint: 'Las multas van en UTM: el monto en pesos cambia todos los meses.',
        yes: [
          'Rango de la multa en UTM según la clasificación de la infracción (Art. 200 de la Ley 18.290)',
          'Conversión a pesos con la UTM del mes en curso',
          'Mínimo, máximo y punto medio del rango, que es lo que el juez de policía local puede fijar',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El monto exacto lo fija el Juzgado de Policía Local dentro del rango legal: esta página te muestra el rango, no una sentencia',
          'No existe un recargo legal automático del 50% por pagar tarde ni por reincidencia: lo que sí ocurre es que la deuda impaga se registra y bloquea el permiso de circulación del año siguiente',
          'Las infracciones gravísimas pueden llevar además suspensión o cancelación de la licencia, y en el caso del alcohol hay sanciones penales aparte',
          'Con multas impagas en el Registro Nacional de Conductores no puedes sacar el permiso de circulación ni transferir el vehículo',
        ],
        plazo:
          'tienes 5 días hábiles desde la notificación para comparecer o pagar en el Juzgado de Policía Local; las multas impagas prescriben, pero mientras tanto te bloquean los trámites del vehículo.',
        answer:
          'Las multas de tránsito van en UTM: leves de 0,2 a 0,5, menos graves de 0,5 a 1, graves de 1 a 1,5 y gravísimas de 1,5 a 3 UTM, y el juez fija el monto dentro del rango.',
      },
      {
        id: 'licencia',
        label: 'Tengo que renovar la licencia de conducir',
        hint: 'El arancel lo fija cada municipalidad por ordenanza, no hay tarifa nacional.',
        yes: [
          'Arancel municipal de la renovación, que tú pones porque cambia de comuna en comuna',
          'Vigencia que te queda según la clase de licencia y tu edad',
          'Costo prorrateado por año, para compararlo contra el resto de los gastos del auto',
          'Multa que arriesgas si andas manejando con la licencia vencida',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Renovar atrasado NO tiene multa: la infracción es conducir con la licencia vencida, y es una infracción grave (1 a 1,5 UTM)',
          'El arancel de la licencia lo fija cada municipalidad por ordenanza: no existe un arancel del SII ni del Registro Civil, así que confirma el valor en tu municipio',
          'La renovación exige exámenes de sentidos, teórico y práctico según el caso; las clases profesionales piden además certificados médicos y de antecedentes',
          'Si tienes multas impagas en el Registro Nacional de Conductores no te van a renovar la licencia hasta que las pagues',
        ],
        plazo:
          'la licencia clase B dura 6 años en las renovaciones y 4 años la primera vez; sobre los 65 años el control pasa a ser cada 2 años. Puedes renovar desde algunos meses antes del vencimiento.',
        answer:
          'Renovar la licencia cuesta el arancel que fije tu municipalidad; el atraso no se multa, pero conducir con ella vencida es infracción grave de 1 a 1,5 UTM.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu auto',
  inputsIntro:
    'Todo en pesos chilenos. Cada campo dice en qué caso se usa: los que no aplican a tu situación puedes dejarlos como están.',
  fields: [
    {
      id: 'tasacion',
      label: 'Tasación fiscal SII de tu auto (CLP)',
      prefix: '$',
      value: '6.500.000',
      thousands: true,
      help: 'Es el valor que publica el SII en su lista de tasación de vehículos, no lo que pagaste. Base del permiso de circulación.',
    },
    {
      id: 'soapPrecio',
      label: 'Precio del SOAP anual (CLP)',
      prefix: '$',
      value: '60.500',
      thousands: true,
      help: `Dato editable: la prima del SOAP no está fijada por ley, cada compañía la define y cambia cada 1 de abril. Referencia de auto particular al ${SOAP_PRECIO_FECHA}.`,
    },
    {
      id: 'cobertura',
      label: 'Seguro voluntario que tienes o quieres',
      type: 'select',
      value: 'terceros_completos',
      options: SEGURO_COBERTURAS.map((c) => ({ value: c.id, label: c.nombre })),
      help: 'El SOAP es obligatorio y cubre sólo lesiones a personas. El seguro voluntario es el que cubre los daños al vehículo.',
    },
    {
      id: 'edad',
      label: 'Edad del conductor principal (años)',
      type: 'number',
      value: 40,
      min: 18,
      max: 90,
      step: 1,
      help: 'Las compañías cobran más a los menores de 25 y a los mayores de 65. Sólo afecta al seguro voluntario.',
    },
    {
      id: 'anioVehiculo',
      label: 'Año del vehículo',
      type: 'number',
      value: 2020,
      min: 1980,
      max: 2030,
      step: 1,
      help: 'Afecta la prima del seguro y define si te toca revisión técnica cada año o cada dos.',
    },
    {
      id: 'revisionPrecio',
      label: 'Revisión técnica y gases (CLP)',
      prefix: '$',
      value: '30.000',
      thousands: true,
      help: 'Dato editable: la tarifa la fija cada planta revisora dentro del máximo que autoriza el MTT.',
    },
    {
      id: 'precioAuto',
      label: 'Precio del auto nuevo que quieres comprar (CLP)',
      prefix: '$',
      value: '18.000.000',
      thousands: true,
      help: 'Sólo se usa en el caso "voy a comprar un auto nuevo". Es la base del impuesto verde y del crédito.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento urbano del auto nuevo (km/L)',
      type: 'number',
      value: 12,
      min: 0,
      max: 100,
      step: 0.1,
      help: 'Viene en la etiqueta de eficiencia energética del vehículo. En un eléctrico pon 0: queda exento.',
    },
    {
      id: 'nox',
      label: 'Emisión de NOx del auto nuevo (g/km)',
      type: 'number',
      value: 0.02,
      min: 0,
      max: 5,
      step: 0.001,
      help: 'También sale de la etiqueta de eficiencia. Un bencinero moderno anda cerca de 0,02 g/km; un diésel, bastante más.',
    },
    {
      id: 'pie',
      label: 'Pie que vas a dar (CLP)',
      prefix: '$',
      value: '4.000.000',
      thousands: true,
      help: 'Sólo se usa en el caso de compra. Lo que no cubre el pie es lo que financias.',
    },
    {
      id: 'plazo',
      label: 'Plazo del crédito (meses)',
      type: 'number',
      value: 48,
      min: 1,
      max: 84,
      step: 1,
      help: 'Los créditos automotrices en Chile suelen ir de 12 a 60 meses; algunos llegan a 84.',
    },
    {
      id: 'cae',
      label: 'CAE anual que te ofrecen (%)',
      suffix: '%',
      type: 'number',
      value: 18,
      min: 0,
      max: 60,
      step: 0.1,
      help: 'Carga Anual Equivalente. Es el único número comparable entre ofertas: incluye tasa, gastos y seguros.',
    },
    {
      id: 'gravedad',
      label: 'Clasificación de la multa que te llegó',
      type: 'select',
      value: 'grave',
      options: MULTA_RANGOS.map((m) => ({ value: m.id, label: `${m.nombre} — ${m.minUtm} a ${m.maxUtm} UTM` })),
      help: 'Viene escrita en el parte. Si no la ves, la clasificación depende del artículo de la Ley 18.290 que te citaron.',
    },
    {
      id: 'arancelLicencia',
      label: 'Arancel municipal de la licencia (CLP)',
      prefix: '$',
      value: '25.000',
      thousands: true,
      help: 'Dato editable: cada municipalidad fija el suyo por ordenanza. Confírmalo en el sitio de tu municipio.',
    },
    {
      id: 'claseLicencia',
      label: 'Clase de licencia y situación',
      type: 'select',
      value: 'b_renovacion',
      options: LICENCIA_VIGENCIA.map((l) => ({ value: l.id, label: `${l.nombre} — ${l.anios} años` })),
      help: 'Define la vigencia y, con eso, cuánto te cuesta la licencia repartida por año.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata del auto',
    caption:
      'Compara el peso de cada gasto obligatorio contra los voluntarios: normalmente el seguro pesa más que el permiso de circulación y el SOAP juntos.',
  },
  breakdownTitle: 'Gasto por gasto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del año.',

  faq: [
    {
      q: '¿Cómo se calcula el permiso de circulación en Chile?',
      a: 'Con la tabla progresiva del Art. 12 de la Ley 18.290, aplicada sobre la tasación fiscal que publica el SII para tu modelo y año. La tabla va en UTM: 1% hasta 60 UTM de tasación; 0,6 UTM más 2% del exceso entre 60 y 120 UTM; 1,8 UTM más 3% del exceso entre 120 y 250; 5,7 UTM más 4% del exceso entre 250 y 400; y 11,7 UTM más 4,5% de lo que pase de 400 UTM, con un mínimo de 0,5 UTM. Como la base está en UTM, el valor en pesos cambia todos los meses.',
    },
    {
      q: '¿La municipalidad puede cobrarme más caro el permiso de circulación?',
      a: 'No. La tabla del Art. 12 es la misma en todo el país y no existe una "tasa comunal" que suba o baje el monto. Lo que sí cambia es a qué municipio le pagas: puedes obtener el permiso en cualquier municipalidad de Chile, y el dinero queda repartido entre esa municipalidad y el Fondo Común Municipal. Por eso algunas comunas hacen campañas para que pagues ahí, pero el precio que te cobran es el mismo.',
    },
    {
      q: '¿Conviene pagar el permiso de circulación en una cuota o en dos?',
      a: 'Da exactamente lo mismo en plata: no hay descuento por pronto pago. La primera cuota vence el 31 de marzo y la segunda el 31 de agosto, y las dos suman el mismo total que pagar todo de una vez en marzo. Fraccionar sólo te sirve para el flujo de caja. Lo que sí te cuesta caro es pagar atrasado: se aplican los intereses y reajustes de la deuda municipal y quedas expuesto a que te cursen una infracción por circular sin el permiso al día.',
    },
    {
      q: '¿Qué cubre realmente el SOAP y cuánto cuesta?',
      a: `El SOAP cubre lesiones y muerte de personas, nunca daños al vehículo. Sus coberturas están fijadas en UF por el Art. 25 de la Ley 18.490: hasta ${SOAP_COBERTURAS_UF.muerte} UF por muerte, hasta ${SOAP_COBERTURAS_UF.invalidezPermanenteTotal} UF por invalidez permanente total, hasta ${SOAP_COBERTURAS_UF.invalidezPermanenteParcial} UF por invalidez parcial, hasta ${SOAP_COBERTURAS_UF.incapacidadTemporal} UF por incapacidad temporal y hasta ${SOAP_COBERTURAS_UF.gastosMedicos} UF en gastos médicos y hospitalarios, por cada persona afectada. El precio de la prima, en cambio, no está fijado por ley: cada compañía lo define y por eso conviene comparar.`,
    },
    {
      q: '¿El SOAP me sirve si choco y se me destroza el auto?',
      a: 'No. El SOAP no paga ni un peso por los daños de tu auto ni por los del auto del otro: sólo cubre a las personas lesionadas. Para los daños materiales necesitas un seguro voluntario. El de terceros cubre lo que le rompas a otro, el de terceros completos agrega incendio y robo de tu vehículo, y el todo riesgo cubre además los daños propios, con el deducible que hayas pactado.',
    },
    {
      q: '¿Cuánto cuesta una multa de tránsito en Chile?',
      a: 'Depende de la clasificación de la infracción y se expresa en UTM, así que el monto en pesos se mueve todos los meses. Según el Art. 200 de la Ley 18.290, las infracciones leves van de 0,2 a 0,5 UTM, las menos graves de 0,5 a 1 UTM, las graves de 1 a 1,5 UTM y las gravísimas de 1,5 a 3 UTM. Dentro de ese rango el monto exacto lo fija el Juzgado de Policía Local, considerando las circunstancias del caso.',
    },
    {
      q: '¿Me suben la multa si la pago tarde?',
      a: 'No hay un recargo legal automático del 50% por pagar atrasado, como se lee a veces. Lo que sí pasa es que la multa impaga queda registrada en el Registro Nacional de Conductores y en el Registro de Multas de Tránsito No Pagadas: mientras esté ahí no puedes sacar el permiso de circulación, no puedes renovar la licencia y no puedes transferir el vehículo. Además la deuda se reajusta y el juzgado puede decretar apremios.',
    },
    {
      q: '¿Me multan por renovar la licencia atrasado?',
      a: 'No. Renovar fuera de plazo no tiene multa: llegas, pagas el arancel y das los exámenes que correspondan. La infracción es CONDUCIR con la licencia vencida, y es una infracción grave, o sea entre 1 y 1,5 UTM, con retiro de la licencia incluido. La diferencia importa: si tu licencia venció y no has manejado, no te van a cobrar nada extra por el atraso.',
    },
    {
      q: '¿Cuánto dura la licencia de conducir en Chile?',
      a: 'La licencia clase B no profesional dura 6 años en las renovaciones y 4 años cuando es la primera vez que la sacas. Las clases profesionales (A1 a A5, taxis, buses y camiones) duran 4 años. A partir de los 65 años el control pasa a ser cada 2 años, porque los exámenes de sentidos se vuelven más frecuentes. Puedes renovar desde algunos meses antes del vencimiento sin perder los días que te quedan.',
    },
    {
      q: '¿Qué es el impuesto verde y cuánto se paga?',
      a: `Es el impuesto del Art. 3° de la Ley 20.780 que se paga UNA sola vez, al inscribir un vehículo nuevo. La fórmula que aplica el SII es [(${IMPUESTO_VERDE_CTE_RENDIMIENTO} ÷ rendimiento urbano en km/L) + (${IMPUESTO_VERDE_CTE_NOX} × emisión de NOx en g/km)] × precio de venta × 0,00000006, y el resultado queda expresado en UTM. Castiga dos cosas a la vez: gastar mucho combustible y emitir mucho óxido de nitrógeno. Por eso un diésel grande paga bastante más que un bencinero chico del mismo precio.`,
    },
    {
      q: '¿Los autos eléctricos pagan impuesto verde?',
      a: 'No. Al no consumir combustible el término 35 ÷ rendimiento se anula, y al no tener emisiones de NOx el otro término también da cero, así que el impuesto queda en cero. Es exactamente el incentivo que la ley buscaba. Ojo con no confundirlo con el permiso de circulación: ese sí lo paga el eléctrico, calculado igual que cualquier otro vehículo sobre su tasación fiscal.',
    },
    {
      q: '¿Qué CAE es razonable en un crédito automotriz?',
      a: `La CAE de un crédito automotriz en Chile suele moverse entre el 12% y el 25% anual según tu perfil, el pie y el plazo. Compárala siempre contra la tasa máxima convencional que publica la CMF —referencia de ${TASA_MAXIMA_CONVENCIONAL_CMF}% anual para este tramo—: por encima de ese techo el crédito no se puede pactar legalmente. Y pide el desglose: en el crédito de la automotora suelen ir incrustados el seguro de desgravamen y un todo riesgo obligatorio que engordan la cuota.`,
    },
    {
      q: '¿Es mejor el crédito de la automotora o el del banco?',
      a: 'Depende sólo de la CAE y de las condiciones de salida. La automotora tiende a aprobar más rápido y a exigir menos pie, pero suele venir con seguros amarrados que suben el costo real. El banco pide más requisitos y demora más, pero la CAE es generalmente menor y el prepago suele ser más barato. Pide las dos ofertas por escrito con la CAE y el costo total del crédito, que es la cifra que de verdad puedes comparar.',
    },
    {
      q: '¿Por qué mi costo real termina siendo más alto que esta estimación?',
      a: 'Porque acá están sólo los costos fijos y legales. Faltan la bencina, el TAG, los estacionamientos, la mantención programada, los neumáticos y las reparaciones imprevistas, que en un auto de uso diario pueden superar todo lo anterior junto. La bencina, los peajes y la comparación contra un eléctrico se calculan en el hub del costo del viaje.',
    },
  ],

  sources: [
    {
      name: 'Ley 18.290 de Tránsito — permiso de circulación (Art. 12) y multas (Art. 200)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29708',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'SII — tasación fiscal de vehículos motorizados',
      url: 'https://www.sii.cl/valores_y_fechas/tasacion_vehiculos/tasacion_vehiculos.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — valor mensual de la UTM y la UTA',
      url: 'https://www.sii.cl/valores_y_fechas/utm/utm2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Ley 18.490 — Seguro Obligatorio de Accidentes Personales (SOAP), coberturas en UF del Art. 25',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29892',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'CMF — información al asegurado sobre el SOAP y compañías autorizadas',
      url: 'https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18565.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'CMF — tasa máxima convencional vigente',
      url: 'https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18568.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'Ley 20.780 Art. 3° — impuesto verde a los vehículos motorizados nuevos',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1067194',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'MTT — licencias de conducir, clases y vigencia',
      url: 'https://www.mtt.gob.cl/',
      publisher: 'Ministerio de Transportes y Telecomunicaciones',
    },
    {
      name: 'ChileAtiende — renovación de la licencia de conducir',
      url: 'https://www.chileatiende.gob.cl/fichas/3324-renovacion-de-licencia-de-conducir',
      publisher: 'ChileAtiende',
    },
    {
      name: 'Registro Civil — Registro Nacional de Vehículos Motorizados y de Conductores',
      url: 'https://www.registrocivil.cl/',
      publisher: 'Servicio de Registro Civil e Identificación',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Serie.aspx?gcode=UF&param=RABmAFYAWQB3AGYAaQBuAEkALQAzADUAbgBNAGgAaAAkA',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-permiso-circulacion-chile-vehiculo-2026-comuna',
    '/calculadora-soap-seguro-obligatorio-chile-precio-2026',
    '/calculadora-seguro-auto-chile-todo-riesgo-comparador-2026',
    '/calculadora-multa-no-aviso-uoct-transito-comuna-chile-2026',
    '/calculadora-licencia-conducir-chile-renovacion-precio-vencimiento',
    '/calculadora-impuesto-verde-vehiculo-nuevo-chile-sii',
    '/calculadora-credito-automotriz-chile-cuota-cae-2026',
  ],

  lastReviewed: '2026-07-28',
};
