import type { HubData } from '../types';
import { COLOMBIA_2026, REAJUSTE_PENSIONAL_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto me pueden subir el arriendo y cuánto debería estar pagando?"
 *
 * Absorbe cuatro calculadoras de arriendo: aumento anual de vivienda urbana, canon de
 * local comercial, precio promedio por ciudad y cuota de administración de copropiedad.
 *
 * Constantes: src/lib/data/colombia-2026.ts. El IPC del año anterior NO se hardcodea
 * como verdad eterna: viaja como valor por defecto de un campo editable (ver IPC_ANUAL).
 */

/** Disclaimer YMYL — textual, igual que en el hub piloto. */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/**
 * IPC anual del año inmediatamente anterior (DANE), tope legal del aumento de vivienda
 * urbana (Ley 820/2003 art. 20). Sale de la tabla maestra: REAJUSTE_PENSIONAL_2026.ipc2025Pct
 * es el IPC 2025 con el que se reajustan las mesadas y los cánones durante 2026.
 * Es un DEFAULT EDITABLE: cada enero el DANE publica uno nuevo.
 */
export const IPC_ANUAL = REAJUSTE_PENSIONAL_2026.ipc2025Pct;
export const IPC_ANIO = 2025;

/** Ley 820/2003 art. 18: el canon mensual no puede exceder el 1% del valor comercial del inmueble. */
export const TOPE_CANON_PCT_VALOR = 0.01;

/** Ley 820/2003: aviso previo del reajuste y prórroga; depósito en garantía prohibido en vivienda (art. 16). */
export const AVISO_DIAS = 60;

/** Retención en la fuente por arrendamiento de bien inmueble (art. 401 ET + Decreto 1625/2016). */
export const RETENCION_ARRIENDO = {
  tasa: 0.035,
  baseUvt: COLOMBIA_2026.retefuenteConceptos[3].baseUvt,
  basePesos: COLOMBIA_2026.retefuenteConceptos[3].basePesos,
};

export const UVT = COLOMBIA_2026.uvt;
export const SMLMV = COLOMBIA_2026.smlmv;

/**
 * Canon de referencia del mercado: apartamento de 2 alcobas en zona media-alta, por ciudad.
 * Mismos valores base que la fórmula vieja `arriendo-bogota-medellin-cali-precio-promedio.ts`
 * (portales inmobiliarios + DANE). NO son un dato oficial: son referencia de mercado y
 * envejecen. La página los muestra como comparación, nunca como precio "correcto".
 */
export const MERCADO = {
  fecha: '2026-01',
  ciudades: [
    { id: 'bogota', nombre: 'Bogotá', base2Alcobas: 2_800_000 },
    { id: 'medellin', nombre: 'Medellín', base2Alcobas: 2_200_000 },
    { id: 'cali', nombre: 'Cali', base2Alcobas: 1_600_000 },
    { id: 'barranquilla', nombre: 'Barranquilla', base2Alcobas: 1_700_000 },
  ],
  /** Factor por cantidad de alcobas sobre la base de 2 alcobas. */
  alcobas: { 1: 0.65, 2: 1, 3: 1.4, 4: 1.85 } as Record<number, number>,
  /** La administración típica corre entre el 12% y el 26% del canon según la zona. */
  adminPctTipico: { min: 0.12, max: 0.26, medio: 0.19 },
};

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/vida/arriendo',
  title: 'Arriendo en Colombia: cuánto te pueden subir y cuánto deberías pagar',
  description:
    'Calculá el aumento legal de tu arriendo (tope IPC, Ley 820/2003 art. 20), el tope del 1% sobre el valor comercial, la cuota de administración y lo que le queda al arrendador después de predial y retención del 3,5%.',
  silo: 'Vida',
  siloHref: '/co/vida',
  locale: 'co',

  eyebrow: 'Colombia · Ley 820 de 2003 · Ley 675 de 2001',
  h1: '¿Cuánto te pueden subir el arriendo y cuánto deberías estar pagando?',
  lede:
    'El aumento del arriendo de vivienda urbana tiene tope legal y el canon también: no puede pasar del 1% del valor comercial del inmueble. Acá corrés las dos cuentas, le sumás la administración —que es plata que pagás igual— y comparás tu costo real contra el promedio de tu ciudad.',
  stamps: [
    `Tope de aumento: IPC ${IPC_ANIO} = ${IPC_ANUAL.toString().replace('.', ',')}% (editable)`,
    'Ley 820/2003 arts. 18 y 20 · Ley 675/2001',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Lo que vas a pagar por mes',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'El tope del IPC y el límite del 1% son de vivienda urbana. Un local comercial se rige por el Código de Comercio y ahí las reglas cambian: no hay tope legal de reajuste, pero sí derecho a renovación. Partimos del caso más frecuente.',
    items: [
      {
        id: 'vivienda',
        label: 'Alquilo una vivienda y me van a subir el canon',
        hint: 'Vivienda urbana · Ley 820/2003',
        answer: `El aumento anual no puede superar el IPC del año anterior: ${IPC_ANUAL.toString().replace('.', ',')}% con el último dato del DANE.`,
        yes: [
          `El reajuste se aplica una vez al año, al cumplirse cada año de ejecución del contrato, y no puede pasar del IPC del año calendario anterior (art. 20 Ley 820/2003)`,
          `El canon mensual no puede exceder el 1% del valor comercial del inmueble o de la parte que se arrienda (art. 18)`,
          'La cuota de administración: si el contrato dice que va por tu cuenta, es parte real de lo que pagás por vivir ahí',
          `El arrendador debe avisarte el reajuste por escrito, por un medio que deje constancia, con al menos ${AVISO_DIAS} días de anticipación si además quiere modificar condiciones`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'El IPC que manda es el del año calendario inmediatamente anterior publicado por el DANE, no el de los últimos doce meses corridos ni el proyectado',
          'En vivienda urbana está prohibido exigir depósito en garantía sobre el inmueble (art. 16 Ley 820/2003): lo que se usa en el mercado son codeudores, pólizas o afianzadoras',
          'Un aumento por encima del IPC no se vuelve legal porque lo hayas firmado: la norma es de orden público',
        ],
        plazo: 'el aumento rige desde el aniversario del contrato, no desde enero ni desde que te avisan.',
      },
      {
        id: 'comercial',
        label: 'Arriendo un local para mi negocio',
        hint: 'Código de Comercio arts. 518-524',
        answer: 'En local comercial no hay tope legal de reajuste, pero sí derecho a renovación después de dos años.',
        yes: [
          'El canon y su reajuste son de libre pacto entre las partes: el tope del IPC de la Ley 820 NO aplica acá',
          'Después de dos años ocupando el mismo local con el mismo negocio tenés derecho a la renovación del contrato (art. 518 C.Co.)',
          'Si no hay acuerdo sobre el precio de la renovación, la diferencia se resuelve por peritos (art. 519 C.Co.)',
          'El desacuerdo sobre el canon no te saca del local mientras el contrato esté vigente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La Ley 820 de 2003 regula sólo el arrendamiento de vivienda urbana: aplicarle su tope de IPC a un local es un error que aparece hasta en modelos de contrato que circulan por internet',
          'El derecho de renovación se pierde si incumpliste el contrato, y el arrendador puede desahuciarte con un año de aviso para demoler, reconstruir u ocupar el local con su propio negocio (art. 518)',
          'El costo real del local no es sólo el canon: sumá administración, impuesto predial si lo trasladan, servicios y la cuota de la cámara de comercio del sector',
        ],
        plazo: 'para pedir la renovación conviene avisar por escrito con anticipación y dejar constancia de la fecha.',
      },
      {
        id: 'arrendador',
        label: 'Soy el arrendador y quiero saber qué me queda',
        hint: 'Neto después de gastos y retención',
        answer: `Del canon salen administración, predial, seguro y una retención del ${(RETENCION_ARRIENDO.tasa * 100).toString().replace('.', ',')}% cuando el arrendatario es agente retenedor.`,
        yes: [
          `Retención en la fuente del ${(RETENCION_ARRIENDO.tasa * 100).toString().replace('.', ',')}% sobre el canon, cuando quien paga es agente de retención y supera la base de ${RETENCION_ARRIENDO.baseUvt} UVT (${cop(RETENCION_ARRIENDO.basePesos)})`,
          'Impuesto predial anual del inmueble, prorrateado al mes',
          'Cuota de administración, si la asumís vos y no el inquilino',
          'Comisión de la inmobiliaria o de la afianzadora, si el inmueble está administrado',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La retención no es un impuesto extra: es un anticipo del impuesto de renta que se acredita cuando declarás',
          'Si el arrendatario es persona natural no comerciante, no te retiene nada — pero el ingreso sigue siendo declarable',
          'La rentabilidad bruta sobre el valor comercial es engañosa: descontá vacancia, reparaciones y los meses que el inmueble esté vacío',
        ],
        plazo: 'guardá los certificados de retención: son los que te acreditan el anticipo en la declaración anual.',
      },
      {
        id: 'mercado',
        label: 'Quiero saber si estoy pagando de más',
        hint: 'Comparación contra el promedio de la ciudad',
        answer: 'Se compara tu canon más administración contra el promedio de un apartamento equivalente en tu ciudad.',
        yes: [
          'Canon más cuota de administración: el número que realmente sale de tu bolsillo cada mes',
          'Referencia de mercado por ciudad y cantidad de alcobas, para zona media-alta',
          `La administración típica de un edificio corre entre el ${(MERCADO.adminPctTipico.min * 100).toFixed(0)}% y el ${(MERCADO.adminPctTipico.max * 100).toFixed(0)}% del canon`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los promedios de mercado no son un dato oficial ni un tope legal: son referencia y envejecen rápido. Dentro de la misma ciudad, dos barrios pueden diferir más que dos ciudades entre sí',
          'Un canon por debajo del promedio no siempre es una ganga: mirá la administración, el estrato (define el subsidio de los servicios) y cuánto vas a gastar en transporte',
        ],
        plazo: 'el mejor momento para renegociar es antes del aniversario del contrato, no después del aviso de aumento.',
      },
    ],
  },

  inputsTitle: 'Tus números del arriendo',
  inputsIntro:
    'Todo en pesos colombianos y por mes, salvo el impuesto predial, que es anual. Dejá el ejemplo cargado si querés ver primero cómo funciona.',
  fields: [
    {
      id: 'canon',
      label: 'Canon de arriendo actual (COP/mes)',
      prefix: '$',
      value: '2.000.000',
      thousands: true,
      help: 'Lo que pagás hoy de arriendo, sin contar administración ni servicios.',
    },
    {
      id: 'ipc',
      label: 'IPC anual del DANE que aplica al reajuste (%)',
      type: 'number',
      value: IPC_ANUAL,
      min: 0,
      max: 30,
      step: 0.01,
      help: `Tope legal del aumento en vivienda urbana. Por defecto, el IPC ${IPC_ANIO} (${IPC_ANUAL.toString().replace('.', ',')}%). Cada enero el DANE publica el del año que cerró: cambialo por ese. En local comercial poné el porcentaje que pactaste.`,
    },
    {
      id: 'administracion',
      label: 'Cuota de administración (COP/mes)',
      prefix: '$',
      value: '380.000',
      thousands: true,
      help: 'La que cobra la copropiedad. Poné 0 si el inmueble no es propiedad horizontal o si la paga el arrendador.',
    },
    {
      id: 'valorComercial',
      label: 'Valor comercial del inmueble (COP)',
      prefix: '$',
      value: '350.000.000',
      thousands: true,
      help: 'Sirve para el tope del 1% del art. 18 de la Ley 820 y para la rentabilidad del arrendador. Si no lo sabés, usá el avalúo catastral como piso.',
    },
    {
      id: 'predial',
      label: 'Impuesto predial del año (COP)',
      prefix: '$',
      value: '2.400.000',
      thousands: true,
      help: 'Sólo cuenta en la rama del arrendador: se prorratea a doce meses.',
    },
    {
      id: 'retiene',
      label: '¿El arrendatario te practica retención?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, es empresa o agente retenedor' },
        { value: 'no', label: 'No, es persona natural no comerciante' },
      ],
      help: `La retención del ${(RETENCION_ARRIENDO.tasa * 100).toString().replace('.', ',')}% sobre arrendamiento de inmuebles la practica quien paga, si es agente de retención.`,
    },
    {
      id: 'ciudad',
      label: 'Ciudad',
      type: 'select',
      value: 'bogota',
      options: MERCADO.ciudades.map((c) => ({ value: c.id, label: c.nombre })),
      help: 'Define contra qué promedio de mercado se compara tu canon.',
    },
    {
      id: 'alcobas',
      label: 'Alcobas del inmueble',
      type: 'number',
      value: 2,
      min: 1,
      max: 4,
      step: 1,
      help: 'Entre 1 y 4. La referencia de mercado se ajusta por tamaño.',
    },
  ],
  fineprint: `${DISCLAIMER_TAX} El IPC que trae cargado el formulario es el del año ${IPC_ANIO} y es editable: cada enero el DANE publica el del año que cerró y ese es el que manda. Los promedios de mercado por ciudad son referencia de portales inmobiliarios (${MERCADO.fecha}), no un dato oficial ni un tope legal.`,

  chart: {
    type: 'stacked',
    title: 'De qué está hecho lo que pagás (o lo que cobrás)',
    caption:
      'La barra parte el desembolso mensual real: el canon de base, el aumento que te aplican y la cuota de administración. En la rama del arrendador muestra qué parte del canon se te va en gastos y retención, y cuánto te queda limpio.',
  },
  breakdownTitle: 'La cuenta, línea por línea',
  breakdownIntro:
    'Primero el canon nuevo y sus topes legales, después el costo real con administración, y al final la comparación contra el promedio de tu ciudad.',

  faq: [
    {
      q: '¿Cuánto me pueden subir el arriendo de vivienda por año?',
      a: `Como máximo el IPC del año calendario inmediatamente anterior, según el art. 20 de la Ley 820 de 2003. Con el último dato del DANE eso es ${IPC_ANUAL.toString().replace('.', ',')}% (IPC ${IPC_ANIO}). El reajuste se puede aplicar una sola vez al año y al cumplirse cada año de ejecución del contrato. Si te suben más que eso, el exceso no es exigible aunque figure en el contrato: la norma es de orden público y no se puede renunciar a ella.`,
    },
    {
      q: '¿Existe un tope al valor del arriendo, no sólo al aumento?',
      a: 'Sí, y casi nadie lo conoce: el art. 18 de la Ley 820 de 2003 fija que el canon mensual no puede exceder el 1% del valor comercial del inmueble o de la parte que se arrienda. Sobre un inmueble de $350 millones, el canon máximo legal es de $3.500.000 al mes. Además, ese valor comercial no puede exceder el doble del avalúo catastral, lo que en la práctica pone otro techo.',
    },
    {
      q: '¿La administración cuenta como parte del arriendo?',
      a: 'Jurídicamente no: la cuota de administración la fija la asamblea de copropietarios según la Ley 675 de 2001 y se reparte por coeficiente de copropiedad, no la fija el arrendador ni entra en el tope del IPC. Económicamente sí: es plata que sale de tu bolsillo todos los meses para poder vivir ahí. Por eso esta calculadora te muestra siempre el costo real (canon + administración), que es el número con el que deberías comparar entre inmuebles.',
    },
    {
      q: '¿Cómo se calcula la cuota de administración de mi apartamento?',
      a: 'Se toma el presupuesto anual de gastos comunes que aprueba la asamblea y se reparte entre las unidades según el coeficiente de copropiedad de cada una, que figura en el reglamento de propiedad horizontal (Ley 675 de 2001). El coeficiente se deriva del área privada de tu unidad sobre el área privada total del edificio, con los ajustes que haya hecho el reglamento. Si tu unidad tiene el 0,85% del edificio y el presupuesto mensual es de $40 millones, tu cuota es de $340.000.',
    },
    {
      q: '¿Me pueden pedir depósito o mes de garantía en vivienda?',
      a: 'No. El art. 16 de la Ley 820 de 2003 prohíbe expresamente exigir depósitos en dinero u otra caución real para garantizar el cumplimiento del contrato de arrendamiento de vivienda urbana. Lo que sí se usa —y es legal— son codeudores solidarios, pólizas de arrendamiento y compañías afianzadoras, que te cobran una cuota mensual aparte. En local comercial la prohibición no aplica y el depósito es práctica corriente.',
    },
    {
      q: 'Mi local comercial: ¿también tiene tope del IPC?',
      a: 'No. La Ley 820 de 2003 regula el arrendamiento de vivienda urbana. Los locales comerciales se rigen por el Código de Comercio (arts. 518 a 524) y el canon y su reajuste son de libre pacto. A cambio, el comerciante tiene una protección que el inquilino de vivienda no tiene: después de dos años ocupando el mismo local con el mismo establecimiento, gana derecho a la renovación del contrato, y si no hay acuerdo sobre el nuevo precio, lo definen peritos.',
    },
    {
      q: 'Soy el arrendador: ¿cuánto me queda realmente?',
      a: `Del canon bruto salen la cuota de administración si la asumís vos, el impuesto predial prorrateado al mes, la comisión de la inmobiliaria y la retención en la fuente del ${(RETENCION_ARRIENDO.tasa * 100).toString().replace('.', ',')}% que practica el arrendatario cuando es agente retenedor y el pago supera la base de ${RETENCION_ARRIENDO.baseUvt} UVT (${cop(RETENCION_ARRIENDO.basePesos)}). Sobre un canon de $2.000.000 con administración de $380.000 y predial de $2.400.000 al año, lo que queda limpio suele estar 30% o 40% por debajo del canon publicado.`,
    },
    {
      q: '¿La retención del 3,5% es un impuesto adicional?',
      a: 'No: es un anticipo del impuesto de renta. Todo lo que te retengan durante el año se acredita contra el impuesto que liquidás en tu declaración anual, y si te retuvieron de más queda saldo a favor. Lo importante es pedir el certificado de retención a cada arrendatario antes de declarar, porque sin él no tenés cómo probar el anticipo.',
    },
    {
      q: '¿Con cuánta anticipación tienen que avisarme el aumento?',
      a: `El reajuste anual opera al cumplirse cada año de contrato y el arrendador debe comunicarlo por un medio que deje constancia (carta, correo, mensaje con acuse). Si además quiere cambiar condiciones del contrato o darlo por terminado a la fecha de vencimiento, la Ley 820 le exige avisar con al menos ${AVISO_DIAS} días de anticipación. Un aviso verbal el mismo mes del aniversario es una mala práctica frecuente, pero no vuelve legal un aumento por encima del IPC.`,
    },
    {
      q: '¿Puedo negarme a pagar el aumento?',
      a: 'Si el aumento respeta el IPC del año anterior, es exigible y no pagarlo te pone en mora. Si supera el tope legal, lo que corresponde es dejar constancia por escrito de que aceptás el reajuste hasta el máximo legal y seguir pagando ese valor: pagar de menos sin dejar constancia sí te expone a un proceso de restitución. Ante un conflicto, la Superintendencia de Industria y Comercio ejerce funciones de inspección sobre arrendamiento de vivienda urbana.',
    },
    {
      q: '¿Cuánto se paga de arriendo en Bogotá, Medellín o Cali?',
      a: `Como referencia de mercado para un apartamento de dos alcobas en zona media-alta, la calculadora usa unos ${cop(MERCADO.ciudades[0].base2Alcobas)} en Bogotá, ${cop(MERCADO.ciudades[1].base2Alcobas)} en Medellín, ${cop(MERCADO.ciudades[2].base2Alcobas)} en Cali y ${cop(MERCADO.ciudades[3].base2Alcobas)} en Barranquilla, más administración. Son promedios de portales inmobiliarios, no un dato oficial del DANE ni un tope: la dispersión entre barrios de la misma ciudad es enorme y estos valores envejecen en meses.`,
    },
    {
      q: '¿Qué porcentaje de mis ingresos debería irse en arriendo?',
      a: 'La regla que usan las inmobiliarias colombianas para aprobar un contrato es que el canon no supere un tercio de los ingresos del hogar, y muchas piden acreditar ingresos de tres veces el canon. Como regla de bolsillo funciona, pero medila sobre el costo real —canon más administración— y no sobre el canon solo, porque la administración puede sumar otro 15% o 20% encima.',
    },
  ],

  sources: [
    {
      name: 'Ley 820 de 2003 — régimen de arrendamiento de vivienda urbana (arts. 16, 18 y 20)',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0820_2003.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ley 675 de 2001 — régimen de propiedad horizontal y coeficientes de copropiedad',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0675_2001.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Código de Comercio, arts. 518 a 524 — arrendamiento de local comercial y derecho de renovación',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_comercio_pr016.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'DANE — Índice de Precios al Consumidor (IPC)',
      url: 'https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-al-consumidor-ipc',
      publisher: 'DANE',
    },
    {
      name: 'Estatuto Tributario, art. 401 — retención en la fuente por otros ingresos tributarios',
      url: 'https://estatuto.co/401',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Superintendencia de Industria y Comercio — arrendamiento de vivienda urbana',
      url: 'https://www.sic.gov.co/tema/arrendamiento',
      publisher: 'SIC',
    },
  ],

  replaces: [
    '/co/calculadora-canon-arrendamiento-vivienda-aumento-anual-colombia-ipc',
    '/co/calculadora-canon-arrendamiento-comercial-colombia-comerciante',
    '/co/calculadora-arriendo-bogota-medellin-cali-precio-promedio',
    '/co/calculadora-cuota-administracion-copropiedad-colombia',
  ],

  lastReviewed: '2026-07-28',
};
