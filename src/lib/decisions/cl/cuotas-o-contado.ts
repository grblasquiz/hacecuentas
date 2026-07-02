/**
 * Sala de decisión CL — "¿En cuotas o al contado?"
 *
 * Chile: la trampa clásica del retail no es la tasa, es el PRECIO-CUOTA. Las
 * "cuotas sin interés" suelen calcularse sobre un precio de lista más alto que
 * el precio-contado, así que el recargo viene escondido en el total. Con
 * inflación baja (~3,5-4% anual) el "ahorro por pagar después" es chico: acá
 * comparamos el contado contra el valor presente de las cuotas descontadas por
 * tu costo de oportunidad (depósito a plazo ~5-6% anual). Si las cuotas tienen
 * interés (mirar el CAE), casi siempre pierden.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const precioContado = Math.max(0, num(inputs.precioContado));
  const descuentoContado = Math.max(0, num(inputs.descuentoContado));
  const cuotas = Math.max(1, num(inputs.cuotas));
  const valorCuota = Math.max(0, num(inputs.valorCuota));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));
  const depositoAnual = Math.max(0, num(inputs.depositoAnual));

  if (!precioContado || !valorCuota) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Carga el precio al contado y el valor de cada cuota tal como aparecen en la vitrina o el sitio. Comparamos el total real de cada opción — en Chile el precio-cuota suele ser más alto que el precio-contado — y te decimos cuál sale más barato.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia a favor de la opción ganadora' },
      scenarios: [],
      nextActions: [
        'Carga el **precio al contado** (efectivo o débito) y el descuento si te ofrecen uno.',
        'Carga la **cantidad de cuotas** y el **valor de cada una**: multiplícalas mentalmente, ese total es el que importa.',
      ],
    };
  }

  // Costo de oportunidad mensual: la mayor entre IPC esperado y lo que rendiría
  // la plata en un depósito a plazo. En Chile ronda 0,4-0,5% mensual: el
  // descuento de las cuotas futuras es MODESTO, no como en países de alta inflación.
  const tasaMensual = Math.max(inflacionAnual, depositoAnual) / 12 / 100;

  const contadoNeto = precioContado * (1 - descuentoContado / 100);
  const totalNominalCuotas = valorCuota * cuotas;
  const recargoPct = precioContado > 0 ? ((totalNominalCuotas - precioContado) / precioContado) * 100 : 0;

  let vpCuotas = 0;
  for (let k = 1; k <= cuotas; k++) {
    vpCuotas += valorCuota / Math.pow(1 + tasaMensual, k);
  }

  const diff = contadoNeto - vpCuotas; // + => cuotas más baratas; − => contado más barato
  const ganaCuotas = diff > 0;
  const ventaja = Math.abs(diff);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (ventaja < contadoNeto * 0.01) {
    status = 'tie';
    tone = 'neutral';
    title = 'Es prácticamente lo mismo: decide por liquidez';
    badge = 'Empate';
    detail = `En plata de hoy, contado (${fmtMoney(contadoNeto)}) y cuotas (${fmtMoney(vpCuotas)}) quedan casi iguales: la diferencia es de apenas ${fmtMoney(ventaja)}. Si las cuotas son realmente al mismo precio total, financiarte te deja la caja libre sin costo; si prefieres no tener un cargo mensual dando vueltas, paga al contado.`;
  } else if (ganaCuotas) {
    status = 'b';
    tone = 'good';
    title = 'Convienen las cuotas (mientras el precio total sea el mismo)';
    badge = 'Cuotas';
    detail = `Las ${cuotas} cuotas suman ${fmtMoney(totalNominalCuotas)}, pero traídas a plata de hoy equivalen a ${fmtMoney(vpCuotas)}: menos que los ${fmtMoney(contadoNeto)} del contado. Financiándote quedas ${fmtMoney(ventaja)} mejor, siempre que dejes el efectivo trabajando en un depósito a plazo o cuenta que rinda, no gastado.`;
  } else {
    status = 'a';
    tone = 'good';
    title = 'Conviene pagar al contado';
    badge = 'Contado';
    detail = `El contado sale ${fmtMoney(contadoNeto)} y las cuotas, aun descontadas a plata de hoy, valen ${fmtMoney(vpCuotas)}: pagas ${fmtMoney(ventaja)} de más por financiarte.${recargoPct > 1 ? ` El total en cuotas trae un recargo de ${fmtPct(recargoPct, 1)} sobre el precio-contado — el clásico "precio cuota" del retail.` : ''} Con inflación baja, ese sobreprecio no se licúa: lo pagas entero.`;
  }

  const scenarios = [
    { label: 'Contado', value: fmtMoney(contadoNeto), detail: descuentoContado > 0 ? `Con ${fmtPct(descuentoContado, 0)} de descuento sobre ${fmtMoney(precioContado)}.` : 'Precio para pagar de una vez (efectivo o débito).' },
    { label: 'Cuotas (plata de hoy)', value: fmtMoney(vpCuotas), detail: `${cuotas} cuotas de ${fmtMoney(valorCuota)} descontadas al ${fmtPct(tasaMensual * 100, 2)} mensual.` },
    { label: 'Cuotas (total nominal)', value: fmtMoney(totalNominalCuotas), detail: recargoPct > 1 ? `Suma un recargo de ${fmtPct(recargoPct, 1)} sobre el precio-contado.` : 'La suma simple de todas las cuotas.' },
  ];

  const comparison = {
    columns: ['Contado', 'Cuotas'] as [string, string],
    rows: [
      { label: 'Total que pagas (nominal)', a: fmtMoney(contadoNeto), b: fmtMoney(totalNominalCuotas), hint: recargoPct > 1 ? `las cuotas cargan ${fmtPct(recargoPct, 1)} de sobreprecio` : undefined },
      { label: 'Valor en plata de hoy', a: fmtMoney(contadoNeto), b: fmtMoney(vpCuotas), hint: `descontado al ${fmtPct(tasaMensual * 100, 2)} mensual` },
      { label: 'Caja que conservas hoy', a: fmtMoney(0), b: fmtMoney(contadoNeto), hint: 'lo que no desembolsas de entrada' },
      { label: 'Resultado', a: ganaCuotas ? '—' : `Ahorras ${fmtMoney(ventaja)}`, b: ganaCuotas ? `Ahorras ${fmtMoney(ventaja)}` : '—' },
    ],
  };

  const nextActions = [
    'Antes de decidir, compara los **totales**: precio-contado contra cuota × número de cuotas. En el retail chileno el precio para cuotas suele ser otro, y ahí está el interés escondido.',
    ganaCuotas
      ? 'Si te financias, **deja el efectivo en un depósito a plazo o cuenta remunerada**: la ventaja de las cuotas existe solo si esa plata rinde mientras tanto.'
      : 'Si tienes la plata sin tocar tu fondo de emergencia, paga al contado y pide el descuento por efectivo o débito: muchas tiendas lo dan aunque no lo publiquen.',
    'Si las cuotas tienen interés, exige el **CAE** (Carga Anual Equivalente): es el costo total anualizado y es el único número comparable entre tarjetas, avances y créditos. Con CAE sobre 20%, financiarte casi nunca conviene.',
    'No tomes cuotas solo porque "salen gratis" si te aprietan el presupuesto: un cupo de tarjeta comido por 12 meses también tiene costo.',
  ];

  const notes = [
    'Comparamos el contado contra el valor presente de las cuotas, descontadas por tu costo de oportunidad mensual (la mayor entre IPC esperado y depósito a plazo). Con la inflación chilena en torno al 3,5-4% anual, ese descuento es chico: un recargo del precio-cuota casi nunca se compensa.',
    'Asume cuotas fijas en pesos. Si el crédito está en UF, la cuota se reajusta y la ventaja de pagar después desaparece.',
    'No incluye comisiones de administración ni seguros de cesantía que algunas tarjetas suman a la cuota: pide el CAE para ver el costo completo.',
    'No es asesoría financiera: es una comparación de precios en plata de hoy.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ventaja),
      label: status === 'tie' ? 'Diferencia (empate técnico)' : `Ahorras pagando ${ganaCuotas ? 'en cuotas' : 'al contado'}`,
      sub: `Contado: **${fmtMoney(contadoNeto)}** · Cuotas en plata de hoy: **${fmtMoney(vpCuotas)}**.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuotas-o-contado',
  title: '¿Cuotas o al contado en Chile? Cuál conviene de verdad 2026',
  h1: '¿Me conviene pagar en cuotas o al contado?',
  description:
    'Las "cuotas sin interés" del retail chileno suelen esconder un precio-cuota más alto que el contado. Compara los totales reales en plata de hoy — con depósito a plazo e IPC como costo de oportunidad — y descubre cuál sale más barato.',
  intro:
    'En Chile la pregunta no es si las cuotas "son sin interés": es si el precio total en cuotas es el mismo que el precio-contado. El retail suele publicar dos precios, y el interés viene escondido en la diferencia. Esta sala multiplica cuota por número de cuotas, trae ese total a plata de hoy usando tu costo de oportunidad (depósito a plazo, IPC) y lo enfrenta al contado con descuento. Con inflación baja, el veredicto suele sorprender a quien viene acostumbrado a que "las cuotas siempre convienen".',
  icon: '💳',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    precioContado: 599990,
    descuentoContado: 0,
    cuotas: 12,
    valorCuota: 55990,
    inflacionAnual: 3.5,
    depositoAnual: 5.5,
  },
  fields: [
    { id: 'precioContado', label: 'Precio al contado', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '599990', help: 'El precio para pagar de una vez (efectivo, débito o transferencia), antes de cualquier descuento extra.', group: 'La compra', groupIcon: '🏷️' },
    { id: 'descuentoContado', label: 'Descuento por pagar al contado', type: 'number', suffix: '%', default: 0, min: 0, max: 90, placeholder: '5', help: 'Si te ofrecen una rebaja por efectivo o débito, ponla aquí. Si no hay, deja 0.', group: 'La compra' },
    { id: 'cuotas', label: 'Número de cuotas', type: 'number', required: true, min: 1, max: 48, placeholder: '12', help: 'En cuántas cuotas te ofrecen la compra.', group: 'La compra' },
    { id: 'valorCuota', label: 'Valor de cada cuota', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '55990', help: 'Lo que pagarías al mes. Ojo: si es "precio cuota", suele calcularse sobre un precio de lista más alto.', group: 'La compra' },
    { id: 'inflacionAnual', label: 'IPC anual esperado', type: 'number', suffix: '%', default: 3.5, min: 0, max: 30, placeholder: '3.5', help: 'La inflación chilena ronda el 3,5-4% anual. Define cuánto "se abaratan" las cuotas futuras: poco.', group: 'Tu contexto', groupIcon: '📈' },
    { id: 'depositoAnual', label: 'Rendimiento alternativo anual', type: 'number', suffix: '%', default: 5.5, min: 0, max: 50, placeholder: '5.5', help: 'Lo que rendiría tu plata en un depósito a plazo o fondo conservador (5-6% anual es lo típico).', group: 'Tu contexto', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-tarjeta-credito-chile-tasa-rotativa-pago-minimo', label: 'Tarjeta de crédito: rotativo y pago mínimo' },
    { slug: 'cl/calculadora-prestamo-personal-chile-cae-cmf-cuota', label: 'Crédito de consumo y CAE' },
    { slug: 'cl/calculadora-deposito-plazo-chile-bancos-2026-tasa', label: 'Depósito a plazo' },
    { slug: 'cl/calculadora-crefacile-financiar-electrodomesticos-chile-cuota-cae', label: 'Financiar electrodomésticos' },
  ],
  howItWorks: `Esta sala compara totales reales, no promesas de vitrina.

1. **Total en cuotas.** Multiplica el valor de la cuota por el número de cuotas. Si ese total supera el precio-contado, el interés existe aunque el cartel diga lo contrario: es el "precio cuota" del retail.
2. **Contado neto.** Aplica el descuento por efectivo o débito al precio de lista, si te ofrecen uno.
3. **Costo de oportunidad.** Toma la mayor entre el IPC esperado y lo que rendiría tu plata en un depósito a plazo, y la convierte en tasa mensual. En Chile eso da alrededor de 0,4-0,5% al mes.
4. **Cuotas en plata de hoy.** Descuenta cada cuota futura por esa tasa y las suma. Como la tasa es baja, el descuento también: una cuota del mes 12 vale apenas un 5% menos que una de hoy.
5. **El veredicto.** Gana el total menor en plata de hoy. Con precios iguales, las cuotas ganan por poco (tu plata rinde mientras tanto); con recargo de precio-cuota o CAE alto, el contado gana casi siempre.`,
  faq: [
    { q: '¿Las cuotas "sin interés" del retail son realmente sin interés?', a: 'Muchas veces no. La práctica común es tener un precio-contado y un "precio cuota" más alto: las cuotas se calculan sobre el segundo, así que el interés viene escondido en el sobreprecio. La prueba es simple: multiplica la cuota por el número de cuotas y compárala con el precio-contado. Si da más, hay interés, se llame como se llame.' },
    { q: '¿Por qué en Chile las cuotas no convienen tanto como dicen?', a: 'Porque la inflación es baja. Con IPC en torno al 3,5-4% anual, una cuota que pagas en 12 meses vale casi lo mismo que una de hoy: el efecto "pagar con plata devaluada" es mínimo. Cualquier recargo de precio-cuota o comisión se paga casi entero, no se licúa.' },
    { q: '¿Qué es el CAE y por qué debería mirarlo?', a: 'La Carga Anual Equivalente es el costo total anualizado de un crédito: incluye interés, comisiones y seguros. Es el único número que permite comparar entre tarjetas, avances y créditos de consumo, y las instituciones están obligadas a informarlo. Un CAE de consumo típico va del 20% al 35%: muy por encima de lo que rinde tu plata en cualquier depósito.' },
    { q: '¿Cuándo sí convienen las cuotas?', a: 'Cuando el precio total en cuotas es igual al precio-contado (cuotas realmente sin recargo) y tú dejas el efectivo rindiendo en un depósito a plazo o cuenta remunerada. En ese caso te financias gratis y tu plata gana un 5-6% anual mientras tanto. Si vas a gastar el efectivo igual, la ventaja desaparece.' },
    { q: '¿Y si me ofrecen descuento por pagar en efectivo o con débito?', a: 'Cárgalo en la sala: un descuento de 5% al contado suele superar de lejos la mini-ventaja financiera de las cuotas. Muchas tiendas lo dan si lo pides, sobre todo en compras grandes, aunque no lo publiquen.' },
    { q: '¿Qué pasa con el pago mínimo y el rotativo de la tarjeta?', a: 'Es el peor escenario: si compras en cuotas y encima pagas solo el mínimo, el saldo pasa al crédito rotativo con CAE que puede superar el 25-40% anual. Las cuotas solo se comparan con el contado si las vas a pagar completas y a tiempo.' },
    { q: '¿Las cuotas afectan mi capacidad de endeudamiento?', a: 'Sí. Cada compra en cuotas ocupa cupo de tu tarjeta y suma a tu carga financiera mensual, la que los bancos miran cuando pides un crédito hipotecario o de consumo. Doce meses de cuotas es un compromiso, no un regalo.' },
    { q: '¿Dónde reclamo si el precio publicitado no se respeta?', a: 'En el SERNAC. Las tiendas están obligadas a informar el precio al contado, el valor de cada cuota, el número de cuotas y el CAE. Si el total cobrado difiere de lo publicitado, tienes derecho a reclamar.' },
  ],
  sources: [
    { name: 'SERNAC — Información de precios y crédito al consumidor', url: 'https://www.sernac.cl/' },
    { name: 'CMF — Carga Anual Equivalente (CAE)', url: 'https://www.cmfchile.cl/' },
    { name: 'Banco Central de Chile — Tasas de captación', url: 'https://www.bcentral.cl/' },
  ],
};
