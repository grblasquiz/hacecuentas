/**
 * Sala de decisión PE — "¿En cuotas o al contado?"
 *
 * Patrón COMPARACIÓN (2 columnas), reescrito para la economía peruana: con
 * inflación baja (~2,5% anual) y TCEA de tarjetas de 40-90%, financiar casi
 * nunca "se licúa" como en economías de alta inflación. Compara el contado con
 * descuento contra el VALOR PRESENTE de las cuotas, descontado por tu costo de
 * oportunidad real (depósito a plazo ~4-5%, cajas municipales ~6-7%). Además
 * estima la TCEA implícita de las cuotas para desenmascarar "cuotas sin
 * intereses" que en realidad tienen recargo.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

/** TEA % anual → tasa efectiva mensual (decimal). */
function teaAMensual(teaPct: number): number {
  return Math.pow(1 + teaPct / 100, 1 / 12) - 1;
}

/** TCEA implícita de financiar `precio` en n cuotas de `cuota` (bisección). */
function tceaImplicita(precio: number, cuota: number, n: number): number {
  if (cuota * n <= precio + 0.01) return 0;
  let lo = 0;
  let hi = 0.5; // 50% mensual de techo
  for (let iter = 0; iter < 60; iter++) {
    const mid = (lo + hi) / 2;
    let vp = 0;
    for (let k = 1; k <= n; k++) vp += cuota / Math.pow(1 + mid, k);
    if (vp > precio) lo = mid;
    else hi = mid;
  }
  return (Math.pow(1 + (lo + hi) / 2, 12) - 1) * 100;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const precioContado = Math.max(0, num(inputs.precioContado));
  const descuentoContado = Math.max(0, num(inputs.descuentoContado));
  const cuotas = Math.max(1, num(inputs.cuotas));
  const valorCuota = Math.max(0, num(inputs.valorCuota));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));
  const rendimientoTEA = Math.max(0, num(inputs.rendimientoTEA));

  if (!precioContado || !valorCuota) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga el precio al contado y el valor de cada cuota. Comparamos el contado (con su descuento) contra lo que realmente cuestan las cuotas en soles de hoy, y te calculamos la TCEA implícita del financiamiento.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia a favor de la opción ganadora' },
      scenarios: [],
      nextActions: [
        'Carga el **precio al contado** y el **descuento** que te dan por pagar de una vez (si lo hay).',
        'Carga la **cantidad de cuotas** y el **valor de cada cuota** que te ofrece la tienda o el banco.',
      ],
    };
  }

  // Costo de oportunidad mensual: lo mejor que puede hacer tu plata si NO pagas
  // al contado (depósito a plazo o caja municipal), nunca menos que la inflación.
  const tasaDescuentoMensual = Math.max(teaAMensual(inflacionAnual), teaAMensual(rendimientoTEA));
  const contadoNeto = precioContado * (1 - descuentoContado / 100);

  let vpCuotas = 0;
  for (let k = 1; k <= cuotas; k++) {
    vpCuotas += valorCuota / Math.pow(1 + tasaDescuentoMensual, k);
  }
  const totalNominalCuotas = valorCuota * cuotas;
  const tceaImp = tceaImplicita(contadoNeto, valorCuota, cuotas);

  const diff = contadoNeto - vpCuotas; // + => cuotas más baratas; - => contado más barato
  const ganaCuotas = diff > 0;
  const ventaja = Math.abs(diff);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (ventaja < contadoNeto * 0.02) {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decide por tu liquidez';
    badge = 'Parejo';
    detail = `En soles de hoy, el contado (${fmtMoney(contadoNeto)}) y las cuotas (${fmtMoney(vpCuotas)}) casi empatan: la diferencia es de apenas ${fmtMoney(ventaja)}. Si son cuotas realmente sin intereses, financiar te deja el efectivo libre; si prefieres no deber nada, paga al contado. Ninguna opción te cuesta caro.`;
  } else if (ganaCuotas) {
    status = 'b';
    tone = 'good';
    title = 'Te conviene pagar en cuotas';
    badge = 'Cuotas';
    detail = `Las cuotas suman ${fmtMoney(totalNominalCuotas)} nominales, pero en soles de hoy equivalen a ${fmtMoney(vpCuotas)}: menos que los ${fmtMoney(contadoNeto)} del contado. Ahorras ${fmtMoney(ventaja)}, siempre que el efectivo que no desembolsas lo pongas a rendir (depósito a plazo o caja) y no lo gastes. Esto solo pasa con cuotas genuinamente sin intereses.`;
  } else {
    status = 'a';
    tone = 'good';
    title = 'Te conviene pagar al contado';
    badge = 'Contado';
    detail = `El contado sale ${fmtMoney(contadoNeto)} frente a ${fmtMoney(vpCuotas)} que valen las cuotas en soles de hoy: pagas ${fmtMoney(ventaja)} de más si financias. ${tceaImp > 1 ? `La TCEA implícita del financiamiento es de ${fmtPct(tceaImp, 0).replace('+', '')} — muy por encima del ${fmtPct(rendimientoTEA, 1).replace('+', '')} que rinde tu plata en un depósito.` : 'Con la inflación baja del Perú, estirar los pagos no "licúa" nada: el interés lo pagas completo.'}`;
  }

  const scenarios = [
    { label: 'Contado con descuento', value: fmtMoney(contadoNeto), detail: descuentoContado > 0 ? `${fmtPct(descuentoContado, 0)} de descuento sobre ${fmtMoney(precioContado)}.` : 'Sin descuento por pago al contado.' },
    { label: 'Cuotas (en soles de hoy)', value: fmtMoney(vpCuotas), detail: `${cuotas} cuotas de ${fmtMoney(valorCuota)} descontadas a tu costo de oportunidad.` },
    { label: 'Cuotas (total nominal)', value: fmtMoney(totalNominalCuotas), detail: tceaImp > 1 ? `TCEA implícita del financiamiento: ~${fmtPct(tceaImp, 0).replace('+', '')}.` : 'Igual al precio: cuotas sin intereses reales.' },
  ];

  const comparison = {
    columns: ['Contado', 'Cuotas'] as [string, string],
    rows: [
      { label: 'Lo que pagas en total', a: fmtMoney(contadoNeto), b: fmtMoney(totalNominalCuotas), hint: descuentoContado > 0 ? `contado con ${fmtPct(descuentoContado, 0)} de descuento` : undefined },
      { label: 'Valor en soles de hoy', a: fmtMoney(contadoNeto), b: fmtMoney(vpCuotas), hint: `descontado al ${fmtPct(tasaDescuentoMensual * 100, 2)} mensual` },
      { label: 'Costo del financiamiento', a: '—', b: tceaImp > 1 ? `TCEA ~${fmtPct(tceaImp, 0).replace('+', '')}` : 'TCEA 0% (sin intereses)', hint: 'la tasa que realmente pagas por las cuotas' },
      { label: 'Efectivo que conservas hoy', a: fmtMoney(0), b: fmtMoney(contadoNeto), hint: 'lo que no desembolsas de entrada' },
      { label: 'Resultado', a: ganaCuotas ? '—' : `Ahorras ${fmtMoney(ventaja)}`, b: ganaCuotas ? `Ahorras ${fmtMoney(ventaja)}` : '—' },
    ],
  };

  const nextActions = [
    ganaCuotas
      ? 'Si financias, **pon a rendir el efectivo** que no desembolsaste (depósito a plazo o caja municipal): ahí vive la ventaja. Si lo gastas, la pierdes.'
      : 'Si tienes el efectivo sin tocar tu fondo de emergencia ni tu CTS, **paga al contado** y negocia el descuento: en el Perú, con inflación baja, financiar con interés casi nunca compensa.',
    `Antes de firmar, pide la **TCEA por escrito** (no la TEA ni la "tasa referencial"): es el costo total con comisiones y seguros. ${tceaImp > 1 ? `Con estas cuotas, la implícita ronda ${fmtPct(tceaImp, 0).replace('+', '')}.` : 'Compárala con la que calculamos acá.'}`,
    'Ojo con las "cuotas sin intereses" de retail: verifica que el precio en cuotas sea el MISMO que al contado. Si el precio de lista sube al financiar, el interés está escondido en el precio.',
    'Compara tu alternativa real de inversión: un depósito a plazo rinde ~4-5% TEA y una caja municipal ~6-7%. Ese es tu techo de "ganancia" por no pagar al contado — cualquier TCEA por encima te hace perder.',
  ];

  const notes = [
    'Comparamos el contado contra el valor presente de las cuotas, descontando cada cuota futura a tu costo de oportunidad mensual (la mayor entre inflación esperada y el rendimiento de tu mejor alternativa: depósito a plazo o caja).',
    'La TCEA implícita se calcula desde el precio contado y el plan de cuotas que cargaste; la oficial puede diferir por comisiones o seguros de desgravamen. Pide siempre la TCEA formal (la SBS obliga a informarla).',
    'Con inflación de ~2,5% anual, las cuotas futuras casi no se "licúan": a diferencia de economías de alta inflación, en el Perú el interés que pagas es interés real.',
    'No es asesoría financiera. Verifica el precio final de cada opción, incluidos portes y seguros del financiamiento.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ventaja),
      label: status === 'tie' ? 'Diferencia (casi empate)' : `Ahorras pagando ${ganaCuotas ? 'en cuotas' : 'al contado'}`,
      sub: `Contado con descuento: **${fmtMoney(contadoNeto)}** · Cuotas en soles de hoy: **${fmtMoney(vpCuotas)}**.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuotas-o-contado',
  title: '¿En cuotas o al contado? Qué conviene en el Perú 2026',
  h1: '¿Me conviene pagar en cuotas o al contado?',
  description:
    'Compara el precio al contado contra lo que realmente cuestan las cuotas en soles de hoy, con la TCEA implícita del financiamiento. Con inflación baja y tarjetas con TCEA de 40-90%, en el Perú el contado suele ganar — salvo cuotas sin intereses reales.',
  intro:
    'En el Perú la inflación es baja (~2,5% anual), así que financiar no "licúa" la deuda: cada punto de TCEA que pagas es costo real. Pero tampoco toda cuota es mala — las cuotas sin intereses genuinas te dejan el efectivo libre para que rinda en un depósito o caja. Esta sala compara el contado con descuento contra el valor presente de las cuotas, calcula la TCEA implícita del plan que te ofrecen y te dice cuál sale más barato con tus números.',
  icon: '💳',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    precioContado: 3000,
    descuentoContado: 5,
    cuotas: 12,
    valorCuota: 295,
    inflacionAnual: 2.5,
    rendimientoTEA: 4.5,
  },
  fields: [
    { id: 'precioContado', label: 'Precio al contado', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '3,000', help: 'El precio pagando de una sola vez, antes de cualquier descuento.', group: 'La compra', groupIcon: '🏷️' },
    { id: 'descuentoContado', label: 'Descuento por pagar al contado', type: 'number', suffix: '%', default: 0, min: 0, max: 90, placeholder: '5', help: 'El % que te rebajan por pagar cash o con débito. Si no hay, deja 0.', group: 'La compra' },
    { id: 'cuotas', label: 'Número de cuotas', type: 'number', required: true, min: 1, max: 60, placeholder: '12', help: 'En cuántas cuotas mensuales te ofrecen financiarlo.', group: 'La compra' },
    { id: 'valorCuota', label: 'Valor de cada cuota', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '295', help: 'Lo que pagarías al mes. Revisa el cronograma: incluye intereses, portes y seguro de desgravamen si los hay.', group: 'La compra' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', default: 2.5, min: 0, max: 30, placeholder: '2.5', help: 'El BCRP apunta a un rango de 1-3% anual. Afecta poco: en el Perú las cuotas casi no se licúan.', group: 'Tu contexto', groupIcon: '📈' },
    { id: 'rendimientoTEA', label: 'Rendimiento de tu plata (TEA)', type: 'number', suffix: '%', default: 4.5, min: 0, max: 30, placeholder: '4.5', help: 'Lo que ganaría tu efectivo si no lo desembolsas: depósito a plazo ~4-5%, cajas municipales ~6-7% TEA.', group: 'Tu contexto', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-tarjeta-credito-pago-minimo-peru', label: 'Pago mínimo de tarjeta' },
    { slug: 'pe/calculadora-deposito-plazo-fijo-peru', label: 'Depósito a plazo fijo' },
    { slug: 'pe/calculadora-prestamo-personal-tcea-peru', label: 'Préstamo personal (TCEA)' },
  ],
  howItWorks: `Esta sala lleva las dos opciones a soles de hoy y desenmascara el costo real del financiamiento.

1. **Contado neto.** Aplica el descuento por pago al contado al precio de lista. Ese es tu costo real de pagar de una vez.
2. **Tu costo de oportunidad.** Toma lo mejor que puede rendir tu plata si no la desembolsas — un depósito a plazo (~4-5% TEA) o una caja municipal (~6-7%) — y nunca menos que la inflación. Con eso descuenta los pagos futuros.
3. **Valor presente de las cuotas.** Trae cada cuota a soles de hoy y las suma. Con inflación baja, una cuota del mes 12 vale casi lo mismo que una de hoy: acá no hay licuación que te salve.
4. **TCEA implícita.** Calcula qué tasa efectiva anual estás pagando en realidad por financiar, comparando el precio contado contra el plan de cuotas. Si las "cuotas sin intereses" tienen recargo escondido, acá aparece.
5. **El veredicto.** Gana la opción con menor valor en soles de hoy. Regla peruana: con TCEA positiva, el contado gana casi siempre; solo las cuotas genuinamente sin intereses compiten.`,
  faq: [
    { q: '¿En el Perú conviene comprar en cuotas?', a: 'Solo si son cuotas genuinamente sin intereses y al mismo precio que el contado. Con inflación de ~2,5% anual, financiar no "licúa" la deuda: si la TCEA de la tarjeta es de 40-90%, cada cuota carga interés real que ninguna inversión segura (depósito a 4-5%, caja a 6-7%) compensa.' },
    { q: '¿Qué es la TCEA y en qué se diferencia de la TEA?', a: 'La TCEA (Tasa de Costo Efectivo Anual) es el costo total del crédito: interés más comisiones, portes y seguro de desgravamen. La TEA es solo el interés. En el Perú los bancos están obligados por la SBS a informarte la TCEA — es el único número comparable entre ofertas.' },
    { q: '¿Las "cuotas sin intereses" de las tiendas son realmente gratis?', a: 'A veces. La trampa más común es que el precio "en cuotas" sea mayor que el precio contado o que le sumen portes mensuales y seguro de desgravamen: eso es interés disfrazado. Compara el total del cronograma contra el precio contado — esta sala te calcula la TCEA implícita para detectarlo.' },
    { q: '¿Cuánto rinde mi plata si no la gasto al contado?', a: 'En 2026, un depósito a plazo en banco ronda 4-5% TEA y las cajas municipales pagan ~6-7% TEA (cubiertas por el Fondo de Seguro de Depósitos hasta el tope vigente). Ese es tu techo realista de ganancia por financiar: cualquier TCEA superior a eso te hace perder plata.' },
    { q: '¿La inflación no hace que las cuotas salgan más baratas?', a: 'Casi nada. Con el BCRP manteniendo la inflación en el rango de 1-3% anual, una cuota del mes 12 vale apenas ~2,5% menos que una de hoy. A diferencia de Argentina o Venezuela, en el Perú no puedes contar con que la inflación pague tu deuda.' },
    { q: '¿Y si pago con tarjeta en cuotas que ya tienen interés?', a: 'Ahí el contado gana casi siempre: las TCEA de tarjetas en el Perú van de 40% a más de 90% según el banco y el perfil. Puedes verificar la tasa de tu tarjeta en el comparador Retasas de la SBS antes de aceptar el cronograma.' },
    { q: '¿Conviene usar mi CTS o mi fondo de emergencia para pagar al contado?', a: 'El fondo de emergencia no: si lo gastas y surge un imprevisto, terminarás financiándolo con la tarjeta a TCEA de tarjeta. La CTS es tu seguro de desempleo — tampoco es plata para consumo. Paga al contado solo con excedente real.' },
    { q: '¿Qué pasa si ya tomé las cuotas y me arrepiento?', a: 'En el Perú el pago anticipado es un derecho: puedes cancelar el saldo cuando quieras con reducción de intereses y sin penalidad (Código de Protección al Consumidor y normas SBS). Si la TCEA es alta, adelantar cuotas te ahorra el interés no devengado.' },
  ],
  sources: [
    { name: 'SBS — Retasas: comparador de tasas y TCEA', url: 'https://www.sbs.gob.pe/app/retasas/paginas/retasasInicio.aspx' },
    { name: 'BCRP — Reporte de Inflación y meta de inflación', url: 'https://www.bcrp.gob.pe/' },
  ],
};
