import type { HubData } from './types';
import { jubilacionMinima } from '../formulas/jubilacion-minima';

/**
 * Hub de decisión — "¿Cuándo me puedo jubilar?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas: todavía estoy aportando
 * (default), tengo la edad pero no los 30 años, quiero comprar los aportes que
 * faltan, y me voy por la PUAM.
 *
 * SILO: /jubilacion, que ya existe con index propio y un hub hermano
 * ("¿Cuánto voy a cobrar de jubilación?"). No hay silo ANSES/previsional
 * separado en src/pages ni en los siloHref del registry, así que este es el
 * silo correcto y no se crea nada nuevo.
 *
 * DE DÓNDE SALEN LOS NÚMEROS:
 *  · Edad mínima (60 mujer / 65 hombre) y 30 años de aportes: Ley 24.241,
 *    espejado de src/lib/formulas/edad-jubilacion-anos-aporte.ts y
 *    src/lib/formulas/cuanto-falta-jubilarse-jubilacion-edad-aportes.ts
 *  · Costo del plan de pago (29% del MOPRE por mes, hasta 120 cuotas):
 *    src/lib/formulas/comprar-anos-aportes-moratoria.ts (Ley 27.705, arts. 8 y 9)
 *  · HABER MÍNIMO: NO está escrito acá. Se lee llamando a la fórmula real
 *    src/lib/formulas/jubilacion-minima.ts, que es la fuente única del repo.
 *    Cuando ANSES mueve el mínimo y se actualiza esa constante, este hub
 *    cambia solo. La PUAM se deriva de ahí (80% del mínimo, Ley 27.260 art. 13).
 *  · El MOPRE es un campo del formulario a propósito: ANSES lo actualiza por
 *    resolución varias veces al año y no tiene fuente viva en el repo.
 *    Hardcodearlo garantizaría un número viejo.
 */

/** Requisitos de la Ley 24.241 (arts. 19 y 37). */
export const REQUISITOS = {
  edadMujer: 60,
  edadHombre: 65,
  aniosAportes: 30,
  /** PUAM: Ley 27.260 art. 13 — 65 años para ambos sexos, 80% del haber mínimo. */
  puamEdad: 65,
  puamFactor: 0.8,
  /** Ley 27.705 arts. 8 y 9 — plan de pago de deuda previsional. */
  moratoriaPctMopre: 0.29,
  moratoriaCuotas: 120,
  /** Tope de años comprables con el plan de pago. */
  moratoriaMaxAnios: 30,
};

/** Haber mínimo vigente, leído de la fórmula real (no hardcodeado). */
const _minima = jubilacionMinima({ tieneBono: 'no' });
export const HABER_MINIMO = Math.round(_minima.haberMinimo);
export const PUAM = Math.round(HABER_MINIMO * REQUISITOS.puamFactor);

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

/** Texto del disclaimer YMYL (getCalculatorDisclaimer, dominio 'general'). */
const DISCLAIMER =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

