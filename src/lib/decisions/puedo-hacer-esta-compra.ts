/**
 * Sala de decisión — "¿Puedo hacer esta compra sin desordenar mis finanzas?"
 *
 * Patrón IMPACTO. No mira solo "¿me alcanza?", sino qué te deja la compra: cuánto
 * colchón te queda después. Compara pagar al contado (impacto directo en el ahorro)
 * vs en cuotas (costo financiero si hay interés), y enciende un semáforo según si
 * la compra te deja sin fondo de emergencia.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num, bool } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const precio = Math.max(0, num(inputs.precioContado));
  const enCuotas = bool(inputs.tieneCuotas);
  const cuotas = Math.max(1, num(inputs.cuotas));
  const ahorro = Math.max(0, num(inputs.ahorroDisponible));
  const fondoEmergencia = Math.max(0, num(inputs.fondoEmergencia));
  const tnaCuotas = Math.max(0, num(inputs.tnaCuotas));

  if (!precio || !ahorro) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio de lo que querés comprar y cuánto ahorro disponible tenés. Te decimos si la compra te deja con colchón o te deja en rojo.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Colchón que te queda después' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio al contado** y tu **ahorro disponible**.',
        'Indicá tu **fondo de emergencia** para ver si la compra lo toca.',
      ],
    };
  }

  // Contado: impacto directo en el ahorro.
  const ahorroDespuesContado = ahorro - precio;
  // Cuotas: costo financiero si hay TNA.
  const i = tnaCuotas / 12 / 100;
  const valorCuota = enCuotas
    ? (i === 0 ? precio / cuotas : (precio * i) / (1 - Math.pow(1 + i, -cuotas)))
    : 0;
  const totalCuotas = enCuotas ? valorCuota * cuotas : precio;
  const costoFinanciero = enCuotas ? totalCuotas - precio : 0;

  // Colchón disponible por fuera del fondo de emergencia.
  const colchonLibre = ahorro - fondoEmergencia;
  // ¿La compra al contado toca el fondo de emergencia?
  const tocaFondo = precio > colchonLibre;
  const ahorroPorEncimaFondoDespues = ahorroDespuesContado - fondoEmergencia;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (ahorroDespuesContado < 0) {
    status = 'a';
    tone = 'bad';
    title = 'No te alcanza para pagarla al contado';
    badge = 'No alcanza';
    detail = `La compra cuesta ${fmtMoney(precio)} y tu ahorro disponible es ${fmtMoney(ahorro)}: te faltan ${fmtMoney(-ahorroDespuesContado)}. Al contado no llegás. ${enCuotas ? `En ${cuotas} cuotas de ${fmtMoney(valorCuota)} sí podrías, pero fijate si la cuota entra en tu presupuesto mensual.` : 'Solo podrías financiándola, lo que suma costo si tiene interés.'}`;
  } else if (tocaFondo) {
    status = 'tie';
    tone = 'warn';
    title = 'Te alcanza, pero te comés el fondo de emergencia';
    badge = 'Toca tu colchón';
    detail = `Podés pagar los ${fmtMoney(precio)} al contado, pero te quedarías con ${fmtMoney(ahorroDespuesContado)}, ${fmtMoney(-ahorroPorEncimaFondoDespues)} por debajo de tu fondo de emergencia de ${fmtMoney(fondoEmergencia)}. Estarías sacrificando tu colchón para esta compra: pensalo dos veces o esperá a juntar más.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Sí, podés hacerla sin desordenarte';
    badge = 'Adelante';
    detail = `Después de pagar los ${fmtMoney(precio)} al contado te quedan ${fmtMoney(ahorroDespuesContado)}, manteniendo intacto tu fondo de emergencia de ${fmtMoney(fondoEmergencia)}. Te sobra colchón: la compra no te desordena.`;
  }

  const scenarios = [
    { label: 'Al contado', value: fmtMoney(ahorroDespuesContado), detail: `Lo que te queda de ahorro tras pagar ${fmtMoney(precio)} de una.` },
    {
      label: enCuotas ? `En ${cuotas} cuotas` : 'En cuotas (sin datos)',
      value: enCuotas ? fmtMoney(valorCuota) + '/mes' : '—',
      detail: enCuotas
        ? (costoFinanciero > 0 ? `Pagás ${fmtMoney(totalCuotas)} en total: ${fmtMoney(costoFinanciero)} de costo financiero.` : 'Sin interés: el total es el mismo precio, conservás liquidez.')
        : 'Indicá la cantidad de cuotas para comparar.',
    },
    { label: 'Esperar y juntar', value: tocaFondo || ahorroDespuesContado < 0 ? 'Recomendado' : 'Opcional', detail: 'Postergar la compra hasta tener colchón de sobra siempre es la opción más segura.' },
  ];

  const breakdown = [
    { label: 'Precio al contado', value: fmtMoney(precio) },
    { label: 'Ahorro disponible', value: fmtMoney(ahorro) },
    { label: 'Fondo de emergencia (intocable)', value: fmtMoney(fondoEmergencia) },
    { label: 'Colchón libre (ahorro − fondo)', value: fmtMoney(colchonLibre) },
    { label: 'Ahorro después de la compra', value: fmtMoney(ahorroDespuesContado), hint: tocaFondo ? 'queda por debajo del fondo' : 'fondo a salvo' },
    ...(enCuotas
      ? [
          { label: `Valor de cada cuota (${cuotas})`, value: fmtMoney(valorCuota) },
          { label: 'Total pagando en cuotas', value: fmtMoney(totalCuotas), hint: costoFinanciero > 0 ? `+${fmtPct((costoFinanciero / precio) * 100, 0)} vs contado` : 'sin interés' },
          { label: 'Costo financiero de financiar', value: fmtMoney(costoFinanciero) },
        ]
      : []),
  ];

  const nextActions = [
    tocaFondo || ahorroDespuesContado < 0
      ? 'Esta compra toca tu colchón de seguridad: lo más sano es **esperar a juntar más** o achicar el gasto. Tu fondo de emergencia vale más que un capricho.'
      : 'La compra no te desordena: si la necesitás, dale. Igual, no la hagas si te deja por debajo de tu colchón mínimo más adelante.',
    enCuotas && costoFinanciero > 0
      ? `Las cuotas suman ${fmtMoney(costoFinanciero)} de costo: solo conviene financiar si esa plata invertida o como colchón vale más que ese costo, o si la cuota es realmente sin interés.`
      : enCuotas
        ? 'Si las cuotas son **sin interés real**, financiar te conserva liquidez: con inflación, pagás con pesos que valen menos. Pero confirmá que no haya recargo oculto en el precio.'
        : 'Si hay opción de cuotas sin interés, evaluala: conservar liquidez con inflación alta suele convenir más que pagar todo de una.',
    'Antes de comprar, separá mentalmente tu **fondo de emergencia**: esa plata no cuenta para gastos, por más tentadora que sea la oferta.',
    'Distinguí necesidad de deseo: si es un deseo, la regla sana es comprarlo solo con plata que te sobra por encima del colchón, nunca tocándolo.',
  ];

  const notes = [
    'La cuota se calcula con el sistema francés cuando cargás una TNA; si la compra es en cuotas sin interés, el total es igual al precio de contado.',
    'El "colchón" es tu ahorro menos tu fondo de emergencia. Una compra sana se paga con ese excedente, no rompiendo el fondo.',
    'No es asesoramiento financiero. No considera el costo de oportunidad de invertir ese dinero; para compras grandes, evaluá también ese factor.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ahorroDespuesContado),
      label: 'Colchón que te queda tras pagar al contado',
      sub: tocaFondo ? `Quedás **por debajo** de tu fondo de emergencia (${fmtMoney(fondoEmergencia)}).` : `Tu fondo de emergencia (${fmtMoney(fondoEmergencia)}) queda intacto.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-hacer-esta-compra',
  title: '¿Puedo hacer esta compra sin desordenar mis finanzas? 2026',
  h1: '¿Puedo hacer esta compra sin desordenar mis finanzas?',
  description:
    'Antes de comprar, mirá qué te deja: comparamos pagar al contado vs en cuotas y te decimos cuánto colchón te queda y si la compra toca tu fondo de emergencia. Semáforo claro: adelante, cuidado o esperá.',
  intro:
    'La pregunta no es "¿me alcanza?", sino "¿qué me deja esta compra?". Esta sala compara pagarla al contado (impacto directo en tu ahorro) contra hacerlo en cuotas (con su costo financiero), y te dice cuánto colchón te queda después y si estás tocando tu fondo de emergencia. Un semáforo simple para no arrepentirte.',
  icon: '🛒',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precioContado: 1200000,
    tieneCuotas: 'si',
    cuotas: 12,
    ahorroDisponible: 2500000,
    fondoEmergencia: 1500000,
    tnaCuotas: 0,
  },
  fields: [
    { id: 'precioContado', label: 'Precio al contado', type: 'number', prefix: '$', required: true, min: 0, placeholder: '1200000', help: 'Lo que cuesta pagando todo de una.', group: 'La compra', groupIcon: '🛒' },
    { id: 'tieneCuotas', label: '¿Te ofrecen cuotas?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No, solo contado' }, { value: 'si', label: 'Sí, en cuotas' }], help: 'Si hay opción de financiar, comparamos las dos formas.', group: 'La compra' },
    { id: 'cuotas', label: 'Cantidad de cuotas', type: 'number', default: 12, min: 1, max: 60, placeholder: '12', help: 'En cuántas cuotas la pagarías.', group: 'La compra' },
    { id: 'tnaCuotas', label: 'Tasa de las cuotas (TNA)', type: 'number', suffix: '%', default: 0, min: 0, placeholder: '0', help: 'Si las cuotas son sin interés, dejá 0. Si tienen recargo, cargá la TNA.', group: 'La compra', advanced: true },
    { id: 'ahorroDisponible', label: 'Ahorro disponible', type: 'number', prefix: '$', required: true, min: 0, placeholder: '2500000', profileKey: 'finanzas.ahorros', help: 'Toda la plata que tenés ahorrada, incluido el fondo de emergencia.', group: 'Tu situación', groupIcon: '💰' },
    { id: 'fondoEmergencia', label: 'Tu fondo de emergencia', type: 'number', prefix: '$', recommended: true, default: 0, min: 0, placeholder: '1500000', help: 'La parte de tu ahorro que NO querés tocar pase lo que pase.', group: 'Tu situación' },
  ],
  compute,
  componentCalcs: [
    { slug: 'regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
  ],
  howItWorks: `Esta sala mira tu compra desde lo que de verdad importa: el colchón que te deja.

1. **Impacto al contado.** Resta el precio de tu ahorro disponible para ver con cuánta plata quedás si pagás todo de una.
2. **El fondo intocable.** Separa tu fondo de emergencia del resto: ese dinero no debería usarse para una compra. Calcula tu "colchón libre" (ahorro menos fondo).
3. **¿Toca el fondo?** Si el precio supera tu colchón libre, la compra te obliga a meter mano en el fondo de emergencia: la sala lo marca como alerta.
4. **Contado vs cuotas.** Si te ofrecen financiación, calcula el valor de la cuota y, si tiene interés, el costo financiero total de pagar en cuotas en vez de al contado.
5. **El semáforo.** Verde si la compra te deja con colchón de sobra, amarillo si te come el fondo de emergencia, rojo si directamente no te alcanza.`,
  faq: [
    { q: '¿Cómo sé si una compra "me desordena"?', a: 'No por si te alcanza, sino por lo que te deja. Si después de comprar seguís con tu fondo de emergencia intacto y algo de colchón, no te desordena. Si te obliga a tocar el fondo o te deja en cero, sí: es una señal de que conviene esperar.' },
    { q: '¿Conviene pagar al contado o en cuotas?', a: 'Si las cuotas tienen interés, al contado pagás menos. Pero si son sin interés real y hay inflación, las cuotas te dejan conservar liquidez y pagás con pesos que valen menos cada mes. Compará el costo financiero contra lo que esa plata rendiría o te cubriría.' },
    { q: '¿Por qué no debería usar el fondo de emergencia para comprar?', a: 'Porque ese dinero está reservado para imprevistos. Si lo usás para un gusto y justo aparece una urgencia, terminás endeudándote a una tasa cara, que es exactamente lo que el fondo evita. El fondo es intocable salvo emergencia real.' },
    { q: '¿Las cuotas sin interés siempre convienen?', a: 'Casi siempre, si son realmente sin interés: conservás liquidez y la inflación licúa las cuotas futuras. El truco es confirmar que el precio de contado no sea más barato (a veces el "sin interés" ya viene recargado en el precio de lista).' },
    { q: '¿Qué pasa si no me alcanza ni al contado ni en cuotas cómodas?', a: 'Es la señal más clara de que la compra no es para este momento. Lo sano es postergarla y juntar, no forzarla con deuda cara o vaciando el ahorro. Si es una necesidad real (no un deseo), buscá una alternativa más económica.' },
    { q: '¿Tengo que contar el costo de oportunidad?', a: 'Para compras grandes, sí: la plata que usás para comprar deja de rendir invertida o de servir como colchón. Esta sala no lo calcula, pero tenelo en cuenta: a veces conviene financiar sin interés e invertir el efectivo.' },
    { q: '¿Cómo distingo una necesidad de un deseo?', a: 'Una necesidad es algo que afecta tu trabajo, salud o vida diaria si no lo tenés. Un deseo es algo que mejora tu confort pero podés postergar. La regla sana: los deseos se pagan solo con plata que te sobra por encima del colchón, nunca tocándolo.' },
    { q: '¿Esto reemplaza un presupuesto?', a: 'No: lo complementa. Esta sala evalúa una compra puntual; un presupuesto (como la regla 50/30/20) ordena todos tus gastos del mes. Lo ideal es usar ambos: el presupuesto para el día a día y esta sala antes de un gasto grande.' },
  ],
  sources: [
    { name: 'CNV — Educación financiera', url: 'https://www.argentina.gob.ar/cnv' },
    { name: 'BCRA — Información para usuarios financieros', url: 'https://www.bcra.gob.ar/BCRAyVos/default.asp' },
  ],
};
