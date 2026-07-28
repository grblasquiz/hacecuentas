import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "Me separo: ¿cuánto cuesta, cómo se reparten los bienes
 * y de cuánto es la pensión de alimentos?"
 *
 * Absorbe cuatro calculadoras: costo y plazos del divorcio, partición de bienes
 * según régimen patrimonial, monto de la pensión de alimentos y consecuencias de
 * la mora (Registro Nacional de Deudores).
 *
 * Normas aplicadas:
 *  - Ley 19.947 de Matrimonio Civil: divorcio de común acuerdo con 1 año de cese
 *    de convivencia (Art. 55 inc. 1), unilateral con 3 años (Art. 55 inc. 3),
 *    por culpa sin exigencia de cese (Art. 54).
 *  - Código Civil: sociedad conyugal (Art. 1725 y ss., gananciales por mitades
 *    Art. 1774), separación de bienes, participación en los gananciales
 *    (Art. 1792-1 y ss., crédito de participación por la mitad del exceso).
 *  - Ley 14.908 sobre abandono de familia y pago de pensiones alimenticias:
 *    piso legal del Art. 3 (40% de un ingreso mínimo remuneracional por un hijo;
 *    30% por cada uno si son dos o más) y techo del Art. 7 (50% de las rentas
 *    del alimentante).
 *  - Ley 21.389 que crea el Registro Nacional de Deudores de Pensiones de
 *    Alimentos: inscripción por tres cuotas consecutivas o cinco discontinuas.
 *
 * DIFERENCIAS DELIBERADAS CON LAS FÓRMULAS VIEJAS (ver reporte):
 *  - Las viejas ignoraban el piso legal en ingreso mínimo remuneracional y el
 *    techo del 50%. Acá se aplican los dos.
 *  - Las viejas cobraban "aranceles de tribunal" de $80.000 a $120.000: los
 *    tribunales de familia en Chile no cobran arancel. Acá el costo de trámite
 *    son certificados del Registro Civil y es un campo editable.
 *  - La vieja de mora aplicaba un 27% anual citando el "Art. 22 del Código
 *    Civil", que no regula intereses. Acá el reajuste y el interés son campos
 *    editables, porque la ley manda reajustar por IPC y aplicar el interés
 *    corriente que publica la CMF.
 *
 * UF y UTM son datos VIVOS (src/data/live/chile.json): no se hardcodean.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'legal'). */
export const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

/** Indicadores vivos, con el mismo fallback que usan las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/**
 * Ingreso mínimo remuneracional — Ley 21.830, vigente desde 01-may-2026.
 * Es el valor que usa el piso del Art. 3 de la Ley 14.908. NO se usa
 * `immNoRemuneracional` ($356.815), que aplica a fines expresamente no
 * remuneracionales y daría un piso un 36% más bajo.
 */
export const IMR = CHILE_2026.imm;

/** Piso legal de la pensión de alimentos — Art. 3 Ley 14.908, en proporción del IMR. */
export const PISO_ALIMENTOS = {
  unHijo: 0.4,
  dosOMasPorHijo: 0.3,
} as const;

/** Techo legal de la pensión — Art. 7 Ley 14.908: 50% de las rentas del alimentante. */
export const TECHO_ALIMENTOS_PCT = 0.5;

/** Umbrales del Registro Nacional de Deudores — Ley 21.389. */
export const REGISTRO_DEUDORES = {
  cuotasConsecutivas: 3,
  cuotasDiscontinuas: 5,
} as const;

/** Fecha de los honorarios y costos de mercado de este hub. */
export const COSTOS_AS_OF = '2026-07';

/**
 * Vías de divorcio de la Ley 19.947, con honorarios de mercado (editables) y
 * plazos observados en tribunales de familia.
 */
export const VIAS: Array<{
  id: string;
  nombre: string;
  norma: string;
  ceseAnios: number;
  honMin: number;
  honMax: number;
  mesesMin: number;
  mesesMax: number;
}> = [
  { id: 'mutuo_acuerdo', nombre: 'De común acuerdo', norma: 'Art. 55 inc. 1 Ley 19.947', ceseAnios: 1, honMin: 500_000, honMax: 1_000_000, mesesMin: 3, mesesMax: 4 },
  { id: 'unilateral', nombre: 'Unilateral por cese de convivencia', norma: 'Art. 55 inc. 3 Ley 19.947', ceseAnios: 3, honMin: 1_000_000, honMax: 2_000_000, mesesMin: 6, mesesMax: 9 },
  { id: 'culpa', nombre: 'Por culpa del otro cónyuge', norma: 'Art. 54 Ley 19.947', ceseAnios: 0, honMin: 2_000_000, honMax: 3_000_000, mesesMin: 9, mesesMax: 12 },
];

