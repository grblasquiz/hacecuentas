import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "Me despiden o renuncio: ¿cuánto me tienen que pagar?"
 *
 * Absorbe cinco calculadoras de terminación laboral (finiquito, liquidación,
 * prima de antigüedad e ISR de la separación).
 *
 * Criterios legales que las calcs viejas tenían mal y acá se corrigen:
 *  - Prima de antigüedad PROPORCIONAL al tiempo servido (LFT Art. 162), no
 *    truncada a años enteros.
 *  - Salario base de la prima topado a 2× salario mínimo general (LFT Art. 486).
 *  - Exención de ISR por separación: 90 UMA POR AÑO de servicio (LISR 93-XIII),
 *    no 90 salarios mínimos totales.
 *  - El excedente gravable de la separación paga a la TASA EFECTIVA del último
 *    sueldo ordinario (Art. 95 LISR / Art. 174 RLISR), no a la tarifa directa.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/** Tarifa ISR mensual (Art. 96 LISR, Anexo 8 RMF 2026). `hasta: null` = sin techo. */
export const ISR_MENSUAL: Array<{ desde: number; hasta: number | null; cuota: number; tasa: number }> =
  MEXICO_2026.isrTarifaMensual.map(([limInf, limSup, cuota, tasa]) => ({
    desde: limInf,
    hasta: Number.isFinite(limSup) ? limSup : null,
    cuota,
    tasa,
  }));

/** Reglas de terminación de la LFT. */
export const LFT = {
  aguinaldoDias: MEXICO_2026.lft.aguinaldoDiasMinimo,           // 15 días · Art. 87
  primaVacacionalPct: MEXICO_2026.lft.primaVacacional * 100,    // 25% · Art. 80
  primaAntiguedadDias: MEXICO_2026.lft.primaAntiguedad.diasPorAnio, // 12 días/año · Art. 162
  primaAntiguedadTopeSm: MEXICO_2026.lft.primaAntiguedad.topeSalarioVecesSm, // 2× SM · Art. 486
  mesesConstitucionales: MEXICO_2026.lft.indemnizacion.mesesConstitucionales, // 3 meses · Art. 48/50
  diasPorAnio20: MEXICO_2026.lft.indemnizacion.diasPorAnio20,   // 20 días/año · Art. 50
  vacacionesPorAnio: MEXICO_2026.lft.vacacionesPorAnio as unknown as number[], // Art. 76
  incrementoQuinquenal: MEXICO_2026.lft.vacacionesIncrementoQuinquenal,
};

/** Exenciones de ISR aplicables (en UMA diarias, LISR Art. 93). */
export const EXENCIONES = {
  separacionPorAnioUmas: MEXICO_2026.exencionesIsrUmas.separacionPorAnio, // 90 UMA por año
  aguinaldoUmas: MEXICO_2026.exencionesIsrUmas.aguinaldo,                 // 30 UMA
  primaVacacionalUmas: MEXICO_2026.exencionesIsrUmas.primaVacacional,     // 15 UMA
};

export const UMA_DIARIA = MEXICO_2026.uma.diaria;
export const SM_GENERAL_DIARIO = MEXICO_2026.salarioMinimo.generalDiario;
export const FACTOR_MENSUAL = MEXICO_2026.salarioMinimo.factorMensual;

