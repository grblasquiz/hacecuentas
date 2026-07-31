import type { HubData } from '../types';
import { SUBSIDIO_ARRIENDO_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Me conviene seguir arrendando o comprar?"
 *
 * Absorbe cuatro calculadoras: arriendo vs comprar a 10 años, precio de arriendo por
 * comuna, reajuste del arriendo por IPC y subsidio de arriendo MINVU.
 *
 * La UF es dato VIVO (src/data/live/chile.json, mindicador.cl). Todo el mercado
 * inmobiliario chileno cotiza en UF y los topes del subsidio están en UF: acá NUNCA
 * se hardcodea la UF en pesos.
 *
 * Diferencias deliberadas con la fórmula original
 * (src/lib/formulas/arriendo-vs-comprar-chile-10-anos-uf.ts):
 *  1. El impuesto de timbres se aplica al MONTO DEL CRÉDITO, no al precio de la
 *     vivienda. El DL 3.475 grava la operación de crédito de dinero, no la compraventa.
 *     La original cobraba 0,8% sobre el precio completo: sobresestima el timbre en
 *     1/(1−pie) (con pie 20%, un 25% de más).
 *  2. La tasa de timbres es seleccionable: 0,8% general, 0,2% si la vivienda está
 *     acogida al DFL 2 y 0% en vivienda social (Art. 24 DL 3.475). La original cobraba
 *     0,8% a todo el mundo.
 *  3. La inscripción en el Conservador usa el arancel real (0,2% del precio con tope),
 *     no el 1,5% fijo de "notaría + inscripción" de la original.
 *  4. El horizonte es configurable, no 10 años fijos.
 *  5. No se replica la "TIR" de la original: era Math.pow() de un cociente que puede ser
 *     negativo → NaN, y no es una TIR.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Indicadores vivos, con el mismo fallback que usan las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/** Subsidio de Arriendo MINVU, llamado 2026 — verificado en src/lib/data/chile-2026.ts. */
export const SUBSIDIO = SUBSIDIO_ARRIENDO_2026;

/**
 * Impuesto de timbres y estampillas sobre el mutuo hipotecario — DL 3.475.
 * 0,8% general · 0,2% para viviendas acogidas al DFL 2 · exento en vivienda social.
 */
export const TIMBRES = {
  general: 0.008,
  dfl2: 0.002,
  social: 0,
};

/**
 * Arancel del Conservador de Bienes Raíces: 0,2% del precio con tope.
 * TOPE EDITABLE: el arancel lo fija cada Conservador y el de Santiago lo reajusta.
 * Valor de referencia del CBR de Santiago a julio de 2026.
 */
export const CBR = {
  tasa: 0.002,
  topeClp: 264_200,
  fechaDato: 'julio de 2026',
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
const uf2 = (n: number) =>
  n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'cl/hogar/arrendar-o-comprar',
  title: 'Arrendar o comprar en Chile: qué conviene según los números',
  description:
    'Compara el costo total de seguir arrendando —con el reajuste por IPC que dice tu contrato— contra comprar con pie y crédito hipotecario en UF. Incluye el subsidio de arriendo MINVU, el patrimonio que acumulas comprando y el año en que la compra se paga sola.',
  silo: 'Hogar',
  siloHref: '/cl/hogar',
  locale: 'cl',

  eyebrow: 'Chile · vivienda',
  h1: '¿Me conviene seguir arrendando o comprar?',
  lede:
    'Arrendar es un gasto que se va todos los meses y sube con el IPC. Comprar inmoviliza el pie, suma gastos que nadie cuenta y te deja un patrimonio. Pon el arriendo que pagas hoy y el precio de la vivienda que miras, y esta página compara las dos rutas en el mismo horizonte, con la UF de hoy.',
  stamps: [
    `UF de hoy: $${uf2(UF)}`,
    'DL 3.475 · DFL 2 · arancel CBR',
    `Subsidio de arriendo: ${SUBSIDIO.totalUf} UF, tope ${String(SUBSIDIO.topeMensualUf).replace('.', ',')} UF/mes`,
    '4 calculadoras en una',
  ],

  resultLabel: 'Diferencia a favor de comprar',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por la comparación completa: cuánto te cuesta arrendar el horizonte que elijas contra cuánto te cuesta comprar lo mismo.',
    items: [
      {
        id: 'comparar',
        label: 'Quiero comparar arrendar contra comprar',
        hint: 'La cuenta completa: arriendo reajustado por IPC contra dividendo, gastos de compra y patrimonio.',
        yes: [
          'Costo de arrendar el horizonte completo, con el arriendo y el gasto común reajustados por IPC cada año',
          'Costo de comprar: pie, gastos de escrituración y todos los dividendos del período',
          'Contribuciones, seguro de incendio y mantención de la propiedad',
          'Patrimonio al final: valor de la vivienda menos el saldo que aún debes',
          'El año en que la compra deja de ser más cara que el arriendo',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La revalorización de la vivienda es un supuesto tuyo, no una promesa: si el mercado no sube lo que pusiste, la compra rinde menos',
          'El crédito hipotecario está en UF, así que el dividendo sube en pesos aunque la tasa sea fija',
          'No se descuenta el costo de oportunidad de tener el pie invertido: si pudieras rentabilizarlo, la comparación se acerca',
        ],
        plazo:
          'la aprobación de un crédito hipotecario toma entre 2 y 6 semanas desde que entregas la carpeta al banco.',
        answer:
          'Comprar gana cuando el horizonte es largo: los gastos de entrada se diluyen y el capital amortizado se vuelve tuyo, mientras el arriendo sigue subiendo con el IPC.',
      },
      {
        id: 'arrendar',
        label: 'Sigo arrendando: quiero saber cuánto me va a costar',
        hint: 'Cuánto suma el arriendo en los próximos años y cuánto necesitas para entrar a uno nuevo.',
        yes: [
          'Arriendo y gasto común proyectados año a año con el IPC que estimes',
          'Total del período completo, en pesos de cada año',
          'Entrada para arrendar: mes de garantía, primer mes y gasto común',
          'Cuánto de tu ingreso se lleva el arriendo, que es lo que mira el corredor',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La garantía se devuelve al final del contrato descontando daños: no es un gasto, pero sí es plata inmovilizada',
          'La comisión de corretaje la paga quien lo pacte y suele ser medio mes o un mes más IVA',
          'Un contrato de arriendo de vivienda no tiene tope legal de reajuste: lo que manda es lo que firmaste',
        ],
        plazo:
          'el contrato de arriendo de vivienda urbana se rige por la Ley 18.101; el desahucio del arrendador tiene plazos mínimos según el tipo de contrato.',
        answer:
          'Arrendar cuesta poco de entrada y mucho acumulado: con IPC del 3% anual, diez años de arriendo suman cerca de 138 meses del arriendo inicial.',
      },
      {
        id: 'subsidio',
        label: 'Quiero postular al subsidio de arriendo MINVU',
        hint: 'Verifica si cumples los requisitos del llamado y cuánto cubriría de tu arriendo.',
        yes: [
          `Subsidio total de ${SUBSIDIO.totalUf} UF, en cuotas mensuales`,
          `Tope mensual de ${String(SUBSIDIO.topeMensualUf).replace('.', ',')} UF, o ${String(SUBSIDIO.topeMensualUfZonaEspecial).replace('.', ',')} UF en zona especial`,
          `Arriendo máximo de ${SUBSIDIO.arriendoMaxUf} UF, o ${SUBSIDIO.arriendoMaxUfZonaEspecial} UF en zona especial`,
          `Ahorro mínimo de ${SUBSIDIO.ahorroMinimoUf} UF en cuenta de ahorro para la vivienda`,
          `Ingreso del grupo familiar entre ${SUBSIDIO.ingresoMinUf} y ${SUBSIDIO.ingresoMaxUf} UF, más ${SUBSIDIO.ufExtraPorIntegranteDesde4to} UF por integrante desde el cuarto`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          `El Registro Social de Hogares tiene que estar hasta el tramo del ${SUBSIDIO.rshTramoMax}%: en el RSH un tramo más bajo significa mayor vulnerabilidad, no menor`,
          'Cumplir los requisitos no garantiza el subsidio: el MINVU selecciona por puntaje y por cupos disponibles del llamado',
          'El subsidio se paga contra un contrato de arriendo formal y una propiedad que cumpla el estándar: no sirve para un acuerdo de palabra',
          'Los topes están fijados en UF, así que el monto en pesos cambia todos los días',
        ],
        plazo: `el llamado 2026 recibe postulaciones entre el ${SUBSIDIO.postulacion.desde.split('-').reverse().join('-')} y el ${SUBSIDIO.postulacion.hasta.split('-').reverse().join('-')}, en minvu.cl con ClaveÚnica o en oficinas Serviu.`,
        answer:
          `El subsidio de arriendo aporta hasta ${SUBSIDIO.totalUf} UF en total, con un tope mensual de ${String(SUBSIDIO.topeMensualUf).replace('.', ',')} UF: alcanza para unos ${Math.floor(SUBSIDIO.totalUf / SUBSIDIO.topeMensualUf)} meses usando el tope completo.`,
      },
      {
        id: 'reajuste',
        label: 'Me reajustaron el arriendo, ¿es legal?',
        hint: 'Calcula el reajuste que corresponde según el IPC del período que dice tu contrato.',
        yes: [
          'Reajuste que corresponde aplicando el IPC acumulado del período pactado',
          'Arriendo nuevo y cuánto sube en pesos',
          'Comparación contra lo que efectivamente te cobraron',
          'Cuánto suma el reajuste en el año completo',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'En el arriendo de vivienda la ley chilena no fija un tope de reajuste: es válido lo que diga tu contrato, y si nada dice, no corresponde reajuste unilateral',
          'El IPC del período lo publica el INE: usa el acumulado del lapso exacto que pactaste, no la variación de doce meses si tu contrato dice otra cosa',
          'Un reajuste por sobre lo pactado no se vuelve exigible porque venga en el aviso: se reclama al arrendador y, si no hay acuerdo, en el Juzgado de Policía Local',
          'Si el contrato pactó reajuste en UF en vez de IPC, el cálculo es distinto: se multiplica por la UF del día de pago',
        ],
        plazo:
          'el INE publica el IPC del mes dentro de los primeros ocho días del mes siguiente.',
        answer:
          'El reajuste legítimo es el que pactaste en el contrato: el IPC acumulado del período aplicado sobre el arriendo vigente, ni un peso más.',
      },
    ],
  },

  inputsTitle: 'Tus números',
  inputsIntro:
    'La vivienda va en UF, que es como se cotiza en Chile; el arriendo va en pesos, que es como se paga. En el caso del reajuste, el campo de arriendo es el que pagas hoy y el de IPC es el acumulado del período.',
  fields: [
    {
      id: 'precioUf',
      label: 'Precio de la vivienda (UF)',
      suffix: 'UF',
      type: 'number',
      value: 3000,
      min: 200,
      max: 40000,
      step: 50,
      help: `Con la UF de hoy, 3.000 UF son ${fmt(3000 * UF)}.`,
    },
    {
      id: 'piePct',
      label: 'Pie que puedes poner',
      suffix: '%',
      type: 'number',
      value: 20,
      min: 0,
      max: 100,
      step: 1,
      help: 'Los bancos financian hasta el 80% del precio en la mayoría de los casos, así que el pie típico es 20%.',
    },
    {
      id: 'tasa',
      label: 'Tasa del crédito hipotecario (% anual en UF)',
      suffix: '%',
      type: 'number',
      value: 4.4,
      min: 0.5,
      max: 12,
      step: 0.05,
      help: 'Es tasa real: el crédito ya está en UF, así que la inflación va por fuera. Compara la tasa vigente en la CMF.',
    },
    {
      id: 'plazo',
      label: 'Plazo del crédito (años)',
      suffix: 'años',
      type: 'number',
      value: 25,
      min: 5,
      max: 30,
      step: 1,
    },
    {
      id: 'arriendo',
      label: 'Arriendo mensual que pagas o pagarías (CLP)',
      prefix: '$',
      value: '650.000',
      thousands: true,
      help: 'En el caso del reajuste, pon el arriendo vigente antes del aumento.',
    },
    {
      id: 'gastoComun',
      label: 'Gasto común mensual (CLP)',
      prefix: '$',
      value: '90.000',
      thousands: true,
      help: 'Lo pagas arriendes o compres, pero solo cuenta como diferencia si cambias de tipo de propiedad.',
    },
    {
      id: 'ipc',
      label: 'IPC anual estimado / acumulado del período',
      suffix: '%',
      type: 'number',
      value: 3.5,
      min: -5,
      max: 30,
      step: 0.1,
      help: 'Reajusta el arriendo año a año. En el caso "me reajustaron el arriendo" es el IPC acumulado del período que dice tu contrato.',
    },
    {
      id: 'revalorizacion',
      label: 'Revalorización anual esperada de la vivienda',
      suffix: '%',
      type: 'number',
      value: 2,
      min: -10,
      max: 15,
      step: 0.1,
      help: 'Supuesto tuyo, en UF reales. Es la variable que más mueve el resultado: prueba con 0% para ver el caso conservador.',
    },
    {
      id: 'anios',
      label: 'Horizonte de la comparación (años)',
      suffix: 'años',
      type: 'number',
      value: 10,
      min: 1,
      max: 30,
      step: 1,
      help: 'Cuánto tiempo piensas quedarte. Mientras más corto, más pesan los gastos de compra.',
    },
    {
      id: 'tipoVivienda',
      label: 'Tipo de vivienda (define el impuesto de timbres)',
      type: 'select',
      value: 'dfl2',
      options: [
        { value: 'dfl2', label: 'Acogida al DFL 2 (hasta 140 m²) — timbres 0,2%' },
        { value: 'general', label: 'Sin beneficio DFL 2 — timbres 0,8%' },
        { value: 'social', label: 'Vivienda social — exenta de timbres' },
      ],
      help: 'La mayoría de los departamentos nuevos de hasta 140 m² están acogidos al DFL 2. Pregúntalo antes de firmar: son varios cientos de miles de pesos.',
    },
    {
      id: 'contribuciones',
      label: 'Contribuciones anuales (UF)',
      suffix: 'UF',
      type: 'number',
      value: 8,
      min: 0,
      max: 500,
      step: 0.5,
      help: 'Impuesto territorial del año completo. Las viviendas bajo el avalúo exento no pagan.',
    },
    {
      id: 'arriendoCobrado',
      label: 'Arriendo nuevo que te comunicaron (CLP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Solo se usa en el caso del reajuste. Déjalo en 0 si únicamente quieres saber cuánto corresponde.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'bars',
    title: 'Arrendar contra comprar en tu horizonte',
    caption:
      'Compara lo que se va en arriendo contra el costo neto de ser dueño (todo lo desembolsado menos el patrimonio que te queda). La barra más baja es la ruta más barata.',
  },
  breakdownTitle: 'Peso por peso',
  breakdownIntro:
    'Las barras comparan cada concepto contra el mayor de la comparación. Lo que está en UF va marcado como tal.',

  faq: [
    {
      q: '¿A partir de cuántos años conviene comprar en vez de arrendar?',
      a: 'No hay un número único, pero el mecanismo sí es estable: comprar tiene un costo de entrada alto —pie, timbres, notaría, Conservador, tasación— que solo se amortiza con el tiempo, mientras que el arriendo no tiene entrada pero sube con el IPC todos los años y no deja nada. Con los parámetros típicos chilenos (pie 20%, tasa en torno al 4,5% en UF, plazo 25 años) el cruce suele caer entre el año 5 y el año 9. Mientras más corto tu horizonte, más conviene arrendar; si piensas mudarte en tres años, comprar casi nunca sale a favor.',
    },
    {
      q: '¿Por qué el dividendo sube si me dijeron que la tasa era fija?',
      a: 'Porque en Chile el crédito hipotecario se pacta en UF, no en pesos. La tasa fija significa que la tasa real no cambia, pero la cuota está expresada en UF y se paga en pesos al valor del día. Como la UF se reajusta con el IPC del mes anterior, tu dividendo en pesos sube aproximadamente con la inflación. Eso no es un cobro extra: es la manera chilena de aislar el crédito de la inflación, y por eso las tasas hipotecarias parecen bajas comparadas con las de países que prestan en moneda nominal.',
    },
    {
      q: '¿Cuánto es el impuesto de timbres de un crédito hipotecario?',
      a: 'La tasa general del DL 3.475 es 0,8% del monto del crédito. Pero si la vivienda está acogida al DFL 2 —el beneficio que cubre las viviendas económicas de hasta 140 m², que es la mayoría de los departamentos nuevos— la tasa baja a 0,2%, y la vivienda social está exenta. La diferencia no es menor: en un crédito de 2.400 UF, pasar de 0,8% a 0,2% son casi tres cuartos de millón de pesos. Además, el impuesto se calcula sobre el crédito, no sobre el precio de la propiedad: si pagas el 100% al contado, no hay timbres que pagar.',
    },
    {
      q: '¿Me pueden subir el arriendo lo que quieran?',
      a: 'En el arriendo de vivienda la ley chilena no fija un tope de reajuste: manda lo que hayas firmado. Si el contrato dice "reajuste anual según la variación del IPC", ese es el único aumento exigible y se calcula sobre el arriendo vigente. Si el contrato no dice nada sobre reajuste, el arrendador no puede subirlo unilateralmente durante la vigencia; puede proponerlo al renovar, y ahí tú decides si aceptas o te vas. Un aviso de aumento por sobre lo pactado no se vuelve exigible por venir escrito: se reclama al arrendador y, sin acuerdo, en el Juzgado de Policía Local.',
    },
    {
      q: '¿Qué IPC uso para calcular el reajuste de mi arriendo?',
      a: 'El acumulado del período exacto que pactaste, publicado por el INE. Si el contrato dice reajuste anual, es la variación del IPC de los últimos doce meses contados desde el mes de aniversario; si dice semestral, es el acumulado de esos seis meses. Es un error frecuente aplicar la variación de doce meses a un contrato con reajuste semestral: duplica el aumento. El INE publica el índice dentro de los primeros ocho días de cada mes.',
    },
    {
      q: '¿Cuánto necesito para entrar a un arriendo?',
      a: 'Lo habitual es un mes de garantía más el primer mes de arriendo por adelantado, más el gasto común del primer mes. Algunos corredores piden dos meses de garantía y cobran comisión de medio mes o un mes más IVA, pero eso es negociable y depende de quién contrató al corredor. La garantía no es un gasto: se devuelve al término del contrato descontando los daños que no sean por uso normal, así que conviene dejar constancia fotográfica del estado del inmueble el día que recibes las llaves.',
    },
    {
      q: '¿Cuánto cubre el subsidio de arriendo del MINVU?',
      a: `El llamado vigente entrega hasta ${SUBSIDIO.totalUf} UF en total, pagadas mes a mes con un tope de ${String(SUBSIDIO.topeMensualUf).replace('.', ',')} UF mensuales —${String(SUBSIDIO.topeMensualUfZonaEspecial).replace('.', ',')} UF en zonas especiales—, lo que alcanza para unos ${Math.floor(SUBSIDIO.totalUf / SUBSIDIO.topeMensualUf)} meses si usas el tope completo. El arriendo no puede superar ${SUBSIDIO.arriendoMaxUf} UF (${SUBSIDIO.arriendoMaxUfZonaEspecial} UF en zona especial), necesitas ${SUBSIDIO.ahorroMinimoUf} UF de ahorro en una cuenta para la vivienda, un ingreso familiar entre ${SUBSIDIO.ingresoMinUf} y ${SUBSIDIO.ingresoMaxUf} UF y estar hasta el tramo del ${SUBSIDIO.rshTramoMax}% del Registro Social de Hogares. Ojo: cumplir los requisitos te habilita a postular, no te asegura el beneficio — el MINVU selecciona por puntaje y cupos.`,
    },
    {
      q: 'En el Registro Social de Hogares, ¿un tramo más alto es mejor o peor?',
      a: 'Un tramo más BAJO significa mayor vulnerabilidad socioeconómica y, por lo tanto, más acceso a beneficios. El tramo 40% agrupa al 40% de hogares con menores ingresos corregidos por su composición; el tramo 100% es el de mayores ingresos. Por eso los subsidios se expresan como "hasta el tramo X%": el de arriendo llega hasta el 70% y el subsidio eléctrico cubre hasta el 40%. Es una confusión habitual y cara, porque lleva a gente que sí califica a no postular.',
    },
    {
      q: '¿Qué gastos tiene comprar además del pie y el dividendo?',
      a: 'Los que se olvidan y descuadran el presupuesto: impuesto de timbres sobre el crédito, escritura ante notario, inscripción en el Conservador de Bienes Raíces —0,2% del precio con tope—, tasación de la propiedad, estudio de títulos y los seguros de desgravamen e incendio que el banco exige por toda la vida del crédito. Sumados suelen andar entre el 2% y el 4% del precio, según si la vivienda es DFL 2 y qué cobre tu banco. A eso, ya como dueño, se agregan las contribuciones y la mantención, que arrendando pagaba el propietario.',
    },
    {
      q: '¿Conviene poner un pie más grande?',
      a: 'Un pie mayor baja el dividendo, baja el impuesto de timbres —que se calcula sobre el crédito— y suele mejorar la tasa que te ofrece el banco, porque baja el riesgo. Lo que no hace es aumentar tu patrimonio: la plata del pie ya era tuya, solo cambia de forma. La pregunta real es qué rendimiento alternativo tiene esa plata: si puedes obtener menos que la tasa del crédito, conviene ponerla de pie; si puedes obtener más, conviene el pie mínimo. Con tasas hipotecarias reales en torno al 4,5% en UF, superarlas de forma consistente y segura no es trivial.',
    },
    {
      q: '¿La revalorización de la vivienda es plata segura?',
      a: 'No, y es el supuesto que más mueve esta comparación. En esta página la revalorización la pones tú, en UF reales, es decir por sobre la inflación. Los precios de vivienda en Chile subieron con fuerza durante buena parte de la década pasada, pero también han tenido períodos planos y de caída real. Si quieres la respuesta conservadora, corre el cálculo con 0% de revalorización: si comprar sigue ganando en ese escenario, la decisión es sólida; si solo gana con revalorizaciones altas, estás apostando al mercado, no comprando una casa.',
    },
    {
      q: '¿Puedo tener subsidio de arriendo y postular después a uno de compra?',
      a: 'Son programas distintos y el de arriendo está pensado justamente como puente mientras se junta el ahorro para comprar. No son simultáneos sobre la misma vivienda ni el de arriendo consume el subsidio habitacional de compra, pero sí conviene revisar las condiciones del llamado específico, porque el MINVU fija en cada convocatoria las incompatibilidades y la antigüedad exigida a la cuenta de ahorro. Lo que sí es incompatible es recibir el subsidio de arriendo siendo propietario de una vivienda.',
    },
  ],

  sources: [
    {
      name: 'MINVU — Subsidio de Arriendo: requisitos, montos y llamado vigente',
      url: 'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-de-arriendo/',
      publisher: 'Ministerio de Vivienda y Urbanismo',
    },
    {
      name: 'ChileAtiende — Subsidio de arriendo de vivienda',
      url: 'https://www.chileatiende.gob.cl/fichas/3338-subsidio-de-arriendo-de-vivienda',
      publisher: 'ChileAtiende',
    },
    {
      name: 'SII — Impuesto de Timbres y Estampillas (DL 3.475) y beneficio DFL 2',
      url: 'https://www.sii.cl/preguntas_frecuentes/renta/001_002_3413.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'INE — Índice de Precios al Consumidor, series y variación acumulada',
      url: 'https://www.ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion/indice-de-precios-al-consumidor',
      publisher: 'Instituto Nacional de Estadísticas',
    },
    {
      name: 'CMF — tasas de interés de créditos hipotecarios por institución',
      url: 'https://www.cmfchile.cl/portal/estadisticas/617/w3-propertyvalue-30538.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'Conservador de Bienes Raíces de Santiago — arancel de inscripción',
      url: 'https://conservador.cl/portal/inscripcion_propiedad',
      publisher: 'Conservador de Bienes Raíces de Santiago',
    },
    {
      name: 'Ley 18.101 — Arrendamiento de predios urbanos',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29390',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'Registro Social de Hogares — qué son los tramos de calificación socioeconómica',
      url: 'https://www.registrosocial.gob.cl/',
      publisher: 'Ministerio de Desarrollo Social y Familia',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://www.bcentral.cl/web/banco-central/areas/estadisticas/indicadores-diarios',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-arriendo-vs-comprar-chile-10-anos-uf',
    '/calculadora-arriendo-santiago-vina-concepcion-precio-promedio',
    '/calculadora-reajuste-arriendo-ipc-chile',
    '/calculadora-subsidio-arriendo-minvu-chile-2026-monto-requisitos',
  ],

  lastReviewed: '2026-07-28',
};
