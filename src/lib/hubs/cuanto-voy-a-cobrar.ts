import type { HubData } from './types';
import { jubilacionMinima } from '../formulas/jubilacion-minima';
import { jubilacionAnsesMontoMinimoMaxima2026 } from '../formulas/jubilacion-anses-monto-minimo-maxima-2026';
import {
  INFLACION_SERIE_MENSUAL,
  INFLACION_SERIE_HASTA,
  INFLACION_AS_OF,
} from '../data/inflacion-serie-ar';

/**
 * Hub de decisión — "¿Cuánto voy a cobrar de jubilación?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas: régimen general ANSES
 * (default), docente, cuánto necesito ahorrar para complementarla, y haber
 * mínimo con bono.
 *
 * CRÍTICO — de dónde salen los números que ANSES mueve todos los meses:
 *
 *  · HABER MÍNIMO y BONO: NO están escritos acá. Se leen llamando a la fórmula
 *    real `src/lib/formulas/jubilacion-minima.ts`, que es la fuente única del
 *    repo para el mínimo y el refuerzo. Cuando se actualice esa constante, este
 *    hub cambia solo.
 *  · HABER MEDIO y HABER MÁXIMO: se leen de
 *    `src/lib/formulas/jubilacion-anses-monto-minimo-maxima-2026.ts` (devuelve
 *    strings formateados, así que se parsean).
 *  · MOVILIDAD MENSUAL: desde el DNU 274/2024 el haber se ajusta cada mes por el
 *    IPC del INDEC publicado con dos meses de rezago. Así que el coeficiente NO
 *    se hardcodea: sale de la serie viva `src/data/live/inflacion.json` a través
 *    de `src/lib/data/inflacion-serie-ar.ts`, la misma que refresca el cron de
 *    datos. Si el IPC de este mes cambia, el hub lo refleja sin tocar código.
 *  · PBU: el monto de la Prestación Básica Universal (Ley 24.241 art. 20) no
 *    tiene fuente propia en el repo. Se DERIVA del haber mínimo con la relación
 *    que las resoluciones de movilidad de ANSES vienen sosteniendo desde 2022
 *    (la PBU se ajusta con el mismo coeficiente que el mínimo, así que el
 *    cociente es estable en torno al 45%: mar-2024 $60.500 sobre $134.445;
 *    dic-2022 $22.594 sobre $50.125). Al derivarla del mínimo vivo, tampoco
 *    queda vieja: se mueve con él.
 */

/** Haber mínimo y bono vigentes, leídos de la fórmula real (no hardcodeados). */
const _minima = jubilacionMinima({ tieneBono: 'si' });
export const HABER_MINIMO = Math.round(_minima.haberMinimo);
export const BONO_REFUERZO = Math.round(_minima.bonoExtra);

/** Parseo de los montos formateados que devuelve la fórmula de mínima/máxima. */
function montoDe(tipo: string): number {
  const out = jubilacionAnsesMontoMinimoMaxima2026({ tipo });
  return Number(String(out.haberMensual).replace(/[^\d]/g, '')) || 0;
}
export const HABER_MEDIO = montoDe('media');
export const HABER_MAXIMO = montoDe('maxima');

/**
 * Movilidad mensual vigente = IPC del INDEC con dos meses de rezago
 * (DNU 274/2024). Sale de la serie viva; si faltara el dato, queda en 0 y el
 * copy lo dice, antes que inventar un porcentaje.
 */
const _ultimo = INFLACION_SERIE_MENSUAL[INFLACION_SERIE_MENSUAL.length - 1];
export const MOVILIDAD = {
  /** Variación mensual aplicable, en %. */
  pct: _ultimo ? Number(_ultimo.valor) : 0,
  /** Mes del IPC usado, clave "YYYY-MM". */
  mesIpc: INFLACION_SERIE_HASTA || '',
  /** Fecha del dato para el sello de frescura. */
  asOf: INFLACION_AS_OF,
  /** Etiqueta legible del mes del IPC. */
  label: (() => {
    const k = INFLACION_SERIE_HASTA;
    if (!k) return 'sin dato';
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const [y, m] = k.split('-').map(Number);
    return `${meses[(m || 1) - 1]} ${y}`;
  })(),
};

