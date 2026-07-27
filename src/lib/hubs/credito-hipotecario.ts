import type { HubData } from './types';
import tasasLive from '../../data/live/tasas.json';
import inflacionLive from '../../data/live/inflacion.json';

/**
 * Hub de decisión — "¿Califico para un crédito hipotecario UVA?"
 * Arquetipo RAMIFICADO. Absorbe 9 calculadoras sueltas (ver hub.replaces).
 *
 * EL VALOR DEL UVA NO SE HARDCODEA. Sale del snapshot vivo del pipeline de
 * datos (`src/data/live/tasas.json`, serie 31 del BCRA, refrescada por el cron
 * de datos), igual que el hub de aumento de alquiler resuelve el ICL desde
 * `_bcra-icl.ts`. Si mañana el UVA vale otra cosa, el hub se entera solo.
 *
 * La inflación de referencia sale de `src/data/live/inflacion.json` (INDEC):
 * es el default del campo "inflación anual estimada", que es la variable que
 * define el riesgo real del crédito UVA.
 */

/** Valor del UVA en pesos, del snapshot vivo del BCRA (serie 31). */
export const UVA_HOY: number = Number(tasasLive?.uva?.valor) || 0;
/** Fecha del valor de UVA publicado. */
export const UVA_FECHA: string = String(tasasLive?.uva?.fecha || '');
/** Inflación acumulada de los últimos 12 meses según INDEC, en %. */
export const INFLACION_12M: number = Number(inflacionLive?.acumulado_12m_pct) || 0;

function fechaCorta(iso: string): string {
  const p = iso.split('-');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : iso;
}

