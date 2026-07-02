/**
 * Sala de decisión CL — "¿Prepago la deuda o invierto la plata?"
 *
 * Compara el CAE de la deuda (consumo ~20-35%, tarjetas ~25-40%) contra lo que
 * rendiría esa misma plata invertida (depósito a plazo 5-6%, fondos mutuos).
 * Prepagar deuda cara es un rendimiento GARANTIZADO igual al CAE. La gran
 * excepción chilena: el hipotecario en UF a tasa baja, que suele rendir menos
 * que un depósito — ahí conviene invertir. El prepago tiene costo regulado
 * (comisión de prepago): hay que revisar el contrato antes.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num, bool } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const saldoDeuda = Math.max(0, num(inputs.saldoDeuda));
  const caeDeuda = Math.max(0, num(inputs.caeDeuda));
  const montoDisponible = Math.max(0, num(inputs.montoDisponible));
  const rendInversion = Math.max(0, num(inputs.rendimientoInversion));
  const fondoEmergencia = Math.max(0, num(inputs.fondoEmergencia));
  const esHipotecarioUF = bool(inputs.esHipotecarioUF);

  if (!saldoDeuda || !caeDeuda || !montoDisponible || !rendInversion) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Carga el saldo y el CAE de tu deuda, la plata que tienes disponible y el rendimiento que le sacarías invertida (depósito a plazo, fondo mutuo). Comparamos ambas tasas sobre el mismo capital y te decimos qué te deja mejor.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ventaja a 12 meses' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo** de tu deuda y su **CAE** (Carga Anual Equivalente: el costo real con comisiones y seguros, no la tasa pelada).',
        'Carga **cuánta plata tienes disponible** y el **rendimiento anual** de tu alternativa de inversión (depósito a plazo: 5-6%).',
      ],
    };
  }

  // Plata realmente aplicable, sin tocar el fondo de emergencia.
  const usable = Math.max(0, montoDisponible - fondoEmergencia);
  const aplicaPrepago = Math.min(usable, saldoDeuda);

  // El CAE ya es una tasa efectiva anual con costos incluidos: se compara directo.
  const ahorroAnual = aplicaPrepago * (caeDeuda / 100);
  const gananciaAnual = aplicaPrepago * (rendInversion / 100);
  const ventaja = ahorroAnual - gananciaAnual;
  const spread = caeDeuda - rendInversion;

  const sobrante = Math.max(0, usable - saldoDeuda);
  const gananciaSobrante = sobrante * (rendInversion / 100);

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (spread >= 1.5) {
    status = 'a';
    tone = 'good';
    title = 'Conviene prepagar la deuda';
    badge = 'Prepaga';
    detail = `Tu deuda cuesta ${fmtPct(caeDeuda, 1).replace('+', '')} de CAE y la inversión rinde ${fmtPct(rendInversion, 1).replace('+', '')} anual. Prepagar es un rendimiento garantizado y sin riesgo: te deja ${fmtMoney(ventaja)} mejor al año que invertir. Ninguna inversión conservadora le gana a una deuda de consumo o tarjeta chilena.`;
  } else if (spread <= -1.5) {
    status = 'b';
    tone = 'good';
    title = 'Conviene invertir la plata';
    badge = 'Invierte';
    detail = `La inversión rinde ${fmtPct(rendInversion, 1).replace('+', '')} anual y tu deuda cuesta ${fmtPct(caeDeuda, 1).replace('+', '')} de CAE. Invertir te deja ${fmtMoney(-ventaja)} más al año que prepagar.${esHipotecarioUF ? ' Es el caso típico del hipotecario en UF a tasa baja: mantén el dividendo al día y deja tu plata rindiendo.' : ' Mantén la deuda al día e invierte — siempre que la deuda no te quite el sueño.'}`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decide por liquidez y tranquilidad';
    badge = 'Empate';
    detail = `El CAE de tu deuda (${fmtPct(caeDeuda, 1).replace('+', '')}) y el rendimiento de la inversión (${fmtPct(rendInversion, 1).replace('+', '')}) están muy cerca: la diferencia es de apenas ${fmtMoney(Math.abs(ventaja))} al año. Con números tan parejos, pesa más tener caja disponible y sacarte la deuda de la cabeza. Ojo: la comisión de prepago puede inclinar la balanza hacia invertir.`;
  }

  const scenarios = [
    { label: 'Prepagar la deuda', value: '+' + fmtMoney(ahorroAnual).replace('-', ''), detail: `Intereses que dejas de pagar en 12 meses sobre ${fmtMoney(aplicaPrepago)}.` },
    { label: 'Invertir todo', value: '+' + fmtMoney(gananciaAnual).replace('-', ''), detail: `Lo que rendiría esa misma plata al ${fmtPct(rendInversion, 1).replace('+', '')} anual.` },
    {
      label: 'Mixta',
      value: '+' + fmtMoney(ahorroAnual + gananciaSobrante).replace('-', ''),
      detail: sobrante > 0 ? `Prepagas toda la deuda e inviertes el sobrante de ${fmtMoney(sobrante)}.` : 'Prepagar lo que alcances (tu plata no cubre todo el saldo).',
    },
  ];

  const comparison = {
    columns: ['Prepagar', 'Invertir'] as [string, string],
    rows: [
      { label: 'Tasa anual', a: fmtPct(caeDeuda, 1).replace('+', '') + ' (CAE)', b: fmtPct(rendInversion, 1).replace('+', ''), hint: `${spread >= 0 ? '+' : ''}${spread.toFixed(1).replace('.', ',')} pts a favor de prepagar` },
      { label: `Resultado a 12 meses sobre ${fmtMoney(aplicaPrepago)}`, a: '+' + fmtMoney(ahorroAnual).replace('-', ''), b: '+' + fmtMoney(gananciaAnual).replace('-', '') },
      { label: 'Capital que aplicas', a: fmtMoney(aplicaPrepago), b: fmtMoney(usable) },
      { label: 'Riesgo', a: 'Cero: ahorro garantizado', b: 'Depende del instrumento' },
    ],
  };

  const nextActions = [
    'Prepaga **primero la deuda más cara**: el rotativo de la tarjeta o el avance en efectivo (CAE que puede pasar del 30-40%) le gana a cualquier depósito o fondo mutuo. Es el mejor "rendimiento" disponible.',
    'Antes de prepagar, **pide la liquidación de prepago al banco**: la comisión está regulada por ley, pero existe y varía según el contrato. Réstale ese costo al ahorro para confirmar que sigue conviniendo.',
    fondoEmergencia > 0
      ? `Dejas ${fmtMoney(fondoEmergencia)} de fondo de emergencia intacto ✓. No lo uses para prepagar: si aparece un imprevisto, terminarías pidiendo un avance al 40% para cubrirlo.`
      : 'Separa primero un **fondo de emergencia** (3 a 6 meses de gastos) antes de prepagar. Sin colchón, cualquier imprevisto te devuelve a la deuda cara.',
    esHipotecarioUF
      ? 'Tu deuda es hipotecaria en UF a tasa baja: si el CAE está bajo el rendimiento del depósito, matemáticamente conviene invertir. Prepaga solo si el valor de dormir sin dividendo pesa más que el spread.'
      : 'Compara siempre con el **CAE**, no con la tasa de interés pelada: comisiones y seguros pueden sumar varios puntos al costo real de tu deuda.',
  ];

  const notes = [
    'Comparamos el CAE de la deuda contra el rendimiento anual de la inversión sobre el mismo capital. Prepagar equivale a una inversión libre de riesgo a la tasa de tu deuda.',
    'El prepago tiene un costo regulado (comisión de prepago, pactada en el contrato con topes legales): pide la liquidación exacta a tu institución antes de decidir. En deudas caras rara vez cambia el veredicto; en deudas baratas puede empatarlo.',
    'El rendimiento de la inversión puede pagar impuesto (los intereses de depósitos tributan, con beneficios según instrumento y monto): el número neto puede ser algo menor al que cargas.',
    'No es asesoría financiera. Es una comparación de tasas para ordenar la decisión; para montos grandes, confirma con tu banco o un asesor.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.abs(ventaja)) + '/año',
      label: ventaja >= 0 ? 'Ahorras prepagando' : 'Ganas invirtiendo',
      sub: `Deuda: **${fmtPct(caeDeuda, 1).replace('+', '')} CAE** vs inversión: **${fmtPct(rendInversion, 1).replace('+', '')} anual**. La diferencia decide.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'prepagar-deuda-o-invertir',
  title: '¿Prepagar la deuda o invertir? Qué conviene en Chile 2026',
  h1: '¿Me conviene prepagar la deuda o invertir la plata?',
  description:
    'Compara el CAE de tu deuda (consumo 20-35%, tarjetas 25-40%) contra lo que rendiría tu plata en un depósito a plazo o fondo mutuo (5-6%). Prepagar deuda cara es rendimiento garantizado; el hipotecario en UF a tasa baja es la excepción.',
  intro:
    'Te llegó plata — bono, aguinaldo, retiro de utilidades — y tienes una deuda: ¿la prepagas o la inviertes? La respuesta no es intuición, es comparar dos tasas sobre el mismo capital. Prepagar una deuda con CAE del 25% te "rinde" ese 25% garantizado y sin riesgo: ningún depósito a plazo al 5,5% le compite. Pero la ecuación se da vuelta con el hipotecario en UF a tasa baja, y el prepago tiene un costo regulado que conviene revisar en tu contrato. Esta sala te dice cuál gana, por cuánto, y cuánto fondo de emergencia dejar intacto.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    saldoDeuda: 3500000,
    caeDeuda: 27,
    montoDisponible: 4000000,
    rendimientoInversion: 5.5,
    fondoEmergencia: 1000000,
    esHipotecarioUF: 'no',
  },
  fields: [
    { id: 'saldoDeuda', label: 'Saldo de la deuda', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '3500000', help: 'Lo que te falta pagar del crédito de consumo, tarjeta o línea. Para el monto exacto, pide la liquidación de prepago.', group: 'Tu deuda', groupIcon: '💳' },
    { id: 'caeDeuda', label: 'CAE de la deuda', type: 'number', suffix: '%', required: true, min: 0, max: 100, placeholder: '27', help: 'La Carga Anual Equivalente: el costo real anual con comisiones y seguros. Consumo: 20-35%; tarjetas y avances: 25-40%; hipotecario: 4-5%.', group: 'Tu deuda' },
    { id: 'esHipotecarioUF', label: '¿Es un crédito hipotecario en UF?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No, es consumo / tarjeta / línea' }, { value: 'si', label: 'Sí, hipotecario en UF' }], advanced: true, help: 'El hipotecario en UF a tasa baja es la gran excepción: suele convenir invertir en vez de prepagarlo.', group: 'Tu deuda' },
    { id: 'montoDisponible', label: 'Plata que tienes disponible', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '4000000', help: 'El monto que podrías destinar a prepagar o invertir.', group: 'Tu plata', groupIcon: '💰' },
    { id: 'rendimientoInversion', label: 'Rendimiento de la inversión (anual)', type: 'number', suffix: '%', required: true, min: 0, max: 50, default: 5.5, placeholder: '5.5', help: 'Lo que rendiría tu plata: depósito a plazo 5-6% anual, fondos mutuos conservadores algo similar (con vaivenes).', group: 'Tu plata' },
    { id: 'fondoEmergencia', label: 'Fondo de emergencia a mantener', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, recommended: true, placeholder: '1000000', help: 'Plata líquida que NO tocas pase lo que pase (ideal: 3-6 meses de gastos). No se usa para prepagar.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-deposito-plazo-chile-bancos-2026-tasa', label: 'Depósito a plazo' },
    { slug: 'cl/calculadora-fondos-mutuos-chile-rentabilidad-comparativa-2026', label: 'Fondos mutuos' },
    { slug: 'cl/calculadora-tarjeta-credito-chile-tasa-rotativa-pago-minimo', label: 'Tarjeta: rotativo y pago mínimo' },
    { slug: 'cl/calculadora-pago-anticipado-credito-hipotecario-chile-ahorro-uf', label: 'Prepago de hipotecario' },
  ],
  howItWorks: `La decisión se reduce a comparar dos tasas sobre la misma plata.

1. **La tasa de tu deuda.** Usa el CAE, no la tasa de interés pelada: la Carga Anual Equivalente ya incluye comisiones y seguros, y las instituciones están obligadas a informarla. Prepagar equivale a "invertir" a ese CAE, garantizado.
2. **La tasa de tu alternativa.** Lo que rendiría esa plata invertida: un depósito a plazo (5-6% anual), un fondo mutuo conservador o el instrumento que uses.
3. **Mismo capital, 12 meses.** Aplica ambas tasas a la plata disponible (descontando tu fondo de emergencia) y calcula cuánto ahorras prepagando contra cuánto ganarías invirtiendo.
4. **El veredicto.** Gana la tasa mayor. Una deuda de consumo o tarjeta (CAE 20-40%) le gana a cualquier inversión conservadora: prepágala. Un hipotecario en UF al 4,5% suele perder contra un depósito al 5,5%: ahí conviene invertir.
5. **El costo del prepago.** El prepago tiene una comisión regulada que depende de tu contrato: la sala te recuerda pedir la liquidación exacta antes de firmar, porque en decisiones parejas puede cambiar el resultado.`,
  faq: [
    { q: '¿Por qué prepagar una deuda es como invertir?', a: 'Porque cada peso que prepagas deja de generar intereses a la tasa de tu deuda. Si tu crédito de consumo tiene CAE del 27%, prepagarlo te "rinde" ese 27% garantizado, sin riesgo y sin impuesto. No existe depósito a plazo ni fondo mutuo conservador que ofrezca algo parecido.' },
    { q: '¿Qué es el CAE y por qué usarlo en vez de la tasa de interés?', a: 'La Carga Anual Equivalente es el costo total anualizado del crédito: interés, comisiones y seguros incluidos. Es el número que las instituciones deben informarte por ley y el único comparable entre productos. La tasa de interés pelada subestima el costo real, a veces por varios puntos.' },
    { q: '¿El prepago tiene costo en Chile?', a: 'Sí: la comisión de prepago está regulada por ley y pactada en tu contrato, con topes que dependen del tipo y monto del crédito. Antes de prepagar, pide a tu institución la liquidación de prepago con el costo exacto. En deudas caras (tarjeta, consumo) esa comisión rara vez cambia el veredicto; en deudas baratas puede empatar la decisión.' },
    { q: '¿Conviene prepagar el crédito hipotecario?', a: 'Casi nunca por rentabilidad pura: un hipotecario en UF al 4,3-4,7% cuesta menos de lo que rinde un depósito a plazo al 5-6%, así que matemáticamente conviene invertir. Prepagarlo se justifica por tranquilidad — vivir sin dividendo — o para reducir plazo antes de un cambio de ingresos. Es la gran excepción chilena a la regla "paga la deuda primero".' },
    { q: '¿Debería usar todos mis ahorros para prepagar?', a: 'No. Primero separa un fondo de emergencia de 3 a 6 meses de gastos en algo líquido. Si prepagas con todo y aparece un imprevisto, terminarás cubriéndolo con un avance en efectivo o el rotativo de la tarjeta al 30-40% — exactamente la deuda que querías evitar.' },
    { q: '¿Qué deuda prepago primero si tengo varias?', a: 'La de mayor CAE: típicamente el avance en efectivo y el rotativo de la tarjeta (25-40%), después el crédito de consumo (20-35%), después la línea de crédito, y al final — si acaso — el hipotecario (4-5%). Ordenar por tasa maximiza el ahorro total de intereses.' },
    { q: '¿Los intereses de la inversión pagan impuesto?', a: 'En general sí: los intereses de depósitos y las ganancias de fondos tributan, aunque existen beneficios (como el que exime intereses menores dentro de ciertos topes, o regímenes como el APV con sus propias reglas). El rendimiento neto puede ser algo menor al nominal que cargas — un punto más a favor de prepagar deuda cara, cuyo ahorro no tributa.' },
    { q: '¿Y si mis cuotas al día me tienen ahogado, aunque la tasa sea baja?', a: 'Entonces el problema no es rentabilidad sino carga financiera. Si tus cuotas superan el 25% del ingreso líquido, reducir deuda mejora tu holgura y tu acceso a crédito futuro, aunque el spread matemático diga "invierte". La regla de tasas asume que puedes sostener las cuotas sin estrés.' },
  ],
  sources: [
    { name: 'CMF — CAE y comisión de prepago', url: 'https://www.cmfchile.cl/' },
    { name: 'SERNAC — Crédito de consumo y derechos del consumidor', url: 'https://www.sernac.cl/' },
    { name: 'Banco Central de Chile — Tasas de captación y colocación', url: 'https://www.bcentral.cl/' },
  ],
};
