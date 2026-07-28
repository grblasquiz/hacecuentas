import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Por qué me llegó tan cara la cuenta y cómo la bajo?"
 *
 * Absorbe seis calculadoras: recibo de luz BT1, comparador de tarifas BT1/BT2/BT3,
 * recibo de gas red vs cilindro, internet fibra, subsidio eléctrico y compensación
 * por corte de la SEC.
 *
 * ═══ POR QUÉ CASI TODA TARIFA ACÁ ES CAMPO EDITABLE ═══
 * Las tarifas eléctricas las fija la CNE por decreto y cambian varias veces al año; el
 * precio del gas licuado y los planes de internet se mueven mes a mes. Las fórmulas
 * originales traían tarifas hardcodeadas que ya estaban desactualizadas Y se
 * contradecían entre sí (una cobraba $115/kWh y la otra $205/kWh para la MISMA tarifa
 * BT1). Acá el precio del kWh, el cargo fijo, el precio del cilindro y el plan de
 * internet son CAMPOS EDITABLES con su valor de referencia y su fecha: el usuario copia
 * lo que dice su propia boleta y el resultado es exacto, en vez de plausible y falso.
 *
 * Lo que NO es editable es lo que está en la norma: el IVA del 19%, el cupo y la
 * estructura del subsidio eléctrico de la Ley 21.667 y el mecanismo de compensación del
 * Art. 16 B de la Ley 18.410.
 *
 * Correcciones respecto de las fórmulas originales:
 *  1. La electricidad domiciliaria paga IVA del 19%. La original
 *     `tarifa-electrica-…ts:63` aplicaba un "impuesto a la electricidad del 2,3%" que
 *     no existe en la legislación chilena, y subfacturaba la boleta ~16 puntos.
 *  2. El autoconsumo solar se descuenta UNA vez. La original
 *     `recibo-luz-…ts` restaba los kWh solares del consumo facturado y ADEMÁS restaba
 *     el ahorro del total: descontaba dos veces.
 *  3. El subsidio eléctrico es un monto FIJO por tamaño de hogar para hogares hasta el
 *     tramo 40% del RSH (Ley 21.667), no un 50% de descuento en la tarifa; y los
 *     hogares del tramo 40% SÍ califican — la original los declaraba no elegibles.
 *  4. El gas se compara por energía (kWh), no por "m³" contra "m³": el m³ de gas natural
 *     y el de gas licuado no tienen el mismo poder calorífico y compararlos 1:1
 *     distorsiona la decisión.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const IVA = CHILE_2026.iva;

/**
 * Subsidio Eléctrico — Ley 21.667. Monto FIJO por hogar según número de integrantes,
 * pagado en 6 cuotas mensuales descontadas en la boleta. Elegibles: hogares hasta el
 * tramo 40% del Registro Social de Hogares.
 * Montos de la convocatoria vigente a julio de 2026 (Ministerio de Energía).
 * EDITABLE en su efecto: el monto se actualiza en cada convocatoria.
 */
export const SUBSIDIO_ELECTRICO = {
  rshTramoMax: 40,
  cuotas: 6,
  montoUnIntegrante: 17_346,
  montoDosATres: 22_548,
  montoCuatroOMas: 32_224,
  fechaDato: 'convocatoria vigente a julio de 2026',
};

/**
 * Valores de referencia de tarifa eléctrica BT1 residencial.
 * ⚠️ REFERENCIALES Y EDITABLES: la CNE fija las tarifas por decreto y varían por
 * distribuidora y por zona dentro de una misma distribuidora. Copiá los tuyos de la
 * boleta ("cargo fijo" y "cargo por energía").
 */
export const TARIFAS_REF: Array<{ id: string; nombre: string; cargoFijo: number; precioKwh: number }> = [
  { id: 'enel', nombre: 'Enel Distribución (RM)', cargoFijo: 4200, precioKwh: 155 },
  { id: 'cge', nombre: 'CGE (centro-sur)', cargoFijo: 3900, precioKwh: 160 },
  { id: 'saesa', nombre: 'Saesa / Frontel (sur)', cargoFijo: 4100, precioKwh: 165 },
  { id: 'conafe', nombre: 'Conafe (norte y costa)', cargoFijo: 4400, precioKwh: 170 },
  { id: 'edelaysen', nombre: 'Edelaysén (Aysén)', cargoFijo: 4600, precioKwh: 175 },
];