/** Incrementos de honorarios por complejidad del caso, CLP. Precios de mercado. */
export const INCREMENTOS = {
  porHijo: 150_000,
  bienesSimples: 250_000,
  bienesComplejos: 750_000,
  deudasCompartidas: 200_000,
  sinAcuerdoCustodia: 500_000,
} as const;

/**
 * Costo de trámite del divorcio. Los tribunales de familia NO cobran arancel:
 * el gasto real son los certificados del Registro Civil que hay que acompañar
 * (matrimonio, nacimiento de los hijos) y, si hay bienes raíces, la escritura
 * y la inscripción en el Conservador. Editable.
 */
export const COSTO_TRAMITE = {
  certificadosRegistroCivil: 6_000,
  escrituraNotarial: 80_000,
  inscripcionConservador: 120_000,
} as const;

export const REGIMENES: Array<{ id: string; nombre: string; norma: string }> = [
  { id: 'sociedad_conyugal', nombre: 'Sociedad conyugal', norma: 'Art. 1725 y ss. Código Civil' },
  { id: 'separacion_bienes', nombre: 'Separación total de bienes', norma: 'Art. 1720 y 152 Código Civil' },
  { id: 'participacion_gananciales', nombre: 'Participación en los gananciales', norma: 'Art. 1792-1 y ss. Código Civil' },
];

export const CUSTODIAS: Array<{ id: string; nombre: string; ajuste: number }> = [
  { id: 'exclusiva_otro', nombre: 'Cuidado personal del otro progenitor', ajuste: 0 },
  { id: 'compartida_alterno', nombre: 'Cuidado compartido con alternancia', ajuste: -0.2 },
  { id: 'compartida_50', nombre: 'Cuidado compartido en partes iguales', ajuste: -0.3 },
];

