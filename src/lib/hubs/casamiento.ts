import type { HubData } from './types';
import { getCalculatorDisclaimer } from '../disclaimers';
import { anilloCompromisoPrecioSueldo } from '../formulas/anillo-compromiso-precio-sueldo';
import { costoBodaArgentina } from '../formulas/costo-boda-argentina';
import { presupuestoCasamientoPorInvitado } from '../formulas/presupuesto-casamiento-por-invitado';
import { regaloBodaApropiadoInvitado } from '../formulas/regalo-boda-apropiado-invitado';
import { fechaBodaIdeal } from '../formulas/fecha-boda-ideal';

/**
 * Hub de decisión — "¿Cuánto cuesta casarse?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cinco ramas: el anillo de compromiso, el
 * presupuesto total de la fiesta (default), el costo por invitado, el lado del
 * invitado (cuánto regalar) y cuándo conviene poner la fecha.
 *
 * DE DÓNDE SALEN LOS NÚMEROS — ninguno está escrito a mano:
 *
 *   costo por invitado y rubros fijos de la fiesta → costo-boda-argentina.ts
 *     (se derivan DIFERENCIANDO el total entre 100 y 101 invitados, para separar
 *      la parte variable de la fija, y parseando el `desglose` de la fórmula)
 *   reparto porcentual por rubro                   → presupuesto-casamiento-por-invitado.ts
 *   sueldos que valen 1, 2 o 3 "reglas" de anillo  → anillo-compromiso-precio-sueldo.ts
 *   proporción del regalo según el vínculo         → regalo-boda-apropiado-invitado.ts
 *   puntaje de cada sábado del año                 → fecha-boda-ideal.ts
 *     (se llama la fórmula mes por mes y se guarda su propia salida)
 *
 * DOS FÓRMULAS VIEJAS ESTÁN EN DÓLARES Y SE MUESTRAN COMO PESOS:
 *  - presupuesto-casamiento-por-invitado.ts usa 70 / 150 / 350 "$" por invitado
 *  - regalo-boda-apropiado-invitado.ts usa una matriz de 100 a 2.000 "$"
 * Son escalas en USD imprimidas con signo peso. Este hub usa de esas dos
 * fórmulas SÓLO su estructura relativa (los porcentajes por rubro y la
 * proporción entre vínculos) y ancla los importes en la única fórmula con
 * pesos argentinos reales, costo-boda-argentina.ts. Está declarado a la vista
 * en cada constante.
 */

/* ── Utilidades ───────────────────────────────────────────────────────── */

const nAr = (v: number, d = 0) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

/** Parsea "$1.234.567" tal como lo escribe la fórmula (es-AR). */
function pesos(s: string): number {
  return Number(String(s).replace(/[^\d]/g, '')) || 0;
}

/** Los seis rubros que la fórmula de costo de boda escribe en su `desglose`. */
function rubros(invitados: number, nivel: string, musica: string) {
  const out = costoBodaArgentina({ invitados, nivel, musica });
  const map: Record<string, number> = {};
  for (const line of out.desglose.split('\n')) {
    const [k, v] = line.split(': ');
    map[k.replace(/\s*\(.*\)$/, '')] = pesos(v);
  }
  return {
    total: out.totalEstimado,
    porInvitado: out.costoPorInvitado,
    salon: map['Salón + catering'],
    musica: map['Música'],
    foto: map['Foto + video'],
    decoracion: map['Decoración'],
    torta: map['Torta + mesa dulce'],
    varios: map['Varios'],
  };
}

const NIVELES = ['basico', 'medio', 'premium'] as const;
const MUSICAS = ['dj', 'banda', 'ambos'] as const;

/**
 * Costo marginal de sumar un invitado (salón + catering), derivado por
 * diferencia: es exactamente el `cpp` de costo-boda-argentina.ts, pero sin
 * copiarlo a mano.
 */
export const COSTO_CUBIERTO: Record<string, number> = Object.fromEntries(
  NIVELES.map((n) => [n, rubros(101, n, 'dj').salon - rubros(100, n, 'dj').salon])
);