/** Poder calorífico para comparar gas natural contra gas licuado en la misma unidad. */
export const GAS = {
  /** kWh de energía útil por m³ de gas natural de red. */
  kwhPorM3Red: 10.4,
  /** kWh de energía útil por kilo de gas licuado (GLP). */
  kwhPorKgGlp: 12.8,
  fechaDato: 'valores de referencia; el poder calorífico exacto lo publica tu distribuidora',
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/hogar/cuentas-de-la-casa',
  title: 'Cuentas de la casa en Chile: por qué te llegó cara la luz y cómo bajarla',
  description:
    'Desarma tu boleta de luz peso por peso —cargo fijo, energía e IVA—, compara gas de red contra cilindro por energía real y revisa tu plan de internet. Incluye el subsidio eléctrico de la Ley 21.667 y la compensación que te corresponde cuando te cortan la luz.',
  silo: 'Hogar',
  siloHref: '/cl/hogar',
  locale: 'cl',

  eyebrow: 'Chile · servicios del hogar',
  h1: '¿Por qué me llegó tan cara la cuenta y cómo la bajo?',
  lede:
    'La boleta de la luz tiene tres partes: un cargo fijo que pagas aunque no consumas, la energía que sí consumiste y un 19% de IVA sobre todo lo anterior. Copia los valores de tu propia boleta y mira dónde se te va la plata, si te toca el subsidio eléctrico y qué te deben cuando hay corte.',
  stamps: [
    'IVA 19% sobre la boleta',
    `Subsidio eléctrico Ley 21.667: hasta tramo ${SUBSIDIO_ELECTRICO.rshTramoMax}% del RSH`,
    'Compensación por corte: Art. 16 B Ley 18.410',
    '6 calculadoras en una',
  ],

  resultLabel: 'Total de la boleta',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por la más frecuente: te llegó la cuenta de la luz más alta de lo esperado y quieres entender por qué.',
    items: [
      {
        id: 'luz',
        label: 'Me llegó cara la cuenta de la luz',
        hint: 'Desarma la boleta: cargo fijo, energía e IVA, y cuánto pesa cada artefacto.',
        yes: [
          'Cargo fijo del mes, que se paga aunque consumas cero',
          'Cargo por la energía consumida, al precio por kWh de tu boleta',
          'IVA del 19% sobre el total del suministro',
          'Costo real de tu kWh una vez repartido el cargo fijo',
          'Cuánto bajaría la boleta con autoconsumo solar',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Los valores por defecto son REFERENCIALES: el precio del kWh y el cargo fijo cambian por distribuidora, por zona y por decreto de la CNE. Copia los de tu boleta para que el cálculo sea exacto',
          'La electricidad domiciliaria paga IVA del 19%: no existe un "impuesto a la electricidad" del 2% ni del 3%',
          'Una boleta con lectura estimada en vez de real se regulariza al mes siguiente: si te llegó muy alta o muy baja, revisa si dice "estimada"',
          'El autoconsumo solar se descuenta una sola vez: reduce los kWh que te facturan, no se resta además del total',
        ],
        plazo:
          'los reclamos por facturación se presentan primero a la distribuidora y, sin respuesta satisfactoria, ante la SEC.',
        answer:
          'La boleta sube por tres motivos: consumiste más kWh, subió el precio del kWh por decreto tarifario, o te facturaron una lectura estimada que después se regulariza.',
      },
      {
        id: 'gas',
        label: 'Gas: ¿me conviene cilindro o red?',
        hint: 'Comparación por energía real, no por metros cúbicos que no son equivalentes.',
        yes: [
          'Costo mensual del gas de red: cargo fijo más consumo, con IVA',
          'Costo mensual equivalente en cilindros de gas licuado',
          'Comparación en la misma unidad de energía, no m³ contra m³',
          'Cuál sale más barato a tu nivel de consumo y desde qué consumo se da vuelta',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Un m³ de gas natural de red y un m³ de gas licuado NO entregan la misma energía: comparar metro contra metro distorsiona la decisión, por eso acá se compara en kWh',
          'El precio del cilindro que ves en la calle ya incluye IVA: no hay que sumárselo de nuevo',
          'La red tiene un cargo fijo mensual que pagas aunque no consumas: por eso conviene desde cierto consumo hacia arriba',
          'Conectarse a la red tiene un costo de instalación inicial que no entra en esta comparación mensual',
        ],
        plazo:
          'el precio de los cilindros lo publican las distribuidoras y la CNE mantiene un comparador de precios por comuna.',
        answer:
          'La red conviene con consumos altos, porque su cargo fijo se diluye; el cilindro conviene con consumos bajos o estacionales.',
      },
      {
        id: 'internet',
        label: 'Internet: ¿me conviene cambiarme?',
        hint: 'Cuánto pagas por Mbps y cuánto te cuesta el plan en el período completo.',
        yes: [
          'Costo total del plan en los meses que evalúes',
          'Precio por Mbps, que es lo comparable entre ofertas',
          'Efecto del precio promocional cuando se acaba la promoción',
          'Diferencia contra el plan alternativo que estás mirando',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Compara siempre el precio DESPUÉS de la promoción: casi todas las ofertas suben al mes 7 o al mes 13',
          'Verifica la cobertura real en tu dirección antes de contratar: la velocidad ofrecida depende de la tecnología disponible en tu calle',
          'Los planes empaquetados con TV o móvil suelen esconder el costo real de cada servicio por separado',
          'Si tienes permanencia mínima, salir antes tiene costo: pídelo por escrito antes de firmar',
        ],
        plazo:
          'la portabilidad y el cambio de proveedor están regulados por SUBTEL; el corte y alta no debería dejarte sin servicio más de lo informado.',
        answer:
          'Lo comparable es el precio por Mbps después de la promoción, no el precio de los primeros meses.',
      },
      {
        id: 'corte',
        label: 'Me cortaron la luz, ¿me compensan?',
        hint: 'Qué te descuentan solo en la boleta y qué puedes exigir aparte.',
        yes: [
          'Energía que no te suministraron durante el corte, estimada desde tu propio consumo',
          'Compensación automática de la SEC: el doble de esa energía, valorizada a costo de racionamiento',
          'Compensación mínima por suspensión injustificada, equivalente a diez veces tu promedio diario facturado',
          'Valor de esa energía a tu tarifa, como referencia',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La compensación del Art. 16 B de la Ley 18.410 se abona SOLA en la boleta siguiente: si no aparece, reclama en la SEC',
          'El costo de racionamiento con que se valoriza la compensación lo fija la autoridad y es bastante mayor que tu tarifa: el monto exacto lo calcula la distribuidora',
          'La compensación por interrupción es distinta e independiente de la indemnización por daños: si se te echaron a perder alimentos o electrodomésticos, eso se reclama aparte',
          'Los cortes por fuerza mayor calificada pueden quedar excluidos de la compensación automática',
        ],
        plazo:
          'el descuento aparece en la facturación siguiente al corte; el reclamo ante la SEC no tiene costo y se hace en sec.cl.',
        answer:
          'Te corresponde un descuento automático en la boleta equivalente al doble de la energía no suministrada, más una compensación aparte si la suspensión fue injustificada.',
      },
      {
        id: 'subsidio',
        label: '¿Me toca el subsidio eléctrico?',
        hint: 'Requisitos y monto del beneficio de la Ley 21.667 según tu hogar.',
        yes: [
          `Elegibilidad por tramo del Registro Social de Hogares: hasta el ${SUBSIDIO_ELECTRICO.rshTramoMax}%`,
          'Monto del beneficio según cuántas personas viven en el hogar',
          `Cómo se reparte: en ${SUBSIDIO_ELECTRICO.cuotas} cuotas mensuales descontadas en la boleta`,
          'Qué porcentaje de tu cuenta cubre',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          `En el Registro Social de Hogares un tramo MÁS BAJO significa MAYOR vulnerabilidad: el subsidio cubre hasta el tramo ${SUBSIDIO_ELECTRICO.rshTramoMax}%, es decir el 40% de hogares de menores ingresos`,
          'Es un monto fijo por hogar según su tamaño, no un porcentaje de descuento sobre la tarifa',
          'El beneficio se aplica al suministro del domicilio registrado: el número de cliente tiene que coincidir con la dirección del RSH',
          'Los montos se actualizan en cada convocatoria: los de esta página son los vigentes a la fecha de revisión',
        ],
        plazo:
          'la postulación se abre por convocatorias y el descuento aparece en la boleta unos meses después de los resultados.',
        answer:
          `Si tu hogar está hasta el tramo ${SUBSIDIO_ELECTRICO.rshTramoMax}% del Registro Social de Hogares, te corresponde un monto fijo según cuántos vivan en la casa, descontado en ${SUBSIDIO_ELECTRICO.cuotas} cuotas de tu boleta.`,
      },
    ],
  },

  inputsTitle: 'Los datos de tu boleta',
  inputsIntro:
    'Los precios vienen con un valor de referencia, pero lo correcto es copiar los de tu propia boleta: el cargo fijo y el precio del kWh cambian por distribuidora y por decreto tarifario.',
  fields: [
    {
      id: 'kwh',
      label: 'Consumo del mes (kWh)',
      suffix: 'kWh',
      type: 'number',
      value: 250,
      min: 0,
      max: 5000,
      step: 10,
      help: 'Aparece en tu boleta como "consumo del período". Un hogar promedio chileno consume entre 150 y 250 kWh al mes.',
    },
    {
      id: 'distribuidora',
      label: 'Tu distribuidora (carga valores de referencia)',
      type: 'select',
      value: 'enel',
      options: TARIFAS_REF.map((t) => ({ value: t.id, label: t.nombre })),
      help: 'Solo precarga referencias. Si los campos de abajo no coinciden con tu boleta, manda tu boleta.',
    },
    {
      id: 'precioKwh',
      label: 'Precio del kWh de tu boleta, sin IVA (CLP)',
      prefix: '$',
      type: 'number',
      value: 155,
      min: 1,
      max: 1000,
      step: 1,
      help: 'DATO QUE CADUCA: la CNE lo fija por decreto y cambia varias veces al año. Cópialo de tu boleta.',
    },
    {
      id: 'cargoFijo',
      label: 'Cargo fijo mensual de tu boleta, sin IVA (CLP)',
      prefix: '$',
      type: 'number',
      value: 4200,
      min: 0,
      max: 50000,
      step: 100,
      help: 'Lo pagas aunque el consumo sea cero. Cópialo de tu boleta.',
    },
    {
      id: 'kwhSolar',
      label: 'Generación solar propia del mes (kWh)',
      suffix: 'kWh',
      type: 'number',
      value: 0,
      min: 0,
      max: 5000,
      step: 10,
      help: 'Si tienes paneles bajo Ley de Generación Distribuida. Déjalo en 0 si no tienes.',
    },
    {
      id: 'integrantes',
      label: 'Personas que viven en el hogar',
      type: 'number',
      value: 3,
      min: 1,
      max: 15,
      step: 1,
      help: 'Define el monto del subsidio eléctrico.',
    },
    {
      id: 'rshTramo',
      label: 'Tu tramo en el Registro Social de Hogares',
      type: 'select',
      value: '40',
      options: [
        { value: '40', label: 'Hasta 40% — mayor vulnerabilidad' },
        { value: '50', label: '50%' },
        { value: '60', label: '60%' },
        { value: '70', label: '70%' },
        { value: '80', label: '80%' },
        { value: '90', label: '90%' },
        { value: '100', label: '100% — menor vulnerabilidad' },
      ],
      help: 'Un tramo más bajo significa mayor vulnerabilidad y más acceso a beneficios.',
    },
    {
      id: 'modalidadGas',
      label: 'Con qué gas cocinas y calientas hoy',
      type: 'select',
      value: 'cilindro',
      options: [
        { value: 'cilindro', label: 'Cilindro de gas licuado' },
        { value: 'red', label: 'Gas natural de red' },
      ],
    },
    {
      id: 'gasM3',
      label: 'Consumo mensual de gas de red (m³)',
      suffix: 'm³',
      type: 'number',
      value: 30,
      min: 0,
      max: 500,
      step: 1,
      help: 'Si usas cilindro, pon el consumo equivalente que estimas o el que tenías con red.',
    },
    {
      id: 'gasCargoFijo',
      label: 'Cargo fijo mensual del gas de red, sin IVA (CLP)',
      prefix: '$',
      type: 'number',
      value: 15200,
      min: 0,
      max: 100000,
      step: 100,
      help: 'DATO QUE CADUCA: cópialo de tu boleta de gas.',
    },
    {
      id: 'gasPrecioM3',
      label: 'Precio del m³ de gas de red, sin IVA (CLP)',
      prefix: '$',
      type: 'number',
      value: 600,
      min: 1,
      max: 5000,
      step: 10,
      help: 'DATO QUE CADUCA: cópialo de tu boleta de gas.',
    },
    {
      id: 'cilindroKg',
      label: 'Tamaño del cilindro que usas',
      type: 'select',
      value: '15',
      options: [
        { value: '5', label: '5 kg' },
        { value: '11', label: '11 kg' },
        { value: '15', label: '15 kg' },
        { value: '45', label: '45 kg' },
      ],
    },
    {
      id: 'precioCilindro',
      label: 'Precio del cilindro, con IVA incluido (CLP)',
      prefix: '$',
      value: '21.800',
      thousands: true,
      help: 'DATO QUE CADUCA: el precio de calle ya incluye IVA. La CNE publica un comparador por comuna.',
    },
    {
      id: 'precioInternet',
      label: 'Precio mensual de tu plan de internet (CLP)',
      prefix: '$',
      value: '19.990',
      thousands: true,
      help: 'Usa el precio DESPUÉS de la promoción, que es el que vas a pagar la mayor parte del tiempo.',
    },
    {
      id: 'velocidad',
      label: 'Velocidad contratada (Mbps)',
      suffix: 'Mbps',
      type: 'number',
      value: 600,
      min: 10,
      max: 10000,
      step: 50,
    },
    {
      id: 'precioInternetAlt',
      label: 'Precio del plan alternativo que estás mirando (CLP)',
      prefix: '$',
      value: '15.990',
      thousands: true,
      help: 'Déjalo en 0 si solo quieres evaluar el plan actual.',
    },
    {
      id: 'velocidadAlt',
      label: 'Velocidad del plan alternativo (Mbps)',
      suffix: 'Mbps',
      type: 'number',
      value: 600,
      min: 0,
      max: 10000,
      step: 50,
    },
    {
      id: 'horasCorte',
      label: 'Cuántas horas duró el corte de luz',
      suffix: 'horas',
      type: 'number',
      value: 8,
      min: 0,
      max: 800,
      step: 1,
    },
    {
      id: 'montoBoleta',
      label: 'Monto de tu última boleta de luz (CLP)',
      prefix: '$',
      value: '45.000',
      thousands: true,
      help: 'Se usa para calcular la compensación por suspensión, que se mide sobre tu promedio diario facturado.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu cuenta',
    caption:
      'El cargo fijo se paga aunque no consumas y no baja apagando luces: solo la parte de energía responde a lo que hagas en la casa.',
  },
  breakdownTitle: 'Peso por peso',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Por qué me llegó tan cara la cuenta de la luz este mes?',
      a: 'Hay tres explicaciones posibles y conviene descartarlas en orden. Primero, que hayas consumido más: revisa los kWh del período contra los de meses anteriores, que vienen en el gráfico de la propia boleta. Segundo, que haya subido el precio del kWh: la CNE fija las tarifas por decreto y se reajustan varias veces al año, así que puedes pagar más con el mismo consumo. Tercero, y es el caso más frecuente cuando el salto es grande, que te hayan facturado una lectura estimada en vez de una real: eso se regulariza al mes siguiente y la boleta lo dice expresamente.',
    },
    {
      q: '¿Qué impuesto paga la electricidad domiciliaria en Chile?',
      a: 'IVA del 19% sobre el total del suministro, igual que casi todo lo demás. No existe un impuesto específico a la electricidad del 2% ni del 3% para el consumo residencial: si alguien te muestra un cálculo con esa tasa, está subestimando tu boleta en unos dieciséis puntos porcentuales. En tu boleta el IVA aparece como una línea separada, aplicada sobre la suma del cargo fijo más la energía y los demás cargos del suministro.',
    },
    {
      q: '¿Qué es el cargo fijo y puedo evitarlo?',
      a: 'Es el monto que cubre el costo de mantener tu empalme, el medidor, la lectura y la facturación, y se paga completo aunque consumas cero kWh. No se puede evitar mientras tengas el suministro contratado, y por eso los hogares de consumo muy bajo pagan un costo por kWh efectivo mucho más alto: si el cargo fijo son $4.200 y consumes 50 kWh, ese cargo solo ya te suma $84 a cada kWh. Es también la razón por la que apagar todo durante las vacaciones no deja la boleta en cero.',
    },
    {
      q: '¿Me conviene el cilindro de gas o conectarme a la red?',
      a: 'La red tiene un cargo fijo mensual alto pero un costo por unidad de energía más bajo, así que conviene desde cierto consumo hacia arriba; el cilindro no tiene cargo fijo y conviene con consumos bajos o estacionales. La comparación hay que hacerla en energía, no en metros cúbicos: un m³ de gas natural y un m³ de gas licuado no entregan lo mismo, y compararlos uno a uno hace parecer al cilindro mucho más barato de lo que es. A eso hay que sumarle que conectarse a la red tiene un costo de instalación inicial que no se recupera en un par de meses.',
    },
    {
      q: '¿El precio del cilindro de gas incluye IVA?',
      a: 'Sí. El precio que te cobra el repartidor o que ves en el local ya viene con IVA incluido, como cualquier precio al consumidor final en Chile. Es un error común sumarle otro 19% al comparar contra la boleta de gas de red, donde los cargos aparecen desglosados y el IVA figura como línea aparte. Al comparar, asegúrate de poner ambos con IVA o ambos sin IVA.',
    },
    {
      q: '¿Quién puede recibir el subsidio eléctrico?',
      a: `Los hogares que estén hasta el tramo ${SUBSIDIO_ELECTRICO.rshTramoMax}% del Registro Social de Hogares, es decir el 40% de hogares de menores ingresos corregidos por su composición. Es importante no confundirse con la dirección del tramo: uno más bajo significa mayor vulnerabilidad y más acceso, no menos. El beneficio de la Ley 21.667 es un monto fijo según cuántas personas vivan en la casa, que se descuenta directamente en la boleta repartido en ${SUBSIDIO_ELECTRICO.cuotas} cuotas mensuales, y no es un porcentaje de descuento sobre la tarifa.`,
    },
    {
      q: '¿De cuánto es el subsidio eléctrico?',
      a: `En la convocatoria vigente a mediados de 2026 los montos son del orden de ${fmt(SUBSIDIO_ELECTRICO.montoUnIntegrante)} para hogares de una persona, ${fmt(SUBSIDIO_ELECTRICO.montoDosATres)} para hogares de dos o tres integrantes y ${fmt(SUBSIDIO_ELECTRICO.montoCuatroOMas)} para hogares de cuatro o más, repartidos en ${SUBSIDIO_ELECTRICO.cuotas} cuotas mensuales en la boleta. Los montos se actualizan en cada convocatoria, así que conviene confirmarlos en el sitio del Ministerio de Energía o en ChileAtiende antes de hacer cuentas.`,
    },
    {
      q: 'Me cortaron la luz varias horas, ¿me tienen que compensar?',
      a: 'Sí, y por dos vías distintas. La primera es automática: el Art. 16 B de la Ley 18.410 obliga a la distribuidora a descontar en tu boleta siguiente el equivalente al doble de la energía que no te suministró, valorizada al costo de racionamiento, que es un valor regulado bastante mayor que tu tarifa. No hay que pedirla, pero si no aparece en la boleta siguiente hay que reclamar en la SEC. La segunda aplica si la suspensión fue injustificada y da derecho a una compensación mínima equivalente a diez veces el valor promedio diario de tu última facturación.',
    },
    {
      q: 'Se me echó a perder la comida del refrigerador por el corte. ¿Eso entra?',
      a: 'No, eso va por otro carril. La compensación por interrupción del suministro repone el servicio que no recibiste; los daños concretos —alimentos perdidos, un electrodoméstico quemado por una variación de tensión al reponerse el servicio— son una indemnización aparte que se reclama a la distribuidora acreditando el perjuicio, con boletas, fotos y el informe técnico si hubo equipo dañado. Ambas vías son independientes y una no excluye a la otra.',
    },
    {
      q: '¿Cómo comparo dos planes de internet?',
      a: 'Por el precio por Mbps y, sobre todo, usando el precio de después de la promoción. Casi todas las ofertas de fibra en Chile muestran un valor promocional para los primeros seis o doce meses y luego suben; si comparas precios promocionales contra precios normales estás comparando cosas distintas. Después mira la permanencia mínima —salir antes tiene costo—, si el router está incluido y, antes que todo, si hay cobertura real en tu dirección, porque la velocidad ofrecida depende de la tecnología disponible en tu calle.',
    },
    {
      q: '¿Cuánto ahorro poniendo paneles solares?',
      a: 'Bajo la Ley de Generación Distribuida, lo que generas y consumes en el momento deja de comprarse a la red, y los excedentes que inyectas se te descuentan de la boleta a un precio de inyección menor que el de compra. El ahorro es la energía que dejaste de comprar, una sola vez: no se resta del total además de reducir los kWh facturados. Y hay un piso que los paneles no bajan, que es el cargo fijo: aunque generes todo lo que consumes, la boleta no llega a cero.',
    },
    {
      q: '¿Qué hago si creo que mi boleta está mal?',
      a: 'Primero reclama a la distribuidora, que tiene plazo para responder y debe entregarte un número de reclamo. Revisa la lectura del medidor contra la que dice la boleta, y fíjate si figura como lectura estimada. Si la respuesta no te satisface o no llega, el reclamo se eleva a la Superintendencia de Electricidad y Combustibles, que es gratuita y se hace en línea en sec.cl. Puedes pedir además una verificación del medidor: si resulta que estaba defectuoso, la distribuidora asume el costo y corrige la facturación.',
    },
  ],

  sources: [
    {
      name: 'CNE — tarifas de distribución eléctrica y decretos tarifarios vigentes',
      url: 'https://www.cne.cl/tarificacion/electrica/',
      publisher: 'Comisión Nacional de Energía',
    },
    {
      name: 'SEC — compensaciones por interrupción del suministro eléctrico',
      url: 'https://www.sec.cl/',
      publisher: 'Superintendencia de Electricidad y Combustibles',
    },
    {
      name: 'Ley 18.410 — crea la SEC; Art. 16 B, compensación por energía no suministrada',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29918',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'Ley 21.667 — crea el Subsidio Eléctrico para hogares vulnerables',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1204175',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'ChileAtiende — Subsidio Eléctrico: requisitos, montos y postulación',
      url: 'https://www.chileatiende.gob.cl/fichas/124375-subsidio-electrico',
      publisher: 'ChileAtiende',
    },
    {
      name: 'CNE — comparador de precios de gas licuado y gas de red por comuna',
      url: 'https://www.cne.cl/precios-combustibles/',
      publisher: 'Comisión Nacional de Energía',
    },
    {
      name: 'SUBTEL — información de servicios de internet fija y cobertura',
      url: 'https://www.subtel.gob.cl/',
      publisher: 'Subsecretaría de Telecomunicaciones',
    },
    {
      name: 'SERNAC — derechos del consumidor en servicios básicos',
      url: 'https://www.sernac.cl/',
      publisher: 'Servicio Nacional del Consumidor',
    },
    {
      name: 'Registro Social de Hogares — tramos de calificación socioeconómica',
      url: 'https://www.registrosocial.gob.cl/',
      publisher: 'Ministerio de Desarrollo Social y Familia',
    },
  ],

  replaces: [
    '/calculadora-recibo-luz-chile-enel-cge-saesa-tarifa-bt1',
    '/calculadora-tarifa-electrica-distribuidoras-chile-bt1-bt2-bt3',
    '/calculadora-recibo-gas-chile-metrogas-lipigas-cilindro-vs-red',
    '/calculadora-internet-fibra-chile-claro-vtr-mundo-mejor-precio',
    '/calculadora-bono-electrico-chile-subsidio-cuenta-electrica',
    '/calculadora-compensacion-corte-luz-sec-chile',
  ],

  lastReviewed: '2026-07-28',
};