export const CAPACIDADES: Array<{ id: string; nombre: string; ajuste: number }> = [
  { id: 'reducida', nombre: 'Reducida (cesantía, enfermedad, deuda)', ajuste: -0.1 },
  { id: 'normal', nombre: 'Normal', ajuste: 0 },
  { id: 'superior', nombre: 'Superior (varias rentas o patrimonio)', ajuste: 0.1 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/vida/separarse-en-chile',
  title: 'Separarse en Chile: costo del divorcio, partición de bienes y pensión de alimentos',
  description:
    'Cuánto cuesta y cuánto demora un divorcio en Chile de común acuerdo, unilateral por cese de convivencia o por culpa; cómo se reparten los bienes según sociedad conyugal, separación de bienes o participación en los gananciales; y de cuánto es la pensión de alimentos, con el piso legal del Art. 3 de la Ley 14.908 y el Registro Nacional de Deudores.',
  silo: 'Vida',
  siloHref: '/cl/vida',
  locale: 'cl',

  eyebrow: 'Chile · separación y familia',
  h1: 'Me separo: ¿cuánto cuesta, cómo se reparten los bienes y de cuánto es la pensión?',
  lede:
    'Tres decisiones se toman juntas y casi nadie las calcula junta: por qué vía pedir el divorcio, cómo queda el patrimonio según el régimen con que se casaron y cuánto es la pensión de alimentos. Acá están las tres, con el piso y el techo que fija la ley, más lo que pasa si el que paga deja de pagar.',
  stamps: [
    `Ingreso mínimo remuneracional: ${fmt(IMR)} · Ley 21.830`,
    `Piso de alimentos por un hijo: ${fmt(IMR * PISO_ALIMENTOS.unHijo)} · Art. 3 Ley 14.908`,
    'Ley 19.947 · Ley 14.908 · Ley 21.389',
    `Honorarios de referencia de ${COSTOS_AS_OF}`,
    '4 calculadoras en una sola página',
  ],

  resultLabel: 'Estimación del caso',

  cases: {
    title: '¿Qué parte de la separación estás resolviendo?',
    intro:
      'Empezamos por la vía más común y más barata: el divorcio de común acuerdo. Si tu caso es otro, cámbialo acá.',
    items: [
      {
        id: 'mutuo_acuerdo',
        label: 'Divorcio de común acuerdo',
        hint: 'Ambos quieren divorciarse y tienen un acuerdo completo y suficiente.',
        yes: [
          'Se exige un año de cese de la convivencia (Art. 55 inc. 1 de la Ley 19.947)',
          'Hay que acompañar un acuerdo completo y suficiente: alimentos, cuidado personal, relación directa y regular, y régimen de bienes',
          'Honorarios de abogado, certificados del Registro Civil y, si hay inmuebles, escritura e inscripción',
          'Plazo estimado del proceso ante el tribunal de familia',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los tribunales de familia no cobran arancel: el proceso es gratuito y el único costo obligatorio son los certificados del Registro Civil. Si te cobran una "tasa de tribunal", pregunta de qué se trata',
          'La Corporación de Asistencia Judicial atiende gratis según evaluación socioeconómica: si no puedes pagar abogado, ese es el camino y no hay un umbral fijo en UF',
          'Si el acuerdo no es "completo y suficiente" el tribunal lo rechaza y el proceso se alarga: es la causa más frecuente de demora en esta vía',
        ],
        plazo:
          'un año de cese de convivencia acreditado antes de demandar; el proceso en sí suele tomar entre tres y cuatro meses.',
        answer:
          'El divorcio de común acuerdo exige un año de cese de convivencia y es la vía más rápida y barata: en torno a tres o cuatro meses.',
      },
      {
        id: 'unilateral',
        label: 'Divorcio unilateral por cese de convivencia',
        hint: 'Uno solo lo pide, sin acuerdo del otro.',
        yes: [
          'Se exigen tres años de cese efectivo de la convivencia (Art. 55 inc. 3 de la Ley 19.947)',
          'Hay que acreditar el cese: la fecha cierta se prueba con escritura, acta de cese ante oficial del Registro Civil o demanda de alimentos previa',
          'Honorarios más altos por la etapa de notificación y las eventuales objeciones del demandado',
          'Plazo más largo: notificación, audiencia preparatoria y audiencia de juicio',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El demandado puede oponer que el demandante no ha pagado los alimentos debiendo hacerlo: si prospera esa excepción, el divorcio se rechaza (Art. 55 inc. 3 de la Ley 19.947)',
          'Los tres años se cuentan desde que hay fecha cierta del cese, no desde que dejaron de vivir juntos de hecho: sin fecha cierta el plazo puede no haber empezado a correr',
          'Negociar un acuerdo antes de demandar suele recortar el costo total en torno a un 30%, porque evita la etapa de prueba',
        ],
        plazo:
          'tres años de cese acreditado antes de demandar; el proceso suele tomar entre seis y nueve meses, más si hay bienes o desacuerdo por los hijos.',
        answer:
          'El divorcio unilateral exige tres años de cese de convivencia con fecha cierta y tarda entre seis y nueve meses.',
      },
      {
        id: 'culpa',
        label: 'Divorcio por culpa del otro cónyuge',
        hint: 'Falta grave contra los deberes del matrimonio que hace intolerable la vida en común.',
        yes: [
          'No se exige plazo de cese de convivencia (Art. 54 de la Ley 19.947)',
          'Hay que probar la causal: hay etapa de prueba con testigos, documentos y eventuales peritajes',
          'Es la vía más cara y más lenta de las tres',
          'Puede tener efectos patrimoniales: el cónyuge culpable puede ver reducida o denegada la compensación económica',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Probar la culpa es difícil y caro: si la prueba falla, se pierde el juicio y el tiempo, y hay que empezar de nuevo por otra vía',
          'La compensación económica es una institución distinta del divorcio y se pide en el mismo juicio: si no la pides ahí, se pierde',
          'Esta vía sólo tiene sentido cuando la culpa tiene un efecto patrimonial concreto que quieres perseguir; para terminar el matrimonio, el cese de convivencia es más barato y más seguro',
        ],
        plazo:
          'no hay plazo de cese previo, pero el juicio suele tomar entre nueve y doce meses, y más si hay apelación.',
        answer:
          'El divorcio por culpa no exige cese de convivencia, pero exige prueba: es la vía más cara y la que más demora.',
      },
      {
        id: 'particion',
        label: 'Cómo se reparten los bienes',
        hint: 'Sociedad conyugal, separación total de bienes o participación en los gananciales.',
        yes: [
          'Sociedad conyugal: los gananciales se dividen por mitades entre los cónyuges (Art. 1774 del Código Civil), después de pagar el pasivo social',
          'Separación total de bienes: cada uno conserva y administra lo suyo, y no hay masa que partir',
          'Participación en los gananciales: cada uno administra lo suyo durante el matrimonio y, al terminar, el que ganó menos tiene un crédito por la mitad del exceso',
          'Costo del proceso, escritura e inscripción en el Conservador si hay bienes raíces',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'En sociedad conyugal la mujer puede renunciar a los gananciales (Art. 1781 del Código Civil): renuncia a la mitad del activo, pero deja de responder por las deudas sociales',
          'La adjudicación de un bien en la partición de una comunidad no es una venta: no genera mayor valor afecto a impuesto a la renta. Cualquier calculadora que te cobre un "impuesto de transferencia" por partir bienes está inventando',
          'El haber propio de cada cónyuge (lo que tenía antes de casarse y lo heredado o donado) no entra en la mitad de gananciales: sólo entra el haber social',
          'La compensación económica es distinta de la partición: se calcula por el menoscabo económico de quien no pudo trabajar, y se pide en el juicio de divorcio',
        ],
        plazo:
          'la liquidación de la sociedad conyugal se puede hacer de común acuerdo por escritura pública, o por un juez árbitro si no hay acuerdo, lo que agrega meses y honorarios de árbitro.',
        answer:
          'En sociedad conyugal los gananciales se parten por mitades; en separación de bienes no hay nada que partir; en participación en los gananciales el que ganó menos recibe la mitad de la diferencia.',
      },
      {
        id: 'alimentos',
        label: 'Cuánto es la pensión de alimentos',
        hint: 'El piso y el techo que fija la ley, y el criterio de capacidad económica.',
        yes: [
          'Piso legal del Art. 3 de la Ley 14.908: por un hijo, el 40% de un ingreso mínimo remuneracional; por cada uno, si son dos o más, el 30%',
          'Techo legal del Art. 7 de la Ley 14.908: la pensión no puede exceder el 50% de las rentas del alimentante',
          'Estimación por capacidad económica sobre el ingreso líquido, ajustada por el régimen de cuidado personal',
          'Gastos extraordinarios de educación y salud prorrateados al mes',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'La ley fija un piso y un techo, no un porcentaje exacto: el monto lo determina el juez ponderando las necesidades del alimentario y las facultades del alimentante. El porcentaje que estima esta página es un criterio orientativo, no una regla legal',
          'El piso se calcula sobre el ingreso mínimo remuneracional vigente, no sobre el ingreso mínimo para fines no remuneracionales: la diferencia entre uno y otro cambia el piso en más de un tercio',
          'El juez puede fijar una pensión menor al piso sólo si el alimentante acredita fundadamente que carece de los medios para pagarlo',
          'La pensión se reajusta automáticamente y se puede pedir su modificación si cambian las circunstancias: no queda congelada',
        ],
        plazo:
          'el tribunal fija alimentos provisorios al proveer la demanda, y esos alimentos se deben desde la notificación; la sentencia definitiva llega después.',
        answer:
          'La ley fija un piso —40% de un ingreso mínimo remuneracional por un hijo, 30% por cada uno si son dos o más— y un techo del 50% de las rentas del alimentante. Entre esos dos números decide el juez.',
      },
      {
        id: 'deudor',
        label: 'El otro no paga la pensión',
        hint: 'Registro Nacional de Deudores, retención de la devolución de impuestos y demás apremios.',
        yes: [
          'Cuántas cuotas hacen falta para la inscripción en el Registro Nacional de Deudores: tres consecutivas o cinco discontinuas (Ley 21.389)',
          'Deuda actualizada: capital adeudado, reajuste por IPC e interés',
          'Retención de la devolución anual de impuestos y de fondos de cuentas bancarias, que se imputan a la deuda',
          'Qué trámites quedan bloqueados mientras la persona esté inscrita en el registro',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Las pensiones adeudadas se reajustan según la variación del IPC y devengan el interés corriente para operaciones reajustables que publica la CMF: no hay una tasa fija de ley. Los valores de esta página son editables y debes contrastarlos con el IPC y la tasa vigentes',
          'La inscripción en el registro no es automática por monto: la ordena el tribunal cuando se cumple el número de cuotas impagas y se hace la liquidación de la deuda',
          'Estar inscrito bloquea trámites concretos: renovar licencia de conducir, obtener o renovar pasaporte, inscribir la transferencia de un vehículo o de un inmueble, y postular a beneficios y cargos públicos',
          'La salida del país requiere autorización del tribunal mientras el deudor esté inscrito, pero no es una "prohibición automática por monto": es una medida que se decreta en el procedimiento',
        ],
        plazo:
          'la inscripción se solicita al tribunal una vez que hay tres cuotas consecutivas o cinco discontinuas impagas y practicada la liquidación de la deuda; se cancela pagando el total o pactando y cumpliendo un acuerdo de pago.',
        answer:
          'Con tres cuotas consecutivas o cinco discontinuas impagas el tribunal ordena inscribir al deudor en el Registro Nacional de Deudores de Pensiones de Alimentos, y desde ahí se le bloquean trámites y se le retiene la devolución de impuestos.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu caso',
  inputsIntro:
    'Los honorarios y costos vienen precargados con valores de mercado y son editables. Los pisos, techos y plazos son los de la ley y no cambian con tus datos.',
  fields: [
    {
      id: 'hijos',
      label: 'Hijos menores de edad en común',
      type: 'number',
      value: 2,
      min: 0,
      max: 12,
      step: 1,
    },
    {
      id: 'regimen',
      label: 'Régimen patrimonial del matrimonio',
      type: 'select',
      value: 'sociedad_conyugal',
      options: REGIMENES.map((r) => ({ value: r.id, label: r.nombre })),
    },
    {
      id: 'bienesComunes',
      label: 'Bienes sociales o gananciales (CLP)',
      prefix: '$',
      value: '90.000.000',
      thousands: true,
      help: 'Lo adquirido a título oneroso durante el matrimonio. No incluye el haber propio de cada uno.',
    },
    {
      id: 'deudasComunes',
      label: 'Deudas sociales o comunes (CLP)',
      prefix: '$',
      value: '25.000.000',
      thousands: true,
    },
    {
      id: 'propiosA',
      label: 'Bienes propios del cónyuge que hace el cálculo (CLP)',
      prefix: '$',
      value: '12.000.000',
      thousands: true,
      help: 'Lo que tenía antes de casarse más lo heredado o donado durante el matrimonio.',
    },
    {
      id: 'propiosB',
      label: 'Bienes propios del otro cónyuge (CLP)',
      prefix: '$',
      value: '4.000.000',
      thousands: true,
    },
    {
      id: 'complejidad',
      label: 'Complejidad del patrimonio',
      type: 'select',
      value: 'si_simple',
      options: [
        { value: 'no', label: 'No hay bienes que repartir' },
        { value: 'si_simple', label: 'Bienes simples (una propiedad, un auto)' },
        { value: 'si_complejo', label: 'Bienes complejos (empresa, varios inmuebles)' },
      ],
    },
    {
      id: 'acuerdoHijos',
      label: '¿Hay acuerdo sobre el cuidado personal y los alimentos?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, está todo acordado' },
        { value: 'no', label: 'No, lo va a resolver el tribunal' },
      ],
    },
    {
      id: 'honorarios',
      label: 'Honorarios de abogado que te cotizaron (CLP, 0 = estimar)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: `Si lo dejas en 0, se estima con valores de mercado de ${COSTOS_AS_OF} según la vía y la complejidad.`,
    },
    {
      id: 'ingresoAlimentante',
      label: 'Ingreso bruto mensual de quien paga la pensión (CLP)',
      prefix: '$',
      value: '1.500.000',
      thousands: true,
    },
    {
      id: 'descuentosPct',
      label: 'Descuentos previsionales y de impuesto (%)',
      suffix: '%',
      type: 'number',
      value: 20,
      min: 0,
      max: 60,
      step: 0.5,
      help: 'AFP, salud, cesantía e Impuesto Único. Sirve para pasar del bruto al líquido.',
    },
    {
      id: 'custodia',
      label: 'Régimen de cuidado personal',
      type: 'select',
      value: 'exclusiva_otro',
      options: CUSTODIAS.map((c) => ({ value: c.id, label: c.nombre })),
    },
    {
      id: 'capacidad',
      label: 'Capacidad económica del alimentante',
      type: 'select',
      value: 'normal',
      options: CAPACIDADES.map((c) => ({ value: c.id, label: c.nombre })),
    },
    {
      id: 'gastosExtra',
      label: 'Gastos extraordinarios mensualizados (CLP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Colegio, salud y actividades, prorrateados al mes. Se acuerdan aparte de la pensión.',
    },
    {
      id: 'cuotasImpagas',
      label: 'Cuotas de pensión impagas',
      type: 'number',
      value: 4,
      min: 0,
      max: 120,
      step: 1,
    },
    {
      id: 'pensionFijada',
      label: 'Pensión mensual fijada por el tribunal (CLP)',
      prefix: '$',
      value: '250.000',
      thousands: true,
    },
    {
      id: 'ipcAcumulado',
      label: 'Variación del IPC acumulada desde el primer impago (%)',
      suffix: '%',
      type: 'number',
      value: 1.6,
      min: 0,
      max: 200,
      step: 0.1,
      help: 'Reajuste legal de las pensiones adeudadas. Contrástalo con la serie del IPC del INE.',
    },
    {
      id: 'interesAnual',
      label: 'Interés corriente para operaciones reajustables (% anual)',
      suffix: '%',
      type: 'number',
      value: 4.5,
      min: 0,
      max: 60,
      step: 0.1,
      help: 'Tasa que publica la CMF. Cambia todos los meses: verifica la vigente antes de usar el resultado.',
    },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte',
    caption:
      'Muestra la composición del número principal del caso que elegiste: el costo del divorcio, el reparto del patrimonio, la pensión y sus gastos, o la deuda acumulada.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada monto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto tiempo de separación se necesita para divorciarse en Chile?',
      a: 'Depende de la vía. De común acuerdo se exige un año de cese efectivo de la convivencia, según el inciso primero del Art. 55 de la Ley 19.947. Si lo pide uno solo, sin acuerdo del otro, el plazo sube a tres años. Y por culpa, del Art. 54, no se exige ningún plazo de cese, pero hay que probar la causal. Un detalle que cambia todo: el plazo se cuenta desde que hay fecha cierta del cese, que se obtiene con escritura pública, acta ante oficial del Registro Civil o una demanda de alimentos, no desde que dejaron de vivir juntos de hecho.',
    },
    {
      q: '¿Cuánto cuesta un divorcio en Chile?',
      a: 'El grueso son honorarios de abogado. De común acuerdo y sin bienes ni hijos, el mercado se mueve entre quinientos mil y un millón de pesos; unilateral, entre uno y dos millones; por culpa, entre dos y tres millones, porque hay etapa de prueba. A eso se suman los certificados del Registro Civil, que cuestan unos pocos miles de pesos, y —sólo si hay bienes raíces que traspasar— la escritura notarial y la inscripción en el Conservador de Bienes Raíces. Los tribunales de familia no cobran arancel: el proceso judicial en sí es gratuito.',
    },
    {
      q: '¿Es cierto que hay que pagar un arancel al tribunal de familia?',
      a: 'No. En Chile el acceso a los tribunales de familia es gratuito y no existe una tasa judicial que el demandante deba pagar para presentar la demanda de divorcio. Si una calculadora, un sitio o un tramitador te cobra ochenta o cien mil pesos por concepto de "arancel de tribunal", pregunta con detalle a qué corresponde: probablemente sea parte de sus honorarios con otro nombre. Y si no puedes pagar abogado, la Corporación de Asistencia Judicial da atención gratuita previa evaluación socioeconómica.',
    },
    {
      q: '¿Cómo se reparten los bienes si nos casamos en sociedad conyugal?',
      a: 'Al disolverse la sociedad conyugal se forma una masa común con el haber social, se pagan las deudas sociales y lo que queda —los gananciales— se divide por mitades entre los cónyuges, según el Art. 1774 del Código Civil. El haber propio de cada uno, es decir lo que tenía antes de casarse y lo que recibió por herencia o donación, no entra en esa división. Además la mujer tiene un derecho que conviene evaluar con calma: puede renunciar a los gananciales, con lo que pierde su mitad del activo pero deja de responder por las deudas sociales, algo que le conviene si la sociedad está sobreendeudada.',
    },
    {
      q: '¿Qué pasa con los bienes si estamos casados con separación total de bienes?',
      a: 'No hay nada que partir. Cada cónyuge conservó durante todo el matrimonio la propiedad y la administración de sus bienes, y al divorciarse cada uno se queda con lo suyo y responde de sus propias deudas. Lo que sí puede haber es una comunidad sobre bienes que compraron juntos, en cuyo caso se parte esa comunidad según la cuota de cada uno en la escritura, y una eventual compensación económica si uno de los dos no pudo desarrollar una actividad remunerada por dedicarse al hogar o a los hijos.',
    },
    {
      q: '¿Cómo funciona la participación en los gananciales?',
      a: 'Durante el matrimonio funciona igual que la separación de bienes: cada uno administra lo suyo. La diferencia aparece al terminar el régimen. Ahí se compara el patrimonio final con el originario de cada cónyuge para determinar cuánto ganó cada uno, y el que obtuvo menos gananciales tiene un crédito de participación contra el otro por la mitad del exceso. Es un crédito en dinero, no un derecho sobre bienes determinados: el que debe elige con qué paga, y sólo se puede exigir en bienes si no hay dinero suficiente.',
    },
    {
      q: '¿De cuánto es la pensión de alimentos mínima en Chile?',
      a: 'El Art. 3 de la Ley 14.908 fija un piso: la pensión decretada a favor de un hijo menor no puede ser inferior al 40% de un ingreso mínimo remuneracional, y si son dos o más hijos menores, no puede ser inferior al 30% del ingreso mínimo remuneracional por cada uno. Con el ingreso mínimo vigente eso significa que un solo hijo tiene un piso cercano a los doscientos veinte mil pesos mensuales. El juez puede fijar un monto menor únicamente si el alimentante acredita fundadamente que carece de los medios para pagar ese mínimo.',
    },
    {
      q: '¿Cuál es el máximo que me pueden descontar por pensión de alimentos?',
      a: 'El Art. 7 de la Ley 14.908 establece que el tribunal no puede fijar una pensión que exceda el 50% de las rentas del alimentante. Ese techo es sobre el total de lo que la persona debe pagar por alimentos, no por cada hijo. Es la razón por la que, cuando hay varios alimentarios, el monto por hijo baja: la suma no puede pasar de la mitad de las rentas. Entre ese techo y el piso del Art. 3 decide el juez, ponderando las necesidades del alimentario y las facultades del alimentante.',
    },
    {
      q: '¿Cómo se calcula en la práctica el monto de la pensión?',
      a: 'La ley no fija un porcentaje. Los tribunales ponderan dos cosas: lo que el niño necesita —alimentación, vivienda, salud, educación, recreación— y lo que el alimentante puede pagar según sus ingresos y su patrimonio. En la práctica se trabaja sobre el ingreso líquido y el monto sube con el número de hijos, aunque nunca puede pasar del 50% de las rentas ni bajar del piso legal. Los porcentajes que estima esta página son un criterio orientativo para ordenar la conversación, no una regla legal: el número final lo pone el juez.',
    },
    {
      q: '¿Los gastos de colegio y de salud van dentro de la pensión?',
      a: 'Depende de cómo se haya acordado o fijado. Lo habitual es distinguir entre la pensión mensual, que cubre los gastos ordinarios de vida, y los gastos extraordinarios de educación y salud, que se pactan aparte y se reparten en una proporción acordada, muchas veces por mitades y contra boleta. Conviene dejarlo escrito con precisión en el acuerdo, porque los gastos extraordinarios son la principal fuente de conflicto posterior entre progenitores separados.',
    },
    {
      q: '¿Cuándo entra alguien al Registro Nacional de Deudores de Pensiones de Alimentos?',
      a: 'La Ley 21.389 lo establece para quien adeuda, total o parcialmente, tres cuotas consecutivas o cinco discontinuas de la pensión. La inscripción la ordena el tribunal una vez practicada la liquidación de la deuda, no es automática ni depende del monto. El registro lo lleva el Servicio de Registro Civil e Identificación y es de acceso público a través de su sitio.',
    },
    {
      q: '¿Qué consecuencias tiene estar en el Registro de Deudores?',
      a: 'Bloquea trámites concretos: no se puede renovar la licencia de conducir ni obtener o renovar el pasaporte, no se puede inscribir la transferencia de un vehículo ni de un inmueble, y no se puede postular a beneficios estatales ni a determinados cargos públicos. Además el Servicio de Impuestos Internos retiene la devolución anual de impuestos y la imputa a la deuda, y los bancos deben retener fondos ante una orden judicial. La inscripción se cancela pagando el total o pactando un acuerdo de pago y cumpliéndolo.',
    },
    {
      q: '¿Cómo se actualiza una deuda de pensión de alimentos?',
      a: 'Las pensiones adeudadas se reajustan según la variación del Índice de Precios al Consumidor que publica el INE, y sobre el monto reajustado se aplica el interés corriente para operaciones reajustables que fija mensualmente la Comisión para el Mercado Financiero. No existe una tasa fija de ley: cualquier cálculo que aplique un porcentaje anual redondo y lo atribuya a un artículo del Código Civil está inventando. Por eso en esta página el reajuste y el interés son campos que puedes editar con los valores vigentes.',
    },
    {
      q: '¿La pensión de alimentos se puede modificar después?',
      a: 'Sí. Cualquiera de las partes puede pedir al tribunal que aumente, rebaje o cese la pensión cuando cambian las circunstancias que se tuvieron a la vista al fijarla: pérdida del empleo, nacimiento de otro hijo, cambio del régimen de cuidado personal o aumento de las necesidades del alimentario. Además la pensión se reajusta de forma automática en la periodicidad que fije la sentencia, para que no se licúe con la inflación.',
    },
  ],

  sources: [
    {
      name: 'BCN — Ley 19.947, Nueva Ley de Matrimonio Civil (divorcio, Arts. 54 y 55)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=225128',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'BCN — Ley 14.908 sobre abandono de familia y pago de pensiones alimenticias (Arts. 3 y 7)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=172986',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'BCN — Ley 21.389, Registro Nacional de Deudores de Pensiones de Alimentos',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1168579',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'BCN — Código Civil: sociedad conyugal y participación en los gananciales',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=172986&idParte=8717776',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'Registro Nacional de Deudores de Pensiones de Alimentos — consulta pública',
      url: 'https://registrodeudores.registrocivil.cl/',
      publisher: 'Servicio de Registro Civil e Identificación',
    },
    {
      name: 'Poder Judicial — tribunales de familia y trámite del divorcio',
      url: 'https://www.pjud.cl/tribunales/tribunales-de-familia',
      publisher: 'Poder Judicial de Chile',
    },
    {
      name: 'ChileAtiende — divorcio de común acuerdo y unilateral',
      url: 'https://www.chileatiende.gob.cl/fichas/3195-divorcio',
      publisher: 'ChileAtiende',
    },
    {
      name: 'CMF — tasas de interés corriente por tipo de operación',
      url: 'https://www.cmfchile.cl/portal/estadisticas/617/w3-propertyvalue-25397.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'INE — Índice de Precios al Consumidor (reajuste de pensiones adeudadas)',
      url: 'https://www.ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion/indice-de-precios-al-consumidor',
      publisher: 'Instituto Nacional de Estadísticas',
    },
    {
      name: 'Dirección del Trabajo — ingreso mínimo remuneracional vigente (Ley 21.830)',
      url: 'https://www.dt.gob.cl/portal/1628/w3-article-60141.html',
      publisher: 'Dirección del Trabajo',
    },
  ],

  replaces: [
    '/calculadora-divorcio-chile-cese-convivencia-3-anos',
    '/calculadora-divorcio-particion-bienes-chile-sociedad-conyugal-vs-separacion',
    '/calculadora-pension-alimenticia-chile-padre-tribunal-familia',
    '/calculadora-pension-de-alimentos-mora-chile-registro-deudores',
  ],

  lastReviewed: '2026-07-28',
};
