import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Por qué me llegó tan caro el recibo?"
 *
 * Absorbe cinco calculadoras de servicios públicos: luz (dos), gas natural, agua y
 * alcantarillado, e internet hogar.
 *
 * 🔴 REGLA DE ESTE HUB: las tarifas de servicios públicos las fijan la CREG (energía y gas)
 * y la CRA (agua) y se recalculan TODOS LOS MESES por fórmula tarifaria. Acá NINGUNA tarifa
 * se hardcodea como verdad: viajan como valor de referencia con fecha, dentro de campos
 * editables, y el usuario debe reemplazarlas por las de su factura. Lo que sí es estable
 * —porque está en la ley, no en una resolución mensual— son los topes de subsidio y
 * contribución y el consumo de subsistencia.
 */

const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Fecha de los valores de referencia cargados en los campos editables. */
export const TARIFAS_REF_FECHA = '2026-07';

/**
 * Topes de subsidio y contribución por estrato.
 * Subsidios máximos: Ley 1117 de 2006 art. 3 (60% E1, 50% E2, 15% E3), prorrogada por leyes
 * sucesivas. Contribución de solidaridad: Ley 142 de 1994 art. 89.1 → 20% para estratos 5 y 6
 * y para usuarios comerciales e industriales. El estrato 4 no recibe subsidio ni contribuye.
 * Cada municipio puede aplicar menos subsidio del máximo según el balance de su fondo (FSRI).
 */
export const FACTOR_ESTRATO: Record<number, number> = {
  1: -0.6,
  2: -0.5,
  3: -0.15,
  4: 0,
  5: 0.2,
  6: 0.2,
};

/**
 * Consumo de subsistencia: el bloque de consumo sobre el que se aplica el subsidio.
 * Lo que pasa de ahí se paga sin subsidio, a tarifa plena. La contribución de los
 * estratos 5 y 6, en cambio, se cobra sobre TODO el consumo.
 *  - Energía: 173 kWh/mes por debajo de 1.000 msnm, 130 kWh/mes de 1.000 msnm para arriba (CREG).
 *  - Gas natural: 20 m³/mes (CREG).
 *  - Acueducto: consumo básico de 11 m³/mes sobre 2.000 msnm y 16 m³/mes en tierra caliente
 *    (Resolución CRA 750 de 2016; el escalón intermedio es de 13 m³).
 */
export const SUBSISTENCIA = {
  luz: { alta: 130, baja: 173 },
  gas: { alta: 20, baja: 20 },
  agua: { alta: 11, baja: 16 },
};

/** Empresas prestadoras más frecuentes, por servicio. Sirven de contexto, no de tarifa. */
export const EMPRESAS = {
  luz: 'Enel-Codensa (Bogotá), EPM (Antioquia), Celsia/EPSA (Valle), Air-e y Afinia (Caribe)',
  gas: 'Vanti (Bogotá y Santanderes), EPM (Antioquia), Surtigas y Gases del Caribe (Costa)',
  agua: 'EAAB (Bogotá), EPM (Medellín), Emcali (Cali), Triple A (Barranquilla)',
  internet: 'Claro, ETB, Tigo y Movistar',
};

/**
 * Planes de internet hogar de referencia (solo internet, sin TV), tomados de la fórmula vieja
 * `internet-fibra-claro-etb-tigo-colombia-mejor-precio.ts`. Precios comerciales, no regulados:
 * cambian con cada promoción y suben al terminar el período de permanencia.
 */
export const INTERNET_REF = {
  fecha: '2026-07',
  planes: [
    { operador: 'Movistar', mbps: 300, precio: 55_990 },
    { operador: 'Claro', mbps: 300, precio: 79_900 },
    { operador: 'ETB', mbps: 300, precio: 79_900 },
    { operador: 'Tigo', mbps: 300, precio: 89_900 },
  ],
  /** Tigo es el único de la muestra que cobra un cargo de instalación al contratar con permanencia. */
  instalacionTigo: 199_900,
};

/**
 * IVA: los servicios públicos domiciliarios están excluidos del IVA (art. 476 ET). El internet
 * fijo de estratos 1 y 2 también está excluido; en los demás estratos el precio que publica el
 * operador ya viene con IVA incluido.
 */
export const IVA = 0.19;