export const hub: HubData = {
  slug: 'jubilacion/cuando-me-jubilo',
  title: '¿Cuándo me puedo jubilar? — Edad, años de aportes y qué pasa si no llegás',
  description:
    'Cuántos años te faltan para jubilarte según tu edad y tus aportes, qué pasa si no llegás a los 30 años, qué moratoria está vigente hoy y cuánto cobrarías con la PUAM.',
  silo: 'Jubilación',
  siloHref: '/jubilacion',

  eyebrow: 'Guía previsional ANSES',
  h1: '¿Cuándo me puedo jubilar?',
  lede:
    'Se necesitan dos cosas al mismo tiempo: la edad (60 la mujer, 65 el hombre) y 30 años de aportes. Te jubilás cuando se cumple el que tarda más. Cargá tus datos y mirá cuál de los dos te está frenando; si el problema son los aportes, abajo están las salidas que siguen abiertas.',
  stamps: [
    'Ley 24.241 · 60/65 años + 30 de aportes',
    `Haber mínimo ${fmtArs(HABER_MINIMO)}`,
    `PUAM ${fmtArs(PUAM)} (80% del mínimo)`,
    '3 calculadoras adentro',
  ],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿En qué situación estás?',
    intro:
      'Partimos del caso más frecuente: seguís trabajando y querés saber cuándo te toca. Si ya tenés la edad o te faltan aportes, cambialo: la salida es distinta.',
    items: [
      {
        id: 'activo',
        label: 'Sigo trabajando y quiero saber cuándo me toca',
        hint: 'El caso más común',
        answer: 'Te jubilás cuando se cumple el requisito que tarda más: edad o aportes.',
        yes: [
          'Cuántos años te faltan por edad y cuántos por aportes, por separado',
          'Cuál de los dos manda: ese es tu verdadero límite',
          'El año aproximado en que podrías iniciar el trámite',
        ],
        warn: [
          DISCLAIMER,
          'Los aportes que contás tienen que estar certificados: pedí en ANSES el formulario PS 6.2 (Certificación de Servicios) antes de dar por buenos tus años',
          'Los meses de monotributo o autónomos impagos no computan aunque hayas estado inscripto',
        ],
        plazo: 'la historia laboral se consulta gratis en Mi ANSES; los errores tardan meses en corregirse, no lo dejes para el final.',
      },
      {
        id: 'sin-aportes',
        label: 'Ya tengo la edad pero no llego a los 30 años',
        hint: 'El nudo del sistema',
        answer: 'Con la edad cumplida y menos de 30 años de aportes, hoy la vía habitual es la PUAM.',
        yes: [
          'Cuántos años de aportes te faltan exactamente para los 30',
          'Cuánto cobrarías con la PUAM, que no exige los 30 años',
          'La comparación contra el haber mínimo de una jubilación ordinaria',
        ],
        warn: [
          DISCLAIMER,
          'La adhesión a la moratoria de la Ley 27.705 para quienes YA tenían la edad venció el 23/03/2025 y no fue prorrogada: no hay hoy una moratoria abierta para ese grupo',
          'La PUAM no genera pensión derivada para tu cónyuge y exige 10 años de residencia si sos extranjero',
          'La PUAM es compatible con seguir trabajando, pero no se puede cobrar junto con otra jubilación o pensión',
        ],
        plazo: 'la PUAM se tramita a los 65 años, para mujeres y varones por igual.',
      },
      {
        id: 'regularizacion',
        label: 'Quiero comprar los aportes que me faltan',
        hint: 'Plan de pago Ley 27.705',
        answer: 'El plan de pago sigue abierto sólo para quien está a menos de 10 años de la edad.',
        yes: [
          'Cuántos meses de aportes tendrías que comprar para llegar a los 30 años',
          'La deuda total al 29% del MOPRE por mes y la cuota en 120 pagos',
          'Cuánto te quedaría del haber después del descuento de la cuota',
          'Si ese haber neto supera o no a la PUAM, que se cobra sin descuentos',
        ],
        warn: [
          DISCLAIMER,
          'Lo que sigue vigente de la Ley 27.705 es la regularización para trabajadores en actividad a menos de 10 años de la edad jubilatoria. Si ya cumpliste la edad y no adheriste antes del 23/03/2025, esta vía no está disponible',
          'La cuota se descuenta del haber todos los meses durante hasta 10 años: si el neto queda por debajo de la PUAM, estás pagando por cobrar menos',
          'El MOPRE lo actualiza ANSES por resolución varias veces al año: cargá el vigente o la cuenta queda vieja',
        ],
        plazo: 'la deuda se puede cancelar anticipadamente en cualquier momento y ahí se libera el haber del descuento.',
      },
      {
        id: 'puam',
        label: 'Me voy a la PUAM',
        hint: '80% del haber mínimo',
        answer: 'La PUAM paga el 80% del haber mínimo sin exigir años de aportes.',
        yes: [
          'El importe de la PUAM, que es el 80% del haber mínimo vigente',
          'Cuánto resignás por mes frente a una jubilación ordinaria por el mínimo',
          'A qué edad la podés pedir: 65 años, mujeres y varones',
        ],
        warn: [
          DISCLAIMER,
          'No genera pensión derivada: al fallecimiento no le queda nada al cónyuge, y esa es la diferencia grande contra una jubilación ordinaria',
          'Exige 10 años de residencia en el país para extranjeros, 5 de ellos inmediatamente anteriores al pedido',
          'Es incompatible con cobrar cualquier otra jubilación o pensión, propia o derivada',
        ],
        plazo: 'incluye cobertura de PAMI y el mismo bono de refuerzo que el haber mínimo cuando se paga.',
      },
    ],
  },

  inputsTitle: 'Tus datos previsionales',
  inputsIntro: 'Con la edad y los aportes ya alcanza. El MOPRE se usa sólo si estás mirando el plan de pago.',
  fields: [
    { id: 'edad', label: 'Tu edad actual', type: 'number', min: 15, max: 90, suffix: 'años', value: 58 },
    {
      id: 'sexo',
      label: 'Sexo legal',
      type: 'select',
      value: 'f',
      options: [
        { value: 'f', label: 'Femenino — se jubila a los 60' },
        { value: 'm', label: 'Masculino — se jubila a los 65' },
      ],
    },
    {
      id: 'anios',
      label: 'Años de aportes registrados',
      type: 'number',
      min: 0,
      max: 60,
      suffix: 'años',
      value: 22,
      help: 'Los que figuran en tu historia laboral de ANSES: relación de dependencia, monotributo y autónomos pagos.',
    },
    { id: 'meses', label: 'Meses sueltos además de los años', type: 'number', min: 0, max: 11, suffix: 'meses', value: 6 },
    {
      id: 'mopre',
      label: 'Valor del MOPRE vigente (sólo para el plan de pago)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Módulo Previsional. Lo fija ANSES por resolución y se actualiza varias veces al año: consultá el vigente en anses.gob.ar antes de usar el resultado.',
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Esta página no es una liquidación: el derecho y el haber los determina ANSES con tu historia laboral completa, y los requisitos pueden cambiar por ley.',

  chart: {
    type: 'progress',
    title: 'Cuánto del camino llevás',
    caption:
      'La barra mide el avance hacia los dos requisitos a la vez y se queda con el que va más atrasado: llegar al 100% quiere decir que cumplís edad y aportes.',
    bands: [
      { label: 'Lejos', from: 0, to: 50, tone: 'bad' },
      { label: 'A mitad de camino', from: 50, to: 80, tone: 'warn' },
      { label: 'Cerca', from: 80, to: 99, tone: 'warn' },
      { label: 'Cumplís los requisitos', from: 99, to: 100, tone: 'good' },
    ],
  },
  breakdownTitle: 'Qué te falta, número por número',
  breakdownIntro: 'Las barras comparan cada valor con el mayor del listado. Fijate la unidad de cada fila.',

  faq: [
    {
      q: '¿Cuáles son los requisitos para jubilarse en Argentina?',
      a: 'Dos, y hay que cumplir los dos: la edad mínima —60 años las mujeres, 65 los varones— y 30 años de servicios con aportes. Los fija la Ley 24.241 y sólo cambian por una reforma previsional. Como se exigen juntos, la fecha de jubilación la manda el requisito que tarda más en cumplirse.',
    },
    {
      q: '¿Qué pasa si llego a la edad pero no tengo 30 años de aportes?',
      a: 'No accedés a la jubilación ordinaria. Hoy la vía habitual es la PUAM (Prestación Universal para el Adulto Mayor), que se pide a los 65 años sin exigir años de aportes y paga el 80% del haber mínimo. La otra opción sería una moratoria, pero la adhesión de la Ley 27.705 para quienes ya tenían la edad venció el 23 de marzo de 2025 y no fue prorrogada.',
    },
    {
      q: '¿Hay una moratoria previsional vigente hoy?',
      a: 'Para quien ya cumplió la edad jubilatoria, no: ese tramo de la Ley 27.705 venció el 23/03/2025 y hay proyectos de prórroga en el Congreso, pero ninguno sancionado. Lo que sí sigue abierto es el otro programa de la misma ley: la regularización de aportes para trabajadores en actividad que están a menos de 10 años de cumplir la edad jubilatoria. Es la vía para adelantarse al problema antes de llegar a los 60 o 65.',
    },
    {
      q: '¿Cuánto cuesta comprar un año de aportes?',
      a: 'El plan de pago cobra el 29% del MOPRE por cada mes que se compra, o sea doce veces eso por año, y se cancela en hasta 120 cuotas mensuales que se descuentan directamente del haber. No se paga de tu bolsillo: sale del cobro mensual. El MOPRE lo fija ANSES por resolución y se actualiza varias veces al año, así que hay que usar siempre el valor vigente.',
    },
    {
      q: '¿Conviene la moratoria o la PUAM?',
      a: 'La cuenta rápida es comparar el haber neto después del descuento de la cuota contra la PUAM, que se cobra sin descuentos. Si el neto queda por debajo, estás pagando por cobrar menos. Aun así, la jubilación ordinaria por moratoria tiene una ventaja que la PUAM no da: genera pensión derivada del 70% para el cónyuge al fallecimiento. Si hay cónyuge a cargo, esa diferencia puede pesar más que unos pesos por mes.',
    },
    {
      q: '¿Cuánto se cobra con la PUAM?',
      a: `La PUAM equivale al 80% del haber mínimo. Con el mínimo vigente de ${fmtArs(HABER_MINIMO)}, son unos ${fmtArs(PUAM)} por mes, más el bono de refuerzo cuando ANSES lo paga. Incluye cobertura de PAMI y aguinaldo, pero no genera pensión derivada.`,
    },
    {
      q: '¿La PUAM se puede cobrar trabajando?',
      a: 'Sí: es compatible con seguir trabajando en relación de dependencia o por cuenta propia. Lo que no permite es cobrarla junto con otra jubilación o pensión, propia o derivada. Y para extranjeros exige 10 años de residencia en el país, 5 de ellos inmediatamente anteriores al pedido.',
    },
    {
      q: '¿Los años en negro cuentan para la jubilación?',
      a: 'No computan por sí solos, porque no hubo aportes. Sí se pueden reconocer si se prueban en un juicio laboral o si el empleador regulariza la relación, y en ese caso pasan a integrar la historia laboral. Por eso conviene pedir la Certificación de Servicios (formulario PS 6.2) mucho antes de llegar a la edad: corregir un período mal registrado lleva meses.',
    },
    {
      q: '¿Puedo jubilarme antes de la edad mínima?',
      a: 'En el régimen general no. Hay regímenes diferenciales y especiales —tareas insalubres, docentes, personal de la construcción, algunos estatutos— que adelantan la edad o piden menos años, y está la jubilación por invalidez, que no depende de la edad sino del grado de incapacidad. Fuera de esos casos, la edad mínima no se negocia.',
    },
    {
      q: '¿Qué pasa si sigo trabajando después de cumplir los requisitos?',
      a: 'Podés seguir. Cada año extra de aportes suma en el cálculo de la Prestación Compensatoria y la Prestación Adicional por Permanencia, así que el haber sube. También se puede tramitar la jubilación y seguir trabajando en relación de dependencia, aunque en ese caso los aportes posteriores ya no mejoran el haber.',
    },
    {
      q: '¿Cómo consulto mis años de aportes?',
      a: 'Entrando a Mi ANSES con clave de la Seguridad Social podés ver la historia laboral completa, mes por mes. Ahí figuran los períodos con aportes y los huecos. Si detectás un período que trabajaste y no aparece, se reclama con documentación (recibos de sueldo, certificación de servicios del empleador) y el trámite puede tardar varios meses.',
    },
    {
      q: '¿La edad de jubilación de la mujer sigue siendo 60 años?',
      a: 'Sí, en el régimen general: 60 años para la mujer y 65 para el varón, según la Ley 24.241. La mujer puede optar por seguir trabajando hasta los 65 y jubilarse después, sumando aportes. Para la PUAM, en cambio, la edad es 65 para ambos: ahí no hay diferencia por sexo.',
    },
  ],

  sources: [
    {
      name: 'Ley 24.241 — Sistema Integrado de Jubilaciones y Pensiones (arts. 19 y 37)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/639/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 27.705 — Plan de Pago de Deuda Previsional (arts. 8 y 9)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/375000-379999/378816/norma.htm',
      publisher: 'InfoLeg',
      date: '29-03-2023',
    },
    {
      name: 'Ley 27.260 art. 13 — Prestación Universal para el Adulto Mayor (PUAM)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/260000-264999/263691/norma.htm',
      publisher: 'InfoLeg',
      date: '29-06-2016',
    },
    {
      name: 'Jubilación: requisitos y trámite',
      url: 'https://www.anses.gob.ar/jubilados-y-pensionados',
      publisher: 'ANSES',
    },
    {
      name: 'Prestación Universal para el Adulto Mayor — requisitos',
      url: 'https://www.anses.gob.ar/prestacion/prestacion-universal-para-el-adulto-mayor',
      publisher: 'ANSES',
    },
  ],

  replaces: [
    '/calculadora-comprar-anos-aportes-moratoria-previsional-cuotas',
    '/calculadora-edad-jubilacion-anos-aporte',
    '/calculadora-cuanto-falta-jubilarse-jubilacion-edad-aportes',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
