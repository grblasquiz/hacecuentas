/**
 * Sala de decisión MX — "¿Rentar o comprar casa?"
 *
 * Compara el costo acumulado de RENTAR (renta que sube ~INPC + el rendimiento
 * del enganche invertido en CETES, que juega a favor de rentar) contra COMPRAR
 * (mensualidad de crédito hipotecario a ~10-11%, escrituración 4-7% con notario
 * e impuestos, predial y mantenimiento, menos la plusvalía estimada del
 * inmueble). En México el crédito es caro y la renta sube poco (~5% anual),
 * así que comprar tarda MÁS años en alcanzar el punto de equilibrio que en
 * economías de inflación alta: el horizonte de permanencia decide.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

/** Mensualidad fija (sistema francés). V = monto del crédito, tasa anual %, n meses. */
function mensualidadCredito(V: number, tasaAnualPct: number, nMeses: number): number {
  if (V <= 0 || nMeses <= 0) return 0;
  const i = tasaAnualPct / 12 / 100;
  if (i === 0) return V / nMeses;
  return (V * i) / (1 - Math.pow(1 + i, -nMeses));
}

// Predial + mantenimiento del propietario: ~1.2% anual del valor (estimación).
const COSTO_TENENCIA_ANUAL = 0.012;

function compute(inputs: Record<string, any>): DecisionResult {
  const valor = Math.max(0, num(inputs.valorPropiedad));
  const enganche = Math.max(0, num(inputs.enganche));
  const tasa = Math.max(0, num(inputs.tasaHipoteca));
  const plazoCredito = Math.max(0, num(inputs.plazoAnios));
  const renta = Math.max(0, num(inputs.rentaMensual));
  const incrementoRenta = Math.max(0, num(inputs.incrementoRenta));
  const plusvalia = Math.max(0, num(inputs.plusvalia));
  const escrituracionPct = Math.max(0, Math.min(15, num(inputs.gastosEscrituracion)));
  const rendCetes = Math.max(0, num(inputs.rendimientoCetes));
  const permanencia = Math.max(1, num(inputs.aniosPermanencia));

  if (!valor || !renta || !plazoCredito) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Carga el valor de la casa o departamento, la renta mensual de algo equivalente y el plazo del crédito hipotecario. Con eso comparamos el costo acumulado de rentar contra el de comprar y buscamos el punto de equilibrio en años.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Punto de equilibrio' },
      scenarios: [],
      nextActions: [
        'Carga el **valor de la propiedad** y la **renta mensual** de una vivienda equivalente en la misma colonia.',
        'Indica el **enganche** que darías y el **plazo del crédito** para comparar parejo.',
      ],
    };
  }

  const montoCredito = Math.max(0, valor - enganche);
  const mensualidad = mensualidadCredito(montoCredito, tasa, plazoCredito * 12);
  const escrituracion = valor * (escrituracionPct / 100);

  // Costo acumulado de RENTAR a `anios`: rentas crecientes − lo que gana el
  // enganche invertido en CETES (dinero a tu favor por NO comprar).
  const costoRentar = (anios: number): number => {
    let totalRenta = 0;
    for (let y = 0; y < anios; y++) {
      totalRenta += renta * 12 * Math.pow(1 + incrementoRenta / 100, y);
    }
    const gananciaEnganche = enganche * (Math.pow(1 + rendCetes / 100, anios) - 1);
    return totalRenta - gananciaEnganche;
  };

  // Costo acumulado de COMPRAR a `anios`: escrituración + mensualidades pagadas
  // + predial y mantenimiento − plusvalía acumulada del inmueble.
  const costoComprar = (anios: number): number => {
    const mesesPagados = Math.min(anios, plazoCredito) * 12;
    const tenencia = valor * COSTO_TENENCIA_ANUAL * anios;
    const gananciaPlusvalia = valor * (Math.pow(1 + plusvalia / 100, anios) - 1);
    return escrituracion + mensualidad * mesesPagados + tenencia - gananciaPlusvalia;
  };

  let breakEven = 0;
  for (let y = 1; y <= 40; y++) {
    if (costoComprar(y) <= costoRentar(y)) {
      breakEven = y;
      break;
    }
  }

  const costRentPerm = costoRentar(permanencia);
  const costBuyPerm = costoComprar(permanencia);
  const diff = costRentPerm - costBuyPerm; // + => comprar más barato a tu horizonte

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (breakEven > 0 && permanencia >= breakEven) {
    status = 'b';
    tone = 'good';
    title = 'A tu horizonte, conviene comprar';
    badge = 'Compra';
    detail = `Comprar alcanza a rentar a partir del año ${breakEven}, y tú piensas quedarte ${permanencia} años. En ese plazo comprar te deja ${fmtMoney(Math.abs(diff))} mejor parado que rentar (ya contando plusvalía del ${plusvalia.toFixed(0)}% anual), y al final el patrimonio es tuyo.`;
  } else if (breakEven === 0 || permanencia < breakEven - 1) {
    status = 'a';
    tone = 'warn';
    title = 'A tu horizonte, conviene rentar';
    badge = 'Renta';
    detail =
      breakEven > 0
        ? `Comprar apenas se empareja en el año ${breakEven} y tú piensas quedarte ${permanencia} años. Hasta ahí, rentar te deja ${fmtMoney(Math.abs(diff))} mejor: la renta es baja frente al costo del crédito al ${tasa.toFixed(1)}%, y tu enganche rinde en CETES mientras tanto.`
        : `Con estos números, comprar no alcanza a rentar ni en 40 años: la renta es muy baja frente al precio de venta y el crédito al ${tasa.toFixed(1)}% sale caro. Renta e invierte el enganche en CETES — o busca una tasa menor (Infonavit/Fovissste, cofinanciamiento).`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está muy parejo: decide por tu plan de vida';
    badge = 'Está parejo';
    detail = `El punto de equilibrio (año ${breakEven}) cae justo alrededor de tu horizonte de ${permanencia} años: la diferencia es de apenas ${fmtMoney(Math.abs(diff))}. Decide por estabilidad, movilidad laboral y ganas de tener casa propia, no solo por el dinero.`;
  }

  const scenarios = [5, 10, 20].map((n) => {
    const d = costoRentar(n) - costoComprar(n);
    return {
      label: `A ${n} años`,
      value: d >= 0 ? 'Comprar: ' + fmtMoney(d) : 'Rentar: ' + fmtMoney(-d),
      detail:
        d >= 0
          ? `Comprar acumula ${fmtMoney(Math.abs(d))} menos de costo neto a ${n} años.`
          : `Rentar acumula ${fmtMoney(Math.abs(d))} menos de costo neto a ${n} años.`,
    };
  });

  const comparison = {
    columns: ['Rentar', 'Comprar'] as [string, string],
    rows: [
      {
        label: 'Desembolso inicial',
        a: fmtMoney(renta * 3),
        b: fmtMoney(enganche + escrituracion),
        hint: `rentar: entrada ~3 rentas · comprar: enganche + escrituración (${escrituracionPct.toFixed(0)}%)`,
      },
      {
        label: 'Costo mensual (año 1)',
        a: fmtMoney(renta),
        b: fmtMoney(mensualidad + (valor * COSTO_TENENCIA_ANUAL) / 12),
        hint: 'renta vs mensualidad + predial y mantenimiento',
      },
      {
        label: `Costo neto acumulado a ${permanencia} años`,
        a: fmtMoney(costRentPerm),
        b: fmtMoney(costBuyPerm),
        hint: 'rentar descuenta el rendimiento del enganche; comprar descuenta la plusvalía',
      },
      {
        label: 'Al final, ¿de quién es la casa?',
        a: 'Del arrendador',
        b: 'Tuya',
        hint: 'comprar te deja patrimonio; rentar, movilidad',
      },
    ],
  };

  const nextActions = [
    breakEven > 0
      ? `Tu punto de equilibrio es el año **${breakEven}**: si piensas quedarte más que eso en la misma ciudad, comprar gana; si menos, renta e invierte el enganche.`
      : 'Con esta relación renta/precio, comprar no se justifica financieramente: revisa si el precio de venta no está inflado para la zona, o mejora la tasa.',
    `Cotiza el **CAT del crédito en varios bancos**, no solo la tasa: con ${fmtPct(tasa, 1).replace('+', '')} anual la mensualidad sería ${fmtMoney(mensualidad)}. Si cotizas en Infonavit, Fovissste o cofinanciamiento, tu tasa puede bajar y el equilibrio llegar años antes.`,
    'Si rentas, **invierte el enganche** que no inmovilizaste (CETES vía cetesdirecto, ~8-9% anual): ese rendimiento es la mitad de la ecuación y mucha gente se lo gasta.',
    `Presupuesta la escrituración completa: entre notario, avalúo, ISAI/traslado de dominio y registro, ronda el 4-7% del valor (aquí usamos ${escrituracionPct.toFixed(0)}% = ${fmtMoney(escrituracion)}). No es opcional y se paga de contado.`,
    'Suma lo intangible: comprar da estabilidad y patrimonio, pero te ancla a una colonia y a una mensualidad de 20 años; rentar da flexibilidad. Decide también por tu plan de vida.',
  ];

  const notes = [
    'La mensualidad se calcula con pago fijo (sistema francés) sobre la tasa que cargas; los créditos bancarios en México suelen ser de tasa fija, así que el supuesto es razonable. El CAT real agrega seguros y comisiones.',
    `Rentar descuenta el rendimiento del enganche invertido en CETES (${rendCetes.toFixed(1)}% anual); comprar descuenta la plusvalía estimada del inmueble (${plusvalia.toFixed(0)}% anual). Ambas son estimaciones: la plusvalía depende de la zona y no está garantizada.`,
    `Predial y mantenimiento del propietario se estiman en ${(COSTO_TENENCIA_ANUAL * 100).toFixed(1)}% anual del valor; la escrituración en ${escrituracionPct.toFixed(0)}% (varía por estado: el ISAI/traslado de dominio cambia entre entidades).`,
    'No es asesoría financiera ni inmobiliaria. Para una operación de este tamaño, cotiza con varios bancos y confirma los costos con un notario de tu estado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: breakEven > 0 ? `${breakEven} años` : 'No se empareja',
      label: 'Punto de equilibrio (rentar → comprar)',
      sub:
        breakEven > 0
          ? `A tu horizonte de ${permanencia} años, comprar ${diff >= 0 ? 'te deja' : 'te cuesta'} **${fmtMoney(Math.abs(diff))}** ${diff >= 0 ? 'a favor' : 'extra'} frente a rentar.`
          : 'Con estos números, rentar e invertir el enganche gana en todo el horizonte analizado.',
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'rentar-o-comprar',
  title: '¿Rentar o comprar casa? Qué conviene en México 2026',
  h1: '¿Me conviene rentar o comprar casa?',
  description:
    'Compara el costo acumulado de rentar (renta que sube por INPC + tu enganche rindiendo en CETES) contra comprar (crédito hipotecario a 10-11%, escrituración 4-7%, predial, mantenimiento y plusvalía). Te decimos el punto de equilibrio en años.',
  intro:
    '"Rentar es tirar el dinero", dicen. Pero en México el crédito hipotecario cuesta 10-11% anual, la escrituración se lleva 4-7% del valor de un jalón, y mientras tanto tu enganche podría estar rindiendo en CETES. Esta sala suma el costo real de cada camino año por año — renta que sube por INPC contra mensualidad, predial, mantenimiento y plusvalía — y encuentra el año exacto a partir del cual comprar le gana a rentar. La respuesta depende de cuántos años piensas quedarte.',
  icon: '🏠',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    valorPropiedad: 2500000,
    enganche: 500000,
    tasaHipoteca: 10.5,
    plazoAnios: 20,
    rentaMensual: 12000,
    incrementoRenta: 5,
    plusvalia: 5,
    gastosEscrituracion: 6,
    rendimientoCetes: 8.5,
    aniosPermanencia: 10,
  },
  fields: [
    { id: 'valorPropiedad', label: 'Valor de la propiedad', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '2500000', help: 'Precio de venta de la casa o departamento que comprarías.', group: 'La compra', groupIcon: '🏠' },
    { id: 'enganche', label: 'Enganche que darías', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '500000', help: 'Tu dinero propio (el resto va a crédito). Los bancos piden mínimo 10-20% del valor.', group: 'La compra' },
    { id: 'tasaHipoteca', label: 'Tasa del crédito hipotecario (anual)', type: 'number', suffix: '%', required: true, min: 0, max: 30, default: 10.5, placeholder: '10.5', help: 'La tasa fija anual del banco (10-11% típico en 2026). Infonavit/Fovissste pueden ser menores.', group: 'La compra' },
    { id: 'plazoAnios', label: 'Plazo del crédito (años)', type: 'number', required: true, min: 1, max: 30, default: 20, help: 'A cuántos años pagarías el crédito (15 y 20 son los más comunes).', group: 'La compra' },
    { id: 'gastosEscrituracion', label: 'Gastos de escrituración', type: 'number', suffix: '%', default: 6, min: 0, max: 15, advanced: true, help: 'Notario, avalúo, ISAI/traslado de dominio y registro: 4-7% del valor según el estado.', group: 'La compra' },
    { id: 'rentaMensual', label: 'Renta mensual equivalente', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '12000', help: 'Lo que pagarías de renta por una vivienda parecida en la misma colonia.', group: 'La renta', groupIcon: '🔑' },
    { id: 'incrementoRenta', label: 'Incremento anual de la renta', type: 'number', suffix: '%', default: 5, min: 0, max: 30, placeholder: '5', help: 'Lo que sube la renta al año: por INPC (~4%) o el porcentaje pactado (típico 5%).', group: 'La renta' },
    { id: 'rendimientoCetes', label: 'Rendimiento del enganche invertido (anual)', type: 'number', suffix: '%', default: 8.5, min: 0, max: 30, advanced: true, help: 'Lo que rendiría tu enganche en CETES u otro instrumento si NO compras.', group: 'La renta' },
    { id: 'plusvalia', label: 'Plusvalía anual estimada', type: 'number', suffix: '%', default: 5, min: 0, max: 30, advanced: true, help: 'Cuánto sube el valor del inmueble al año en esa zona. Es una estimación, no una garantía.', group: 'Tu horizonte', groupIcon: '📅' },
    { id: 'aniosPermanencia', label: '¿Cuántos años piensas quedarte?', type: 'number', recommended: true, min: 1, max: 40, default: 10, help: 'La clave de la decisión: cuanto más tiempo te quedes, más conviene comprar.', group: 'Tu horizonte' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-pagos-hipoteca-infonavit', label: 'Pagos de hipoteca Infonavit' },
    { slug: 'mx/calculadora-infonavit-credito-mexico-puntaje-monto-2026', label: 'Puntos y monto Infonavit' },
    { slug: 'mx/calculadora-predial-cdmx-monterrey-guadalajara-2026', label: 'Predial CDMX/MTY/GDL' },
    { slug: 'mx/calculadora-cetes-mexico-rendimiento-28-91-182-364-dias', label: 'Rendimiento de CETES' },
  ],
  howItWorks: `Esta sala no compara la renta contra la mensualidad de un mes: suma el costo total de cada camino a lo largo de los años.

1. **Costo de rentar.** Suma las rentas año por año (subiendo por INPC o lo pactado) y le RESTA lo que gana tu enganche invertido en CETES. Esa resta es clave: si no compras, ese dinero trabaja para ti.
2. **Costo de comprar.** Suma la escrituración inicial (notario, avalúo, ISAI: 4-7% del valor), las mensualidades del crédito, y el predial y mantenimiento (~1.2% anual), y le RESTA la plusvalía estimada del inmueble.
3. **Punto de equilibrio.** Busca el primer año en que comprar acumula menos costo neto que rentar. Antes de ese año conviene rentar; después, comprar.
4. **Tu horizonte decide.** Compara ambos costos al plazo que piensas quedarte y te dice cuál gana y por cuánto. En México, con crédito al 10-11% y rentas que suben poco, el equilibrio suele llegar entre el año 8 y el 15.
5. **Escenarios.** Muestra la diferencia a 5, 10 y 20 años para que veas cómo cambia el ganador con el tiempo.`,
  faq: [
    { q: '¿Rentar es tirar el dinero?', a: 'No necesariamente. En México el crédito hipotecario cuesta 10-11% anual y la escrituración 4-7% del valor. Si te quedas pocos años, o si tu enganche rinde en CETES mientras rentas, rentar te deja mejor parado. Comprar gana cuando te quedas más años que el punto de equilibrio — típicamente entre 8 y 15 años con números de 2026.' },
    { q: '¿Qué es el punto de equilibrio?', a: 'El año a partir del cual comprar acumula menos costo neto que rentar, contando todo: escrituración, mensualidades, predial y mantenimiento contra rentas crecientes, y descontando la plusvalía del inmueble y el rendimiento del enganche. Si te quedas más años que ese punto, comprar gana; si te mudas antes, rentar fue mejor negocio.' },
    { q: '¿Cuánto cuesta escriturar una casa en México?', a: 'Entre 4% y 7% del valor de la propiedad, según el estado: honorarios del notario, avalúo, el impuesto de adquisición (ISAI o traslado de dominio, que varía por entidad) y la inscripción en el Registro Público. Para una casa de $2,500,000 son entre $100,000 y $175,000 — de contado y aparte del enganche.' },
    { q: '¿Conviene más crédito bancario o Infonavit?', a: 'Depende de tu caso. El bancario ofrece tasas de 10-11% fijas y montos mayores; Infonavit y Fovissste dan condiciones más accesibles y descuentan vía nómina, pero con montos según tu puntaje y salario. El cofinanciamiento (Infonavit + banco) combina ambos. Una tasa 2 puntos menor puede adelantar el punto de equilibrio varios años: cotiza en los dos lados.' },
    { q: '¿Por qué se resta el rendimiento del enganche si rento?', a: 'Porque al rentar no inmovilizas los $500,000 del enganche: puedes tenerlos en CETES rindiendo ~8.5% anual. En 10 años eso genera más de $600,000, que compensan buena parte de las rentas pagadas. Si te gastas el enganche en vez de invertirlo, la comparación cambia por completo a favor de comprar.' },
    { q: '¿La plusvalía está garantizada?', a: 'No. Usamos una estimación (5% anual por defecto) porque históricamente la vivienda en zonas urbanas de México se aprecia cerca o algo arriba de la inflación, pero varía muchísimo por ciudad y colonia, y puede estancarse. Si quieres un cálculo conservador, baja la plusvalía a 3-4% y mira cómo se aleja el punto de equilibrio.' },
    { q: '¿Qué gastos tiene ser dueño además de la mensualidad?', a: 'El predial (que en CDMX, Guadalajara o Monterrey depende del valor catastral), el mantenimiento del inmueble y, en condominios, la cuota mensual. Esta sala los estima en ~1.2% del valor por año. Son gastos que el inquilino no paga y que mucha gente olvida al comparar.' },
    { q: '¿Y si la renta que pago es muy baja respecto al precio de venta?', a: 'Entonces rentar gana por paliza y la sala te lo va a decir (incluso "no se empareja en 40 años"). Es común en zonas donde los precios de venta subieron más rápido que las rentas. En ese caso, rentar e invertir el enganche es la jugada financieramente correcta, aunque comprar pueda seguir teniendo sentido emocional o patrimonial.' },
    { q: '¿El resultado cambia si pienso mudarme de ciudad?', a: 'Sí, radicalmente. Vender una casa cuesta comisiones (4-6%) e impuestos, y si te vas antes del punto de equilibrio, pierdes la escrituración que pagaste al entrar. Si tu horizonte es menor a 5-7 años o tu trabajo te puede mover de ciudad, rentar casi siempre es la opción segura.' },
  ],
  sources: [
    { name: 'Banco de México — Indicadores de tasas hipotecarias', url: 'https://www.banxico.org.mx/' },
    { name: 'CONDUSEF — Simulador de crédito hipotecario', url: 'https://www.condusef.gob.mx/' },
    { name: 'INEGI — INPC y precios de la vivienda', url: 'https://www.inegi.org.mx/' },
  ],
};