export const hub: HubData = {
  slug: 'mx/trabajo/finiquito-y-liquidacion',
  title: 'Finiquito y liquidación México 2026: cuánto te deben pagar',
  description:
    'Calculadora de finiquito y liquidación en México 2026: partes proporcionales, 3 meses de indemnización, 20 días por año y prima de antigüedad según LFT.',
  silo: 'Trabajo',
  siloHref: '/mx/trabajo',

  eyebrow: 'México · fin de la relación laboral',
  h1: 'Me despiden o renuncio en México: ¿cuánto me tienen que pagar?',
  lede:
    'El finiquito son tus partes proporcionales y siempre te toca, renuncies o te corran. La liquidación es la indemnización que se suma solo si el despido fue injustificado. Elige tu caso y mira concepto por concepto qué te deben, ya con el ISR descontado.',
  stamps: [
    'Indemnización de 3 meses + 20 días/año · LFT Art. 48 y 50',
    'Prima de antigüedad proporcional · LFT Art. 162 y 486',
    'Exención de 90 UMA por año · LISR Art. 93-XIII',
    '5 calculadoras fusionadas',
  ],

  resultLabel: 'Total neto que te deben pagar',

  cases: {
    title: '¿Cómo termina tu relación de trabajo?',
    intro:
      'La diferencia entre cobrar solo el finiquito o cobrar también la indemnización depende del motivo de la separación. Empezamos por el despido injustificado, que es el caso completo.',
    items: [
      {
        id: 'despido-injustificado',
        label: 'Me despidieron sin causa justificada',
        hint: 'Te corrieron sin causa legal, o sin darte el aviso por escrito que exige la ley.',
        yes: [
          'Finiquito completo: días trabajados, vacaciones pendientes, prima vacacional y aguinaldo proporcional',
          'Indemnización constitucional de tres meses de salario (Art. 48 LFT)',
          'Veinte días de salario por cada año de servicio (Art. 50 LFT)',
          'Prima de antigüedad de doce días por año, con el salario topado a dos salarios mínimos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La prescripción para demandar por despido es de dos meses desde la separación: no firmes un convenio a la ligera',
          'Si el patrón no te dio aviso escrito de la causa, el despido se presume injustificado aunque él diga lo contrario',
          'Los 20 días por año solo proceden cuando el trabajador pide indemnización en lugar de reinstalación, o en los supuestos del Art. 50',
        ],
        plazo: 'tienes dos meses para demandar ante el Centro de Conciliación y el Tribunal Laboral (Art. 518 LFT).',
        answer:
          'Te deben el finiquito más tres meses de salario, veinte días por año de servicio y la prima de antigüedad.',
      },
      {
        id: 'renuncia',
        label: 'Renuncié por mi cuenta',
        hint: 'Dejaste el trabajo voluntariamente, con o sin aviso previo.',
        yes: [
          'Finiquito: días trabajados del período, vacaciones no disfrutadas y su prima',
          'Aguinaldo proporcional a los días trabajados del año',
          'Prima de antigüedad solo si acumulaste quince años o más de servicio (Art. 162 LFT)',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Al renunciar no hay indemnización de tres meses ni veinte días por año: eso solo existe en el despido injustificado',
          'Con menos de quince años de antigüedad, la renuncia voluntaria no genera prima de antigüedad',
          'Firma la renuncia con fecha real y guarda copia: una renuncia antedatada te puede costar días de salario',
        ],
        plazo: 'el finiquito debe pagarse al terminar la relación; el reclamo prescribe al año (Art. 516 LFT).',
        answer:
          'Te toca el finiquito completo, y la prima de antigüedad solo si llevabas quince años o más.',
      },
      {
        id: 'despido-justificado',
        label: 'Me despidieron con causa justificada',
        hint: 'El patrón rescindió el contrato invocando una causal del Art. 47 y te dio el aviso.',
        yes: [
          'Finiquito completo, igual que en cualquier otra terminación',
          'Prima de antigüedad sin importar la antigüedad: la separación no es voluntaria (Art. 162 LFT)',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No hay indemnización de tres meses ni veinte días por año cuando la causa está probada',
          'Que el patrón la llame justificada no la vuelve justificada: la carga de probar la causal es suya',
          'Revisa que el aviso de rescisión te haya sido entregado o notificado por el tribunal dentro de los cinco días hábiles',
        ],
        plazo: 'el aviso de rescisión debe entregarse dentro de los cinco días hábiles siguientes (Art. 47 LFT).',
        answer:
          'Cobras el finiquito y la prima de antigüedad, pero no la indemnización por despido.',
      },
      {
        id: 'separacion',
        label: 'Salí por jubilación, incapacidad o muerte',
        hint: 'Terminación por causas ajenas a la voluntad de las partes o retiro del trabajador.',
        yes: [
          'Finiquito completo con todas las partes proporcionales devengadas',
          'Prima de antigüedad completa, sin requisito de antigüedad mínima (Art. 162 LFT)',
          'En caso de muerte, los beneficiarios cobran el finiquito y la prima ante el tribunal laboral',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La pensión del IMSS es un trámite separado y no sustituye al finiquito que debe pagar el patrón',
          'Si hubo incapacidad permanente por riesgo de trabajo, además corresponde la indemnización de la LFT a cargo del IMSS',
        ],
        plazo: 'los beneficiarios tienen un año para reclamar las prestaciones devengadas (Art. 516 LFT).',
        answer:
          'Corresponde el finiquito íntegro más la prima de antigüedad, cualquiera que sea el tiempo servido.',
      },
    ],
  },

  inputsTitle: 'Tus datos de la separación',
  inputsIntro:
    'El salario diario es tu sueldo mensual entre 30. Si no sabes cuántos días de vacaciones traes pendientes, la calculadora usa los que marca la ley para tu antigüedad.',
  fields: [
    {
      id: 'salarioDiario',
      label: 'Salario diario (MXN)',
      prefix: '$',
      value: '700',
      thousands: true,
      help: 'Sueldo mensual entre 30. Es la base de casi todos los conceptos.',
    },
    {
      id: 'antiguedad',
      label: 'Antigüedad en años (acepta decimales)',
      type: 'number',
      value: 4.5,
      min: 0,
      max: 50,
      step: 0.1,
      help: 'Pon 4,5 si llevas cuatro años y medio: la prima de antigüedad se paga proporcional.',
    },
    {
      id: 'diasPendientes',
      label: 'Días de sueldo pendientes del período',
      type: 'number',
      value: 10,
      min: 0,
      max: 31,
      step: 1,
      help: 'Días efectivamente trabajados que aún no te han pagado.',
    },
    {
      id: 'diasVacaciones',
      label: 'Días de vacaciones pendientes',
      type: 'number',
      value: 0,
      min: 0,
      max: 120,
      step: 1,
      help: 'Déjalo en 0 para que use los días de ley de tu antigüedad (Art. 76 LFT).',
    },
    {
      id: 'diasAnio',
      label: 'Días trabajados en el año en curso',
      type: 'number',
      value: 200,
      min: 0,
      max: 365,
      step: 1,
      help: 'Se usan para prorratear el aguinaldo del año en el que sales.',
    },
    {
      id: 'primaVacacionalPct',
      label: 'Prima vacacional de tu empresa',
      suffix: '%',
      type: 'number',
      value: 25,
      min: 25,
      max: 200,
      step: 5,
      help: 'El mínimo legal es 25%. Si tu contrato da más, ponlo.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué se compone tu pago',
    caption:
      'Separa lo que es finiquito (partes proporcionales que siempre te tocan) de lo que es indemnización y prima de antigüedad, y cuánto se lleva el ISR.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Cada renglón cita el artículo que lo obliga. Las barras comparan contra el concepto mayor.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre finiquito y liquidación?',
      a: 'El finiquito son las partes proporcionales que ya devengaste: días trabajados, vacaciones no disfrutadas, prima vacacional y aguinaldo del año. Te toca siempre, sin importar cómo termine la relación. La liquidación es la indemnización por un despido injustificado: tres meses de salario más veinte días por cada año de servicio, y se suma al finiquito solo en ese supuesto.',
    },
    {
      q: '¿Cómo se calcula la prima de antigüedad en México: 12 días por año?',
      a: 'Sí: son 12 días de salario por cada año de servicio (Art. 162 de la LFT), y el tiempo incompleto se paga proporcional, no se trunca. El salario que sirve de base está topado a dos veces el salario mínimo general (Art. 486), así que quien gana bien cobra la prima sobre ese tope y no sobre su sueldo real. Se paga en toda separación, salvo la renuncia voluntaria con menos de quince años.',
    },
    {
      q: '¿Cuál es el tope de 2 salarios mínimos de la prima de antigüedad en 2026?',
      a: 'Con el salario mínimo general de $315.04 diarios, el tope del salario base es de $630.08 al día en la zona general; en la Zona Libre de la Frontera Norte, con mínimo de $440.87, el tope sube a $881.74. Eso significa que la prima máxima por cada año de servicio es de $7,560.96 en zona general y de $10,580.88 en la frontera (12 días por el tope diario). Si tu salario diario es menor al tope, la prima se calcula sobre tu salario real.',
    },
    {
      q: '¿Me toca prima de antigüedad si renuncio?',
      a: 'Solo si llevabas quince años o más de servicio. Con menos, la renuncia voluntaria no la genera. En cambio, si te despiden (justificada o injustificadamente), te separas por incapacidad, te jubilas o falleces, la prima procede sin requisito de antigüedad mínima.',
    },
    {
      q: '¿Cuánto ISR me retienen del finiquito?',
      a: 'La indemnización y la prima de antigüedad tienen una exención de noventa UMA por cada año de servicio (Art. 93 fracción XIII de la LISR). Lo que rebase esa exención paga ISR a la tasa efectiva de tu último sueldo ordinario mensual, según el procedimiento del Art. 95 de la LISR y el Art. 174 de su reglamento. El finiquito ordinario tributa como salario del mes, con sus propias exenciones de aguinaldo y prima vacacional.',
    },
    {
      q: '¿Los veinte días por año siempre se pagan?',
      a: 'No. La regla general del Art. 48 es que el trabajador elige entre la reinstalación y la indemnización de tres meses. Los veinte días por año proceden cuando el trabajador opta por la indemnización en los supuestos del Art. 50, o cuando el patrón queda eximido de reinstalar. Muchos convenios los incluyen igual para cerrar el asunto, y por eso conviene calcularlos.',
    },
    {
      q: '¿Qué salario se usa para cada concepto?',
      a: 'La indemnización de tres meses y los veinte días por año se calculan sobre el salario diario integrado, que suma al sueldo la parte proporcional de aguinaldo, prima vacacional y demás prestaciones. La prima de antigüedad usa el salario diario topado a dos salarios mínimos. El finiquito ordinario se calcula sobre el salario diario nominal.',
    },
    {
      q: '¿Cuánto tiempo tengo para reclamar?',
      a: 'Para demandar por despido injustificado el plazo es de dos meses contados desde la separación (Art. 518 de la LFT). Para reclamar prestaciones devengadas como salarios, vacaciones o aguinaldo el plazo general es de un año (Art. 516). Antes de ir al tribunal hay que agotar la conciliación prejudicial ante el Centro de Conciliación.',
    },
    {
      q: '¿Puedo negarme a firmar el convenio que me ofrecen?',
      a: 'Sí. Un convenio de terminación solo produce efectos de cosa juzgada si se ratifica ante el Centro de Conciliación o el Tribunal Laboral, que debe revisar que no renuncies a derechos. Firmar un recibo por menos de lo que te corresponde no te impide reclamar la diferencia, pero complica la prueba: mejor calcula antes y anota la diferencia.',
    },
    {
      q: '¿El patrón puede descontarme algo del finiquito?',
      a: 'Solo los conceptos que la ley permite: pensión alimenticia decretada, cuotas del IMSS y del Infonavit, ISR, y adeudos por préstamos dentro de los límites del Art. 110 de la LFT, que topan el descuento por deudas al 30% del excedente del salario mínimo. Multas y descuentos disciplinarios están prohibidos.',
    },
    {
      q: '¿Qué pasa con mi crédito Infonavit si me quedo sin trabajo?',
      a: 'El descuento vía nómina se detiene al causar baja, pero la deuda sigue viva y empieza a generar omisiones. El Infonavit tiene prórrogas por desempleo que hay que solicitar expresamente; no se activan solas. Aparte, puedes tramitar el retiro parcial de tu Afore por desempleo si cumples los requisitos de la Ley del Seguro Social.',
    },
    {
      q: '¿El aguinaldo proporcional se paga aunque me hayan despedido en enero?',
      a: 'Sí. El aguinaldo se devenga día a día, así que corresponde la parte proporcional a los días trabajados del año, por pocos que sean (Art. 87 de la LFT). Lo mismo aplica a las vacaciones y a su prima: si no alcanzaste el aniversario, se pagan proporcionales en el finiquito.',
    },
    {
      q: '¿Cómo sé si mi despido fue justificado?',
      a: 'La ley enumera las causas de rescisión sin responsabilidad para el patrón en el Art. 47 de la LFT, y exige que te entregue por escrito el aviso con la fecha y los motivos, o que lo notifique el tribunal, dentro de los cinco días hábiles. Si no hubo aviso o la causa no encaja en esa lista, el despido se considera injustificado y procede la indemnización.',
    },
  ],

  sources: [
    {
      name: 'Ley Federal del Trabajo — Arts. 47, 48, 50, 76, 79, 80, 87, 162, 486, 516 y 518',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley del Impuesto sobre la Renta — Arts. 93 fracc. XIII, 95 y 96',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Reglamento de la LISR — Art. 174, ingresos por separación',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LISR.pdf',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'SAT — Anexo 8 de la RMF 2026, tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.sat.gob.mx/normatividad/22186/resolucion-miscelanea-fiscal-(rmf)',
      publisher: 'Servicio de Administración Tributaria',
      date: '28-12-2025',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'PROFEDET — orientación gratuita en materia laboral',
      url: 'https://www.gob.mx/profedet',
      publisher: 'Procuraduría Federal de la Defensa del Trabajo',
    },
  ],

  replaces: [
    '/calculadora-finiquito-liquidacion-mexico',
    '/calculadora-finiquito-mexico-completo-rescision-relacion',
    '/calculadora-liquidacion-despido-mexico-3-meses-12-dias',
    '/calculadora-prima-antiguedad-mexico',
    '/calculadora-isr-finiquito-liquidacion-mexico-2026',
  ],

  lastReviewed: '2026-08-16',
  locale: 'mx',
};
