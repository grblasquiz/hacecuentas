/**
 * Sala de decisión CO — "¿Puedo pagar este crédito?"
 *
 * Patrón SALUD FINANCIERA localizado a Colombia: la cuota se calcula desde la
 * tasa EFECTIVA ANUAL (como la publican los bancos colombianos), convertida a
 * mensual vencida, y se cruza con el ingreso neto para el semáforo de carga
 * financiera (≤30% cómodo, 30-40% justo, >40% rojo). Incluye la lógica de la
 * libranza (descuento por nómina, tasa más baja) y el reporte a centrales.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

/** Tasa mensual vencida desde la efectiva anual: i = (1+EA)^(1/12) − 1. */
function tasaMensualDesdeEA(eaPct: number): number {
  return Math.pow(1 + eaPct / 100, 1 / 12) - 1;
}

/** Cuota fija (amortización francesa) con tasa mensual vencida. */
function cuotaFija(monto: number, eaPct: number, n: number): number {
  if (n <= 0) return 0;
  const i = tasaMensualDesdeEA(eaPct);
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const monto = Math.max(0, num(inputs.monto));
  const tasaEA = Math.max(0, num(inputs.tasaEA));
  const plazo = Math.max(0, num(inputs.plazoMeses));
  const tipo = String(inputs.tipoCredito || 'libre');
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const otrasCuotas = Math.max(0, num(inputs.otrasCuotas));

  if (!monto || !tasaEA || !plazo || !ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún faltan datos para darte una respuesta',
        detail:
          'Ingresa el monto, la tasa efectiva anual (EA) y el plazo del crédito, más tu ingreso neto mensual. Con eso calculamos la cuota y qué tanto pesa sobre tu plata de cada mes.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Cuota mensual del crédito' },
      scenarios: [],
      nextActions: [
        'Ingresa el **monto, la tasa EA y el plazo** que te ofrece el banco o la cooperativa.',
        'Suma tu **ingreso neto mensual** y las **cuotas que ya pagas** para medir tu carga financiera total.',
      ],
    };
  }

  const cuota = cuotaFija(monto, tasaEA, plazo);
  const totalPagado = cuota * plazo;
  const intereses = totalPagado - monto;

  const cargaCuota = (cuota / ingreso) * 100;
  const cargaTotal = ((cuota + otrasCuotas) / ingreso) * 100;
  const cuotaMaxComoda = Math.max(0, ingreso * 0.3 - otrasCuotas);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (cargaTotal <= 30) {
    status = 'b';
    tone = 'good';
    title = 'Sí puedes pagarlo: la cuota te queda cómoda';
    badge = 'Carga sana';
  } else if (cargaTotal <= 40) {
    status = 'tie';
    tone = 'neutral';
    title = 'Puedes, pero quedas apretado: revisa el plazo';
    badge = 'Carga justa';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Ojo: esa cuota te sobre-endeuda';
    badge = 'Carga alta';
  }

  const detail = `La cuota sale en ${fmtMoney(cuota)} al mes con una tasa del ${fmtPct(tasaEA, 1)} EA. Sumando lo que ya pagas de otras deudas, comprometes el ${fmtPct(cargaTotal, 0)} de tu ingreso neto — lo sano es no pasar del 30%. Tu cuota máxima cómoda es de ${fmtMoney(cuotaMaxComoda)}.${tipo === 'libre' && tasaEA > 18 ? ' Si tienes contrato laboral, cotiza también por libranza: al descontarse de la nómina, la tasa suele bajar al rango 14-18% EA.' : ''}`;

  // Escenarios por tasa: lo que consigues negociando o vía libranza vs una tasa peor.
  const eaAlta = Math.min(tasaEA + 5, 60);
  const eaBaja = Math.max(tasaEA - 5, 1);
  const cuotaAlta = cuotaFija(monto, eaAlta, plazo);
  const cuotaBaja = cuotaFija(monto, eaBaja, plazo);

  const scenarios = [
    { label: `Tasa peor (${fmtPct(eaAlta, 0)} EA)`, value: fmtMoney(cuotaAlta) + '/mes', detail: `Si firmas sin comparar. Carga: ${fmtPct((cuotaAlta / ingreso) * 100, 0)} de tu ingreso.` },
    { label: 'Con la tasa que ingresaste', value: fmtMoney(cuota) + '/mes', detail: `${fmtPct(tasaEA, 1)} EA a ${plazo} meses. Carga: ${fmtPct(cargaCuota, 0)}.` },
    { label: `Negociando (${fmtPct(eaBaja, 0)} EA)`, value: fmtMoney(cuotaBaja) + '/mes', detail: `Lo que logras comparando bancos, cooperativas o pasándote a libranza.` },
  ];

  const breakdown = [
    { label: 'Cuota mensual fija', value: fmtMoney(cuota), hint: `${plazo} cuotas, tasa ${fmtPct(tasaEA, 1)} EA` },
    { label: 'Total que pagarías', value: fmtMoney(totalPagado) },
    { label: 'Intereses del crédito', value: fmtMoney(intereses), hint: `≈ ${fmtPct((intereses / monto) * 100, 0)} sobre lo que te prestan` },
    { label: 'Carga de esta cuota', value: fmtPct(cargaCuota, 0), hint: 'sobre tu ingreso neto' },
    { label: 'Carga financiera total', value: fmtPct(cargaTotal, 0), hint: 'con tus otras cuotas; sano: ≤30%' },
    { label: 'Cuota máxima cómoda', value: fmtMoney(cuotaMaxComoda), hint: '30% del ingreso − otras cuotas' },
  ];

  const nextActions = [
    cargaTotal > 40
      ? `Con el ${fmtPct(cargaTotal, 0)} de tu ingreso comprometido, cualquier imprevisto te lleva a la mora y al reporte negativo en Datacrédito y TransUnion. **Pide menos plata o un plazo mayor** hasta que la cuota baje de ${fmtMoney(cuotaMaxComoda)}.`
      : 'Antes de firmar, pide el **plan de pagos completo**: la cuota real suele incluir seguro de vida deudor y a veces avales o comisiones que no están en la tasa EA.',
    tipo === 'libranza'
      ? 'La libranza se descuenta directo de tu nómina antes de que te consignen: la cuota se paga sola, pero tu ingreso disponible baja desde el día uno. Presupuesta con lo que de verdad te llega.'
      : 'Si eres empleado o pensionado, cotiza la **libranza**: al descontarse por nómina el banco corre menos riesgo y la tasa baja al rango 14-18% EA, frente al 18-25% de la libre inversión.',
    `Compara al menos 3 entidades por **tasa EA y costo total** (no por "cuota baja"): entre bancos, cooperativas y fintech las diferencias superan los 5 puntos. El tope legal es la tasa de usura que certifica la Superfinanciera.`,
    'Paga siempre a tiempo: los reportes positivos en centrales de riesgo te abaratan el próximo crédito, y un solo reporte negativo te persigue hasta por 4 años.',
  ];

  const notes = [
    'La cuota se calcula con amortización de cuota fija, convirtiendo la tasa efectiva anual a mensual vencida: i = (1+EA)^(1/12) − 1. No incluye seguro de vida deudor, avales ni estudio de crédito, así que la cuota final del banco puede ser algo mayor.',
    'El semáforo usa la regla de carga financiera: la suma de todas tus cuotas no debería superar el 30% de tu ingreso neto (hasta 40% es zona amarilla). Es la misma lógica que aplican los bancos al evaluar capacidad de pago.',
    'Ninguna entidad puede cobrarte por encima de la tasa de usura que certifica la Superintendencia Financiera (28,79% EA para consumo en jun-2026). Si te ofrecen más, es ilegal.',
    'Esto es una guía, no asesoría financiera: la aprobación final depende del estudio de crédito de la entidad y de tu historial en centrales.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(cuota) + '/mes',
      label: 'Cuota del crédito',
      sub: `Compromete el **${fmtPct(cargaCuota, 0)}** de tu ingreso. Tu cuota máxima cómoda: **${fmtMoney(cuotaMaxComoda)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-pagar-este-credito',
  title: '¿Puedo pagar este crédito? Cuota y carga financiera Colombia 2026',
  h1: '¿Puedo pagar este crédito?',
  description:
    'Calcula la cuota de un crédito en Colombia desde la tasa efectiva anual y mide tu carga financiera: si la suma de tus cuotas pasa del 30% del ingreso, estás en zona de riesgo. Con tasas 2026 de libre inversión y libranza.',
  intro:
    'En Colombia los bancos aprueban créditos mirando tu capacidad de pago, pero el que termina apretado cada quincena eres tú. Esta sala convierte la tasa efectiva anual (la que publican bancos y cooperativas) en la cuota mensual real, la suma a las deudas que ya pagas y te dice con un semáforo si el crédito te queda cómodo, justo o te sobre-endeuda — antes de que quedes reportado en centrales de riesgo.',
  icon: '🏦',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    monto: 20000000,
    tasaEA: 22,
    plazoMeses: 48,
    tipoCredito: 'libre',
    ingresoNeto: 4500000,
    otrasCuotas: 350000,
  },
  fields: [
    { id: 'monto', label: 'Monto del crédito', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '20.000.000', help: 'La plata que vas a pedir prestada.', group: 'El crédito', groupIcon: '🏦' },
    { id: 'tasaEA', label: 'Tasa efectiva anual (EA)', type: 'number', suffix: '%', required: true, min: 0, max: 60, step: 0.1, placeholder: '22', help: 'La tasa EA de la oferta. Libre inversión suele estar en 18-25% EA; libranza, en 14-18%.', group: 'El crédito' },
    { id: 'plazoMeses', label: 'Plazo (meses)', type: 'number', required: true, min: 1, max: 120, placeholder: '48', help: 'En cuántas cuotas mensuales lo pagarías.', group: 'El crédito' },
    {
      id: 'tipoCredito', label: 'Tipo de crédito', type: 'select', default: 'libre',
      options: [
        { value: 'libre', label: 'Libre inversión (cuota la pagas tú)' },
        { value: 'libranza', label: 'Libranza (descuento por nómina)' },
      ],
      help: 'La libranza se descuenta de tu nómina o mesada pensional y por eso tiene mejor tasa.', group: 'El crédito',
    },
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '4.500.000', help: 'Lo que te consignan al mes después de salud, pensión y retención.', group: 'Tu plata', groupIcon: '💰' },
    { id: 'otrasCuotas', label: 'Cuotas que ya pagas al mes', type: 'number', prefix: '$', default: 0, min: 0, format: 'thousands', placeholder: '350.000', help: 'Suma tarjetas de crédito, otros créditos y compras a cuotas.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-credito-libranza-colombia-empleado-cuota-tasa', label: 'Crédito de libranza' },
    { slug: 'co/calculadora-tarjeta-credito-colombia-tasa-usura-cuota-pago-minimo', label: 'Tarjeta de crédito y tasa de usura' },
    { slug: 'co/calculadora-cooperativas-prestamo-colombia-tasa-interes', label: 'Préstamo en cooperativa' },
    { slug: 'co/calculadora-salario-neto-colombia-2026-bruto-a-neto', label: 'Salario neto (bruto a neto)' },
  ],
  howItWorks: `Esta sala no se queda en la cuota: mide si tu nómina la aguanta mes a mes.

1. **De tasa EA a cuota.** En Colombia las tasas se publican en efectivo anual. La sala la convierte a mensual vencida — i = (1+EA)^(1/12) − 1 — y calcula la cuota fija: cuota = M·i / (1−(1+i)⁻ⁿ).
2. **El costo completo.** Multiplica la cuota por el plazo para mostrarte cuánto pagas en total y cuánto de eso son puros intereses.
3. **Tu carga financiera.** Suma esta cuota a las que ya pagas y las divide por tu ingreso neto. La regla bancaria: hasta 30% es sano, entre 30% y 40% es zona amarilla, más de 40% es sobre-endeudamiento.
4. **Tu cuota máxima cómoda.** Calcula el 30% de tu ingreso menos tus cuotas actuales: ese es el techo que no deberías cruzar con el crédito nuevo.
5. **El veredicto.** Con todo cruzado, te dice si firmas tranquilo, si conviene alargar plazo o bajar monto, o si es mejor no tomarlo — y qué tasa deberías estar negociando según tu tipo de crédito.`,
  faq: [
    { q: '¿Qué porcentaje de mi sueldo puede irse en cuotas?', a: 'La regla que usan los bancos colombianos es que la suma de todas tus cuotas no supere el 30% de tu ingreso neto. Entre el 30% y el 40% quedas apretado, y por encima del 40% estás sobre-endeudado: cualquier imprevisto te manda a la mora.' },
    { q: '¿Cómo se pasa de tasa efectiva anual a la cuota mensual?', a: 'La EA se convierte a tasa mensual vencida con la fórmula i = (1+EA)^(1/12) − 1, y con esa tasa se calcula la cuota fija. Por ejemplo, un 22% EA equivale a cerca del 1,67% mensual, no al 22 dividido 12: confundirlo hace que subestimes la cuota.' },
    { q: '¿Qué tasa es normal en un crédito de libre inversión en 2026?', a: 'Los créditos de libre inversión se mueven entre el 18% y el 25% EA según banco, monto y tu perfil de riesgo. El tope absoluto es la tasa de usura que certifica cada mes la Superintendencia Financiera (28,79% EA para consumo en junio de 2026): nadie puede cobrarte más.' },
    { q: '¿Por qué la libranza tiene mejor tasa?', a: 'Porque la cuota se descuenta directamente de tu nómina o de tu mesada pensional antes de que te consignen, así que el banco casi no corre riesgo de que dejes de pagar. Por eso las libranzas suelen estar en el rango del 14% al 18% EA, varios puntos por debajo de la libre inversión.' },
    { q: '¿Qué pasa si me atraso en las cuotas?', a: 'La entidad te cobra interés de mora y reporta el atraso a las centrales de riesgo (Datacrédito y TransUnion). Ese reporte negativo puede permanecer hasta 4 años después de que pagues y te cierra las puertas a créditos, arriendos y hasta algunos empleos. Evitarlo vale más que cualquier compra.' },
    { q: '¿La cuota que calcula la sala es la misma que me cobrará el banco?', a: 'Es la cuota financiera pura. Los bancos suelen sumar el seguro de vida deudor y, en algunos casos, avales o cuotas de manejo, así que la cuota final puede ser un poco mayor. Pide siempre el plan de pagos completo antes de firmar: ahí aparece el valor exacto.' },
    { q: '¿Me conviene un plazo largo para que la cuota baje?', a: 'Baja la cuota, pero multiplica los intereses: un crédito de $20.000.000 al 22% EA paga muchos más intereses a 72 meses que a 36. Usa el plazo largo solo si lo necesitas para que la carga baje del 30%; si te sobra margen, elige el plazo más corto que aguantes.' },
    { q: '¿Puedo pagar el crédito antes de tiempo sin sanción?', a: 'Sí. En Colombia la ley te permite hacer abonos a capital y pagar anticipadamente créditos de consumo sin penalización. Cada abono extra reduce los intereses futuros, así que si te llega una prima o las cesantías, abonar a capital es de lo mejor que puedes hacer con esa plata.' },
  ],
  sources: [
    { name: 'Superintendencia Financiera de Colombia — Tasas de interés y usura', url: 'https://www.superfinanciera.gov.co/' },
    { name: 'Banco de la República — Tasas de colocación', url: 'https://www.banrep.gov.co/' },
  ],
};
