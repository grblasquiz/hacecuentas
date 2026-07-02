/**
 * Sala de decisión MX — "¿Meses sin intereses o de contado?"
 *
 * Lógica mexicana: los MSI reales (mismo precio, sin recargo) casi siempre
 * convienen si el efectivo que no desembolsas trabaja en CETES (~8-9% anual)
 * y la mensualidad no compromete tu capacidad de pago. Comparamos el contado
 * con descuento contra el VALOR PRESENTE de las mensualidades, descontadas por
 * tu tasa de oportunidad (CETES o inflación, la mayor). Con inflación de ~4%
 * anual el dinero NO se licúa solo: la ventaja de los MSI viene del rendimiento
 * del efectivo, no de la inflación.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const precio = Math.max(0, num(inputs.precio));
  const descuentoContado = Math.max(0, Math.min(90, num(inputs.descuentoContado)));
  const meses = Math.max(1, num(inputs.meses));
  const rendimientoCetes = Math.max(0, num(inputs.rendimientoCetes));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));
  const ingresoMensual = Math.max(0, num(inputs.ingresoMensual));
  const msiActuales = Math.max(0, num(inputs.msiActuales));

  if (!precio || !num(inputs.meses)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Carga el precio del producto y a cuántos meses sin intereses te lo ofrecen. Comparamos el contado (con su descuento, si lo hay) contra el valor presente de las mensualidades, contando lo que rendiría tu efectivo en CETES.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ventaja de la opción ganadora' },
      scenarios: [],
      nextActions: [
        'Carga el **precio del producto** y el **descuento** que te dan por pagar de contado (si no hay, deja 0).',
        'Indica a **cuántos meses sin intereses** te lo ofrecen (3, 6, 12, 18...).',
      ],
    };
  }

  const mensualidad = precio / meses;
  const contadoNeto = precio * (1 - descuentoContado / 100);

  // Tasa de oportunidad: lo que rinde tu efectivo si NO lo desembolsas hoy.
  // En México la referencia natural son los CETES; usamos la mayor entre CETES
  // e inflación, convertida a tasa mensual efectiva.
  const tasaAnual = Math.max(rendimientoCetes, inflacionAnual) / 100;
  const iMes = Math.pow(1 + tasaAnual, 1 / 12) - 1;

  // Valor presente de las mensualidades (cada una se paga a fin de mes k).
  let vpMsi = 0;
  for (let k = 1; k <= meses; k++) {
    vpMsi += mensualidad / Math.pow(1 + iMes, k);
  }

  const diff = contadoNeto - vpMsi; // + => MSI ganan; - => contado gana
  const ganaMsi = diff > 0;
  const ventaja = Math.abs(diff);

  // Carga sobre tu ingreso (los MSI se acumulan y ahí está el verdadero riesgo).
  const cargaMsi = ingresoMensual > 0 ? ((mensualidad + msiActuales) / ingresoMensual) * 100 : 0;
  const sobrecargado = ingresoMensual > 0 && cargaMsi > 20;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (sobrecargado) {
    status = 'a';
    tone = 'warn';
    title = 'Financieramente ganan los MSI, pero tu tarjeta ya va cargada';
    badge = 'Cuidado con la carga';
    detail = `Entre esta compra (${fmtMoney(mensualidad)}/mes) y los MSI que ya traes (${fmtMoney(msiActuales)}/mes), comprometerías el ${cargaMsi.toFixed(0)}% de tu ingreso en mensualidades. Arriba del 20% es zona de riesgo: un imprevisto y terminas pagando el mínimo, que sí genera intereses al CAT de la tarjeta. Mejor paga de contado o espera a liberar mensualidades.`;
  } else if (ventaja < contadoNeto * 0.02) {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decide por liquidez y disciplina';
    badge = 'Está parejo';
    detail = `En dinero de hoy, el contado (${fmtMoney(contadoNeto)}) y los MSI (${fmtMoney(vpMsi)}) quedan casi iguales: la diferencia es de apenas ${fmtMoney(ventaja)}. Si te sirve conservar el efectivo y pagas puntual, toma los MSI; si prefieres no traer mensualidades en la cabeza, paga de contado.`;
  } else if (ganaMsi) {
    status = 'b';
    tone = 'good';
    title = 'Te convienen los meses sin intereses';
    badge = 'MSI';
    detail = `A ${meses} MSI pagas ${fmtMoney(precio)} en total, pero en dinero de hoy esas mensualidades valen ${fmtMoney(vpMsi)}: menos que los ${fmtMoney(contadoNeto)} del contado. La ventaja es de ${fmtMoney(ventaja)} — y sale de que tu efectivo sigue trabajando (CETES al ${rendimientoCetes.toFixed(1)}% anual) mientras pagas poco a poco. Ojo: solo aplica si es el mismo precio y pagas más del mínimo.`;
  } else {
    status = 'a';
    tone = 'good';
    title = 'Te conviene pagar de contado';
    badge = 'Contado';
    detail = `El contado con descuento queda en ${fmtMoney(contadoNeto)}, menos que el valor presente de las mensualidades (${fmtMoney(vpMsi)}). El descuento del ${descuentoContado.toFixed(0)}% le gana a lo que rendiría tu efectivo en CETES durante ${meses} meses: paga de una vez y ahorra ${fmtMoney(ventaja)}.`;
  }

  const gananciaCetes = contadoNeto * (Math.pow(1 + rendimientoCetes / 100, meses / 12) - 1);

  const scenarios = [
    {
      label: 'Contado con descuento',
      value: fmtMoney(contadoNeto),
      detail: descuentoContado > 0 ? `${descuentoContado.toFixed(0)}% de descuento sobre ${fmtMoney(precio)}.` : 'Sin descuento por pago de contado.',
    },
    {
      label: 'MSI en dinero de hoy',
      value: fmtMoney(vpMsi),
      detail: `${meses} mensualidades de ${fmtMoney(mensualidad)} traídas a valor presente.`,
    },
    {
      label: 'Tu efectivo en CETES',
      value: '+' + fmtMoney(gananciaCetes),
      detail: `Lo que gana el efectivo que no desembolsas, invertido ${meses} meses al ${rendimientoCetes.toFixed(1)}% anual.`,
    },
  ];

  const comparison = {
    columns: ['Contado', 'MSI'] as [string, string],
    rows: [
      { label: 'Lo que pagas (nominal)', a: fmtMoney(contadoNeto), b: fmtMoney(precio), hint: `${meses} mensualidades de ${fmtMoney(mensualidad)}` },
      { label: 'Valor en dinero de hoy', a: fmtMoney(contadoNeto), b: fmtMoney(vpMsi), hint: `descontado con CETES/inflación (${fmtPct(iMes * 100, 1)} mensual)` },
      { label: 'Efectivo que conservas hoy', a: fmtMoney(0), b: fmtMoney(contadoNeto), hint: 'lo que puede trabajar en CETES' },
      ...(ingresoMensual > 0
        ? [{ label: 'Carga mensual sobre tu ingreso', a: '0%', b: `${cargaMsi.toFixed(0)}%`, hint: 'mensualidades MSI totales / ingreso neto' }]
        : []),
      { label: 'Resultado', a: ganaMsi ? '—' : `Ahorras ${fmtMoney(ventaja)}`, b: ganaMsi ? `Ahorras ${fmtMoney(ventaja)}` : '—' },
    ],
  };

  const nextActions = [
    'Verifica que sean **MSI reales**: el precio a meses debe ser idéntico al de contado. Si "a meses" cuesta más, ese recargo escondido se come la ventaja — compara el total, no la mensualidad.',
    'Nunca pagues solo el **pago mínimo**: el mínimo de la tarjeta NO cubre la mensualidad del MSI completa, y el saldo restante genera intereses al CAT de la tarjeta (60-80% en muchas). Domicilia el pago de la mensualidad completa.',
    ganaMsi
      ? `Para capturar la ventaja, **no te gastes el efectivo**: ponlo a trabajar (CETES vía cetesdirecto desde $100, sin comisiones) mientras pagas las mensualidades.`
      : 'Si pagas de contado, hazlo sin tocar tu fondo de emergencia: el descuento no compensa quedarte sin colchón.',
    `Suma todas tus mensualidades MSI antes de aceptar otra: la regla sana es que no pasen del **20% de tu ingreso neto**${ingresoMensual > 0 ? ` (hoy irías en ${cargaMsi.toFixed(0)}%)` : ''}. Los MSI no cobran interés, pero sí comprometen tus quincenas futuras.`,
  ];

  const notes = [
    'Comparamos el contado neto contra el valor presente de las mensualidades, descontando con la mayor entre el rendimiento de CETES y la inflación esperada. En México la inflación (~4% anual) no licúa las deudas: la ventaja de los MSI depende de que tu efectivo rinda mientras tanto.',
    'Asume MSI verdaderos: mismo precio que de contado, sin comisión por diferir. Si hay recargo, captúralo bajando el descuento de contado o comparando totales.',
    'No es asesoría financiera. No incluye anualidad de la tarjeta ni el costo de caer en pago mínimo: si no puedes garantizar el pago puntual, el contado es más seguro.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ventaja),
      label: status === 'tie' ? 'Diferencia (está parejo)' : sobrecargado ? 'Ventaja teórica de los MSI (no la tomes así)' : `Ahorras con ${ganaMsi ? 'MSI' : 'el contado'}`,
      sub: `Contado con descuento: **${fmtMoney(contadoNeto)}** · ${meses} MSI en dinero de hoy: **${fmtMoney(vpMsi)}**.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'meses-sin-intereses-o-contado',
  title: '¿Meses sin intereses o de contado? Qué te conviene en México 2026',
  h1: '¿Me convienen los meses sin intereses o pagar de contado?',
  description:
    'Compara el contado con descuento contra el valor presente de las mensualidades a MSI, contando lo que rinde tu efectivo en CETES. Te decimos cuál gana, cuánta carga le metes a tu tarjeta y las trampas del pago mínimo.',
  intro:
    'Los meses sin intereses son la promoción estrella en México, pero no siempre son la mejor jugada. Si el precio es el mismo y tu efectivo puede trabajar en CETES mientras pagas, los MSI suelen ganar; si te dan buen descuento por contado, o tu tarjeta ya va cargada de mensualidades, la cosa cambia. Esta sala compara ambas opciones en dinero de hoy y revisa que la mensualidad no comprometa tus quincenas.',
  icon: '💳',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    precio: 18000,
    descuentoContado: 0,
    meses: 12,
    rendimientoCetes: 8.5,
    inflacionAnual: 4,
    ingresoMensual: 25000,
    msiActuales: 1500,
  },
  fields: [
    { id: 'precio', label: 'Precio del producto', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '18000', help: 'El precio de etiqueta. Verifica que a MSI sea el mismo que de contado.', group: 'La compra', groupIcon: '🛒' },
    { id: 'descuentoContado', label: 'Descuento por pagar de contado', type: 'number', suffix: '%', default: 0, min: 0, max: 90, placeholder: '10', help: 'El % que te bajan por pagar en una sola exhibición. Si no hay, deja 0.', group: 'La compra' },
    { id: 'meses', label: 'Meses sin intereses ofrecidos', type: 'number', required: true, min: 1, max: 48, placeholder: '12', help: 'A cuántos MSI te lo dan: 3, 6, 12, 18, 24...', group: 'La compra' },
    { id: 'rendimientoCetes', label: 'Rendimiento de CETES (anual)', type: 'number', suffix: '%', default: 8.5, min: 0, max: 30, placeholder: '8.5', help: 'Lo que rinde tu efectivo si lo inviertes en vez de desembolsarlo (CETES a 28-364 días).', group: 'Tu dinero', groupIcon: '📈' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', default: 4, min: 0, max: 30, placeholder: '4', advanced: true, help: 'La inflación esperada (INPC). Se usa como piso de tu tasa de oportunidad.', group: 'Tu dinero' },
    { id: 'ingresoMensual', label: 'Tu ingreso mensual neto', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '25000', help: 'Opcional pero recomendado: sirve para revisar que la mensualidad no te sobrecargue. Si cobras por quincena, multiplica por dos.', group: 'Tu capacidad', groupIcon: '💪' },
    { id: 'msiActuales', label: 'Mensualidades MSI que ya pagas', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '1500', help: 'La suma de las mensualidades a MSI que ya traes en tus tarjetas.', group: 'Tu capacidad' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-cetes-mexico-rendimiento-28-91-182-364-dias', label: 'Rendimiento de CETES' },
    { slug: 'mx/calculadora-tarjeta-credito-cat-mexico-pago-minimo-trampa', label: 'La trampa del pago mínimo' },
    { slug: 'mx/calculadora-tarjeta-credito-interes-cat-mexico', label: 'Intereses de tarjeta (CAT)' },
    { slug: 'mx/calculadora-auto-contado-vs-financiado-mexico', label: 'Auto: contado vs financiado' },
  ],
  howItWorks: `Esta sala no compara mensualidad contra precio: lleva todo a dinero de hoy.

1. **Contado neto.** Aplica el descuento por pago de contado (si lo hay) al precio de etiqueta.
2. **Tu tasa de oportunidad.** Toma la mayor entre el rendimiento de CETES y la inflación esperada: es lo que tu efectivo puede ganar cada mes si no lo desembolsas de golpe.
3. **MSI en valor presente.** Trae cada mensualidad futura a dinero de hoy con esa tasa y las suma. Si el precio es el mismo, ese total siempre queda un poco abajo del precio: ahí vive la ventaja de los MSI.
4. **La comparación.** Gana el que cueste menos en dinero de hoy: contado con descuento vs MSI descontados. Con descuentos de contado del 5% o más, el contado empieza a ganar.
5. **El filtro de capacidad.** Aunque los MSI ganen en el papel, si tus mensualidades acumuladas superan el 20% de tu ingreso, la sala te frena: sobrecargar la tarjeta es la puerta al pago mínimo y a los intereses del CAT.`,
  faq: [
    { q: '¿Los meses sin intereses de verdad no cobran intereses?', a: 'Los MSI reales no: pagas el precio dividido entre los meses, sin recargo. La condición es cubrir la mensualidad completa en cada corte. Si un mes pagas solo el mínimo de la tarjeta, el saldo no cubierto empieza a generar intereses al CAT de tu tarjeta, que en México ronda entre 60% y 80% anual.' },
    { q: '¿Por qué convienen los MSI si el precio es el mismo?', a: 'Porque conservas el efectivo. En vez de soltar $18,000 hoy, los sueltas en 12 partes, y mientras tanto ese dinero puede rendir en CETES (alrededor de 8-9% anual en 2026). En dinero de hoy, las mensualidades valen menos que el precio completo: esa diferencia es tu ganancia, siempre que sí inviertas o conserves el efectivo.' },
    { q: '¿Y si me dan descuento por pagar de contado?', a: 'Entonces hay que hacer cuentas, y para eso está esta sala. Como referencia: a 12 MSI con CETES al 8.5%, la ventaja de diferir ronda el 4-4.5% del precio. Un descuento de contado del 5% o más suele ganarle; uno del 2-3%, no.' },
    { q: '¿Qué es eso de que el pago mínimo no cubre los MSI?', a: 'El pago mínimo que calcula tu banco es un porcentaje del saldo, y puede quedar por debajo de la suma de tus mensualidades a MSI. Si pagas solo el mínimo, incumples la mensualidad del MSI, y esa parte se pasa al saldo revolvente con intereses. Regla práctica: domicilia el pago por el total de tus mensualidades, no por el mínimo.' },
    { q: '¿Cuántos MSI puedo traer al mismo tiempo?', a: 'El límite sano es que todas tus mensualidades a MSI juntas no pasen del 20% de tu ingreso neto mensual. El riesgo de los MSI no son los intereses (no los hay si pagas bien), sino comprometer tantas quincenas futuras que un imprevisto te mande al pago mínimo.' },
    { q: '¿Dónde invierto el efectivo mientras pago los MSI?', a: 'La opción más directa en México es cetesdirecto: compras CETES del gobierno desde $100, sin comisiones, con rendimientos de alrededor de 8-9% anual en 2026. También sirven cuentas y fondos de deuda que paguen cerca de la tasa de CETES. Lo importante es que el dinero rinda y esté disponible para cubrir las mensualidades.' },
    { q: '¿Cómo sé si los MSI traen el precio inflado?', a: 'Compara el precio del producto en otra tienda o en el mismo comercio pagando de contado. Si "a 18 MSI" el precio de etiqueta es más alto que el de contado en otro lado, no son MSI reales: es un financiamiento disfrazado. Profeco recomienda comparar el costo total, no la mensualidad.' },
    { q: '¿Los MSI afectan mi Buró de Crédito?', a: 'Cuentan como saldo utilizado de tu tarjeta, así que suben tu porcentaje de utilización mientras los pagas, lo que puede pesar un poco en tu score. Pagando puntual, generan historial positivo. El daño real viene si caes en pago mínimo o te atrasas.' },
    { q: '¿Y en el Buen Fin, conviene esperar los MSI?', a: 'En el Buen Fin abundan los MSI largos (18 y 24 meses) y también los descuentos de contado. Aplica la misma regla: mismo precio + MSI largo + efectivo en CETES = conviene diferir; descuento de contado del 10% o más = suele ganar el contado. Corre los números con ambas ofertas antes de decidir.' },
  ],
  sources: [
    { name: 'Banco de México — Tasas de interés de valores gubernamentales (CETES)', url: 'https://www.banxico.org.mx/' },
    { name: 'CONDUSEF — Meses sin intereses: úsalos a tu favor', url: 'https://www.condusef.gob.mx/' },
    { name: 'PROFECO — Recomendaciones de compra a meses', url: 'https://www.gob.mx/profeco' },
  ],
};