/**
 * PBU derivada del haber mínimo vivo. Ver comentario de cabecera: la relación
 * PBU/mínimo se mantiene porque ambas se ajustan con la misma movilidad.
 */
export const PBU_SOBRE_MINIMO = 0.45;
export const PBU = Math.round(HABER_MINIMO * PBU_SOBRE_MINIMO);

/** Coeficiente anual de PC y PAP: 1,5% por año de servicios (Ley 24.241 arts. 24 y 30). */
export const COEF_ANUAL = 0.015;
/** Tope de años computables para PC + PAP (Ley 24.241 art. 24 inc. a). */
export const TOPE_ANIOS = 35;

/** Porcentajes de haber de los regímenes docentes, según sus fórmulas del repo. */
export const DOCENTE = {
  caba: {
    label: 'Docente CABA (82% del promedio de las 120 mejores)',
    pct: 0.82,
    norma: 'Régimen docente CABA',
    detalle: '82% del promedio de las 120 mejores remuneraciones de los últimos 10 años',
    edadM: 60,
    edadF: 57,
    servicios: 25,
  },
  'ips-ba': {
    label: 'Docente IPS Buenos Aires (82% móvil sobre el 80% del mejor sueldo)',
    pct: 0.8 * 0.82,
    norma: 'Decreto-Ley 9650/80',
    detalle: '82% móvil aplicado sobre el 80% del mejor sueldo de los últimos 10 años',
    edadM: 60,
    edadF: 55,
    servicios: 30,
  },
};

/** Tasa de retiro sostenible anual (regla del 4%), igual que la fórmula de proyección. */
export const TASA_RETIRO_SOSTENIBLE = 0.04;

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