/** Rubros que NO dependen de la cantidad de invitados, por nivel. */
export const RUBROS_FIJOS: Record<string, { foto: number; decoracion: number; torta: number; varios: number }> =
  Object.fromEntries(
    NIVELES.map((n) => {
      const r = rubros(100, n, 'dj');
      return [n, { foto: r.foto, decoracion: r.decoracion, torta: r.torta, varios: r.varios }];
    })
  );

/** Costo de la música, por opción. */
export const COSTO_MUSICA: Record<string, number> = Object.fromEntries(
  MUSICAS.map((m) => [m, rubros(100, 'medio', m).musica])
);

/** Suma de los fijos (sin música) por nivel: lo que pagás aunque no invites a nadie. */
export const FIJOS_SIN_MUSICA: Record<string, number> = Object.fromEntries(
  NIVELES.map((n) => {
    const f = RUBROS_FIJOS[n];
    return [n, f.foto + f.decoracion + f.torta + f.varios];
  })
);

/**
 * Reparto porcentual por rubro, derivado de presupuesto-casamiento-por-invitado.ts.
 * De esa fórmula tomamos SÓLO los porcentajes (su escala absoluta está en USD).
 */
const _split = presupuestoCasamientoPorInvitado({ invitados: 100000, nivel: 'medio' });
export const SPLIT_RUBROS = {
  salon: _split.costoSalon / _split.costoTotal,
  comidaBebida: _split.costoComidaBebida / _split.costoTotal,
  vestuario: _split.costoVestuario / _split.costoTotal,
  fotoVideo: _split.costoFotoVideo / _split.costoTotal,
  musicaDj: _split.costoMusicaDj / _split.costoTotal,
  otros: _split.costoOtros / _split.costoTotal,
};

/* ── Anillo ───────────────────────────────────────────────────────────── */

/** Cuántos sueldos vale cada "regla", según la propia fórmula del anillo. */
export const ANILLO_SUELDOS: Record<string, number> = Object.fromEntries(
  ['1mes', '2meses', '3meses'].map((r) => [
    r,
    anilloCompromisoPrecioSueldo({ sueldoMensual: 1, regla: r }).precioAnillo,
  ])
);

/** Ahorro de lab-grown / moissanita, leído del consejo de la fórmula (40-60%). */
const _consejoAnillo = anilloCompromisoPrecioSueldo({ sueldoMensual: 1000000, regla: '2meses' }).consejo;
const _rangoAhorro = /(\d+)-(\d+)%/.exec(_consejoAnillo);
export const ANILLO_AHORRO = {
  min: Number(_rangoAhorro?.[1] ?? 40) / 100,
  max: Number(_rangoAhorro?.[2] ?? 60) / 100,
};

/* ── Regalo del invitado ──────────────────────────────────────────────── */

const RELACIONES = ['familiaCercana', 'familiaLejana', 'amigoIntimo', 'amigo', 'conocido'] as const;

/**
 * Base cruda de la matriz de regalo-boda-apropiado-invitado.ts. Se consulta con
 * un sueldo intermedio (entre 1.000 y 5.000) para que la fórmula no aplique
 * ninguno de sus dos topes y devuelva el valor de tabla.
 */
function regaloBase(relacion: string, nivel: string) {
  return regaloBodaApropiadoInvitado({
    relacionConNovios: relacion,
    nivelEvento: nivel,
    sueldoInvitado: 4000,
  }).regaloSugerido;
}

/**
 * Proporción del regalo respecto del vínculo "amigo", por nivel de evento.
 * Es lo único aprovechable de esa fórmula: su escala absoluta está en dólares.
 * El ancla en pesos la pone COSTO_CUBIERTO (regla del cubierto: un amigo cubre
 * lo que cuesta su lugar en la mesa).
 */
export const REGALO_RATIO: Record<string, Record<string, number>> = Object.fromEntries(
  RELACIONES.map((rel) => [
    rel,
    Object.fromEntries(NIVELES.map((n) => [n, regaloBase(rel, n) / regaloBase('amigo', n)])),
  ])
);

/** Tope del 30% del sueldo: es el umbral con el que la propia fórmula avisa "ajustá hacia abajo". */
export const REGALO_TOPE_SUELDO = 0.3;

/* ── Fecha ────────────────────────────────────────────────────────────── */

export const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export interface FechaMes {
  mes: number;
  sabados: number;
  mejorFecha: string;
  mejorPuntaje: number;
  promedio: number;
  nota: string;
}