export const UVT = COLOMBIA_2026.uvt;
export const SMLMV = COLOMBIA_2026.smlmv;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/vida/recibos-de-servicios',
  title: 'Recibo de luz por estrato Colombia: Codensa, EPM y subsidios',
  description:
    'Descomponé tu recibo de luz (Enel-Codensa, EPM), gas, agua o internet en Colombia: cargo fijo, consumo, subsidios por estrato o contribución de solidaridad, y cuánto ahorrás bajando el consumo. Con las tarifas de tu propia factura.',
  silo: 'Vida',
  siloHref: '/co/vida',
  locale: 'co',

  eyebrow: 'Colombia · CREG y CRA · subsidios por estrato',
  h1: '¿Por qué me llegó tan caro el recibo de luz, gas o agua? Subsidios y contribución por estrato',
  lede:
    'Una factura de servicios en Colombia tiene tres capas: el cargo fijo que pagás aunque no consumas, el consumo a la tarifa del mes, y el ajuste por estrato —subsidio si estás en 1, 2 o 3; contribución si estás en 5 o 6—. Acá las separás y ves cuánto bajaría el recibo si consumís menos.',
  stamps: [
    'Subsidios hasta 60% (E1), 50% (E2) y 15% (E3)',
    'Contribución del 20% en estratos 5 y 6',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Factura estimada del mes',

  cases: {
    title: '¿Qué recibo estás mirando?',
    intro:
      'El esqueleto es el mismo en los cuatro, pero cambian la unidad, el consumo de subsistencia y quién regula la tarifa. Arrancamos por el que más duele.',
    items: [
      {
        id: 'luz',
        label: 'Energía eléctrica',
        hint: 'kWh · CREG · ' + EMPRESAS.luz,
        answer: 'El subsidio del estrato sólo cubre el consumo de subsistencia; lo que pasa de ahí lo pagás a tarifa plena.',
        yes: [
          'Costo Unitario (CU) del mes por cada kWh consumido: es el número que aparece en tu factura como $/kWh',
          'Cargo fijo o comercialización, que se paga aunque el consumo sea cero',
          `Subsidio sobre el bloque de subsistencia: ${SUBSISTENCIA.luz.alta} kWh al mes desde los 1.000 msnm (Bogotá, Medellín, Tunja) y ${SUBSISTENCIA.luz.baja} kWh en tierra caliente`,
          'Contribución de solidaridad del 20% en estratos 5 y 6, calculada sobre todo el consumo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tarifa cambia todos los meses por fórmula de la CREG y varía por operador y por región: la que trae cargada la calculadora es un valor de referencia, reemplazalo por el CU de tu última factura',
          'El subsidio NO se aplica a toda tu energía: si consumís el doble del bloque de subsistencia, la mitad ya la estás pagando sin descuento y por eso el recibo sube más que proporcional',
          'El alumbrado público, el aseo y la sobretasa municipal se cobran en la misma factura pero no son energía: cargalos aparte si querés comparar el costo real del kWh',
        ],
        plazo: 'la reclamación por una factura la podés radicar ante la empresa dentro de los 5 meses siguientes y, si te la niegan, subir el recurso a la Superservicios.',
      },
      {
        id: 'gas',
        label: 'Gas natural domiciliario',
        hint: 'm³ · CREG · ' + EMPRESAS.gas,
        answer: `El bloque subsidiado del gas es de ${SUBSISTENCIA.gas.alta} m³ al mes, y el servicio no lleva IVA.`,
        yes: [
          'Consumo en metros cúbicos por la tarifa del mes que fija la CREG para tu distribuidor',
          'Cargo fijo del comercializador',
          `Subsidio del estrato sobre los primeros ${SUBSISTENCIA.gas.alta} m³ mensuales`,
          'Cuotas de conexión o de financiación del gasodoméstico, si las tenés: aparecen en la misma factura pero no son consumo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El gas natural domiciliario está excluido de IVA como servicio público domiciliario (art. 476 del Estatuto Tributario): si ves un impuesto del 8% en una estimación, ese porcentaje es del impuesto al consumo de combustibles líquidos y no tiene nada que ver',
          'La tarifa de gas depende del contrato de suministro y del transporte de cada distribuidor: entre Vanti, EPM y las empresas de la Costa hay diferencias de precio grandes y legítimas',
          'Un salto brusco en el consumo con la misma rutina suele ser fuga o medidor con problema: pedí revisión antes de pagar dos facturas altas seguidas',
        ],
        plazo: 'si el consumo se dispara sin explicación, radicá la reclamación antes de pagar: pagar no te quita el derecho, pero sí te quita urgencia.',
      },
      {
        id: 'agua',
        label: 'Agua y alcantarillado',
        hint: 'm³ · CRA · ' + EMPRESAS.agua,
        answer: 'Cada m³ se cobra dos veces: una por acueducto y otra por alcantarillado, más los dos cargos fijos.',
        yes: [
          'Consumo en m³ multiplicado por la suma de las tarifas de acueducto y alcantarillado',
          'Dos cargos fijos separados, uno por cada servicio',
          `Subsidio del estrato sobre el consumo básico: ${SUBSISTENCIA.agua.alta} m³ mensuales por hogar en ciudades sobre los 2.000 msnm y ${SUBSISTENCIA.agua.baja} m³ en tierra caliente`,
          'El aseo se factura junto pero se cobra por unidad de vivienda, no por metro cúbico',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Muchas empresas facturan el agua cada dos meses: si tu factura es bimestral, dividí el consumo por dos antes de cargarlo acá, porque el bloque de subsistencia es mensual',
          'La tarifa de acueducto y alcantarillado la aprueba la CRA para cada empresa y se indexa por IPC cuando se acumula un 3%: no hay una tarifa nacional única',
          'El consumo básico se mide por hogar, no por persona: una familia numerosa se pasa del bloque subsidiado con facilidad',
        ],
        plazo: 'el consumo se promedia con los meses anteriores, así que una fuga tapada tarda dos o tres facturas en dejar de pesar.',
      },
      {
        id: 'internet',
        label: 'Internet y plan hogar',
        hint: 'Precio comercial · ' + EMPRESAS.internet,
        answer: 'El internet no tiene subsidio por estrato: en estratos 1 y 2 está excluido de IVA, y eso es todo.',
        yes: [
          'Precio mensual del plan, que en estratos 3 a 6 ya viene con IVA incluido en lo que publica el operador',
          'Cargo de instalación o de activación, cuando el contrato tiene permanencia',
          'El costo del primer año completo, que es la comparación honesta entre operadores',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los precios de internet son comerciales, no regulados: cambian con cada promoción y suelen subir cuando se termina el período promocional. Los valores de referencia de esta calculadora envejecen en semanas',
          'El internet fijo de estratos 1 y 2 está excluido de IVA; en los demás estratos el 19% ya está adentro del precio de lista',
          'Comparar sólo la mensualidad es la trampa clásica: el operador más barato por mes puede salir más caro en el año si cobra instalación o si el precio promocional dura tres meses',
        ],
        plazo: 'la portabilidad de operador no tiene costo, pero si estás en permanencia mínima puede haber cláusula de terminación anticipada.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu factura',
  inputsIntro:
    'Sacá las tarifas de tu propia factura: las que vienen cargadas son sólo un valor de referencia y cambian todos los meses. El consumo va siempre en valores mensuales.',
  fields: [
    {
      id: 'estrato',
      label: 'Estrato de tu vivienda',
      type: 'select',
      value: '3',
      options: [
        { value: '1', label: 'Estrato 1 — subsidio hasta 60%' },
        { value: '2', label: 'Estrato 2 — subsidio hasta 50%' },
        { value: '3', label: 'Estrato 3 — subsidio hasta 15%' },
        { value: '4', label: 'Estrato 4 — sin subsidio ni contribución' },
        { value: '5', label: 'Estrato 5 — contribución 20%' },
        { value: '6', label: 'Estrato 6 — contribución 20%' },
      ],
      help: 'Figura en tu factura. Es el dato que más mueve el total del recibo.',
    },
    {
      id: 'altitud',
      label: 'Altura de tu ciudad',
      type: 'select',
      value: 'alta',
      options: [
        { value: 'alta', label: 'Desde 1.000 msnm (Bogotá, Medellín, Tunja, Manizales…)' },
        { value: 'baja', label: 'Por debajo de 1.000 msnm (Barranquilla, Cartagena, Cali, Villavicencio…)' },
      ],
      help: 'Define el consumo de subsistencia: en tierra caliente el bloque subsidiado de energía y de agua es más grande.',
    },
    {
      id: 'consumo',
      label: 'Consumo del mes (kWh de luz o m³ de gas o agua)',
      type: 'number',
      value: 200,
      min: 0,
      step: 1,
      help: 'Según la rama que estés mirando: kWh para energía, m³ para gas y para acueducto. Si tu factura de agua es bimestral, dividí por dos.',
    },
    {
      id: 'tarifaLuz',
      label: 'Costo unitario de la energía (COP/kWh)',
      prefix: '$',
      value: 950,
      type: 'number',
      min: 0,
      step: 1,
      help: `Valor de referencia de ${TARIFAS_REF_FECHA}, editable. En tu factura aparece como CU o "costo unitario"; lo fija la CREG cada mes y cambia por operador y región.`,
    },
    {
      id: 'tarifaGas',
      label: 'Tarifa del gas natural (COP/m³)',
      prefix: '$',
      value: 2450,
      type: 'number',
      min: 0,
      step: 1,
      help: `Valor de referencia de ${TARIFAS_REF_FECHA}, editable. Depende del distribuidor y del contrato de suministro.`,
    },
    {
      id: 'tarifaAgua',
      label: 'Tarifa de acueducto + alcantarillado (COP/m³)',
      prefix: '$',
      value: 7200,
      type: 'number',
      min: 0,
      step: 1,
      help: `Valor de referencia de ${TARIFAS_REF_FECHA}, editable. Sumá las dos líneas de tu factura: acueducto y alcantarillado se cobran por separado sobre el mismo m³.`,
    },
    {
      id: 'cargoFijo',
      label: 'Cargo fijo del servicio (COP/mes)',
      prefix: '$',
      value: '12.500',
      thousands: true,
      help: 'Lo que pagás aunque no consumas nada. En agua sumá el cargo fijo de acueducto y el de alcantarillado.',
    },
    {
      id: 'otrosCargos',
      label: 'Otros cargos de la misma factura (COP/mes)',
      prefix: '$',
      value: '18.000',
      thousands: true,
      help: 'Alumbrado público, aseo, sobretasa municipal, cuotas de financiación. No son consumo, pero llegan en el mismo papel.',
    },
    {
      id: 'planInternet',
      label: 'Precio mensual de tu plan de internet (COP)',
      prefix: '$',
      value: '79.900',
      thousands: true,
      help: 'Sólo se usa en la rama de internet. Poné lo que te cobran de verdad, no el precio promocional del primer mes.',
    },
    {
      id: 'ahorro',
      label: '¿Cuánto consumo querés bajar? (kWh o m³)',
      type: 'number',
      value: 30,
      min: 0,
      step: 1,
      help: 'La calculadora te dice cuánto baja la factura si recortás esa cantidad. Ojo: recortar por encima del bloque de subsistencia ahorra más, porque ese consumo no está subsidiado.',
    },
  ],
  fineprint: `${DISCLAIMER_TAX} Las tarifas de energía, gas y acueducto las fijan la CREG y la CRA y se recalculan todos los meses por fórmula tarifaria, distinta para cada empresa y región: los valores que trae cargados el formulario son una referencia de ${TARIFAS_REF_FECHA} y hay que reemplazarlos por los de tu factura. Los topes de subsidio y contribución y el consumo de subsistencia sí son de norma legal y son estables.`,

  chart: {
    type: 'stacked',
    title: 'Cómo se arma tu factura',
    caption:
      'La barra separa el cargo fijo que pagás sí o sí, el consumo valorizado a la tarifa del mes, el ajuste del estrato —subsidio que te descuentan o contribución que te suman— y los otros cargos que viajan en la misma factura sin ser consumo.',
  },
  breakdownTitle: 'Tu factura, línea por línea',
  breakdownIntro:
    'El mismo orden en que la lee un funcionario de la empresa: cargo fijo, consumo, bloque subsidiado, ajuste por estrato y total.',

  faq: [
    {
      q: '¿Por qué mi vecino de al lado paga menos si consumimos igual?',
      a: 'Casi siempre por el estrato. En Colombia la tarifa del servicio es la misma, pero encima se aplica un subsidio si la vivienda es estrato 1, 2 o 3, y un sobrecosto llamado contribución de solidaridad si es estrato 5 o 6. Dos apartamentos del mismo edificio pueden tener estratos distintos si están en manzanas catastrales diferentes. El estrato lo asigna la alcaldía por características de la vivienda y del entorno, no por los ingresos de quien vive ahí.',
    },
    {
      q: '¿De cuánto son los subsidios y la contribución por estrato?',
      a: `El tope legal es de hasta ${Math.abs(FACTOR_ESTRATO[1] * 100)}% para estrato 1, ${Math.abs(FACTOR_ESTRATO[2] * 100)}% para estrato 2 y ${Math.abs(FACTOR_ESTRATO[3] * 100)}% para estrato 3, según la Ley 1117 de 2006 y sus prórrogas. El estrato 4 paga tarifa plena, sin subsidio ni contribución. Los estratos 5 y 6, junto con los usuarios comerciales e industriales, pagan una contribución del ${FACTOR_ESTRATO[5] * 100}% que financia justamente esos subsidios (Ley 142 de 1994, art. 89). Son topes: cada municipio puede aplicar un porcentaje menor según el balance de su fondo de solidaridad.`,
    },
    {
      q: '¿Qué es el consumo de subsistencia y por qué me importa tanto?',
      a: `Es el bloque de consumo mínimo vital sobre el que se aplica el subsidio. En energía son ${SUBSISTENCIA.luz.alta} kWh al mes desde los 1.000 msnm y ${SUBSISTENCIA.luz.baja} kWh por debajo de esa altura; en gas natural son ${SUBSISTENCIA.gas.alta} m³ mensuales; en acueducto el consumo básico es de ${SUBSISTENCIA.agua.alta} m³ en ciudades altas y ${SUBSISTENCIA.agua.baja} m³ en tierra caliente. Todo lo que consumás por encima de ese bloque se paga a tarifa plena, sin descuento. Por eso el recibo no crece en línea recta: pasado el bloque, cada unidad extra cuesta más que las anteriores.`,
    },
    {
      q: '¿El recibo de luz de Codensa y el de EPM se calculan igual por estrato?',
      a: `La estructura es idéntica porque la fija la CREG: cargo fijo, consumo por el costo unitario (CU) del mes y el ajuste por estrato encima. Lo que cambia entre Enel-Codensa (Bogotá), EPM (Antioquia), Celsia/EPSA (Valle) o Air-e y Afinia (Caribe) es el CU, que cada empresa recalcula todos los meses por fórmula tarifaria y que tenés que leer de tu propia factura. Los subsidios por estrato son de ley y valen igual con cualquier operador: hasta ${Math.abs(FACTOR_ESTRATO[1] * 100)}% en estrato 1, ${Math.abs(FACTOR_ESTRATO[2] * 100)}% en el 2 y ${Math.abs(FACTOR_ESTRATO[3] * 100)}% en el 3 sobre el bloque de subsistencia (${SUBSISTENCIA.luz.alta} kWh desde los 1.000 msnm, ${SUBSISTENCIA.luz.baja} en tierra caliente), y contribución del ${FACTOR_ESTRATO[5] * 100}% en estratos 5 y 6 sobre todo el consumo.`,
    },
    {
      q: '¿La contribución de los estratos 5 y 6 también tiene tope de consumo?',
      a: 'No, y esa es la asimetría del sistema: el subsidio se aplica sólo sobre el bloque de subsistencia, mientras que la contribución del 20% se cobra sobre el valor total del consumo. Un hogar de estrato 6 que consume mucho paga ese 20% sobre todo, y un hogar de estrato 1 que consume mucho sólo tiene descuento sobre los primeros kWh o m³.',
    },
    {
      q: '¿El recibo de la luz paga IVA?',
      a: 'Los servicios públicos domiciliarios están excluidos de IVA según el art. 476 del Estatuto Tributario, y eso incluye energía, gas natural, acueducto y alcantarillado para uso residencial. Lo que sí aparece en la factura y no es consumo son el alumbrado público —un impuesto municipal—, la tasa de aseo y a veces cuotas de financiación de electrodomésticos. Si una estimación te suma un "impuesto nacional del 4%" o un "impuesto al consumo del 8%" sobre tu factura residencial, está mal: ese 8% es del impuesto a los combustibles líquidos.',
    },
    {
      q: '¿Cuánto ahorro si bajo 30 kWh al mes?',
      a: 'Depende de dónde recortes. Si tu consumo ya está por encima del bloque de subsistencia, esos 30 kWh valen tarifa plena y el ahorro es el máximo posible: consumo por tarifa, sin subsidio de por medio. Si estás por debajo del bloque, cada kWh que dejás de consumir te ahorra la tarifa menos el subsidio, así que el ahorro es menor. La calculadora te muestra el número exacto según tu caso.',
    },
    {
      q: '¿Por qué el cargo fijo se paga aunque no haya nadie en la casa?',
      a: 'Porque remunera los costos de tener la conexión disponible: comercialización, lectura del medidor, facturación y atención. Es parte de la fórmula tarifaria y no depende del consumo. En un apartamento vacío la factura no llega en cero: llegan los cargos fijos, más el alumbrado público y el aseo, que se cobran por unidad de vivienda.',
    },
    {
      q: 'Me llegó un recibo altísimo sin explicación: ¿qué hago?',
      a: 'Primero, compará el consumo (kWh o m³) contra los meses anteriores en el histórico que trae la propia factura: si el consumo saltó, el problema es físico —fuga, equipo nuevo, medidor—; si el consumo es igual y sólo subió el total, el problema es tarifario o de un cargo nuevo. Podés radicar reclamación ante la empresa, que tiene 15 días hábiles para responder, y si te la niegan el recurso de apelación lo resuelve la Superintendencia de Servicios Públicos Domiciliarios. Mientras la reclamación esté en trámite podés pagar el promedio de los últimos meses.',
    },
    {
      q: '¿Puedo cambiar de estrato para pagar menos?',
      a: 'El estrato no se elige: lo asigna la alcaldía por metodología del DANE, según las características físicas de la vivienda y su entorno. Sí podés pedir una revisión de la estratificación ante la oficina de planeación de tu municipio si creés que la clasificación no corresponde, y existe un comité permanente de estratificación que atiende esos reclamos. No es un trámite rápido, pero cuando prospera afecta todos los servicios a la vez.',
    },
    {
      q: '¿Cuál operador de internet me conviene?',
      a: `Compará el costo del primer año completo, no la mensualidad: sumá doce meses del plan más el cargo de instalación. En la muestra de referencia de ${INTERNET_REF.fecha} para 300 Mbps, los planes de sólo internet arrancan alrededor de ${cop(INTERNET_REF.planes[0].precio)} al mes y llegan a ${cop(INTERNET_REF.planes[3].precio)}, con un cargo de instalación de hasta ${cop(INTERNET_REF.instalacionTigo)} en el operador que lo cobra. Son precios comerciales que cambian con cada promoción: verificá antes de firmar y preguntá cuánto dura el precio promocional.`,
    },
    {
      q: '¿El internet tiene subsidio por estrato como la luz?',
      a: 'No. El internet no es un servicio público domiciliario con subsidios cruzados por estrato. El único beneficio tributario vigente es que el servicio de internet fijo residencial de estratos 1 y 2 está excluido de IVA. Han existido programas puntuales de conectividad social con tarifas especiales, pero no son un descuento automático como el de la energía.',
    },
    {
      q: '¿Por qué el agua me llega cada dos meses y la luz cada mes?',
      a: 'Es una decisión operativa de cada empresa, no una regla nacional: varias empresas de acueducto facturan bimestralmente porque leen el medidor cada dos meses. Para comparar contra el consumo básico, que está definido por mes, dividí el consumo de la factura bimestral entre dos. Si no lo hacés, vas a creer que te pasaste del bloque subsidiado cuando en realidad estás dentro.',
    },
  ],

  sources: [
    {
      name: 'Ley 142 de 1994 — régimen de servicios públicos domiciliarios (art. 89, contribución de solidaridad)',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0142_1994.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ley 1117 de 2006 — topes máximos de subsidio para estratos 1, 2 y 3',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_1117_2006.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'CREG — Comisión de Regulación de Energía y Gas: resoluciones tarifarias vigentes',
      url: 'https://www.creg.gov.co/',
      publisher: 'CREG',
    },
    {
      name: 'CRA — Comisión de Regulación de Agua Potable y Saneamiento Básico',
      url: 'https://www.cra.gov.co/',
      publisher: 'CRA',
    },
    {
      name: 'Superintendencia de Servicios Públicos Domiciliarios — reclamaciones y recursos',
      url: 'https://www.superservicios.gov.co/',
      publisher: 'Superservicios',
    },
    {
      name: 'Estatuto Tributario, art. 476 — servicios excluidos de IVA',
      url: 'https://estatuto.co/476',
      publisher: 'Estatuto Tributario Nacional',
    },
  ],

  replaces: [
    '/co/calculadora-recibo-luz-codensa-epm-colombia-estrato',
    '/co/calculadora-tarifa-electrica-colombia-mes-recibo-codensa',
    '/co/calculadora-recibo-gas-natural-colombia-vanti-epm-naturgas',
    '/co/calculadora-recibo-agua-bogota-eaab-2026',
    '/co/calculadora-internet-fibra-claro-etb-tigo-colombia-mejor-precio',
  ],

  lastReviewed: '2026-08-07',
};
