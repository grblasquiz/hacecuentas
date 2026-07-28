import type { HubData } from '../types';
import { CHILE_2026, BENEFICIO_ANIOS_COTIZADOS_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Con cuánto me voy a jubilar?"
 *
 * Proyección del saldo de la cuenta individual, PGU, Beneficio por Años Cotizados,
 * retiro programado contra renta vitalicia, pensión de sobrevivencia y APV.
 *
 * Correcciones deliberadas contra las fórmulas viejas (ver reporte):
 *  - El retiro programado se calcula como ANUALIDAD sobre los años que te quedan
 *    de expectativa, no dividiendo el saldo por la expectativa de vida completa
 *    contada desde el nacimiento (eso subestimaba la pensión ~3-4×).
 *  - La PGU es un complemento que se SUMA a la pensión autofinanciada según los
 *    umbrales PBI/PBS, no un piso que la reemplaza.
 *  - La pensión de sobrevivencia sigue el Art. 58 del DL 3.500 (cónyuge 60% ó 50%,
 *    más 15% por cada hijo con derecho a orfandad), no un reparto 25/25 inventado.
 *  - El SIS lo paga el empleador: no se descuenta del trabajador.
 *
 * UF y UTM son datos VIVOS: el Beneficio por Años Cotizados está en UF y los topes
 * del APV en UF y UTM.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Indicadores vivos (mindicador.cl vía src/data/live/chile.json). */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/**
 * Parámetros de la Pensión Garantizada Universal vigentes desde febrero de 2026.
 * Se reajustan por IPC cada febrero (Ley 21.419 y reforma Ley 21.735). Espejo de
 * src/lib/formulas/pgu-pension-garantizada-universal-chile-monto-requisitos.ts,
 * que es la única de las fórmulas absorbidas con valores consistentes entre sí.
 * FECHA DEL DATO: 2026-02-01. Verificar en ChileAtiende antes de citarlos como vigentes.
 */
export const PGU = {
  maxBase: 231_732, // 65 a 81 años
  maxMayor: 250_275, // 82 años o más
  edadMayor: 82,
  edadMinima: 65,
  pensionBaseInferior: 789_139, // PBI: hasta acá se recibe la PGU completa
  pensionBaseSuperior: 1_252_602, // PBS: desde acá no corresponde PGU
  decilExcluido: 10,
  fechaDato: '2026-02-01',
};

/** Beneficio por Años Cotizados de la reforma — verificado en src/lib/data/chile-2026.ts. */
export const BAC = BENEFICIO_ANIOS_COTIZADOS_2026;

/** Edades legales de pensión por vejez — DL 3.500. */
export const EDAD_LEGAL = { hombre: 65, mujer: 60 };

/**
 * Topes del APV — Art. 42 bis LIR.
 *  Régimen A: bonificación fiscal del 15% del ahorro del año, tope 6 UTM anuales.
 *  Régimen B: rebaja de la base imponible, tope 600 UF anuales.
 * Los porcentajes y topes salen de la fórmula original apv-beneficio-tributario-chile.ts;
 * el tope de 6 UTM no se pudo verificar contra el texto del Art. 42 bis desde el repo,
 * así que viaja como campo editable del formulario con su fecha de dato.
 */
export const APV = { bonificacionPct: 15, topeRegimenAUtm: 6, topeRegimenBUf: 600, fechaDato: '2026-07-28' };

/** Pensión de sobrevivencia — Art. 58 DL 3.500, porcentajes sobre la pensión de referencia. */
export const SOBREVIVENCIA = {
  conyugeSinHijos: 60,
  conyugeConHijos: 50,
  porHijo: 15,
  madrePadreFiliacionNoMatrimonialSinHijos: 36,
  madrePadreFiliacionNoMatrimonialConHijos: 30,
};

/** Comisiones de AFP vigentes — Superintendencia de Pensiones. */
export const AFP: Array<{ id: string; nombre: string; comision: number }> = [
  { id: 'uno', nombre: 'AFP Uno', comision: 0.49 },
  { id: 'modelo', nombre: 'Modelo', comision: 0.58 },
  { id: 'planvital', nombre: 'PlanVital', comision: 1.16 },
  { id: 'habitat', nombre: 'Habitat', comision: 1.27 },
  { id: 'capital', nombre: 'Capital', comision: 1.44 },
  { id: 'cuprum', nombre: 'Cuprum', comision: 1.44 },
  { id: 'provida', nombre: 'ProVida', comision: 1.45 },
];

/**
 * Rentabilidad real anual histórica de los multifondos, a 10 años.
 * Espejo de saldo-afp-rentabilidad-multifondos-chile-2026.ts (Superintendencia de
 * Pensiones / Boletín de Multifondos). Es un dato histórico, no una promesa.
 */
export const MULTIFONDOS: Array<{ id: string; nombre: string; real10: number }> = [
  { id: 'A', nombre: 'Fondo A — más riesgoso', real10: 4.5 },
  { id: 'B', nombre: 'Fondo B — riesgoso', real10: 4.1 },
  { id: 'C', nombre: 'Fondo C — intermedio', real10: 3.3 },
  { id: 'D', nombre: 'Fondo D — conservador', real10: 2.3 },
  { id: 'E', nombre: 'Fondo E — más conservador', real10: 2.1 },
];

export const TOPE_IMPONIBLE_UF = CHILE_2026.topeImponibleAfpUf;
export const APORTE_OBLIGATORIO = CHILE_2026.afpObligatorio;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/dinero/cuanta-pension-voy-a-tener',
  title: 'Cuánta pensión voy a tener en Chile: saldo AFP, PGU y modalidades',
  description:
    'Proyecta tu pensión en Chile con el saldo real de tu cuenta AFP, la rentabilidad histórica de tu multifondo, la Pensión Garantizada Universal, el Beneficio por Años Cotizados de la reforma y la comparación entre retiro programado y renta vitalicia.',
  silo: 'Dinero',
  siloHref: '/cl/dinero',
  locale: 'cl',

  eyebrow: 'Chile · pensiones',
  h1: '¿Con cuánto me voy a jubilar?',
  lede:
    'Tu pensión sale de tres piezas: lo que acumulaste en tu cuenta individual, lo que el Estado te agrega con la PGU y el Beneficio por Años Cotizados, y la modalidad con la que decidas cobrarla. Pon tu saldo, tu edad y lo que cotizas al mes, y mira el número completo en vez de una sola de las partes.',
  stamps: [
    `UF de hoy: $${UF.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `PGU máxima: ${fmt(PGU.maxBase)} (${fmt(PGU.maxMayor)} desde los ${PGU.edadMayor})`,
    `Beneficio por años cotizados: hasta ${BAC.topeUf} UF = ${fmt(BAC.topeUf * UF)}`,
    'DL 3.500 · Ley 21.419 · Ley 21.735',
    '5 preguntas de pensión en una página',
  ],

  resultLabel: 'Pensión mensual estimada',

  cases: {
    title: '¿Qué necesitas saber?',
    intro:
      'Partimos por la pregunta más frecuente: cuánto va a rendir el saldo que llevas acumulado.',
    items: [
      {
        id: 'proyectar',
        label: 'Quiero proyectar mi pensión',
        hint: 'Tienes el saldo de tu cartola y quieres saber en cuánto termina.',
        yes: [
          'Capitalización de tu saldo actual con la rentabilidad real histórica del multifondo que elijas',
          'Aportes futuros: 10% de tu renta imponible topada, capitalizados hasta la edad legal',
          'Saldo estimado al pensionarte y la pensión que rinde como retiro programado',
          'Si esa pensión te deja bajo los umbrales, cuánto te agrega la PGU',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La rentabilidad histórica de un multifondo no garantiza la futura: es referencia, no promesa',
          'Las rentabilidades usadas son reales, es decir ya descontada la inflación, así que el resultado está en pesos de hoy',
          'Las lagunas previsionales pegan fuerte: cada mes sin cotizar es un mes que no capitaliza durante décadas',
          'El SIS lo paga el empleador y no sale de tu 10%; la comisión de la AFP sí se cobra sobre tu renta imponible pero no entra a tu fondo',
        ],
        plazo:
          'la edad legal es 65 años para hombres y 60 para mujeres, y puedes seguir cotizando después para mejorar la pensión.',
        answer:
          'Tu pensión depende de tres cosas: cuánto llevas acumulado, cuántos años te faltan cotizando y qué rentabilidad real capitaliza ese fondo.',
      },
      {
        id: 'pgu',
        label: 'Ya me pensiono: ¿me corresponde la PGU?',
        hint: 'La Pensión Garantizada Universal reemplazó al antiguo Aporte Previsional Solidario.',
        yes: [
          'Chequeo de los requisitos: edad, residencia y no pertenecer al 10% más rico',
          'Monto de la PGU según tu tramo de edad',
          'Reducción proporcional si tu pensión base está entre la Pensión Base Inferior y la Superior',
          'Pensión final resultante: tu pensión autofinanciada más el complemento',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La PGU se SUMA a tu pensión, no la reemplaza: si un cálculo te muestra la PGU como piso que sustituye tu pensión, está mal',
          'El Aporte Previsional Solidario ya no existe como beneficio nuevo: fue reemplazado por la PGU desde 2022',
          'Los montos y umbrales se reajustan por IPC cada febrero: los de esta página tienen fecha de dato y hay que confirmarlos en ChileAtiende',
          'La exclusión del 10% más rico se determina por el Puntaje de Focalización Previsional, no por lo que declares acá',
        ],
        plazo:
          'la PGU se solicita en el IPS o en ChileAtiende y se paga desde el mes siguiente a la aprobación; no es automática salvo para quienes ya tenían el beneficio anterior.',
        answer:
          'Con 65 años cumplidos, residencia acreditada y sin estar en el 10% más rico, la PGU se suma a tu pensión; se reduce sólo si tu pensión base supera la Pensión Base Inferior.',
      },
      {
        id: 'modalidad',
        label: 'Retiro programado o renta vitalicia',
        hint: 'La decisión más irreversible del proceso: la renta vitalicia no tiene vuelta atrás.',
        yes: [
          'Pensión inicial estimada del retiro programado como anualidad sobre tu expectativa de años',
          'Comparación contra la oferta en UF que te llegó en el certificado del SCOMP',
          'Saldo heredable que quedaría en retiro programado si fallecieras a cierta edad',
          'Qué pasa con el saldo en cada modalidad',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El retiro programado real se recalcula todos los años y tiende a BAJAR con la edad: la cifra de acá es la pensión inicial',
          'La renta vitalicia es irrevocable: una vez firmada no puedes volver al retiro programado',
          'En renta vitalicia el saldo pasa a la compañía de seguros; tus beneficiarios legales reciben pensión de sobrevivencia, no herencia del fondo',
          'El cálculo oficial usa tablas de mortalidad y el vector de tasas de la Superintendencia de Pensiones: esta es una aproximación',
        ],
        plazo:
          'el certificado de ofertas del SCOMP tiene una vigencia acotada; pide ofertas externas antes de decidir y no aceptes la primera.',
        answer:
          'El retiro programado parte más alto, se recalcula cada año y deja herencia; la renta vitalicia es fija en UF de por vida y no deja saldo.',
      },
      {
        id: 'sobrevivencia',
        label: 'Pensión de viudez o de sobrevivencia',
        hint: 'Qué le queda a tu familia si falleces, según el Art. 58 del DL 3.500.',
        yes: [
          'Porcentaje que corresponde al cónyuge o conviviente civil, con y sin hijos con derecho',
          'Porcentaje de orfandad por cada hijo con derecho a pensión',
          'Monto mensual de cada beneficiario y del grupo familiar completo',
          'Chequeo del tope: la suma de las pensiones no puede superar la pensión de referencia del causante',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Un cálculo que reparta el 50% entre cónyuge e hijos y le deje al cónyuge un 25% está equivocado: el 50% es del cónyuge y los hijos suman 15% cada uno encima',
          'El derecho a pensión de orfandad se mantiene hasta los 18 años, o hasta los 24 si el hijo estudia, y es vitalicio si es inválido',
          'Si la suma de todos los beneficiarios supera el 100% de la pensión de referencia, se reduce proporcionalmente',
          'La pensión de sobrevivencia se calcula sobre la pensión de referencia del causante, que no siempre coincide con la pensión que estaba cobrando',
        ],
        plazo:
          'la solicitud se hace en la AFP o en la compañía de seguros del causante; conviene iniciarla apenas se obtiene el certificado de defunción.',
        answer:
          'El cónyuge sin hijos con derecho recibe el 60% de la pensión de referencia; con hijos con derecho, el 50%, y cada hijo suma un 15%.',
      },
      {
        id: 'apv',
        label: 'Cuánto me suma ahorrar de más',
        hint: 'APV en Régimen A o B, Cuenta 2 y el Beneficio por Años Cotizados de la reforma.',
        yes: [
          'Régimen A: bonificación fiscal del 15% de tu aporte anual, con tope en UTM',
          'Régimen B: rebaja de la base del Global Complementario, con tope de 600 UF anuales',
          'Cuál de los dos regímenes te conviene según tu tasa marginal',
          'Beneficio por Años Cotizados: 0,1 UF por cada año cotizado, con tope de 2,5 UF',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Los dos regímenes de APV son excluyentes: eliges uno por cada aporte, no los dos',
          'El Régimen B conviene mientras tu tasa marginal sea alta; con tramo exento el Régimen A gana casi siempre',
          'Retirar el APV antes de pensionarte tiene un impuesto único de retiro que se lleva buena parte del beneficio',
          'La Cuenta 2 (ahorro previsional voluntario de libre disposición) NO da rebaja de base imponible: es una cuenta de ahorro con reglas propias, no un APV',
        ],
        plazo:
          'los aportes de APV cuentan por año calendario: lo que deposites hasta el 31 de diciembre es lo que entra al beneficio de esa Operación Renta.',
        answer:
          'Con tasa marginal baja conviene el Régimen A por la bonificación del 15%; con tasa marginal alta gana el Régimen B, que rebaja la base del impuesto.',
      },
    ],
  },

  inputsTitle: 'Tus datos previsionales',
  inputsIntro:
    'El saldo y los meses cotizados los ves en la cartola cuatrimestral y en el certificado de cotizaciones de tu AFP.',
  fields: [
    {
      id: 'edad',
      label: 'Tu edad',
      type: 'number',
      value: 40,
      min: 18,
      max: 100,
      step: 1,
    },
    {
      id: 'sexo',
      label: 'Sexo registral',
      type: 'select',
      value: 'hombre',
      options: [
        { value: 'hombre', label: `Hombre — edad legal ${EDAD_LEGAL.hombre}` },
        { value: 'mujer', label: `Mujer — edad legal ${EDAD_LEGAL.mujer}` },
      ],
      help: 'Determina la edad legal de pensión por vejez del DL 3.500.',
    },
    {
      id: 'saldo',
      label: 'Saldo acumulado en tu cuenta obligatoria (CLP)',
      prefix: '$',
      value: '35.000.000',
      thousands: true,
      help: 'El que aparece en tu cartola. En el caso de modalidades es el saldo con el que te pensionas.',
    },
    {
      id: 'sueldo',
      label: 'Tu renta imponible mensual (CLP)',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: `Base del 10% de cotización obligatoria, topada en ${TOPE_IMPONIBLE_UF} UF.`,
    },
    {
      id: 'fondo',
      label: 'Multifondo en el que estás',
      type: 'select',
      value: 'C',
      options: MULTIFONDOS.map((m) => ({ value: m.id, label: `${m.nombre} — ${m.real10.toString().replace('.', ',')}% real anual a 10 años` })),
      help: 'La rentabilidad mostrada es real histórica a 10 años: ya descuenta la inflación.',
    },
    {
      id: 'pensionBase',
      label: 'Pensión base autofinanciada (CLP)',
      prefix: '$',
      value: '250.000',
      thousands: true,
      help: 'Sólo se usa en los casos de PGU y sobrevivencia: la pensión mensual sin el aporte del Estado.',
    },
    {
      id: 'decil',
      label: 'Tramo del Registro Social de Hogares (decil)',
      type: 'number',
      value: 5,
      min: 1,
      max: 10,
      step: 1,
      help: 'El decil 10 (10% más rico) queda excluido de la PGU.',
    },
    {
      id: 'residencia',
      label: '¿Acreditas 20 años de residencia en Chile?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'expectativa',
      label: 'Años de pensión que esperas cobrar',
      type: 'number',
      value: 22,
      min: 5,
      max: 45,
      step: 1,
      help: 'Expectativa de vida al pensionarte, en años. Es el plazo sobre el que se reparte el saldo.',
    },
    {
      id: 'tasaTecnica',
      label: 'Tasa de interés técnica anual (%)',
      suffix: '%',
      type: 'number',
      value: 3,
      min: 0.5,
      max: 8,
      step: 0.1,
      help: 'Rentabilidad esperada del saldo mientras se paga la pensión. La oficial la fija la Superintendencia de Pensiones.',
    },
    {
      id: 'ofertaRv',
      label: 'Oferta de renta vitalicia del SCOMP (UF al mes)',
      suffix: 'UF',
      type: 'number',
      value: 6,
      min: 0,
      max: 200,
      step: 0.01,
      help: 'La que viene en tu certificado de ofertas. Déjala en 0 si aún no la tienes.',
    },
    {
      id: 'hijos',
      label: 'Hijos con derecho a pensión de orfandad',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: 'Menores de 18, o hasta 24 si estudian, o inválidos de cualquier edad.',
    },
    {
      id: 'mesesCotizados',
      label: 'Meses cotizados en toda tu vida laboral',
      type: 'number',
      value: 300,
      min: 0,
      max: 720,
      step: 1,
      help: 'Los ves en el certificado de cotizaciones. Determinan el Beneficio por Años Cotizados.',
    },
    {
      id: 'aporteApv',
      label: 'Aporte anual de APV (CLP)',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'Total que depositarías en el año calendario.',
    },
    {
      id: 'tasaMarginal',
      label: 'Tu tasa marginal de impuesto (%)',
      suffix: '%',
      type: 'number',
      value: 8,
      min: 0,
      max: 40,
      step: 0.5,
      help: 'Tramo marginal del Impuesto Único de Segunda Categoría o del Global Complementario.',
    },
    {
      id: 'topeApvA',
      label: `Tope del Régimen A en UTM al año`,
      suffix: 'UTM',
      type: 'number',
      value: APV.topeRegimenAUtm,
      min: 1,
      max: 60,
      step: 0.5,
      help: `Valor referencial al ${APV.fechaDato}. El tope de la bonificación del Régimen A está fijado en UTM en el Art. 42 bis LIR: confírmalo en el SII antes de usarlo.`,
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'De dónde sale tu pensión',
    caption:
      'Muestra qué parte de tu pensión final viene de tu propio fondo y qué parte la pone el Estado con la PGU y el Beneficio por Años Cotizados.',
  },
  breakdownTitle: 'Pieza por pieza',
  breakdownIntro: 'Las barras comparan cada componente contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cómo se calcula la pensión de retiro programado?',
      a: 'Se reparte el saldo de tu cuenta individual entre los años de expectativa que te quedan, capitalizando el saldo que aún no retiras a una tasa de interés técnica. Es matemática de anualidad: pensión = saldo × i ÷ (1 − (1+i)^−n), con n los meses de pensión esperados. Ojo con los simuladores que dividen el saldo por la expectativa de vida completa contada desde el nacimiento: eso reparte la plata entre muchos más años de los que corresponde y te muestra una pensión mucho menor que la real.',
    },
    {
      q: '¿La PGU se suma a mi pensión o la reemplaza?',
      a: 'Se suma. La Pensión Garantizada Universal es un complemento estatal: recibes tu pensión autofinanciada más el monto de PGU que te corresponda. Si tu pensión base está bajo la Pensión Base Inferior, cobras la PGU completa; entre la Pensión Base Inferior y la Superior el monto baja de forma proporcional, y por encima de la Superior no corresponde. Un cálculo que la trate como un piso que sustituye tu pensión está mal planteado.',
    },
    {
      q: '¿Qué pasó con el Aporte Previsional Solidario?',
      a: 'La PGU lo reemplazó en 2022. Quienes recibían el APS pasaron a la PGU de forma automática cuando el monto les resultaba más favorable. Hoy no se puede postular al APS de vejez: la vía es la PGU, que administra el IPS y se solicita en ChileAtiende. Los requisitos también cambiaron: la PGU no exige haber cotizado, sino tener 65 años, acreditar 20 años de residencia y no pertenecer al 10% más rico.',
    },
    {
      q: '¿Qué es el Beneficio por Años Cotizados de la reforma?',
      a: `Es un beneficio de la reforma previsional que paga 0,1 UF por cada 12 meses cotizados, con un tope de ${BAC.topeUf} UF, o sea ${BAC.aniosTope} años de cotizaciones. Se paga desde enero de 2026, de forma automática y sobre la pensión que ya recibes. Los requisitos son ${BAC.edadMinima} años o más y un mínimo de ${BAC.mesesMinMujer} meses cotizados en el caso de las mujeres y ${BAC.mesesMinHombre} en el de los hombres. Como está expresado en UF, su valor en pesos se mueve todos los días.`,
    },
    {
      q: '¿Conviene retiro programado o renta vitalicia?',
      a: 'Depende de qué te importa más. El retiro programado parte más alto, mantiene la plata a tu nombre y deja herencia si falleces, pero se recalcula todos los años y tiende a bajar a medida que envejeces. La renta vitalicia te asegura un monto fijo en UF hasta que mueras, sin sorpresas, pero es irrevocable y el saldo pasa a la compañía de seguros. Si tienes buena salud y pocos beneficiarios, la renta vitalicia protege del riesgo de vivir mucho; si te importa dejar herencia, el retiro programado.',
    },
    {
      q: '¿Cuánto le queda a mi familia si fallezco?',
      a: `Según el Art. 58 del DL 3.500, el cónyuge o conviviente civil sin hijos con derecho a orfandad recibe el ${SOBREVIVENCIA.conyugeSinHijos}% de la pensión de referencia; si hay hijos con derecho, el ${SOBREVIVENCIA.conyugeConHijos}%, y cada hijo suma un ${SOBREVIVENCIA.porHijo}% adicional por orfandad. Si la suma de todos los beneficiarios supera el 100% de la pensión de referencia, se ajusta proporcionalmente. La madre o el padre de hijos de filiación no matrimonial tiene porcentajes propios, menores.`,
    },
    {
      q: '¿Qué régimen de APV me conviene, el A o el B?',
      a: `El Régimen A te da una bonificación fiscal del ${APV.bonificacionPct}% de lo que ahorras en el año, con tope en UTM, y no rebaja tu base imponible. El Régimen B rebaja tu aporte de la base del impuesto, con tope de ${APV.topeRegimenBUf} UF al año, así que su valor depende directamente de tu tasa marginal. La regla práctica: con tramo exento o tasa marginal baja gana el A; con tasa marginal alta gana el B. Son excluyentes por cada aporte.`,
    },
    {
      q: '¿La Cuenta 2 da beneficio tributario?',
      a: 'No de la misma forma que el APV. La Cuenta de Ahorro Voluntario, conocida como Cuenta 2, es una cuenta de libre disposición dentro de la AFP: puedes girar de ella durante tu vida activa y sus retiros tienen su propio tratamiento tributario, pero los depósitos no rebajan la base del Global Complementario ni acceden a la bonificación del 15%. Si lo que buscas es beneficio tributario, el instrumento es el APV del Art. 42 bis, no la Cuenta 2.',
    },
    {
      q: '¿El seguro de invalidez y sobrevivencia me lo descuentan a mí?',
      a: 'No. El SIS lo paga íntegramente el empleador, aunque se calcule sobre tu renta imponible. Lo que sale de tu liquidación es el 10% de cotización obligatoria, que va a tu fondo, más la comisión de la AFP, que se queda la administradora. Un cálculo que te reste el SIS del sueldo te está mostrando un descuento que no existe para el trabajador dependiente.',
    },
    {
      q: '¿Cuánto pesa la comisión de mi AFP en la pensión final?',
      a: 'La comisión no sale del fondo: se cobra aparte sobre tu renta imponible, así que no reduce directamente tu saldo, pero sí reduce tu líquido mes a mes. Hoy va de 0,49% a 1,45% según la administradora, casi un punto porcentual de diferencia sobre tu renta imponible todos los meses durante toda tu vida laboral. Lo que sí afecta el saldo es la rentabilidad del fondo, que es donde conviene mirar la comparación de largo plazo.',
    },
    {
      q: '¿Qué multifondo me conviene según mi edad?',
      a: 'La lógica del sistema es tomar más riesgo cuando faltan muchos años y bajarlo al acercarse la pensión, para no llegar justo en medio de una caída. Por eso el fondo E tiene restricciones para afiliados jóvenes y los fondos A y B están limitados para quienes ya están cerca de la edad legal. Cambiar de fondo persiguiendo la rentabilidad del año pasado suele salir caro: cristaliza pérdidas y se pierde el rebote.',
    },
    {
      q: '¿Por qué mi pensión real va a dar distinto a esta estimación?',
      a: 'Porque la pensión oficial se calcula con las tablas de mortalidad y el vector de tasas que fija la Superintendencia de Pensiones, con tu historial exacto de cotizaciones, con las lagunas que tengas, con los beneficiarios que acredites y con la rentabilidad efectiva de tu fondo, que nadie conoce por adelantado. Esta página estima el orden de magnitud con los parámetros que le pongas, para que sepas si vas bien encaminado o si necesitas ahorrar más.',
    },
  ],

  sources: [
    {
      name: 'Superintendencia de Pensiones — normativa del DL 3.500, modalidades de pensión y multifondos',
      url: 'https://www.spensiones.cl/',
      publisher: 'Superintendencia de Pensiones de Chile',
    },
    {
      name: 'ChileAtiende — Pensión Garantizada Universal: requisitos y montos',
      url: 'https://www.chileatiende.gob.cl/fichas/74584-pension-garantizada-universal-pgu',
      publisher: 'ChileAtiende / IPS',
    },
    {
      name: 'ChileAtiende — Beneficio por Años Cotizados (reforma previsional)',
      url: 'https://www.chileatiende.gob.cl/fichas/130450-beneficio-por-anos-cotizados',
      publisher: 'ChileAtiende / IPS',
    },
    {
      name: 'Biblioteca del Congreso Nacional — DL 3.500, pensiones de sobrevivencia (Art. 58)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=7147',
      publisher: 'BCN Chile',
    },
    {
      name: 'SII — APV y Art. 42 bis de la Ley de la Renta',
      url: 'https://www.sii.cl/preguntas_frecuentes/renta/001_002_2570.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SCOMP — Sistema de Consultas y Ofertas de Montos de Pensión',
      url: 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9908.html',
      publisher: 'Superintendencia de Pensiones de Chile',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Serie.aspx?gcode=UF&param=RABmAFYAWQB3AGYAaQBuAEkALQAzADUAbgBNAGgAaAAkA',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-afp-pension-chile-2026-tabla-comisiones',
    '/calculadora-saldo-afp-rentabilidad-multifondos-chile-2026',
    '/calculadora-pension-jubilacion-chile-edad-aportes-2026',
    '/calculadora-pgu-pension-garantizada-universal-chile-monto-requisitos',
    '/calculadora-aporte-previsional-solidario-aps-chile',
    '/calculadora-aumento-pension-reforma-seguro-social-chile-2026',
    '/calculadora-retiro-programado-vs-renta-vitalicia-chile',
    '/calculadora-pension-viudez-vitalicia-chile-cuantia',
    '/calculadora-cuenta-2-afp-chile-aporte-voluntario-rendimiento',
  ],

  lastReviewed: '2026-07-28',
};
