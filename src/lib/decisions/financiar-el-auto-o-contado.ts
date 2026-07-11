/**
 * Sala de decisión — "¿Financiar el auto o pagarlo al contado?"
 *
 * Patrón COMPARACIÓN (A vs B). Compara el costo REAL de cada camino:
 *  - Contado: precio − descuento por pago contado, MENOS el costo de oportunidad
 *    de inmovilizar esa plata (lo que rendiría invertida durante el plazo).
 *  - Financiado: anticipo + suma de cuotas (cuota francesa). Como las cuotas son
 *    nominales fijas, la inflación las licúa: se descuenta su valor presente.
 * Gana el menor costo real en valor de hoy.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

/** Cuota francesa: V capital, i tasa mensual, n meses. */
function cuotaFrancesa(V: number, i: number, n: number): number {
  if (n <= 0) return 0;
  if (i <= 0) return V / n;
  return (V * i) / (1 - Math.pow(1 + i, -n));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const precio = Math.max(0, num(inputs.precio));
  const anticipo = Math.max(0, num(inputs.anticipo));
  const tnaFin = Math.max(0, num(inputs.tnaFinanciacion));
  const plazo = Math.max(0, num(inputs.plazoMeses));
  const descContadoPct = Math.max(0, num(inputs.descuentoContado));
  const rendAltoTNA = Math.max(0, num(inputs.rendimientoAlternativoTNA));
  const inflMensual = Math.max(0, num(inputs.inflacionMensual));

  if (!precio || !plazo) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio del auto, la TNA de la financiación y el plazo en cuotas. Sumá el descuento por pago contado para comparar contra financiar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia de costo real' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio**, la **TNA** del crédito y el **plazo** en meses.',
        'Preguntá en la concesionaria el **descuento por pago contado**: suele ser importante.',
      ],
    };
  }

  const iFin = tnaFin / 100 / 12;
  const iRend = rendAltoTNA / 100 / 12;
  const iInfl = inflMensual / 100;

  // Comparamos el VALOR PRESENTE de los desembolsos de cada camino, descontados a
  // la MISMA tasa de oportunidad (lo que rinde tu plata; si no la cargás, la
  // inflación). Así ambos lados quedan medidos en el mismo punto del tiempo y no
  // hay doble conteo: el "costo de oportunidad" del contado ya está implícito en
  // que las cuotas futuras se traen a valor de hoy a esa tasa.
  const tasaDescuento = iRend > 0 ? iRend : iInfl;
  const vp = (monto: number, mes: number) =>
    tasaDescuento > 0 ? monto / Math.pow(1 + tasaDescuento, mes) : monto;

  // — CONTADO — todo el desembolso es hoy (mes 0): su valor presente es el precio.
  const precioContado = precio * (1 - descContadoPct / 100);
  const costoContado = precioContado;

  // — FINANCIADO — anticipo hoy + valor presente de cada cuota futura.
  const montoFinanciar = Math.max(0, precio - anticipo);
  const cuota = cuotaFrancesa(montoFinanciar, iFin, plazo);
  const totalCuotasNominal = cuota * plazo;
  let vpCuotas = 0;
  for (let m = 1; m <= plazo; m++) {
    vpCuotas += vp(cuota, m);
  }
  const costoFinanciado = anticipo + vpCuotas;

  const ventaja = costoFinanciado - costoContado; // + => contado más barato; - => financiar
  const ganaContado = ventaja > 0;
  const diff = Math.abs(ventaja);
  const base = Math.min(costoContado, costoFinanciado);
  const margenPct = base > 0 ? (diff / base) * 100 : 0;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (margenPct < 4) {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por liquidez';
    badge = 'Es parejo';
    detail = `En valor de hoy, contado cuesta ${fmtMoney(costoContado)} y financiar ${fmtMoney(costoFinanciado)}: una diferencia de apenas ${fmtMoney(diff)}. Si te queda colchón, pagá contado por la tranquilidad; si no, financiar no te castiga.`;
  } else if (ganaContado) {
    status = 'a'; // A = contado
    tone = 'good';
    title = 'Conviene pagar de contado';
    badge = 'Contado';
    detail = `Con el descuento por pago contado, comprar de contado cuesta ${fmtMoney(diff)} menos en valor de hoy (${costoContado < costoFinanciado ? Math.round(margenPct) : 0}% más barato). El interés del crédito supera lo que ganarías invirtiendo esa plata.`;
  } else {
    status = 'b'; // B = financiar
    tone = 'good';
    title = 'Conviene financiar';
    badge = 'Financiá';
    detail = `Financiar cuesta ${fmtMoney(diff)} menos en valor de hoy: las cuotas fijas se licúan con la inflación y mantenés tu plata trabajando. Eso supera el interés del crédito. Ojo: solo si la cuota entra cómoda en tu presupuesto.`;
  }

  const scenarios = [
    {
      label: 'Contado (valor hoy)',
      value: fmtMoney(costoContado),
      detail: descContadoPct > 0
        ? `Precio con ${descContadoPct}% de descuento, pagado todo hoy.`
        : 'Precio pleno, desembolsado de una sola vez hoy.',
    },
    {
      label: 'Financiado (valor hoy)',
      value: fmtMoney(costoFinanciado),
      detail: `Anticipo + ${plazo} cuotas de ${fmtMoney(cuota)}, traídas a valor presente.`,
    },
    {
      label: 'Financiado (nominal)',
      value: fmtMoney(anticipo + totalCuotasNominal),
      detail: 'Lo que pagás en total sin ajustar por inflación: el número que asusta.',
    },
  ];

  const comparison = {
    columns: ['Contado', 'Financiado'] as [string, string],
    rows: [
      { label: 'Desembolso inicial', a: fmtMoney(precioContado), b: fmtMoney(anticipo) },
      { label: 'Cuotas', a: '—', b: `${plazo} × ${fmtMoney(cuota)}` },
      { label: 'Total nominal pagado', a: fmtMoney(precioContado), b: fmtMoney(anticipo + totalCuotasNominal) },
      { label: 'Tasa de descuento aplicada', a: '—', b: `${(tasaDescuento * 100).toFixed(1).replace('.', ',')}% mensual`, hint: iRend > 0 ? 'tu rendimiento alternativo' : 'inflación esperada' },
      { label: 'Costo real (valor hoy)', a: fmtMoney(costoContado), b: fmtMoney(costoFinanciado), hint: ganaContado ? 'gana contado' : 'gana financiar' },
    ],
  };

  const nextActions = [
    ganaContado
      ? `Pagar de contado te ahorra **${fmtMoney(diff)}**. Negociá el descuento por pago contado lo más alto posible: cada punto extra agranda la ventaja.`
      : `Financiar te conviene por **${fmtMoney(diff)}** en valor de hoy. Confirmá que la cuota de ${fmtMoney(cuota)} entre cómoda en tu presupuesto (usá la sala "¿Puedo mantener este auto?").`,
    'Pedí el **CFT** del crédito, no solo la TNA: incluye seguros y gastos, y es el costo verdadero que esta cuenta necesita para ser exacta.',
    inflMensual > 0
      ? 'Con inflación alta, las cuotas fijas en pesos se licúan: por eso financiar puede ganar aunque la tasa parezca alta. Revisá que la cuota NO se ajuste por UVA.'
      : 'Si la financiación ajusta por UVA o inflación, la ventaja de licuar desaparece: cargá la inflación esperada para verlo.',
    'No vacíes tu fondo de emergencia para pagar contado: si te quedás sin colchón, un imprevisto te manda a una deuda más cara que la del auto.',
  ];

  const notes = [
    'Compara el costo real en valor de hoy: al contado le suma el costo de oportunidad (lo que rendiría esa plata) y a las cuotas las trae a valor presente descontando por inflación o por el rendimiento alternativo.',
    'La cuota se calcula con sistema francés (cuota fija). Si tu crédito ajusta por UVA, las cuotas no son fijas y el resultado cambia: este modelo asume cuota nominal fija.',
    'Orientativo, no es asesoramiento financiero. No incluye seguros obligatorios del crédito ni gastos de otorgamiento: confirmá el CFT con la entidad.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(diff),
      label: ganaContado ? 'Ahorrás pagando contado' : 'Ahorrás financiando',
      sub: `Costo real en valor de hoy: contado **${fmtMoney(costoContado)}** vs financiar **${fmtMoney(costoFinanciado)}**.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'financiar-el-auto-o-contado',
  title: '¿Financiar el auto o pagarlo al contado? Comparador 2026',
  h1: '¿Financiar el auto o pagarlo al contado?',
  description:
    'Compará el costo real de pagar el auto de contado (con descuento y costo de oportunidad) contra financiarlo en cuotas que la inflación licúa. Te decimos cuál sale más barato en valor de hoy.',
  intro:
    'La cuenta no es solo "cuánto pago de intereses". Pagar de contado tiene un costo oculto: esa plata deja de rendir. Y financiar tiene un beneficio oculto: las cuotas fijas se licúan con la inflación. Esta sala compara los dos caminos en valor de hoy —descuento por contado, costo de oportunidad e inflación incluidos— y te dice cuál te deja mejor parado.',
  icon: '💵',
  category: 'finanzas',
  audience: 'AR',
  answer: 'Financiar conviene cuando **la tasa del crédito prendario es menor que la inflación o que lo que rinde tu dinero invertido**: la cuota fija se licúa y conservás liquidez. Contado conviene si hay descuento por pago único o si la tasa efectiva (CFT, con gastos y seguros) es alta. Nunca mires la cuota sola: sumá el CFT total y compará contra dejar esa plata rindiendo.',
  lastReviewed: '2026-07-11',
  example: {
    precio: 25000000,
    anticipo: 10000000,
    tnaFinanciacion: 85,
    plazoMeses: 36,
    descuentoContado: 8,
    rendimientoAlternativoTNA: 40,
    inflacionMensual: 4,
  },
  fields: [
    {
      id: 'precio',
      label: 'Precio del auto',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '25000000',
      profileKey: 'vehiculo.valor',
      help: 'Precio de lista del auto.',
      group: 'El auto',
      groupIcon: '🚗',
    },
    {
      id: 'descuentoContado',
      label: 'Descuento por pago contado',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      max: 50,
      recommended: true,
      placeholder: '8',
      help: 'Cuánto te bajan el precio si pagás todo de una. Preguntalo siempre.',
      group: 'El auto',
    },
    {
      id: 'anticipo',
      label: 'Anticipo (si financiás)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '10000000',
      help: 'Entrega inicial. El resto se financia en cuotas.',
      group: 'Financiación',
      groupIcon: '🏦',
    },
    {
      id: 'tnaFinanciacion',
      label: 'TNA de la financiación',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      placeholder: '85',
      help: 'Tasa nominal anual del crédito. Mejor pedí el CFT (incluye gastos).',
      group: 'Financiación',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo (meses)',
      type: 'number',
      required: true,
      min: 1,
      max: 84,
      placeholder: '36',
      help: 'En cuántas cuotas financiarías.',
      group: 'Financiación',
    },
    {
      id: 'rendimientoAlternativoTNA',
      label: 'Rendimiento de tu plata (TNA)',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '40',
      help: 'Qué rendiría tu dinero si NO lo usás para pagar contado (plazo fijo, money market).',
      group: 'Tu plata',
      groupIcon: '💰',
    },
    {
      id: 'inflacionMensual',
      label: 'Inflación mensual esperada',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      advanced: true,
      placeholder: '4',
      help: 'Cuánto licúa la inflación las cuotas fijas. Solo aplica si la cuota NO ajusta por UVA.',
      group: 'Tu plata',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota del préstamo' },
    { slug: 'calculadora-cft-prestamo-personal-comparativa', label: 'CFT del crédito' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `La sala compara el costo real de cada camino llevándolos al mismo punto: el valor de hoy.

1. **Costo de contado.** Precio menos el descuento por pago contado, más el costo de oportunidad: lo que esa plata rendiría si la invirtieras durante el plazo en vez de inmovilizarla en el auto.
2. **Cuota financiada.** Con el monto a financiar (precio menos anticipo), la TNA y el plazo, calcula la cuota fija por sistema francés.
3. **Valor presente de las cuotas.** Trae cada cuota a hoy descontando por la inflación esperada (que las licúa) o, si no la cargás, por el rendimiento alternativo. Las cuotas lejanas valen menos hoy.
4. **Costo financiado.** Anticipo + valor presente de todas las cuotas.
5. **Veredicto.** Gana el menor costo en valor de hoy. Si la diferencia es chica (menos de 4%), manda la liquidez: pagá contado si te queda colchón.`,
  faq: [
    {
      q: '¿Por qué pagar de contado tiene un costo oculto?',
      a: 'Porque esa plata deja de trabajar. Si en vez de inmovilizar el dinero en el auto lo dejaras en un plazo fijo o money market, ganarías un rendimiento. Ese rendimiento que resignás es el costo de oportunidad, y hay que sumarlo al precio de contado para comparar bien.',
    },
    {
      q: '¿Por qué financiar puede convenir aunque la tasa sea alta?',
      a: 'Porque en un contexto de inflación alta, las cuotas fijas en pesos se licúan: la cuota que pagás dentro de dos años, en plata de hoy, vale mucho menos. Si la inflación supera a la tasa real del crédito, financiar y mantener tu plata invertida puede ganar.',
    },
    {
      q: '¿Qué pasa si el crédito ajusta por UVA?',
      a: 'Si las cuotas se ajustan por UVA o por inflación, ya no son fijas y el efecto de licuación desaparece: la cuota sigue al costo de vida. En ese caso este modelo no aplica tal cual, porque asume cuota nominal fija. Para créditos UVA, pagar contado suele ganar más seguido.',
    },
    {
      q: '¿Tengo que usar el descuento por pago contado en la cuenta?',
      a: 'Sí, es clave. Las concesionarias suelen ofrecer descuentos del 5% al 15% por pago contado, y ese ahorro puede dar vuelta la decisión. Preguntalo siempre y cargalo en la sala.',
    },
    {
      q: '¿Conviene dar un anticipo grande?',
      a: 'Un anticipo mayor reduce el monto financiado y los intereses, pero también inmoviliza más plata (más costo de oportunidad). El equilibrio depende de las tasas: probá distintos anticipos en la sala para ver cómo cambia el resultado.',
    },
    {
      q: '¿Qué diferencia hay entre TNA y CFT?',
      a: 'La TNA es la tasa nominal. El CFT (Costo Financiero Total) suma además seguros, comisiones e impuestos: es lo que realmente te cuesta el crédito. Para que la comparación sea exacta, cargá el CFT en lugar de la TNA pelada.',
    },
    {
      q: '¿Debería vaciar mis ahorros para pagar contado?',
      a: 'No. Aunque pagar contado gane en la cuenta, nunca te quedes sin fondo de emergencia. Si un imprevisto te agarra sin liquidez, vas a terminar tomando una deuda probablemente más cara que la del auto.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa que compara costos con supuestos que cargás vos (tasas, inflación, rendimiento). No incluye seguros obligatorios del crédito ni gastos de otorgamiento. Para decisiones grandes, consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'BCRA — Costo Financiero Total (CFT)', url: 'https://www.bcra.gob.ar/' },
    { name: 'BCRA — Tasas de plazo fijo', url: 'https://www.bcra.gob.ar/BCRAyVos/plazos_fijos_online.asp' },
  ],
};
