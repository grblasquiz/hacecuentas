import type { HubData } from './types';

export const hub: HubData = {
  slug: 'trabajo/sueldo-bruto-y-neto',
  title: 'Calculadora de sueldo bruto a neto 2026 Argentina',
  description:
    'Calculá sueldo bruto a neto y neto a bruto en Argentina. Incluye aportes con tope SIPA de julio 2026, Ganancias estimada y monotributo por categoría.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Sueldo y liquidación',
  h1: '¿Cuánto me queda en mano del sueldo bruto?',
  lede:
    'Partimos del caso más habitual: tenés el bruto y querés saber cuánto cobrás. Si lo tuyo es al revés —cuánto te tienen que poner de bruto para cobrar X— o si sos monotributista, cambiá el caso abajo.',
  stamps: [
    'Revisado 31-07-2026',
    'Tope SIPA julio 2026',
    'Ganancias estimada con escala 2026',
    'Cálculo explicado',
  ],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué necesitás calcular?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'bruto-a-neto',
        label: 'Tengo el bruto y quiero saber cuánto cobro',
        hint: 'El caso más común',
        answer: 'Del bruto se descuenta el 17% de aportes y, si superás el mínimo no imponible, Ganancias.',
        yes: [
          'Jubilación (SIPA) 11%, ley 24.241 art. 11',
          'INSSJP–PAMI 3%, ley 19.032',
          'Obra social 3%, ley 23.660',
          'Impuesto a las Ganancias de 4ª categoría, si el sueldo supera el mínimo no imponible',
        ],
        warn: [
          'Los tres aportes se calculan sobre una base imponible con TOPE (ley 24.241 art. 9): arriba de ese bruto el descuento deja de ser el 17% pleno y el neto sube más rápido',
          'La cuota sindical y otros descuentos de convenio no son obligatorios para todos: cargalos aparte',
        ],
        plazo: 'el sueldo se paga hasta el 4º día hábil del mes siguiente (LCT art. 128).',
      },
      {
        id: 'neto-a-bruto',
        label: 'Sé cuánto quiero cobrar en mano: ¿cuánto bruto tienen que ponerme?',
        hint: 'Cálculo inverso',
        answer: 'Para un neto objetivo hay que buscar el bruto que, tras aportes y Ganancias, lo deja exacto.',
        yes: [
          'Buscamos por aproximación el bruto que produce tu neto objetivo (precisión $100)',
          'Sirve para negociar sueldo o para pedir un aumento en términos de bolsillo',
        ],
        warn: [
          'No es una regla de tres: Ganancias es progresivo, así que el bruto necesario crece más rápido que el neto',
          'Si estás arriba del tope de aportes, cada peso extra de bruto llega casi entero al bolsillo (salvo Ganancias)',
        ],
        plazo: 'pactá siempre el bruto por escrito: el recibo se emite sobre el bruto, no sobre el neto.',
      },
      {
        id: 'recibo',
        label: 'Quiero ver el desglose del recibo',
        hint: 'Liquidación mensual estimada',
        answer: 'El desglose separa aportes personales, Ganancias, descuentos cargados y costo patronal estimado.',
        yes: [
          'Neto mensual desglosado concepto por concepto',
          'Jubilación, PAMI y obra social calculados sobre la base imponible aplicable',
          'Ganancias mensual estimada según cargas declaradas',
          'Costo laboral estimado para el empleador con contribuciones patronales',
        ],
        warn: [
          'El recibo real puede traer presentismo, antigüedad, viáticos, SAC, vacaciones o adicionales que acá no están',
          'Las contribuciones patronales (~26,4%) son una estimación: no incluyen ART ni seguro de vida obligatorio',
        ],
        plazo: 'guardá el duplicado del recibo: prescribe a los 2 años (LCT art. 256).',
      },
      {
        id: 'autonomo',
        label: 'Soy autónomo o monotributista',
        hint: 'Factura, no recibo',
        answer: 'El monotributista no tiene aportes del 17%: paga la cuota de su categoría más Ingresos Brutos y otros gastos.',
        yes: [
          'Cuota mensual de monotributo para servicios según categoría, con valores desde agosto de 2026',
          'Ingresos Brutos provinciales sobre lo facturado',
          'Un estimado de gastos fijos (contador, banco, comisiones)',
        ],
        warn: [
          'No hay aguinaldo, ni vacaciones pagas, ni indemnización: para comparar con un empleado hay que descontar eso del bolsillo',
          'La categoría se revisa cada 6 meses (enero y julio): facturar de más te recategoriza y te sube la cuota',
        ],
        plazo: 'la cuota vence el día 20; la escala usada en este módulo rige desde el 1 de agosto de 2026.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada caso usa sólo los campos que le corresponden: si sos monotributista mirá la facturación y la categoría; si vas de neto a bruto, el neto objetivo.',
  fields: [
    {
      id: 'bruto',
      label: 'Sueldo bruto mensual (o facturación, si sos monotributista)',
      prefix: '$',
      value: '1.500.000',
      thousands: true,
      help: 'Lo que figura arriba del recibo, antes de los descuentos.',
    },
    {
      id: 'neto',
      label: 'Neto en mano que querés cobrar',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'Sólo se usa en el caso "de neto a bruto".',
    },
    {
      id: 'conyuge',
      label: '¿Tenés cónyuge a cargo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Declarado en el SiRADIG F.572: baja la base de Ganancias.',
    },
    { id: 'hijos', label: 'Hijos a cargo (menores de 18)', type: 'number', min: 0, max: 10, value: 0 },
    {
      id: 'sindicato',
      label: 'Cuota sindical y otros descuentos de convenio',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 10,
      step: 0.5,
      value: 0,
      help: 'Suele ser 2% o 3% del bruto. Si no estás afiliado, dejá 0.',
    },
    {
      id: 'antiguedad',
      label: 'Antigüedad (años)',
      type: 'number',
      min: 0,
      max: 45,
      value: 3,
      help: 'Define los días de vacaciones en el caso "recibo completo".',
    },
    {
      id: 'categoria',
      label: 'Categoría de monotributo',
      type: 'select',
      value: 'D',
      options: [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' },
        { value: 'G', label: 'G' },
        { value: 'H', label: 'H' },
        { value: 'I', label: 'I' },
        { value: 'J', label: 'J' },
        { value: 'K', label: 'K' },
      ],
      help: 'Sólo se usa en el caso "autónomo o monotributista".',
    },
    {
      id: 'iibb',
      label: 'Ingresos Brutos de tu provincia',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 10,
      step: 0.1,
      value: 3.5,
      help: 'CABA 3–3,5%. Provincia de Buenos Aires 3,5–4,5%. Varía por actividad.',
    },
  ],
  fineprint:
    'Es una estimación sobre el régimen general. Un convenio colectivo, adicionales remunerativos o deducciones personales cargadas en el SiRADIG pueden cambiar el resultado.',

  chart: {
    type: 'stacked',
    title: '¿En qué se te va el bruto?',
    caption:
      'Una sola barra partida: cuánto termina en tu bolsillo y cuánto se lleva cada descuento —jubilación, PAMI, obra social, sindicato y Ganancias—.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada descuento con el rubro más grande de tu liquidación.',

  faq: [
    {
      q: '¿Cuánto se descuenta del sueldo bruto en Argentina?',
      a: 'En relación de dependencia el descuento obligatorio es del 17% del bruto: 11% de jubilación al SIPA (ley 24.241 art. 11), 3% de INSSJP–PAMI (ley 19.032) y 3% de obra social (ley 23.660). A eso se le suma el Impuesto a las Ganancias si el sueldo supera el mínimo no imponible, y la cuota sindical si estás afiliado.',
    },
    {
      q: '¿Los aportes se calculan sobre todo el sueldo, por alto que sea?',
      a: 'No. El artículo 9 de la ley 24.241 fija una base imponible máxima —el famoso tope SIPA— que se actualiza por movilidad. Arriba de ese bruto los tres aportes se calculan sobre el tope y no sobre el sueldo total, así que el descuento efectivo baja del 17% y el neto crece más rápido.',
    },
    {
      q: '¿Por qué el neto no es simplemente el bruto menos 17%?',
      a: 'Porque encima de los aportes puede haber Impuesto a las Ganancias, que es progresivo: se aplica por tramos sobre el bruto menos aportes menos las deducciones personales. Un sueldo alto puede terminar con un descuento total del 25% o más; uno bajo, con exactamente 17%.',
    },
    {
      q: '¿Cuánto bruto necesito para cobrar un neto determinado?',
      a: 'No hay una fórmula directa porque Ganancias es progresivo. Se resuelve por aproximación: se prueban brutos hasta dar con el que, después de descontar aportes e impuesto, deja el neto buscado. Por eso el caso "de neto a bruto" itera en vez de dividir por 0,83.',
    },
    {
      q: '¿El aguinaldo también paga aportes?',
      a: 'Sí. El SAC es remuneración: se le descuentan los mismos aportes del 17% y forma parte de la base de Ganancias del mes en que se cobra. Se liquida en junio y en diciembre y equivale a la mitad de la mejor remuneración mensual del semestre (LCT art. 121 y 122).',
    },
    {
      q: '¿Cómo se valúan las vacaciones en el recibo?',
      a: 'El valor del día de vacaciones es el sueldo mensual dividido 25 (LCT art. 155), no dividido 30. Los días dependen de la antigüedad (LCT art. 150): 14 días hasta 5 años, 21 de 5 a 10, 28 de 10 a 20 y 35 a partir de los 20 años.',
    },
    {
      q: '¿La cuota sindical es obligatoria?',
      a: 'Sólo si estás afiliado al sindicato. La cuota de afiliación (habitualmente 2% o 3% del bruto) se descuenta con tu consentimiento. Distinto es el aporte solidario que fija algún convenio para no afiliados: ese sí puede ser obligatorio dentro del ámbito de la CCT. En ambos casos la cuota es deducible de la base de retención de Ganancias (RG 4003, anexo II), así que descontarla te baja también el impuesto.',
    },
    {
      q: '¿Un monotributista tiene descuentos del 17%?',
      a: 'No. El monotributista paga una cuota mensual fija que ya incluye el componente impositivo, el aporte jubilatorio al SIPA y el aporte a la obra social. Además tributa Ingresos Brutos provinciales sobre lo que factura. Como contrapartida no cobra aguinaldo, vacaciones pagas ni indemnización.',
    },
    {
      q: '¿Cuánto le cuesto realmente a mi empleador?',
      a: 'Además de tu bruto, el empleador paga contribuciones patronales de alrededor del 26,4% (Dec. 814/01 más obra social ley 23.660), y aparte la alícuota de la ART y el seguro de vida obligatorio. Sobre un bruto de $1.500.000, el costo laboral mensual ronda los $1.900.000 sin contar ART.',
    },
    {
      q: '¿Qué pasa si tengo dos trabajos en relación de dependencia?',
      a: 'Cada empleador te descuenta aportes por separado, pero Ganancias se liquida sobre la suma. Tenés que designar en el SiRADIG al empleador que paga la mayor remuneración como agente de retención e informarle el resto de los ingresos, o vas a terminar con una diferencia a pagar en la declaración jurada.',
    },
  ],

  sources: [
    {
      name: 'Ley 24.241 del Sistema Integrado de Jubilaciones y Pensiones — arts. 9 y 11 (base imponible máxima y aporte del 11%)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/639/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto actualizado',
    },
    {
      name: 'Bases imponibles mínima y máxima para aportes — valores vigentes',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/343717/20260630',
      publisher: 'ANSES — Resolución 186/2026',
      date: 'julio 2026',
    },
    {
      name: 'Ley de Contrato de Trabajo 20.744 — arts. 121, 122, 128, 150 y 155 (aguinaldo, pago y vacaciones)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Impuesto a las Ganancias — escala del art. 94 y deducciones personales del art. 30, período 2026',
      url: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/',
      publisher: 'ARCA (ex AFIP)',
      date: '2026',
    },
    {
      name: 'Monotributo — cuotas y escalas vigentes',
      url: 'https://www.afip.gob.ar/monotributo/categorias.asp',
      publisher: 'ARCA (ex AFIP)',
      date: '2026',
    },
  ],

  replaces: [
    '/calculadora-sueldo-bruto-desde-neto',
    '/sueldo-en-mano-argentina',
    '/simulador-recibo-de-sueldo-argentina',
    '/calculadora-sueldo-neto-autonomo-monotributista',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-bonus-anual-marco-fiscal-neto',
  ],

  lastReviewed: '2026-07-31',
  audience: 'AR',
};
