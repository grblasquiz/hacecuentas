/**
 * Sala de decisión CO — "¿Pagar en cuotas o de contado?"
 *
 * Patrón COMPARACIÓN (2 columnas), lógica colombiana: diferir una compra con
 * tarjeta de crédito casi siempre GENERA intereses a la tasa EA del plástico
 * (con tope en la tasa de usura que certifica la Superfinanciera, ~26% EA).
 * Compara el contado (con descuento opcional) contra el VALOR PRESENTE de las
 * cuotas, descontadas por el costo de oportunidad (CDT ~9-9,5% EA o inflación).
 * Como la tasa de la tarjeta suele triplicar la del CDT, a más cuotas, más caro:
 * lo contrario del caso argentino de cuotas sin interés con inflación alta.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

/** EA % → tasa mensual equivalente (decimal). */
function eaToMensual(eaPct: number): number {
  return Math.pow(1 + eaPct / 100, 1 / 12) - 1;
}

/** Cuota fija mensual (sistema francés). */
function cuotaFija(capital: number, iMensual: number, n: number): number {
  if (capital <= 0 || n <= 0) return 0;
  if (iMensual === 0) return capital / n;
  return (capital * iMensual) / (1 - Math.pow(1 + iMensual, -n));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const precio = Math.max(0, num(inputs.precio));
  const descuentoContado = Math.max(0, num(inputs.descuentoContado));
  const cuotas = Math.max(1, num(inputs.cuotas));
  const tasaEATarjeta = Math.max(0, num(inputs.tasaEATarjeta));
  const tasaEACDT = Math.max(0, num(inputs.tasaEACDT));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));

  if (!precio) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga el precio del producto, el número de cuotas y la tasa EA de tu tarjeta. Calculamos cuánto te cuesta de verdad diferir la compra frente a pagar de contado, en pesos de hoy.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia a favor de la opción ganadora' },
      scenarios: [],
      nextActions: [
        'Carga el **precio del producto** y el **descuento** que te dan por pagar de contado (si lo hay).',
        'Indica a **cuántas cuotas** lo diferirías y la **tasa EA de tu tarjeta** (aparece en el extracto; el tope de usura ronda 26% EA).',
      ],
    };
  }

  // Costo de oportunidad mensual: lo mejor que haría tu plata si no la desembolsas
  // hoy (un CDT) o, si es mayor, la inflación esperada.
  const iOportunidad = eaToMensual(Math.max(tasaEACDT, inflacionAnual));
  const iTarjeta = eaToMensual(tasaEATarjeta);

  const contadoNeto = precio * (1 - descuentoContado / 100);
  const cuotaMensual = cuotaFija(precio, iTarjeta, cuotas);
  const totalCuotas = cuotaMensual * cuotas;
  const interesesTarjeta = totalCuotas - precio;

  // Valor presente de las cuotas al costo de oportunidad.
  let vpCuotas = 0;
  for (let k = 1; k <= cuotas; k++) {
    vpCuotas += cuotaMensual / Math.pow(1 + iOportunidad, k);
  }

  const diff = vpCuotas - contadoNeto; // + => contado más barato; − => cuotas
  const ganaContado = diff > 0;
  const ventaja = Math.abs(diff);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (ventaja < contadoNeto * 0.02) {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decide por tu flujo de caja';
    badge = 'Parejo';
    detail = `En pesos de hoy, el contado (${fmtMoney(contadoNeto)}) y las cuotas (${fmtMoney(vpCuotas)}) quedan casi iguales: la diferencia es de apenas ${fmtMoney(ventaja)}. Suele pasar cuando difieres a pocas cuotas o con una promoción a tasa 0. Decide según qué tanto necesitas conservar liquidez este mes.`;
  } else if (ganaContado) {
    status = 'a';
    tone = 'good';
    title = 'Te conviene pagar de contado';
    badge = 'Contado';
    detail = `Diferir a ${cuotas} cuotas con una tarjeta al ${fmtPct(tasaEATarjeta, 1).replace('+', '')} EA te genera ${fmtMoney(interesesTarjeta)} de intereses. Aun trayendo las cuotas a valor presente con tu CDT, financiar equivale a ${fmtMoney(vpCuotas)} de hoy, frente a ${fmtMoney(contadoNeto)} de contado. Pagando de una te ahorras ${fmtMoney(ventaja)}.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Te conviene diferir en cuotas';
    badge = 'Cuotas';
    detail = `Con la tasa que cargaste, las cuotas traídas a pesos de hoy suman ${fmtMoney(vpCuotas)}, menos que los ${fmtMoney(contadoNeto)} del contado. Solo pasa cuando la tasa de la tarjeta es muy baja o cero (promoción real sin intereses) y tu plata rinde en un CDT mientras tanto. Ahorras ${fmtMoney(ventaja)} en términos reales.`;
  }

  const scenarios = [
    {
      label: 'Contado (con descuento)',
      value: fmtMoney(contadoNeto),
      detail: descuentoContado > 0 ? `Precio de ${fmtMoney(precio)} con ${descuentoContado.toFixed(0)}% de descuento por pago de contado.` : 'Sin descuento por pago de contado.',
    },
    {
      label: `${cuotas} cuotas (total nominal)`,
      value: fmtMoney(totalCuotas),
      detail: `Cuota de ${fmtMoney(cuotaMensual)} al ${tasaEATarjeta.toFixed(1).replace('.', ',')}% EA. Intereses: ${fmtMoney(interesesTarjeta)}.`,
    },
    {
      label: 'Cuotas en pesos de hoy',
      value: fmtMoney(vpCuotas),
      detail: `Las ${cuotas} cuotas descontadas a tu costo de oportunidad (${Math.max(tasaEACDT, inflacionAnual).toFixed(1).replace('.', ',')}% EA).`,
    },
  ];

  const comparison = {
    columns: ['De contado', 'En cuotas'] as [string, string],
    rows: [
      { label: 'Lo que pagas (nominal)', a: fmtMoney(contadoNeto), b: fmtMoney(totalCuotas), hint: `cuotas incluyen ${fmtMoney(interesesTarjeta)} de intereses` },
      { label: 'Valor en pesos de hoy', a: fmtMoney(contadoNeto), b: fmtMoney(vpCuotas), hint: `descontado al ${fmtPct(iOportunidad * 100, 2)} mensual` },
      { label: 'Liquidez que conservas hoy', a: fmtMoney(0), b: fmtMoney(contadoNeto - cuotaMensual), hint: 'lo que no desembolsas de entrada' },
      { label: 'Resultado', a: ganaContado ? `Ahorras ${fmtMoney(ventaja)}` : '—', b: ganaContado ? '—' : `Ahorras ${fmtMoney(ventaja)}` },
    ],
  };

  const nextActions = [
    ganaContado
      ? 'Si tienes la plata sin tocar tu fondo de emergencia, **paga de contado** y pide descuento por hacerlo: muchos comercios lo dan aunque no lo anuncien.'
      : 'Si difieres, **cumple cada cuota completa y a tiempo**: caer en pago mínimo o en mora te lleva a la tasa de usura y a un reporte negativo en Datacrédito.',
    `Verifica en tu extracto la **tasa EA real** de tu tarjeta: el tope de usura ronda 26% EA, pero cada banco fija la suya y algunas promociones bajan a 0%. Con tasa 0 real, las cuotas casi siempre ganan.`,
    cuotas > 12
      ? `Diferir a ${cuotas} cuotas multiplica los intereses: en Colombia, a más cuotas, más caro. Si necesitas financiar, evalúa menos cuotas o un crédito más barato (libranza o cooperativa).`
      : 'Regla local: a más cuotas, más intereses. Diferir a 1 cuota no genera intereses en la mayoría de tarjetas; úsalo si solo quieres correr el pago un mes.',
    'Si el comercio ofrece el mismo precio de contado y financiado, compara el total con intereses contra el contado: esta sala ya lo hace, pero confirma que no haya seguros o cuotas de manejo adicionales.',
  ];

  const notes = [
    'La cuota se calcula con sistema de cuota fija (francés) sobre el precio, a la tasa EA convertida a mensual. Es como liquidan las compras diferidas la mayoría de tarjetas en Colombia.',
    `El valor presente descuenta cada cuota por tu costo de oportunidad: el mayor entre el CDT (${tasaEACDT.toFixed(1).replace('.', ',')}% EA) y la inflación esperada (${inflacionAnual.toFixed(1).replace('.', ',')}% anual).`,
    'No incluye cuota de manejo de la tarjeta ni seguros asociados, que encarecen aún más el financiamiento. Tampoco es asesoría financiera.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ventaja),
      label: status === 'tie' ? 'Diferencia (está parejo)' : `Ahorras pagando ${ganaContado ? 'de contado' : 'en cuotas'}`,
      sub: `Contado: **${fmtMoney(contadoNeto)}** · Cuotas en pesos de hoy: **${fmtMoney(vpCuotas)}** (nominal: ${fmtMoney(totalCuotas)}).`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuotas-o-de-contado',
  title: '¿Pagar en cuotas o de contado? Lo que cuesta diferir en Colombia 2026',
  h1: '¿Me conviene pagar en cuotas o de contado?',
  description:
    'En Colombia diferir con tarjeta casi siempre genera intereses: compara el contado (con descuento) contra el costo real de las cuotas a la tasa EA de tu tarjeta, con tope de usura y tu CDT como costo de oportunidad.',
  intro:
    'En Colombia, diferir una compra con tarjeta de crédito no es gratis: cada cuota carga intereses a la tasa EA del plástico, que puede llegar al tope de usura (~26% EA), mientras un CDT te paga 9-9,5% EA. Esta sala calcula la cuota real, suma los intereses, trae todo a pesos de hoy y te dice cuánto te ahorras pagando de contado — o en qué casos raros (tasa 0 real) las cuotas sí convienen.',
  icon: '💳',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    precio: 2400000,
    descuentoContado: 5,
    cuotas: 12,
    tasaEATarjeta: 25,
    tasaEACDT: 9.5,
    inflacionAnual: 5,
  },
  fields: [
    { id: 'precio', label: 'Precio del producto', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '2400000', help: 'El precio de venta del producto o servicio que quieres comprar.', group: 'La compra', groupIcon: '🏷️' },
    { id: 'descuentoContado', label: 'Descuento por pago de contado', type: 'number', suffix: '%', default: 0, min: 0, max: 90, placeholder: '5', help: 'El porcentaje que te rebajan si pagas todo de una. Si no hay descuento, deja 0.', group: 'La compra' },
    { id: 'cuotas', label: 'Número de cuotas', type: 'number', required: true, min: 1, max: 48, placeholder: '12', help: 'A cuántas cuotas diferirías la compra con tu tarjeta. A 1 cuota normalmente no hay intereses.', group: 'La compra' },
    { id: 'tasaEATarjeta', label: 'Tasa de tu tarjeta (EA)', type: 'number', suffix: '%', required: true, min: 0, max: 40, default: 26, placeholder: '26', help: 'Tasa efectiva anual de tu tarjeta (aparece en el extracto). El tope de usura ronda 26% EA; en promoción puede ser 0.', group: 'La compra' },
    { id: 'tasaEACDT', label: 'Rentabilidad de un CDT (EA)', type: 'number', suffix: '%', default: 9.5, min: 0, max: 30, placeholder: '9.5', help: 'Lo que rendiría tu plata en un CDT si no la desembolsas hoy. Referencia 2026: 9-9,5% EA.', group: 'Tu contexto', groupIcon: '📈' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', default: 5, min: 0, max: 30, placeholder: '5', advanced: true, help: 'IPC anual esperado. Se usa como costo de oportunidad si supera al CDT.', group: 'Tu contexto' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-tarjeta-credito-colombia-tasa-usura-cuota-pago-minimo', label: 'Tarjeta y tasa de usura' },
    { slug: 'co/calculadora-cdt-colombia-rentabilidad-90-180-360-dias', label: 'Rentabilidad de un CDT' },
    { slug: 'co/calculadora-tasa-interes-mora-colombia-tarjeta-credito-2026', label: 'Interés de mora de tarjeta' },
  ],
  howItWorks: `Esta sala compara las dos formas de pago en pesos de hoy, con la lógica de tasas colombiana.

1. **Contado neto.** Aplica el descuento por pago de contado (si existe) al precio. Ese es el desembolso real de pagar de una.
2. **La cuota real.** Convierte la tasa EA de tu tarjeta a tasa mensual y calcula la cuota fija de diferir el precio al número de cuotas elegido. Ahí aparecen los intereses que el comercio no te muestra.
3. **Costo de oportunidad.** Toma el mayor entre la rentabilidad de un CDT y la inflación esperada: es lo que tu plata haría si no la entregas hoy.
4. **Valor presente de las cuotas.** Trae cada cuota futura a pesos de hoy con ese costo de oportunidad y las suma. Así la comparación con el contado es justa.
5. **El veredicto.** Gana la opción con menor valor en pesos de hoy. Como la tasa de la tarjeta suele triplicar la del CDT, en Colombia el contado gana casi siempre — salvo promociones a tasa 0 real.`,
  faq: [
    { q: '¿Por qué en Colombia las cuotas suelen salir más caras?', a: 'Porque diferir con tarjeta genera intereses a la tasa EA del plástico, que ronda 24-26% EA (cerca del tope de usura), mientras tu plata en un CDT rinde 9-9,5% EA y la inflación va por 5%. La brecha entre lo que te cobran y lo que rinde tu dinero hace que, a más cuotas, más pierdas.' },
    { q: '¿Qué es la tasa de usura y quién la fija?', a: 'Es el interés máximo legal que puede cobrar un crédito de consumo en Colombia. La Superintendencia Financiera certifica cada mes el interés bancario corriente y la usura es 1,5 veces ese valor; en 2026 ronda 26% EA. Las tarjetas suelen cobrar muy cerca de ese tope.' },
    { q: '¿Diferir a una cuota genera intereses?', a: 'En la mayoría de tarjetas colombianas, no: la compra a 1 cuota se cobra completa en el siguiente extracto sin intereses. Es la forma de usar la tarjeta "gratis". Los intereses aparecen al diferir a 2 o más cuotas, y crecen con cada cuota adicional.' },
    { q: '¿Cuándo sí conviene pagar en cuotas?', a: 'Cuando la tasa es realmente 0 (promociones puntuales de comercios o bancos) o muy baja, y puedes dejar tu plata rindiendo en un CDT mientras tanto. También si pagar de contado te obliga a tocar tu fondo de emergencia: quedarte sin colchón sale más caro que unos intereses.' },
    { q: '¿El pago mínimo de la tarjeta es una opción?', a: 'Es la más cara de todas. El pago mínimo apenas cubre intereses y un abono pequeño a capital, así que la deuda se estira por años a tasa cercana a usura. Si difieres, paga siempre la cuota completa; el mínimo solo debería usarse en una emergencia puntual.' },
    { q: '¿Qué pasa si me atraso en una cuota?', a: 'El banco te cobra interés de mora (también topado por la usura) y, si el atraso supera los 30 días, te reporta negativamente a Datacrédito y TransUnion. Ese reporte encarece o bloquea tus créditos futuros por años, un costo mucho mayor que el de la compra.' },
    { q: '¿La cuota de manejo cambia la cuenta?', a: 'Sí, en contra de la tarjeta. La cuota de manejo (que muchas tarjetas cobran mensual o trimestralmente) y los seguros asociados encarecen el financiamiento por encima de la tasa EA pura. Esta sala no los incluye, así que el costo real de diferir puede ser aún mayor al mostrado.' },
    { q: '¿Y si el comercio no da descuento por pago de contado?', a: 'Pídelo igual: en Colombia muchos comercios rebajan 3-10% por pago en efectivo o débito porque se ahorran la comisión de la franquicia. Si no hay descuento, la comparación se hace con el precio pleno; aun así el contado suele ganar por los intereses de diferir.' },
  ],
  sources: [
    { name: 'Superintendencia Financiera de Colombia — Interés bancario corriente y tasa de usura', url: 'https://www.superfinanciera.gov.co/' },
    { name: 'Banco de la República — Tasas de interés y estadísticas monetarias', url: 'https://www.banrep.gov.co/' },
    { name: 'DANE — Índice de Precios al Consumidor (IPC)', url: 'https://www.dane.gov.co/' },
  ],
};