/**
 * Se llama a fecha-boda-ideal.ts mes por mes y se guarda SU salida: puntaje de
 * cada sábado, nota y cantidad. Acá no se reimplementa el scoring.
 */
function tablaFechas(evitar: 'si' | 'no'): FechaMes[] {
  return MESES_ES.map((_, i) => {
    const o = fechaBodaIdeal({ mesPreferido: String(i + 1), evitarSupersticiones: evitar });
    const filas = o.listaFechas
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        const m = /^(.+?) \(puntaje: (-?\d+)\) — (.*)$/.exec(l);
        return { fecha: m?.[1] ?? '', score: Number(m?.[2] ?? 0), nota: (m?.[3] ?? '').trim() };
      });
    const top = filas[0];
    return {
      mes: i + 1,
      sabados: o.totalSabados,
      mejorFecha: top?.fecha ?? '',
      mejorPuntaje: top?.score ?? 0,
      promedio: filas.length ? filas.reduce((a, f) => a + f.score, 0) / filas.length : 0,
      nota: top?.nota ?? '',
    };
  });
}

export const FECHAS: Record<string, FechaMes[]> = {
  si: tablaFechas('si'),
  no: tablaFechas('no'),
};

/** Puntaje máximo y mínimo del año, para ubicar tu mes en la escala. */
export const FECHA_RANGO = (() => {
  const proms = FECHAS.si.map((f) => f.promedio);
  return { max: Math.max(...proms), min: Math.min(...proms) };
})();

const _mejorMes = FECHAS.si.reduce((a, b) => (b.promedio > a.promedio ? b : a));
const _peorMes = FECHAS.si.reduce((a, b) => (b.promedio < a.promedio ? b : a));

/* ── Disclaimers textuales (src/lib/disclaimers.ts) ───────────────────── */

export const DISCLAIMER = getCalculatorDisclaimer({
  slug: 'calculadora-costo-boda-argentina',
  category: 'vida',
});
/** El calc del anillo clasifica como laboral porque su slug habla de sueldo. */
export const DISCLAIMER_ANILLO = getCalculatorDisclaimer({
  slug: 'calculadora-anillo-compromiso-precio-sueldo',
  category: 'vida',
});

/* ── Números de ejemplo para el copy ──────────────────────────────────── */

const EJ = rubros(120, 'medio', 'dj');

/* ── Hub ──────────────────────────────────────────────────────────────── */

