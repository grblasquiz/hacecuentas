/**
 * Sala de decisión — "¿Me conviene pagar en cuotas o al contado?"
 *
 * Patrón COMPARACIÓN (2 columnas). Compara el precio de contado con descuento
 * contra el VALOR PRESENTE de las cuotas, descontando cada cuota futura por la
 * tasa de oportunidad (inflación + rendimiento alternativo). En contexto de alta
 * inflación y cuotas sin interés, el valor presente de las cuotas suele ser menor
 * que el contado: las cuotas ganan.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const precioContado = Math.max(0, num(inputs.precioContado));
  const descuentoContado = Math.max(0, num(inputs.descuentoContado));
  const cuotas = Math.max(1, num(inputs.cuotas));
  const valorCuota = Math.max(0, num(inputs.valorCuota));
  const inflacionMensual = Math.max(0, num(inputs.inflacionMensual));
  const rendimientoAlternativoTNA = Math.max(0, num(inputs.rendimientoAlternativoTNA));

  if (!precioContado || !valorCuota) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio de contado y el valor de cada cuota. Comparamos el contado con descuento contra el valor presente de las cuotas para decirte cuál sale más barato hoy.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia a favor de la opción ganadora' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio de contado** y el **descuento** que te hacen por pagar así.',
        'Cargá la **cantidad de cuotas** y el **valor de cada una**.',
      ],
    };
  }

  // Tasa de oportunidad mensual: combina inflación y rendimiento alternativo.
  // Pesos futuros valen menos: por inflación (perdés poder de compra esperando)
  // y porque ese dinero podría rendir invertido. Usamos la mayor de ambas como
  // tasa de descuento mensual (criterio conservador: el mejor uso del dinero).
  const tasaRendMensual = rendimientoAlternativoTNA / 12 / 100;
  const tasaDescuentoMensual = Math.max(inflacionMensual / 100, tasaRendMensual);

  // Precio de contado neto del descuento.
  const contadoNeto = precioContado * (1 - descuentoContado / 100);

  // Valor presente de las cuotas: cada cuota k (k=1..n) se paga a fin de mes k.
  let vpCuotas = 0;
  for (let k = 1; k <= cuotas; k++) {
    vpCuotas += valorCuota / Math.pow(1 + tasaDescuentoMensual, k);
  }
  const totalNominalCuotas = valorCuota * cuotas;

  // Comparación: gana el menor valor presente.
  const diff = contadoNeto - vpCuotas; // + => cuotas más baratas; - => contado más barato
  const ganaCuotas = diff > 0;
  const ventaja = Math.abs(diff);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (Math.abs(diff) < contadoNeto * 0.02) {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por liquidez y comodidad';
    badge = 'Es parejo';
    detail = `En valor de hoy, contado (${fmtMoney(contadoNeto)}) y cuotas (${fmtMoney(vpCuotas)}) están muy cerca: la diferencia es de apenas ${fmtMoney(ventaja)}. Elegí según si preferís conservar liquidez (cuotas) o sacarte la compra de encima (contado).`;
  } else if (ganaCuotas) {
    status = 'b';
    tone = 'good';
    title = 'Conviene pagar en cuotas';
    badge = 'Cuotas';
    detail = `Aunque en pesos nominales las cuotas suman ${fmtMoney(totalNominalCuotas)}, traídas a valor de hoy equivalen a ${fmtMoney(vpCuotas)}: menos que los ${fmtMoney(contadoNeto)} del contado con descuento. Te conviene financiar y ahorrás ${fmtMoney(ventaja)} en términos reales, porque pagás cuotas futuras con pesos que valen menos.`;
  } else {
    status = 'a';
    tone = 'good';
    title = 'Conviene pagar al contado';
    badge = 'Contado';
    detail = `El contado con descuento sale ${fmtMoney(contadoNeto)}, menos que el valor presente de las cuotas (${fmtMoney(vpCuotas)}). Pagás ${fmtMoney(ventaja)} menos en términos reales: el descuento por contado supera a lo que ganarías estirando los pagos.`;
  }

  const scenarios = [
    { label: 'Contado con descuento', value: fmtMoney(contadoNeto), detail: descuentoContado > 0 ? `${fmtPct(descuentoContado, 0)} de descuento sobre ${fmtMoney(precioContado)}.` : 'Sin descuento por pago contado.' },
    { label: 'Cuotas (valor de hoy)', value: fmtMoney(vpCuotas), detail: `${cuotas} cuotas de ${fmtMoney(valorCuota)} traídas a pesos de hoy.` },
    { label: 'Cuotas (nominal)', value: fmtMoney(totalNominalCuotas), detail: 'Lo que pagás en total sumando las cuotas, sin ajustar por inflación.' },
  ];

  const comparison = {
    columns: ['Contado', 'Cuotas'] as [string, string],
    rows: [
      { label: 'Precio que pagás (nominal)', a: fmtMoney(contadoNeto), b: fmtMoney(totalNominalCuotas), hint: descuentoContado > 0 ? `contado con ${fmtPct(descuentoContado, 0)} off` : undefined },
      { label: 'Valor en pesos de hoy', a: fmtMoney(contadoNeto), b: fmtMoney(vpCuotas), hint: `descontado al ${fmtPct(tasaDescuentoMensual * 100, 1)} mensual` },
      { label: 'Liquidez que conservás hoy', a: fmtMoney(0), b: fmtMoney(contadoNeto), hint: 'lo que NO desembolsás de entrada' },
      { label: 'Resultado', a: ganaCuotas ? '—' : `Ahorrás ${fmtMoney(ventaja)}`, b: ganaCuotas ? `Ahorrás ${fmtMoney(ventaja)}` : '—' },
    ],
  };

  const nextActions = [
    ganaCuotas
      ? 'Las cuotas ganan en valor real: financiá, pero **invertí o reservá** el efectivo que no desembolsás, no lo gastes. Ahí está la ventaja.'
      : 'El contado gana: si tenés la liquidez sin tocar tu fondo de emergencia, pagá de una y aprovechá el descuento.',
    'Confirmá que las cuotas sean **realmente sin interés**: si el precio de lista para cuotas es más alto que el de contado, ese recargo se come la ventaja. Compará el precio contado contra el total de cuotas.',
    `La decisión depende de tu tasa de oportunidad (acá ${fmtPct(tasaDescuentoMensual * 100, 1)} mensual). Si la inflación o tu rendimiento alternativo cambian, recalculá: con inflación más alta, las cuotas convienen más.`,
    'No tomes cuotas solo porque "convienen" si después te cuesta sostener el pago mensual: la ventaja financiera no sirve si te desordena el presupuesto.',
  ];

  const notes = [
    'Comparamos el precio de contado contra el valor presente de las cuotas, descontando cada cuota futura por tu tasa de oportunidad mensual (la mayor entre inflación y rendimiento alternativo). En pesos de hoy, una cuota futura vale menos.',
    'Asume cuotas fijas en pesos no ajustables. Si las cuotas se ajustan por inflación o índice (UVA), la ventaja de financiar desaparece o se reduce.',
    'No es asesoramiento financiero. No incluye recargos administrativos ni seguros que algunos planes de cuotas agregan: verificá el precio final de cada opción.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ventaja),
      label: status === 'tie' ? 'Diferencia (es parejo)' : `Ahorrás pagando en ${ganaCuotas ? 'cuotas' : 'contado'}`,
      sub: `Contado con descuento: **${fmtMoney(contadoNeto)}** · Cuotas a valor de hoy: **${fmtMoney(vpCuotas)}**.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuotas-o-contado',
  title: 'Cuotas o contado con inflación: qué conviene en 2026 (calculadora)',
  h1: 'Cuotas o contado: ¿qué conviene con esta inflación?',
  description:
    'Compará el precio de contado con descuento contra el valor presente de las cuotas, descontando inflación y rendimiento. Con cuotas sin interés e inflación alta, financiar suele ganar. Te decimos cuál sale más barato hoy.',
  intro:
    'Pagar en cuotas no es "más caro" automáticamente: con inflación, una cuota que pagás dentro de 10 meses vale mucho menos que hoy. Esta sala compara el contado con descuento contra el valor presente real de las cuotas, descontando inflación y el rendimiento que podrías sacarle a ese dinero, y te dice cuál sale más barato en pesos de hoy.',
  icon: '💳',
  category: 'finanzas',
  audience: 'AR',
  answer: 'Las cuotas convienen cuando **son sin interés y podés poner el dinero del contado a rendir** (plazo fijo o inversión): en contexto inflacionario, pagar en cuotas fijas licúa el costo real. Contado conviene si hay descuento por pago único o si las cuotas tienen un CFT mayor a lo que rinde tu plata. Compará el precio de contado contra el valor presente de las cuotas, no contra el total nominal.',
  lastReviewed: '2026-07-21',
  example: {
    precioContado: 1200000,
    descuentoContado: 5,
    cuotas: 12,
    valorCuota: 100000,
    inflacionMensual: 4,
    rendimientoAlternativoTNA: 45,
  },
  fields: [
    { id: 'precioContado', label: 'Precio de lista (contado)', type: 'number', prefix: '$', required: true, min: 0, placeholder: '1000000', help: 'El precio para pagar de una, antes del descuento por contado.', group: 'La compra', groupIcon: '🏷️' },
    { id: 'descuentoContado', label: 'Descuento por pagar al contado', type: 'number', suffix: '%', default: 0, min: 0, max: 90, placeholder: '10', help: 'El % que te bajan si pagás todo de una. Si no hay descuento, dejá 0.', group: 'La compra' },
    { id: 'cuotas', label: 'Cantidad de cuotas', type: 'number', required: true, min: 1, max: 60, placeholder: '12', help: 'En cuántas cuotas lo podés financiar.', group: 'La compra' },
    { id: 'valorCuota', label: 'Valor de cada cuota', type: 'number', prefix: '$', required: true, min: 0, placeholder: '95000', help: 'Lo que pagás por mes. (Cuotas sin interés: precio de lista dividido la cantidad de cuotas.)', group: 'La compra' },
    { id: 'inflacionMensual', label: 'Inflación mensual esperada', type: 'number', suffix: '%', default: 3.5, min: 0, max: 30, placeholder: '3.5', help: 'Cuánto esperás que suban los precios por mes. Licúa el valor de las cuotas futuras.', group: 'Tu contexto', groupIcon: '📈' },
    { id: 'rendimientoAlternativoTNA', label: 'Rendimiento alternativo (TNA)', type: 'number', suffix: '%', default: 0, min: 0, placeholder: '40', help: 'Qué TNA le sacarías a ese dinero si lo invirtieras en vez de pagar al contado.', group: 'Tu contexto', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
  ],
  howItWorks: `Esta sala no compara precios nominales: los lleva todos a pesos de hoy.

1. **Contado neto.** Aplica el descuento por pago contado al precio de lista. Ese es el costo real de pagar de una.
2. **Tu tasa de oportunidad.** Calcula cuánto se devalúa el dinero por mes, tomando la mayor entre la inflación esperada y el rendimiento que le sacarías invirtiéndolo. Es la tasa a la que "descontás" los pagos futuros.
3. **Valor presente de las cuotas.** Trae cada cuota futura a pesos de hoy: una cuota que pagás en el mes 12 vale bastante menos que una de hoy. Suma todos esos valores descontados.
4. **La comparación.** Enfrenta el contado neto contra el valor presente de las cuotas. Gana el menor: ese es el que realmente te sale más barato en plata de hoy.
5. **El contexto manda.** Con cuotas sin interés e inflación alta, financiar suele ganar. Con un buen descuento por contado o inflación baja, conviene pagar de una. La sala lo resuelve con tus números.`,
  faq: [
    { q: '¿Por qué pagar en cuotas puede salir más barato?', a: 'Porque con inflación, los pesos de mañana valen menos que los de hoy. Si las cuotas son sin interés (o con interés menor a la inflación), pagás cada cuota con dinero más "barato", y el valor real de lo que desembolsás termina siendo menor que el precio de contado.' },
    { q: '¿Qué es el "valor presente" de las cuotas?', a: 'Es cuánto valen hoy todos los pagos futuros sumados, descontando cada uno por la tasa de oportunidad. Una cuota de $95.000 dentro de un año no equivale a $95.000 de hoy: vale menos. Sumar las cuotas a valor presente es la forma correcta de compararlas con el contado.' },
    { q: '¿Qué tasa uso para descontar?', a: 'Tu tasa de oportunidad: la mayor entre la inflación esperada y el rendimiento que le sacarías a ese dinero invirtiéndolo. Es el costo de "atar" tu plata al contado. Cuanto más alta, más conviene financiar.' },
    { q: '¿Las cuotas sin interés siempre convienen?', a: 'En contextos de inflación alta, casi siempre, porque la inflación licúa las cuotas futuras. Pero hay que confirmar que sean realmente sin interés: si el precio para cuotas es más alto que el de contado, ese recargo encubierto puede dar vuelta el resultado.' },
    { q: '¿Y si las cuotas se ajustan por inflación (UVA)?', a: 'Entonces la ventaja desaparece: si cada cuota se actualiza por inflación o por un índice, ya no estás pagando con pesos "más baratos". Esta sala asume cuotas fijas en pesos; si las tuyas se ajustan, el contado vuelve a competir.' },
    { q: '¿Conviene pagar al contado si me dan buen descuento?', a: 'Depende de cuánto. Un descuento grande por contado puede superar la ventaja de licuar las cuotas con inflación. Por eso la sala compara el contado con descuento contra el valor presente de las cuotas: el número decide, no la intuición.' },
    { q: '¿Tengo que invertir el efectivo para que convengan las cuotas?', a: 'Para capturar toda la ventaja, sí: si financiás pero gastás el efectivo que te quedó, perdés el beneficio. Lo ideal es financiar (si conviene) y poner ese dinero a rendir o reservarlo, no consumirlo.' },
    { q: '¿Esto reemplaza mirar el CFT?', a: 'Lo complementa. Si las cuotas tienen interés explícito, el CFT te dice cuánto cuesta financiar; esta sala además incorpora la inflación, que el CFT no considera. Juntos te dan la foto completa de cuotas vs contado.' },
  ],
  sources: [
    { name: 'INDEC — Índice de Precios al Consumidor (IPC)', url: 'https://www.indec.gob.ar/' },
    { name: 'BCRA — Información para usuarios financieros', url: 'https://www.bcra.gob.ar/BCRAyVos/default.asp' },
  ],
};