export const hub: HubData = {
  slug: 'jubilacion/cuanto-voy-a-cobrar',
  title: '¿Cuánto voy a cobrar de jubilación? Calculadora ANSES 2026',
  description:
    'Estimá tu haber jubilatorio con la Ley 24.241: PBU, prestación compensatoria, PAP y bono, con el haber mínimo y la movilidad mensual vigentes. Régimen general, docente, haber mínimo y cuánto ahorrar para complementarla.',
  silo: 'Jubilación',
  siloHref: '/jubilacion',

  eyebrow: 'Guía y estimación previsional',
  h1: '¿Cuánto voy a cobrar de jubilación?',
  lede:
    'Tu haber no es un número mágico: es la suma de tres partes que casi nadie sabe leer en el recibo. Poné tus años de aportes y el promedio de tus sueldos y te mostramos cómo se arma, con el mínimo y la movilidad vigentes.',
  stamps: [
    'Actualizado 27-07-2026',
    'Ley 24.241 · DNU 274/2024',
    `Haber mínimo ${fmtArs(HABER_MINIMO)} + bono ${fmtArs(BONO_REFUERZO)}`,
    `Movilidad ${MOVILIDAD.pct.toLocaleString('es-AR')}% (IPC ${MOVILIDAD.label})`,
    '11 calculadoras adentro',
  ],

  resultLabel: 'Haber mensual estimado',

  cases: {
    title: '¿Cuál es tu caso?',
    intro: 'Partimos del régimen general de ANSES, que es el de la enorme mayoría. Si el tuyo es otro, cambialo.',
    items: [
      {
        id: 'general',
        label: 'Régimen general de ANSES (SIPA)',
        hint: 'El caso más común',
        answer: 'Tu haber es la suma de PBU + prestación compensatoria + PAP, con el mínimo garantizado como piso.',
        yes: [
          'PBU: una suma fija igual para todos los que llegan con 30 años de aportes (art. 20)',
          'Prestación compensatoria: 1,5% por cada año aportado ANTES de julio de 1994 (art. 24)',
          'PAP: 1,5% por cada año aportado DESDE julio de 1994 (art. 30)',
          `Piso: nadie cobra menos que el haber mínimo garantizado, hoy ${fmtArs(HABER_MINIMO)}`,
          `Bono de refuerzo de ${fmtArs(BONO_REFUERZO)} para los haberes que no superan el mínimo`,
        ],
        warn: [
          'El promedio se calcula sobre las remuneraciones ACTUALIZADAS por el índice oficial, no sobre lo que decía tu recibo en su momento',
          'Los años de PC y PAP suman hasta 35: aportar más de 35 años no aumenta el haber por esa vía',
          `El haber tiene tope: hoy la jubilación máxima es de ${fmtArs(HABER_MAXIMO)}`,
          'El bono es no remunerativo: no genera aguinaldo ni se incorpora al haber permanente',
          'Esto es una estimación orientativa: el haber real lo determina ANSES con tu historia laboral completa',
        ],
        plazo:
          `el haber se actualiza todos los meses por el IPC publicado con dos meses de rezago (DNU 274/2024): el ajuste vigente es del ${MOVILIDAD.pct.toLocaleString('es-AR')}%, por el IPC de ${MOVILIDAD.label}.`,
      },
      {
        id: 'docente',
        label: 'Soy docente',
        hint: 'CABA o IPS Buenos Aires',
        answer: 'El régimen docente paga el 82% del promedio, no la suma de PBU + PC + PAP.',
        yes: [
          'CABA: 82% del promedio de las 120 mejores remuneraciones de los últimos 10 años',
          'IPS Buenos Aires: 82% móvil aplicado sobre el 80% del mejor sueldo (Decreto-Ley 9650/80)',
          'Tareas frente al aula: descuentan 5 años de edad y 5 de servicios en los dos regímenes',
          'Se exigen 25 años de servicio docente en CABA y 30 en la provincia de Buenos Aires',
        ],
        warn: [
          'Si no llegás a los años de servicio exigidos el haber se liquida proporcional, no pleno',
          'Los cargos fuera del aula (dirección, supervisión) no siempre computan como docentes puros',
          'La caja provincial es distinta de ANSES: si mezclaste cajas hay que pedir reciprocidad jubilatoria y la determina el organismo otorgante',
          'El 82% se calcula sobre el cargo testigo actualizado, no sobre el sueldo nominal viejo',
        ],
        plazo:
          'pedí la certificación de servicios docentes con un año de anticipación: es el trámite que más demora el expediente.',
      },
      {
        id: 'ahorro',
        label: 'Quiero saber cuánto ahorrar para complementarla',
        hint: 'La jubilación no me alcanza',
        answer: 'La brecha entre lo que querés gastar y lo que te va a pagar ANSES define el capital que tenés que juntar.',
        yes: [
          'Brecha mensual = lo que querés gastar por mes menos el haber estimado de ANSES',
          'Capital objetivo: 25 veces la brecha anual, que es la regla del 4% de retiro sostenible',
          'Aporte mensual necesario para llegar a ese capital en los años que te faltan',
          'Lo que ya tenés ahorrado se capitaliza y baja el aporte mensual que hace falta',
        ],
        warn: [
          'La regla del 4% supone una cartera diversificada y un rendimiento REAL, por encima de la inflación: no uses tasas nominales en pesos',
          'La brecha crece si el haber pierde contra la inflación, que es lo que pasó en casi todos los períodos largos en Argentina',
          'No cuenta gastos de salud crecientes ni el costo de la prepaga, que se dispara después de los 65',
          'Empezar diez años más tarde puede duplicar el aporte mensual necesario',
        ],
        plazo:
          'cada año que postergás el ahorro es un año menos de interés compuesto: es la variable que más pesa en el resultado.',
      },
      {
        id: 'minimo',
        label: 'Cobro el haber mínimo',
        hint: 'Mínima, moratoria o PUAM',
        answer: `Hoy el haber mínimo garantizado es de ${fmtArs(HABER_MINIMO)} y se le suma un bono de ${fmtArs(BONO_REFUERZO)}.`,
        yes: [
          `Haber mínimo garantizado: ${fmtArs(HABER_MINIMO)} por mes`,
          `Bono de refuerzo para haberes hasta el mínimo: ${fmtArs(BONO_REFUERZO)}`,
          'El total se actualiza todos los meses por la movilidad, que sigue al IPC',
          'El aguinaldo se calcula sobre el haber, nunca sobre el bono',
        ],
        warn: [
          'El bono es no remunerativo, no genera aguinaldo y no se incorpora al haber: si un mes no lo decretan, no se cobra',
          'Si tu haber supera el mínimo aunque sea por poco, podés perder el bono completo y terminar cobrando menos que quien está en la mínima',
          'La PUAM equivale al 80% del haber mínimo y no genera pensión derivada para el cónyuge',
          'Las jubilaciones por moratoria cobran el mínimo, pero con el descuento de las cuotas del plan de pago',
        ],
        plazo:
          `el próximo ajuste se aplica con el IPC de ${MOVILIDAD.label}, que da ${MOVILIDAD.pct.toLocaleString('es-AR')}% (DNU 274/2024).`,
      },
    ],
  },

  inputsTitle: 'Cargá tu historia laboral',
  inputsIntro:
    'El promedio es el de tus remuneraciones ACTUALIZADAS por el índice oficial, no el sueldo nominal viejo. Si no lo tenés, poné tu sueldo bruto actual: es una buena aproximación.',
  fields: [
    {
      id: 'promedio',
      label: 'Promedio de tus remuneraciones actualizadas',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'Promedio de los últimos 10 años, actualizado por el índice oficial.',
    },
    { id: 'anios', label: 'Años de aportes computables', type: 'number', min: 0, max: 50, value: 30 },
    {
      id: 'aniosAntes1994',
      label: 'De esos años, cuántos son anteriores a julio de 1994',
      type: 'number',
      min: 0,
      max: 50,
      value: 0,
      help: 'Definen la prestación compensatoria (art. 24).',
    },
    {
      id: 'regimen',
      label: 'Régimen docente (solo si sos docente)',
      type: 'select',
      value: 'caba',
      options: Object.entries(DOCENTE).map(([value, d]) => ({ value, label: d.label })),
    },
    {
      id: 'gasto',
      label: 'Cuánto querés gastar por mes al jubilarte',
      prefix: '$',
      value: '1.500.000',
      thousands: true,
      help: 'Solo para la rama de ahorro complementario.',
    },
    { id: 'aniosParaRetiro', label: 'Años que te faltan para jubilarte', type: 'number', min: 1, max: 50, value: 15 },
    { id: 'tasa', label: 'Rendimiento real anual esperado del ahorro (%)', type: 'number', min: 0, max: 20, step: 0.5, value: 7 },
    { id: 'ahorroActual', label: 'Lo que ya tenés ahorrado', prefix: '$', value: '0', thousands: true },
  ],
  fineprint:
    'Es una estimación orientativa, no una liquidación. El haber real lo determina ANSES con tu historia laboral completa, las remuneraciones actualizadas por los índices oficiales y la movilidad vigente al momento del cese. Ninguna cuenta de esta página reemplaza el cálculo del organismo.',

  chart: {
    type: 'stacked',
    title: 'Cómo se parte tu haber',
    caption:
      'Una sola barra dividida en las partes que forman el haber: la PBU, que es fija; la prestación compensatoria por lo aportado antes de 1994; la PAP por lo aportado después; y el bono, que va aparte y no se incorpora al haber. Es exactamente lo que no se entiende del recibo de ANSES.',
  },
  breakdownTitle: 'De dónde sale cada peso de tu haber',
  breakdownIntro: 'Las barras comparan cada componente con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cómo se calcula el haber jubilatorio en Argentina?',
      a: `Con tres componentes de la Ley 24.241: la <b>PBU</b> (art. 20), una suma fija para todo el que acredita 30 años de aportes; la <b>prestación compensatoria</b> (art. 24), que suma 1,5% del promedio por cada año aportado antes de julio de 1994; y la <b>PAP</b> (art. 30), que suma otro 1,5% por año aportado desde esa fecha. La suma no puede quedar por debajo del haber mínimo garantizado (${fmtArs(HABER_MINIMO)}) ni superar el máximo (${fmtArs(HABER_MAXIMO)}).`,
    },
    {
      q: '¿Cuál es el haber mínimo jubilatorio y cuánto es el bono?',
      a: `El haber mínimo garantizado es de <b>${fmtArs(HABER_MINIMO)}</b> por mes y se le suma un bono de refuerzo de <b>${fmtArs(BONO_REFUERZO)}</b> para quienes no superan ese piso, así que el total ronda los ${fmtArs(HABER_MINIMO + BONO_REFUERZO)}. El bono es no remunerativo: se decreta mes a mes, no genera aguinaldo y no se incorpora al haber permanente.`,
    },
    {
      q: '¿Cómo se actualiza la jubilación cada mes?',
      a: `Desde el DNU 274/2024 la movilidad es mensual y sigue al IPC del INDEC publicado con dos meses de rezago. El coeficiente vigente sale del IPC de ${MOVILIDAD.label}, que fue del <b>${MOVILIDAD.pct.toLocaleString('es-AR')}%</b>. Antes regía la fórmula trimestral de la Ley 27.609, que combinaba RIPTE y recaudación y llegaba con más demora frente a la inflación.`,
    },
    {
      q: '¿Sobre qué sueldos se calcula el promedio?',
      a: 'Sobre las remuneraciones de los últimos 120 meses con aportes, actualizadas cada una por el índice oficial de movilidad hasta la fecha del cese. Por eso un sueldo de hace diez años no entra por su valor nominal: entra multiplicado por el coeficiente de actualización, que es lo que hace la calculadora de RIPTE.',
    },
    {
      q: '¿Qué es el RIPTE y para qué sirve en la jubilación?',
      a: 'El RIPTE es la Remuneración Imponible Promedio de los Trabajadores Estables que publica la Secretaría de Trabajo. Se usa para actualizar remuneraciones históricas: dividís el RIPTE actual por el RIPTE del mes de aquel sueldo y ese cociente es el multiplicador. Un sueldo de 2015 puede quedar multiplicado por varias decenas al traerlo a valor de hoy.',
    },
    {
      q: '¿Aportar más de 35 años me aumenta la jubilación?',
      a: 'Por la vía de PC y PAP no: el cómputo tiene tope en 35 años entre las dos prestaciones. Lo que sí puede subir el haber es seguir trabajando con sueldos altos, porque mejora el promedio de las remuneraciones actualizadas, y postergar el cese para que ese promedio arrastre años más recientes.',
    },
    {
      q: '¿Cuánto cobra un docente jubilado?',
      a: `El régimen docente de CABA paga el <b>82% del promedio de las 120 mejores remuneraciones</b> de los últimos 10 años, con 25 años de servicio docente y 57 años de edad para mujeres o 60 para varones. El IPS de la provincia de Buenos Aires aplica el 82% móvil sobre el 80% del mejor sueldo del último decenio, es decir un ${(DOCENTE['ips-ba'].pct * 100).toFixed(1).replace('.', ',')}% efectivo, con 30 años de servicio. En ambos casos las tareas frente al aula descuentan 5 años de edad y 5 de servicios.`,
    },
    {
      q: '¿Cuánto tengo que ahorrar para complementar la jubilación?',
      a: 'La cuenta corta: calculá la brecha entre lo que querés gastar por mes y el haber que estimás cobrar, multiplicala por 12 y por 25. Ese 25 sale de la regla del 4%, que es la tasa de retiro anual históricamente sostenible sobre una cartera diversificada. Para una brecha de $500.000 por mes el capital objetivo son $150 millones a valores de hoy, y cuanto antes empieces menos cuota mensual necesitás, porque el interés compuesto hace casi todo el trabajo.',
    },
    {
      q: '¿Puedo perder el bono si mi haber sube un poco?',
      a: `Sí, y es la trampa más injusta del sistema. El bono se paga a quienes no superan el haber mínimo, así que alguien que cobra apenas un peso más que ${fmtArs(HABER_MINIMO)} puede quedar afuera del refuerzo completo de ${fmtArs(BONO_REFUERZO)} y terminar con menos plata en mano que quien cobra la mínima. En los decretos recientes suele haber un tramo proporcional, pero conviene verificar el texto del mes.`,
    },
    {
      q: '¿La jubilación tiene aguinaldo?',
      a: 'Sí: el SAC previsional es el 50% del mejor haber mensual del semestre y se cobra con el haber de junio y de diciembre según el cronograma por terminación de DNI. Los bonos y refuerzos no integran la base, así que no generan aguinaldo: se suman aparte al cobro del mes.',
    },
    {
      q: '¿Qué descuentos tiene el haber jubilatorio?',
      a: 'El principal es el 3% del aporte a PAMI (INSSJP), que se retiene sobre el haber. A eso pueden sumarse las cuotas de una moratoria previsional, los descuentos por créditos de ANSES o de mutuales y, en haberes altos, la retención de Impuesto a las Ganancias, aunque el mínimo no imponible previsional deja afuera a la gran mayoría.',
    },
    {
      q: '¿Cuál es la jubilación máxima que se puede cobrar?',
      a: `El haber máximo del régimen general está hoy en <b>${fmtArs(HABER_MAXIMO)}</b> por mes, y el haber medio del sistema ronda los ${fmtArs(HABER_MEDIO)}. El tope existe porque las remuneraciones tienen una base imponible máxima para aportar: por encima de ese sueldo no se aporta más y, por lo tanto, tampoco se acumula más haber.`,
    },
  ],

  sources: [
    {
      name: 'Ley 24.241 — Sistema Integrado de Jubilaciones y Pensiones (arts. 20, 24 y 30)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/639/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto actualizado',
    },
    {
      name: 'DNU 274/2024 — movilidad mensual por IPC de las prestaciones previsionales',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/395000-399999/398070/norma.htm',
      publisher: 'InfoLeg',
      date: '2024',
    },
    {
      name: 'Ley 27.609 — fórmula de movilidad trimestral (régimen anterior)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/345000-349999/346382/norma.htm',
      publisher: 'InfoLeg',
      date: '2021',
    },
    {
      name: 'Haberes, movilidad y bonos vigentes — resoluciones de ANSES',
      url: 'https://www.anses.gob.ar/normativa/resoluciones',
      publisher: 'ANSES',
      date: 'actualización mensual',
    },
    {
      name: 'Índice de Precios al Consumidor (IPC) — coeficiente de movilidad',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: `último dato: ${MOVILIDAD.label}`,
    },
    {
      name: 'Decreto-Ley 9650/80 — régimen previsional de la provincia de Buenos Aires (IPS)',
      url: 'https://www.ips.gba.gob.ar/',
      publisher: 'Instituto de Previsión Social de la Provincia de Buenos Aires',
    },
  ],

  replaces: [
    '/calculadora-jubilacion-anses-monto-minimo-maxima-2026',
    '/calculadora-jubilacion-minima-anses',
    '/calculadora-jubilacion-docente-ips-buenos-aires',
    '/calculadora-jubilacion-docente-caba',
    '/calculadora-ripte-actualizacion-jubilatoria-sueldo',
    '/calculadora-jubilacion-cuanto-necesito',
    '/calculadora-quita-jubilatoria-bono-refuerzo-anses-2026',
    '/calculadora-jubilacion-haber-movilidad-trimestral',
    '/calculadora-haber-minimo-jubilatorio-2026-bono-total',
    '/calculadora-cuanto-voy-a-cobrar-jubilacion-haber-estimado',
    '/calculadora-proyeccion-ahorro-jubilacion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