export const hub: HubData = {
  slug: 'eventos/casamiento',
  title: '¿Cuánto cuesta casarse? Anillo, fiesta, por invitado y regalo',
  description:
    'Cuánto sale casarse en Argentina: el anillo de compromiso, el presupuesto total de la fiesta, el costo real por invitado, cuánto regalar si sos invitado y qué fecha conviene. Cinco calculadoras en una.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Plata y decisiones',
  h1: '¿Cuánto cuesta casarse?',
  lede:
    'Desde el anillo hasta el último souvenir, y también del otro lado del mostrador: cuánto le toca poner al invitado. Partimos del presupuesto de la fiesta, que es la pregunta que casi todos hacen primero.',
  stamps: [
    'Actualizado 27-07-2026',
    `Cubierto de referencia $${nAr(COSTO_CUBIERTO.medio)} por invitado`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué estás tratando de averiguar?',
    intro: 'Partimos del presupuesto de la fiesta. Si tu pregunta es otra, cambiala.',
    items: [
      {
        id: 'fiesta',
        label: 'Cuánto sale la fiesta entera',
        hint: 'El caso más común',
        answer: `Una boda de ${120} invitados de nivel estándar ronda los $${nAr(EJ.total)}, y el salón con el catering se lleva el ${Math.round((EJ.salon / EJ.total) * 100)}% de eso.`,
        yes: [
          `Salón y catering: $${nAr(COSTO_CUBIERTO.medio)} por invitado en nivel estándar, $${nAr(COSTO_CUBIERTO.basico)} en básico y $${nAr(COSTO_CUBIERTO.premium)} en premium`,
          `Música: $${nAr(COSTO_MUSICA.dj)} un DJ, $${nAr(COSTO_MUSICA.banda)} una banda, $${nAr(COSTO_MUSICA.ambos)} los dos`,
          'Foto y video, decoración, torta y mesa dulce, y los varios del civil, invitaciones y souvenirs',
          `Los rubros que no dependen de la lista de invitados suman $${nAr(FIJOS_SIN_MUSICA.medio + COSTO_MUSICA.dj)} en nivel estándar`,
        ],
        warn: [
          DISCLAIMER,
          'El presupuesto del salón casi nunca incluye la bebida: pedí por escrito qué marcas y qué cantidades entran',
          'La seña se paga a valor del día y el saldo a valor del día del evento: en un año de inflación eso mueve el total más que cualquier decisión de decoración',
          'Los "varios" son el rubro que más se subestima: civil, alianzas, peinado, maquillaje, transporte y souvenirs suelen superar lo previsto',
        ],
        plazo:
          'los salones buenos se reservan con 10 a 14 meses de anticipación, y el turno del Registro Civil se pide con 30 a 60 días según la jurisdicción.',
      },
      {
        id: 'anillo',
        label: 'Cuánto gastar en el anillo de compromiso',
        hint: 'Antes de todo lo demás',
        answer: `La referencia más usada es de ${ANILLO_SUELDOS['2meses']} sueldos, pero es una regla publicitaria, no una norma: con un sueldo alcanza y sobra si el anillo es lab-grown o moissanita.`,
        yes: [
          `Presupuesto según la regla que elijas: ${ANILLO_SUELDOS['1mes']}, ${ANILLO_SUELDOS['2meses']} o ${ANILLO_SUELDOS['3meses']} sueldos mensuales`,
          `Cuánto ahorrás con diamante de laboratorio o moissanita: entre ${Math.round(ANILLO_AHORRO.min * 100)}% y ${Math.round(ANILLO_AHORRO.max * 100)}% con el mismo brillo a la vista`,
          'Cuánto pesa el anillo dentro del presupuesto total del casamiento',
        ],
        warn: [
          DISCLAIMER_ANILLO,
          'Lo de "tres sueldos" salió de una campaña publicitaria de De Beers de los años 30 que se reforzó en los 80. Es folclore de marketing, no una recomendación financiera ni una costumbre antigua',
          'Nadie debería endeudarse por un anillo: si la cuota del anillo compite con la seña del salón, ganó el salón',
          'El anillo pagado en cuotas con tarjeta suma CFT: mirá el costo final, no el precio de lista',
        ],
        plazo:
          'un anillo a medida tarda entre 3 y 6 semanas; si pensás proponer en una fecha concreta, encargalo con dos meses.',
      },
      {
        id: 'por-invitado',
        label: 'Cuánto me cuesta cada invitado',
        hint: 'Para decidir a quién invitar',
        answer: `El costo promedio por invitado no es lo que te ahorrás si sacás a alguien: el promedio da $${nAr(EJ.porInvitado)} y lo que realmente se ahorra por cabeza son $${nAr(COSTO_CUBIERTO.medio)}.`,
        yes: [
          'El costo promedio por invitado, que es el número que muestran los salones',
          `El costo marginal real: $${nAr(COSTO_CUBIERTO.medio)} por cada persona que agregás o sacás en nivel estándar`,
          'Cuánto de tu presupuesto es fijo y no baja aunque recortes la lista',
          `El reparto por rubro: salón ${Math.round(SPLIT_RUBROS.salon * 100)}%, comida y bebida ${Math.round(SPLIT_RUBROS.comidaBebida * 100)}%, vestuario ${Math.round(SPLIT_RUBROS.vestuario * 100)}%, foto y video ${Math.round(SPLIT_RUBROS.fotoVideo * 100)}%, música ${Math.round(SPLIT_RUBROS.musicaDj * 100)}% y otros ${Math.round(SPLIT_RUBROS.otros * 100)}%`,
        ],
        warn: [
          DISCLAIMER,
          'Recortar diez invitados no baja el presupuesto diez veces el promedio: la foto, la música y la decoración cuestan lo mismo con 80 que con 150',
          'Los menús infantiles y de proveedores se cobran distinto: confirmá cuántos cubiertos te cuenta el salón de verdad',
          'El mínimo de invitados del salón es el número que manda: si pide 120 y vas con 90, pagás 120 igual',
        ],
        plazo:
          'la lista definitiva se cierra entre 15 y 20 días antes: después de eso el salón factura el número que le pasaste, vayan o no.',
      },
      {
        id: 'invitado',
        label: 'Soy invitado: ¿cuánto regalo?',
        hint: 'El otro lado del mostrador',
        answer: `La regla práctica es cubrir tu cubierto: en una boda de nivel estándar eso son unos $${nAr(COSTO_CUBIERTO.medio)}, y de ahí sube o baja según el vínculo.`,
        yes: [
          `El punto de partida es lo que le cuesta tu lugar en la mesa a la pareja: $${nAr(COSTO_CUBIERTO.basico)}, $${nAr(COSTO_CUBIERTO.medio)} o $${nAr(COSTO_CUBIERTO.premium)} según el nivel del evento`,
          `Ajuste por vínculo: familia cercana multiplica por ${nAr(REGALO_RATIO.familiaCercana.medio, 2)}, un amigo íntimo por ${nAr(REGALO_RATIO.amigoIntimo.medio, 2)} y un conocido por ${nAr(REGALO_RATIO.conocido.medio, 2)}`,
          `Tope de sensatez: el regalo no pasa del ${Math.round(REGALO_TOPE_SUELDO * 100)}% de tu sueldo, y si lo pasaba te lo bajamos`,
          'Qué porcentaje de tu sueldo representa, para que lo veas antes de transferir',
        ],
        warn: [
          DISCLAIMER,
          'Nadie está obligado a cubrir su cubierto: es una convención, no una deuda. Si vas en pareja, el regalo es uno solo para los dos',
          'Si hay lista de bodas o alias para transferencia, respetá el canal que pidieron: el regalo físico duplicado es el clásico que termina en un placard',
          'El pasaje y el hotel de una boda de destino cuentan como parte de tu esfuerzo: en ese caso el regalo baja, y está perfecto',
        ],
        plazo:
          'si transferís, hacelo en la semana previa o en los días posteriores: el día de la fiesta los novios no miran el celular.',
      },
      {
        id: 'fecha',
        label: 'Cuándo conviene poner la fecha',
        hint: 'Estación, feriados y el 13',
        answer: `El mejor mes del año para casarse en Argentina es ${MESES_ES[_mejorMes.mes - 1]} y el más flojo, ${MESES_ES[_peorMes.mes - 1]}: entre uno y otro hay ${Math.round(_mejorMes.promedio - _peorMes.promedio)} puntos de diferencia.`,
        yes: [
          'Puntaje de cada sábado del mes que elijas, con el mejor destacado',
          'Primavera suma puntos, otoño algo menos e invierno resta',
          'Se descuenta puntaje si el sábado cae 13 o si el fin de semana pega con un feriado',
          'Cuántos sábados tiene el mes: con cuatro sábados y todos ocupados, el mes se te fue',
        ],
        warn: [
          DISCLAIMER,
          'Un fin de semana largo baja el puntaje porque la mitad de tus invitados se va de viaje, no porque el salón cueste más',
          'La temporada alta de salones es la misma que la de mejor clima: la mejor fecha es también la más cara y la que se reserva antes',
          'El puntaje no reemplaza mirar la agenda de tu familia: una fecha con 90 puntos y la mitad de los invitados de vacaciones vale menos que una de 70',
        ],
        plazo:
          'reservá salón y fecha con 10 a 14 meses de anticipación; para los sábados de primavera, más.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Los campos sirven a las cinco preguntas: los invitados y el nivel mandan en la fiesta, el sueldo en el anillo y en el regalo, y el mes en la fecha.',
  fields: [
    { id: 'invitados', label: 'Invitados', type: 'number', min: 20, max: 800, value: 120 },
    {
      id: 'nivel',
      label: 'Nivel del evento',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'basico', label: 'Básico' },
        { value: 'medio', label: 'Estándar' },
        { value: 'premium', label: 'Premium' },
      ],
    },
    {
      id: 'musica',
      label: 'Música',
      type: 'select',
      value: 'dj',
      options: [
        { value: 'dj', label: 'DJ' },
        { value: 'banda', label: 'Banda en vivo' },
        { value: 'ambos', label: 'Banda y DJ' },
      ],
    },
    {
      id: 'sueldo',
      label: 'Sueldo mensual (para el anillo o para el regalo)',
      prefix: '$',
      value: '1.500.000',
      thousands: true,
      help: 'Si estás mirando el anillo, es tu sueldo. Si sos invitado, es el tuyo también: sobre él se calcula el tope del regalo.',
    },
    {
      id: 'regla',
      label: 'Regla para el anillo',
      type: 'select',
      value: '2meses',
      options: [
        { value: '1mes', label: 'Un sueldo (prudente)' },
        { value: '2meses', label: 'Dos sueldos (el clásico)' },
        { value: '3meses', label: 'Tres sueldos (la regla publicitaria)' },
      ],
    },
    {
      id: 'relacion',
      label: 'Si sos invitado, tu vínculo con la pareja',
      type: 'select',
      value: 'amigo',
      options: [
        { value: 'familiaCercana', label: 'Familia cercana' },
        { value: 'familiaLejana', label: 'Familia lejana' },
        { value: 'amigoIntimo', label: 'Amigo o amiga íntima' },
        { value: 'amigo', label: 'Amigo o amiga' },
        { value: 'conocido', label: 'Conocido o compañero de trabajo' },
      ],
    },
    {
      id: 'mes',
      label: 'Mes que estás mirando para la fecha',
      type: 'select',
      value: '10',
      options: MESES_ES.map((m, i) => ({ value: String(i + 1), label: m[0].toUpperCase() + m.slice(1) })),
    },
    {
      id: 'evitar',
      label: '¿Evitar el 13 y los fines de semana largos?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, restarles puntaje' },
        { value: 'no', label: 'No me importan' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte',
    caption:
      'En las ramas de plata cada porción es un rubro del presupuesto, así que se ve de un vistazo qué parte crece con la lista de invitados y qué parte cuesta lo mismo con 80 que con 200. En la rama del regalo compara lo que ponés vos contra lo que cuesta tu lugar en la mesa, y en la de la fecha, cuánto puntaje logra el mes contra lo que le falta para el ideal.',
  },
  breakdownTitle: 'El desglose',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande de la lista.',

  faq: [
    {
      q: '¿Cuánto sale casarse en Argentina?',
      a: `Una fiesta de <b>120 invitados de nivel estándar con DJ ronda los $${nAr(EJ.total)}</b>, o sea unos $${nAr(EJ.porInvitado)} por invitado. En nivel básico el mismo evento baja bastante y en premium más que se duplica, porque el salón y el catering pasan de $${nAr(COSTO_CUBIERTO.basico)} a $${nAr(COSTO_CUBIERTO.premium)} por persona. Al total de la fiesta hay que sumarle lo que casi nadie presupuesta al principio: el anillo, las alianzas, el civil y la luna de miel.`,
    },
    {
      q: '¿Qué rubro se lleva la mayor parte del presupuesto?',
      a: `El salón con el catering, siempre: se lleva alrededor del <b>${Math.round((EJ.salon / EJ.total) * 100)}%</b> del total en una boda de 120 invitados y es el único rubro que crece con cada persona que sumás. Mirado como porcentajes de referencia, el reparto típico es salón ${Math.round(SPLIT_RUBROS.salon * 100)}%, comida y bebida ${Math.round(SPLIT_RUBROS.comidaBebida * 100)}%, vestuario ${Math.round(SPLIT_RUBROS.vestuario * 100)}%, foto y video ${Math.round(SPLIT_RUBROS.fotoVideo * 100)}%, música ${Math.round(SPLIT_RUBROS.musicaDj * 100)}% y otros ${Math.round(SPLIT_RUBROS.otros * 100)}%. Por eso la lista de invitados es la palanca más rápida: es lo único que mueve dos tercios del presupuesto.`,
    },
    {
      q: '¿Cuánto me ahorro si saco invitados de la lista?',
      a: `Menos de lo que parece, y esta es la confusión más cara del casamiento. El <b>costo promedio</b> por invitado en el ejemplo es de $${nAr(EJ.porInvitado)}, pero el <b>costo marginal</b> —lo que realmente dejás de pagar por cada persona que sacás— es de $${nAr(COSTO_CUBIERTO.medio)} en nivel estándar. La diferencia es que la foto, el video, la música, la decoración y la torta cuestan lo mismo con 80 invitados que con 150: son $${nAr(FIJOS_SIN_MUSICA.medio + COSTO_MUSICA.dj)} que no se mueven. Sacar diez personas ahorra $${nAr(COSTO_CUBIERTO.medio * 10)}, no $${nAr(EJ.porInvitado * 10)}.`,
    },
    {
      q: '¿Es verdad que el anillo tiene que costar tres sueldos?',
      a: 'No. La "regla de los tres sueldos" es una campaña publicitaria: la agencia N.W. Ayer la creó para De Beers en los años 30 con la idea de un sueldo, y la escaló a dos y después a tres en los 70 y 80, incluido el famoso "un diamante es para siempre". No es una tradición, no es una norma y ningún organismo la recomienda. Este hub la ofrece como referencia cultural porque es lo que la gente busca, pero el criterio sano es el inverso: fijás cuánto podés gastar sin endeudarte y ese es el presupuesto del anillo. Un sueldo es una elección perfectamente respetable.',
    },
    {
      q: '¿Conviene un diamante de laboratorio o una moissanita?',
      a: `Si el objetivo es el brillo, sí: se ahorra entre <b>${Math.round(ANILLO_AHORRO.min * 100)}% y ${Math.round(ANILLO_AHORRO.max * 100)}%</b> con una piedra que a simple vista no se distingue. El diamante de laboratorio es químicamente idéntico al natural (mismo carbono, misma dureza) y sólo se diferencia con equipamiento gemológico; la moissanita es otro mineral, con más fuego y algo menos de dureza. La contra a tener en cuenta es la reventa: el lab-grown viene bajando de precio año a año, así que no lo pienses como reserva de valor. Si el presupuesto es chico, conviene priorizar claridad y color por sobre quilates.`,
    },
    {
      q: 'Soy invitado, ¿cuánto se regala en un casamiento?',
      a: `La convención más usada es <b>cubrir tu cubierto</b>: lo que le cuesta a la pareja tu lugar en la mesa, alrededor de $${nAr(COSTO_CUBIERTO.medio)} en una boda de nivel estándar, $${nAr(COSTO_CUBIERTO.basico)} en una sencilla y $${nAr(COSTO_CUBIERTO.premium)} en una premium. Sobre eso pesa el vínculo: la familia cercana suele multiplicar por ${nAr(REGALO_RATIO.familiaCercana.medio, 2)}, un amigo íntimo por ${nAr(REGALO_RATIO.amigoIntimo.medio, 2)} y un conocido por ${nAr(REGALO_RATIO.conocido.medio, 2)}. Y hay un tope de sentido común que el hub aplica solo: el regalo no debería pasar el ${Math.round(REGALO_TOPE_SUELDO * 100)}% de tu sueldo mensual. Si vas en pareja, es un solo regalo entre los dos.`,
    },
    {
      q: '¿Está mal regalar menos de lo que cuesta el cubierto?',
      a: 'No. Nadie invita a su casamiento para recuperar la inversión, y la pareja eligió el nivel de fiesta antes de armar la lista. Si estás pasando un momento ajustado, si tuviste que pagar pasaje y hotel para llegar, o si el evento es premium y vos no, regalá lo que puedas y listo. El cubierto es un punto de partida útil para no quedarse corto por no saber, no una factura.',
    },
    {
      q: '¿Cuál es el mejor mes para casarse en Argentina?',
      a: `Por clima y por agenda, la primavera: ${MESES_ES[_mejorMes.mes - 1]} encabeza el ranking con un promedio de ${nAr(_mejorMes.promedio, 0)} puntos sobre 100, y el peor mes es ${MESES_ES[_peorMes.mes - 1]}, con ${nAr(_peorMes.promedio, 0)}. El puntaje premia primavera y otoño, castiga el invierno, y descuenta si el sábado cae 13 o si el fin de semana pega con un feriado, porque ahí la mitad de los invitados se va de viaje. La contracara es económica: los sábados de primavera son los más disputados y los que menos margen de negociación te dan con el salón.`,
    },
    {
      q: '¿Conviene casarse en un fin de semana largo?',
      a: 'Casi nunca. Suena lógico —hay un día más para recuperarse— pero es el escenario donde más ausencias vas a tener: un porcentaje grande de tus invitados ya tenía plan de viaje. También sube el precio de hoteles y pasajes para los que vienen de afuera, y complica al proveedor que ese fin de semana tiene tres eventos. El hub le descuenta puntaje a los sábados que caen a menos de dos días de un feriado justamente por eso.',
    },
    {
      q: '¿Cuánto cuesta el trámite del civil?',
      a: 'Es la parte barata del casamiento, y varía por jurisdicción: cada Registro Civil provincial o de la Ciudad fija su propio arancel, y suele haber dos precios muy distintos según casarse en la sede en día y horario habitual, o pedir la ceremonia en un salón, a domicilio o fuera de horario, que es bastante más caro. En todos los casos hace falta turno previo, DNI de ambos y dos testigos (más si la ceremonia es fuera de la sede). El monto exacto lo publica el Registro Civil de tu jurisdicción y conviene consultarlo el mismo mes: se actualiza seguido.',
    },
    {
      q: '¿Cómo se arma el presupuesto cuando la inflación mueve todo?',
      a: 'Con dos cuentas en paralelo. Primero, presupuestá en valores de hoy y usá el hub para ver la estructura: qué parte es variable y qué parte es fija. Segundo, prestá atención a cómo se pacta cada contrato, porque ahí está el riesgo real: seña a valor del día y saldo a valor del día del evento es lo habitual, y significa que el número final depende de cuándo te cases, no sólo de qué elijas. Pedí siempre el precio por cubierto y no el total cerrado, dejá por escrito qué incluye la bebida, y guardá un colchón del 10% al 15% para los ajustes de último momento.',
    },
    {
      q: '¿Qué gastos del casamiento son los que más se olvidan?',
      a: `Los "varios", que en el desglose parecen chicos y nunca lo son: alianzas, turno del civil, invitaciones, peinado y maquillaje, transporte, souvenirs, la noche de hotel y las propinas de los proveedores. En nivel estándar el hub los estima en $${nAr(RUBROS_FIJOS.medio.varios)}, pero es el rubro donde más gente se pasa. Los otros dos clásicos que quedan fuera del presupuesto de la fiesta son el anillo de compromiso y la luna de miel: si los sumás desde el principio, el número te va a asustar menos después.`,
    },
  ],

  sources: [
    {
      name: 'Código Civil y Comercial de la Nación — Matrimonio (arts. 401 a 420)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLEG · Ministerio de Justicia',
    },
    {
      name: 'Casarse: turnos, requisitos y trámite del Registro Civil',
      url: 'https://www.argentina.gob.ar/servicio/casarse',
      publisher: 'Gobierno de la República Argentina',
    },
    {
      name: 'Registro Civil de la Ciudad de Buenos Aires — celebración del matrimonio',
      url: 'https://buenosaires.gob.ar/tramites/matrimonio-civil',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
    {
      name: 'Feriados y días no laborables',
      url: 'https://www.argentina.gob.ar/interior/feriados',
      publisher: 'Ministerio del Interior',
    },
    {
      name: 'Índice de Precios al Consumidor — capítulos Restaurantes y hoteles y Prendas de vestir',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Estadísticas vitales — matrimonios registrados por provincia',
      url: 'https://www.argentina.gob.ar/salud/deis',
      publisher: 'DEIS · Ministerio de Salud de la Nación',
    },
  ],

  replaces: [
    '/calculadora-anillo-compromiso-precio-sueldo',
    '/calculadora-costo-boda-argentina',
    '/calculadora-presupuesto-casamiento-por-invitado',
    '/calculadora-regalo-boda-apropiado-invitado',
    '/calculadora-fecha-boda-ideal',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-matrimonio-civil-costo-tramite-argentina',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Todo lo que compute() necesita del lado del cliente, en un solo objeto. */
export const CASAMIENTO_MATH = {
  cubierto: COSTO_CUBIERTO,
  fijos: RUBROS_FIJOS,
  musica: COSTO_MUSICA,
  split: SPLIT_RUBROS,
  anilloSueldos: ANILLO_SUELDOS,
  anilloAhorro: ANILLO_AHORRO,
  regaloRatio: REGALO_RATIO,
  regaloTope: REGALO_TOPE_SUELDO,
  fechas: FECHAS,
  fechaRango: FECHA_RANGO,
  meses: MESES_ES,
};
