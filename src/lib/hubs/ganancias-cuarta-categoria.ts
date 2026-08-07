import type { HubData } from './types';

export const hub: HubData = {
  slug: 'impuestos/ganancias-cuarta-categoria',
  title: 'Calcular Impuesto a las Ganancias sobre el sueldo 2026',
  description:
    'Calculá el impuesto a las ganancias sobre tu sueldo: si te retienen cuarta categoría y cuánto, sueldo mensual, aguinaldo, pase de monotributo a régimen general y saldo a favor de la liquidación anual. Escala del art. 94 y deducciones del art. 30 vigentes en 2026.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Guía y estimación impositiva',
  h1: '¿Me descuentan Ganancias del sueldo? Calculá el impuesto de cuarta categoría',
  lede:
    'Partimos del caso más habitual: el descuento mes a mes del recibo. Cargá tu bruto y tus cargas de familia y mirá en qué tramo de la escala caés. Si tu situación es otra —aguinaldo, pase al régimen general o saldo a favor— la cambiás abajo.',
  stamps: ['Actualizado 07-08-2026', 'Escala art. 94 LIG vigente', '8 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué querés averiguar?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'mensual',
        label: 'Cuánto me descuentan del sueldo por mes',
        hint: 'El caso más común',
        answer: 'La retención sale de tu bruto menos aportes y menos las deducciones del art. 30.',
        yes: [
          'Sueldo bruto mensual menos aportes personales del 17% (jubilación 11%, PAMI 3%, obra social 3%)',
          'Menos la ganancia no imponible y la deducción especial incrementada de empleados (art. 30 inc. a y c apt. 2)',
          'Menos cónyuge e hijos a cargo declarados en SiRADIG',
          'Sobre lo que queda se aplica la escala progresiva del art. 94, tramo por tramo',
        ],
        warn: [
          'Los aportes se calculan hasta la base imponible máxima: si tu bruto la supera, el descuento deja de ser el 17% pleno y la base de Ganancias sube',
          'Sin SiRADIG presentado, el empleador retiene sin ninguna de tus deducciones personales opcionales',
        ],
        plazo: 'el SiRADIG se puede cargar durante todo el año; el 31 de marzo es el cierre para incidir en la liquidación anual del período anterior.',
      },
      {
        id: 'aguinaldo',
        label: 'Cuánto me sacan del aguinaldo',
        hint: 'SAC de junio y diciembre',
        answer: 'El SAC se prorratea: suma una doceava parte a la base de cada mes.',
        yes: [
          'El medio aguinaldo equivale a medio sueldo bruto por semestre',
          'ARCA lo prorratea en doceavos: la base mensual sube un 8,33% durante todo el año',
          'La retención extra por el SAC es la diferencia entre el impuesto anual con aguinaldo y sin aguinaldo',
        ],
        warn: [
          'El aguinaldo puede empujarte a un tramo superior de la escala y subir tu alícuota marginal',
          'Si el empleador no prorrateó, en junio y diciembre te vas a encontrar con un descuento mucho más grande de golpe',
        ],
        plazo: 'el SAC se paga el 30 de junio y el 18 de diciembre; el prorrateo corre todo el año.',
      },
      {
        id: 'monotributo',
        label: 'Soy monotributista y paso a régimen general',
        hint: 'Comparar carga fiscal',
        answer: 'En régimen general pagás Ganancias sobre la utilidad, no una cuota fija.',
        yes: [
          'Facturación anual menos gastos deducibles = utilidad sujeta a impuesto',
          'Menos la ganancia no imponible del art. 30 inc. a',
          'Menos la deducción especial de autónomos del art. 30 inc. c apt. 1 (más baja que la de empleados en relación de dependencia)',
          'Sobre el remanente, la misma escala del art. 94 que se le aplica a un empleado',
          'Del otro lado, la cuota fija mensual del monotributo de tu categoría, anualizada',
        ],
        warn: [
          'La deducción especial de autónomos exige tener los aportes previsionales al día: si estás en mora, no la podés computar y el impuesto sube',
          'Tampoco entra el IVA, ni Ingresos Brutos, ni los aportes autónomos, que también cambian al pasarte',
          'Si superás el tope de facturación de tu categoría, la exclusión es automática y retroactiva',
        ],
        plazo: 'la recategorización es en enero y julio; la exclusión por exceso de tope opera desde el mes en que ocurre.',
      },
      {
        id: 'saldo-favor',
        label: 'Quiero ver si tengo saldo a favor',
        hint: 'Liquidación anual F.1357',
        answer: 'Si te retuvieron más que el impuesto anual determinado, te lo devuelven.',
        yes: [
          'Total retenido en el año según tus recibos o el F.1357',
          'Contra el impuesto anual determinado sobre tu ganancia neta',
          'La diferencia a favor se devuelve en la liquidación anual que hace el empleador',
        ],
        warn: [
          'Las deducciones que no cargaste en SiRADIG no entran en la liquidación anual: ese dinero no vuelve solo',
          'Si el saldo es a pagar, el empleador te lo retiene en las cuotas siguientes',
        ],
        plazo: 'la liquidación anual se practica hasta el 30 de abril y se devuelve en el recibo de mayo.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después. Los últimos tres campos sólo pesan en su caso.',
  fields: [
    { id: 'bruto', label: 'Sueldo bruto mensual (o facturación mensual)', prefix: '$', value: '3.500.000', thousands: true },
    {
      id: 'conyuge',
      label: 'Cónyuge a cargo',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
    },
    { id: 'hijos', label: 'Hijos a cargo', type: 'number', min: 0, max: 10, value: 0 },
    { id: 'siradig', label: 'Otras deducciones por mes (SiRADIG)', prefix: '$', value: '0', thousands: true },
    { id: 'retenciones', label: 'Ganancias retenida en todo el año (saldo a favor)', prefix: '$', value: '0', thousands: true },
    {
      id: 'categoria',
      label: 'Categoría de monotributo actual',
      type: 'select',
      value: 'H',
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
    },
  ],
  fineprint:
    'Es una orientación. Convenios, adicionales no remunerativos, pluriempleo y deducciones particulares pueden cambiar el resultado. La retención real la determina tu empleador con la RG 4003.',

  chart: {
    type: 'steps',
    title: 'Escalera de tramos del art. 94',
    caption:
      'La escala del art. 94 es progresiva: cada tramo grava sólo el excedente que cae dentro de él. El gráfico muestra cuánto impuesto aporta cada escalón y en cuál caé tu base imponible.',
  },
  breakdownTitle: 'Cómo se arma la base y el impuesto',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Desde qué sueldo bruto se paga Ganancias en 2026?',
      a: 'Depende de tus cargas de familia. Un soltero sin hijos empieza a tributar cuando su bruto supera aproximadamente el mínimo no imponible dividido 0,83 (por el 17% de aportes). Con cónyuge e hijos declarados en SiRADIG el piso sube varios cientos de miles de pesos. El hub calcula tu umbral exacto con los valores del art. 30 vigentes.',
    },
    {
      q: '¿Cómo calcular el impuesto a las ganancias sobre el sueldo?',
      a: 'Arrancá del bruto mensual y restale los aportes personales del 17% (jubilación 11%, PAMI 3%, obra social 3%). A ese neto restale la ganancia no imponible, la deducción especial incrementada de empleados y las cargas de familia que hayas declarado en SiRADIG. Lo que queda es tu base imponible: sobre ella se aplica la escala progresiva del art. 94, tramo por tramo, del 5% al 35%. El impuesto anual se divide en retenciones mensuales que practica tu empleador según la RG 4003. El hub de arriba hace exactamente esa cuenta con los valores vigentes del art. 30.',
    },
    {
      q: '¿Qué es la cuarta categoría?',
      a: 'Es la categoría del Impuesto a las Ganancias que grava las rentas del trabajo personal: empleados en relación de dependencia, jubilados, directores de sociedades y profesionales. Está definida en el art. 82 de la ley 20.628 y el empleador actúa como agente de retención.',
    },
    {
      q: '¿La escala del art. 94 se aplica sobre todo mi sueldo?',
      a: 'No. Es progresiva por tramos: el primer escalón grava al 5% sólo la primera porción de la base imponible, el siguiente al 9% únicamente el excedente, y así hasta el 35%. Tu alícuota marginal es la del último tramo alcanzado, y siempre es más alta que la alícuota efectiva sobre el total.',
    },
    {
      q: '¿Cuánto me descuentan del aguinaldo?',
      a: 'ARCA obliga a prorratear el SAC: se suma una doceava parte del aguinaldo a la base imponible de cada mes, para que no haya un salto en junio y diciembre. El impacto anual equivale a la diferencia entre calcular el impuesto sobre 13 sueldos y sobre 12.',
    },
    {
      q: '¿Qué deducciones puedo cargar en el SiRADIG?',
      a: 'Cónyuge e hijos a cargo, alquiler de vivienda (40% con tope de la ganancia no imponible), cuota médico asistencial, gastos médicos, intereses de crédito hipotecario, servicio doméstico, seguros de vida, donaciones y aportes a sociedades de garantía recíproca, entre otras. Se cargan en el portal SiRADIG - Trabajador con clave fiscal.',
    },
    {
      q: '¿Cuándo me devuelven el saldo a favor?',
      a: 'En la liquidación anual (F.1357) que practica el empleador hasta el 30 de abril del año siguiente. Si te retuvieron de más, la devolución aparece en el recibo del mes siguiente, habitualmente mayo. Si el saldo es a pagar, te lo retienen en las cuotas posteriores.',
    },
    {
      q: '¿Conviene pasar de monotributo a régimen general?',
      a: 'Depende de tus gastos deducibles y de si podés computar IVA crédito fiscal. Con márgenes altos y pocos gastos, el monotributo suele ganar; con muchos gastos con factura A y clientes responsables inscriptos, el régimen general puede resultar más barato. La comparación de este hub mira sólo Ganancias contra la cuota fija: sumá IVA, Ingresos Brutos y autónomos antes de decidir.',
    },
    {
      q: '¿Los aportes jubilatorios se descuentan de la base de Ganancias?',
      a: 'Sí. Jubilación (11%), PAMI (3%) y obra social (3%) son deducibles y salen de la base antes de aplicar la escala. Ojo: se calculan hasta la base imponible máxima previsional, así que en sueldos muy altos el descuento deja de crecer y la base de Ganancias sube más rápido.',
    },
    {
      q: '¿Qué pasa si tengo dos trabajos?',
      a: 'Retiene el empleador que te paga la mayor remuneración. Tenés que declarar el otro empleo y sus haberes en el SiRADIG para que la retención se calcule sobre la suma de ambos; si no lo hacés, cada uno retiene de menos y en la liquidación anual te queda saldo a pagar.',
    },
    {
      q: '¿Las horas extras y el bono anual pagan Ganancias?',
      a: 'El bono y los premios pagan como remuneración común. Las horas extras tienen tratamiento diferencial: el excedente entre lo cobrado por hora extra y lo que hubieran valido esas horas como ordinarias está exento según la ley 27.743.',
    },
  ],

  sources: [
    {
      name: 'Ley 20.628 de Impuesto a las Ganancias — arts. 30, 82 y 94 (texto ordenado)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/44911/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Tabla del art. 94 LIG — escala vigente para el período 2026',
      url: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-ene-a-jun-2026.pdf',
      publisher: 'ARCA (ex AFIP)',
      date: 'período 2026',
    },
    {
      name: 'Deducciones personales del art. 30 — importes vigentes 2026',
      url: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-ene-a-jun-2026.pdf',
      publisher: 'ARCA (ex AFIP)',
      date: 'período 2026',
    },
    {
      name: 'RG 4003/2017 — régimen de retención de cuarta categoría y SiRADIG',
      url: 'https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-4003-2017-272205',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Ley 27.743 — actualización de deducciones y escala',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/310052/20240708',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '08-07-2024',
    },
  ],

  relatedPosts: [
    {
      href: '/blog/escala-ganancias-2026-argentina-tabla-completa-explicada',
      title: 'La escala de Ganancias 2026, tramo por tramo',
      note: 'La tabla completa con las alícuotas de cada tramo, explicada.',
    },
  ],

  replaces: [
    '/calculadora-impuesto-ganancias-sueldo',
    '/calculadora-ganancias-empleados-4ta-categoria-2026',
    '/calculadora-ganancias-aguinaldo-sac-retencion',
    '/calculadora-cuarta-categoria-empleado-empresa-argentina',
    '/calculadora-ganancias-tramos-empleado-mensual-2026',
    '/calculadora-retencion-ganancias-siradig-trabajador',
    '/calculadora-ganancias-monotributista-pase-regimen-general',
    '/calculadora-devolucion-ganancias-4ta-saldo-favor',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-ganancias-segunda-categoria-renta-financiera-2026',
  ],

  lastReviewed: '2026-08-07',
  audience: 'AR',
};