export const hub: HubData = {
  slug: 'vivienda/credito-hipotecario',
  title: '¿Califico para un crédito hipotecario UVA? — Cuota, ingreso mínimo y bancos 2026',
  description:
    'Calculá cuánto te prestan con tu sueldo, la cuota del crédito hipotecario UVA, el ingreso mínimo que piden los bancos y cuánto crece la cuota con la inflación. Con el valor del UVA del BCRA actualizado y la comparación contra tasa fija.',
  silo: 'Vivienda',
  siloHref: '/vivienda',

  eyebrow: 'Guía y estimación de crédito hipotecario',
  h1: '¿Califico para un crédito hipotecario UVA?',
  lede:
    'Los bancos miran una sola cosa: que la cuota no se coma más del 25% de tu ingreso. Partimos de ahí —cuánto te prestan con tu sueldo— y después mirás la cuota, el riesgo de que suba con la inflación y qué banco conviene.',
  stamps: [
    'Actualizado 27-07-2026',
    `UVA $${UVA_HOY.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (BCRA, ${fechaCorta(UVA_FECHA)})`,
    '9 calculadoras adentro',
  ],

  resultLabel: 'Tu número del crédito',

  cases: {
    title: '¿Qué necesitás saber?',
    intro: 'Partimos de cuánto te prestan con tu sueldo, que es la pregunta que abre todo lo demás.',
    items: [
      {
        id: 'cuanto',
        label: 'Cuánto me prestan con mi sueldo',
        hint: 'El punto de partida · relación cuota/ingreso',
        answer: 'Te prestan lo que puedas pagar con una cuota del 25% de tu ingreso.',
        yes: [
          'Cuota máxima = ingreso neto × la relación cuota/ingreso que acepta el banco (25% es el estándar)',
          'Monto máximo = cuota máxima × (1 − (1 + i)^−n) ÷ i, con i = TNA en UVA ÷ 12 y n = plazo en meses',
          'El monto se convierte a UVAs con el valor del BCRA del día: eso es lo que realmente te prestan',
          'Valor de propiedad alcanzable con un anticipo del 25%, que es lo que financia la mayoría de los bancos',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'El banco evalúa ingresos demostrables: recibo de sueldo, monotributo o declaración jurada. Los ingresos informales no suman',
          'Si sumás cónyuge o codeudor, el ingreso se computa junto y el monto sube, pero también la responsabilidad de ambos',
          'Al monto del crédito hay que sumarle escritura, sellos, comisión inmobiliaria e hipoteca: entre 6% y 10% del valor de la propiedad, y eso va de tu bolsillo',
        ],
        plazo: 'la preaprobación de la mayoría de los bancos vale entre 30 y 90 días: el valor del UVA se mueve todos los días hasta la escritura.',
      },
      {
        id: 'cuota',
        label: 'Cuánto voy a pagar de cuota',
        hint: 'Sistema francés y proyección UVA',
        answer: 'La cuota arranca baja y sube todos los meses con la inflación.',
        yes: [
          'Cuota inicial por sistema francés: cuota fija en UVAs, variable en pesos',
          'Reparto capital/interés de la primera cuota: en un francés los primeros años son casi todo interés',
          'Proyección de la cuota en pesos a 12, 24 y 60 meses con la inflación que estimes',
          'Seguro de vida e incendio: alrededor de 0,06% del saldo por mes, que el banco suma a la cuota',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'La cuota en pesos sube TODOS los meses con el UVA: si tu sueldo no le sigue el ritmo, la relación cuota/ingreso se deteriora',
          'La mayoría de los créditos tiene cláusula de alargue de plazo si la cuota supera en 10% la evolución del coeficiente de variación salarial: alivia la cuota pero estira la deuda',
          'El total pagado que ves es en pesos de hoy: nominalmente vas a pagar mucho más',
        ],
        plazo: 'la cuota se recalcula todos los meses con el UVA del día de vencimiento.',
      },
      {
        id: 'uva-vs-fija',
        label: 'UVA vs tasa fija',
        hint: 'Cuál termina más barato',
        answer: 'La UVA gana si la inflación baja; la tasa fija te cubre si se dispara.',
        yes: [
          'Comparación del total pagado con crédito UVA (capital ajustado por inflación, TNA real baja) contra tasa fija nominal alta',
          'Cuota inicial de cada opción: la UVA arranca mucho más baja, y ese es todo su atractivo',
          'La UVA conviene mientras la tasa fija nominal supere a la inflación esperada más la TNA real',
          'También sirve para comparar contra una hipoteca en dólares: ahí el riesgo pasa a ser la devaluación',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'El resultado es muy sensible al supuesto de inflación: cambiá ese campo y la conclusión puede darse vuelta',
          'Nadie sabe la inflación de los próximos 20 años. La comparación es un escenario, no un pronóstico',
          'En una hipoteca en dólares el riesgo no desaparece, cambia de nombre: si cobrás en pesos y el dólar salta, la cuota se vuelve impagable',
        ],
        plazo: 'revisá el escenario cada vez que cambie el régimen de inflación, no una sola vez al firmar.',
      },
      {
        id: 'bancos',
        label: 'Comparar bancos',
        hint: 'Misma plata, distinta cuota',
        answer: 'Un punto de TNA cambia la cuota más de lo que parece.',
        yes: [
          'Cuota inicial del mismo crédito con las TNA en UVA de referencia de cada banco',
          'Diferencia de cuota y de total pagado entre el banco más barato y el más caro',
          'Ser cliente con acreditación de haberes suele bajar entre 1 y 2 puntos la TNA',
          'El CFT es lo comparable de verdad: suma seguros, gastos de otorgamiento y administración',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'Las TNA de referencia cambian seguido: confirmá la vigente en la web del banco antes de decidir',
          'La tasa más baja puede venir con requisitos de acreditación de haberes o de antigüedad que no cumplís',
          'Comparar por cuota inicial engaña: mirá el CFT y el total, porque los seguros y gastos varían mucho entre entidades',
        ],
        plazo: 'las tasas publicadas suelen revisarse mensualmente; una preaprobación no congela la tasa hasta la escritura.',
      },
    ],
  },

  inputsTitle: 'Completá tus datos',
  inputsIntro: 'Con tu ingreso, el monto y el plazo alcanza. El valor del UVA lo trae el hub desde el BCRA.',
  fields: [
    { id: 'ingreso', label: 'Ingreso neto mensual del grupo familiar', prefix: '$', value: '1.800.000', thousands: true, help: 'Sumá el ingreso demostrable del cónyuge o codeudor si van juntos.' },
    {
      id: 'relacion',
      label: 'Relación cuota/ingreso que acepta el banco',
      type: 'select',
      value: '25',
      options: [
        { value: '20', label: '20% — criterio conservador' },
        { value: '25', label: '25% — el estándar del mercado' },
        { value: '30', label: '30% — algunos bancos con codeudor' },
      ],
    },
    { id: 'monto', label: 'Monto del crédito que querés pedir', prefix: '$', value: '100.000.000', thousands: true, help: 'Se usa en las ramas de cuota, UVA vs fija y bancos.' },
    { id: 'plazo', label: 'Plazo', type: 'number', suffix: 'años', min: 1, max: 30, step: 1, value: 20 },
    { id: 'tna', label: 'TNA en UVA (tasa real del crédito)', type: 'number', suffix: '%', min: 0, max: 20, step: 0.25, value: 5.5, help: 'Banco Nación 5,5% · Santander 4,75% · Hipotecario 6,25% · Galicia 7% · Macro 7,5%.' },
    { id: 'inflacion', label: 'Inflación anual estimada', type: 'number', suffix: '%', min: 0, max: 300, step: 0.5, value: INFLACION_12M, help: `Arranca en la inflación de los últimos 12 meses según INDEC (${INFLACION_12M}%). Es la variable que define el riesgo del UVA.` },
    { id: 'tnaFija', label: 'TNA de un crédito a tasa fija en pesos', type: 'number', suffix: '%', min: 0, max: 300, step: 0.5, value: 42, help: 'Sólo se usa en la rama "UVA vs tasa fija".' },
    {
      id: 'anticipo',
      label: 'Anticipo que podés poner',
      type: 'select',
      value: '25',
      options: [
        { value: '20', label: '20% del valor de la propiedad' },
        { value: '25', label: '25% — lo habitual' },
        { value: '30', label: '30%' },
        { value: '40', label: '40%' },
      ],
    },
    { id: 'uva', label: 'Valor del UVA', type: 'number', prefix: '$', min: 1, step: 0.01, value: UVA_HOY, help: `Traído del BCRA al ${fechaCorta(UVA_FECHA)}. Cambialo sólo si tenés un valor más nuevo.` },
  ],
  fineprint:
    'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir. En un crédito UVA la cuota en pesos sube todos los meses con la inflación.',

  chart: {
    type: 'stacked',
    title: 'De tu cuota, cuánto es interés y cuánto capital',
    caption:
      'La barra parte la primera cuota del sistema francés en interés, capital y seguros. En un crédito a 20 años los primeros años son casi todo interés: recién hacia la mitad del plazo empezás a amortizar en serio. Es el dato que la cuota mensual esconde.',
  },
  breakdownTitle: 'Tus números, uno por uno',
  breakdownIntro:
    'Los montos van en pesos; las filas de UVAs, años y porcentajes traen su propia unidad. La proyección de cuota usa la inflación anual que cargaste.',

  faq: [
    {
      q: '¿Cuánto ingreso necesito para un crédito hipotecario UVA?',
      a: 'La regla del mercado es que la cuota no supere el 25% de tu ingreso neto. Con una TNA en UVA de 5,5% a 20 años, cada 10 millones de pesos de crédito dan una cuota de unos 68.800 pesos, más unos 6.000 de seguros: hacen falta cerca de 300.000 pesos de ingreso neto por cada 10 millones que quieras pedir. Podés sumar el ingreso del cónyuge o de un codeudor.',
    },
    {
      q: '¿Cómo se calcula la cuota de un crédito UVA?',
      a: 'El capital se convierte a UVAs al valor del día y la cuota se calcula por sistema francés sobre ese capital, con la TNA real del banco. La cuota queda fija en UVAs para todo el plazo, pero cada mes se paga multiplicada por el UVA vigente, que sigue a la inflación. Por eso en pesos la cuota sube y en UVAs no se mueve.',
    },
    {
      q: '¿Qué es el UVA y cuánto vale hoy?',
      a: `La UVA (Unidad de Valor Adquisitivo) es la unidad de cuenta que creó el BCRA en 2016 para indexar créditos y depósitos: se actualiza por el CER, que sigue al IPC del INDEC. Al ${fechaCorta(UVA_FECHA)} vale $${UVA_HOY.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, y esta página lo toma directo de la serie oficial del BCRA, no de un número escrito a mano.`,
    },
    {
      q: '¿Cuánto sube la cuota de un crédito UVA por año?',
      a: 'Sube lo mismo que la inflación, con un rezago de aproximadamente 45 días por cómo se construye el CER. Con inflación anual del 30%, una cuota de 300.000 pesos pasa a unos 390.000 al año siguiente y a 507.000 al segundo. El crédito es sostenible sólo si tu ingreso se actualiza a un ritmo parecido.',
    },
    {
      q: '¿Conviene UVA o tasa fija?',
      a: 'La UVA conviene si la tasa fija nominal es más alta que la inflación esperada sumada a la TNA real del UVA. Con tasa fija en 42% e inflación esperada del 30%, la UVA al 5,5% real queda cerca en costo total, pero con una cuota inicial mucho más baja. Si esperás que la inflación se dispare, la tasa fija te protege; si esperás que baje, la UVA gana.',
    },
    {
      q: '¿Por qué al principio pago casi todo interés?',
      a: 'Es la mecánica del sistema francés: la cuota es constante, y el interés de cada mes se calcula sobre el saldo, que al principio es todo el capital. En un crédito a 20 años al 5,5% real, la primera cuota es 67% interés y 33% capital, y recién a los 7 años y medio la mitad de la cuota amortiza capital. A 30 años al 4,75% arranca en 76% interés.',
    },
    {
      q: '¿Qué diferencia hay entre sistema francés y alemán?',
      a: 'En el francés la cuota es constante y la amortización de capital crece con el tiempo. En el alemán la amortización de capital es fija (capital ÷ meses) y la cuota arranca más alta y baja mes a mes. El alemán paga menos intereses en total, pero exige más ingreso al inicio, y por eso casi ningún banco argentino lo ofrece para hipotecas.',
    },
    {
      q: '¿Qué gastos hay además de la cuota?',
      a: 'Escritura y honorarios del escribano (alrededor del 2% del valor), impuesto de sellos (1,8% en CABA, y en muchos casos exento para vivienda única), comisión inmobiliaria (hasta 3%+IVA para el comprador), gastos de otorgamiento y tasación del banco, y los seguros de vida e incendio que se suman a la cuota. En total entre 6% y 10% del valor, y no se financian.',
    },
    {
      q: '¿Cuánto financian los bancos?',
      a: 'Entre el 70% y el 80% del valor de tasación de la propiedad, tomando siempre el menor entre tasación y precio de compra. Es decir que necesitás un anticipo de 20% a 30% más los gastos de escrituración. Algunos bancos llegan al 100% con productos específicos, pero con tasas bastante más altas.',
    },
    {
      q: '¿Puedo cancelar el crédito antes de tiempo?',
      a: 'Sí. La normativa del BCRA obliga a admitir la precancelación total o parcial; puede haber comisión si se precancela antes de la cuarta parte del plazo o de los 180 días. Al precancelar parcial elegís si baja la cuota o se acorta el plazo: acortar el plazo ahorra muchos más intereses.',
    },
    {
      q: '¿Qué pasa si la cuota se me va de las manos?',
      a: 'La mayoría de los créditos UVA incluye una cláusula que permite extender el plazo hasta 25% si la cuota supera en más de 10% la evolución del coeficiente de variación salarial. Baja la cuota pero alarga la deuda y suma intereses. Es un paracaídas, no una solución: por eso conviene entrar con la cuota bien por debajo del 25% del ingreso.',
    },
  ],

  sources: [
    {
      name: 'BCRA — Principales variables (serie UVA, base 31/03/2016)',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
      date: fechaCorta(UVA_FECHA),
    },
    {
      name: 'BCRA — Unidad de Valor Adquisitivo (UVA) y CER: preguntas frecuentes',
      url: 'https://www.bcra.gob.ar/BCRAyVos/UVA.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'INDEC — Índice de precios al consumidor (IPC)',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Banco Nación — Créditos hipotecarios',
      url: 'https://www.bna.com.ar/Personas/CreditosHipotecarios',
      publisher: 'Banco de la Nación Argentina',
    },
    {
      name: 'Banco Hipotecario — Créditos hipotecarios UVA',
      url: 'https://www.hipotecario.com.ar/creditos-hipotecarios/',
      publisher: 'Banco Hipotecario',
    },
    {
      name: 'Santander Argentina — Crédito hipotecario UVA',
      url: 'https://www.santander.com.ar/banco/online/personas/prestamos/hipotecarios',
      publisher: 'Banco Santander Argentina',
    },
    {
      name: 'BCRA — Texto ordenado sobre precancelación de préstamos',
      url: 'https://www.bcra.gob.ar/Pdfs/Texord/t-pol-cre.pdf',
      publisher: 'Banco Central de la República Argentina',
    },
  ],

  replaces: [
    '/calculadora-credito-uva-cuota-actual',
    '/calculadora-cuota-credito-hipotecario-uva-banco-nacion',
    '/calculadora-amortizacion-prestamo-frances-aleman',
    '/calculadora-credito-uva-vs-tasa-fija',
    '/calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion',
    '/calculadora-hipoteca-mensual-cuota-fija',
    '/calculadora-hipoteca-uva-santander-argentina',
    '/calculadora-capacidad-credito-hipotecario',
    '/calculadora-hipoteca-divisa-extranjera-vs-uva',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** TNA en UVA de referencia por banco (2026). Confirmar siempre en la web del banco. */
export const TASAS_BANCO: Array<{ id: string; label: string; tna: number }> = [
  { id: 'santander', label: 'Santander', tna: 4.75 },
  { id: 'nacion', label: 'Banco Nación', tna: 5.5 },
  { id: 'hipotecario', label: 'Hipotecario', tna: 6.25 },
  { id: 'galicia', label: 'Galicia', tna: 7 },
  { id: 'macro', label: 'Macro', tna: 7.5 },
];

/** Constantes del cálculo hipotecario. */
export const HIPOTECA = {
  /** Seguro de vida + incendio, como fracción del saldo por mes. */
  SEGURO_MENSUAL: 0.0006,
  /** Gastos de escrituración, sellos y comisión, como fracción del valor. */
  GASTOS_ESCRITURA: 0.08,
  /** Meses que proyecta el hub para mostrar el riesgo UVA. */
  PROYECCION_MESES: [12, 24, 60],
};
