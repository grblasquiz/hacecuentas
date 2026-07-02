/**
 * Sala de decisión (México) — "¿Puedo pagar este crédito?"
 *
 * Patrón SALUD FINANCIERA, reescrito para el mercado mexicano: la mensualidad
 * se calcula con pagos fijos (sistema francés), pero la decisión de fondo pasa
 * por el CAT — el Costo Anual Total que Banxico obliga a publicar y que suma
 * comisiones, seguros y anualidad a la tasa. Semáforo por carga financiera:
 * mensualidades totales ≤30% del ingreso neto = cómodo, 30–40% = justo,
 * >40% = rojo.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

/** Mensualidad de pagos fijos: M = V·i / (1−(1+i)^−n), con i = tasa anual/12. */
function mensualidadFija(monto: number, tasaAnualPct: number, n: number): number {
  if (n <= 0) return 0;
  const i = tasaAnualPct / 12 / 100;
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const monto = Math.max(0, num(inputs.monto));
  const tasa = Math.max(0, num(inputs.tasaAnual));
  const plazo = Math.max(0, num(inputs.plazoMeses));
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const gastosFijos = Math.max(0, num(inputs.gastosFijos));
  const otrasDeudas = Math.max(0, num(inputs.otrasDeudas));

  if (!monto || !tasa || !plazo || !ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Ingresa el monto, la tasa anual y el plazo del crédito, más tu ingreso neto mensual. Con eso calculamos la mensualidad y si entra en tu presupuesto sin ahorcarte.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Mensualidad del crédito' },
      scenarios: [],
      nextActions: [
        'Ingresa el **monto, la tasa anual y el plazo** del crédito que te ofrecen.',
        'Suma tu **ingreso neto mensual** y tus **gastos fijos** para ver si la mensualidad cabe.',
      ],
    };
  }

  const mensualidad = mensualidadFija(monto, tasa, plazo);
  const totalPagado = mensualidad * plazo;
  const costoCredito = totalPagado - monto;

  // Carga financiera: mensualidad / ingreso, y sumando otras deudas.
  const cargaCuota = (mensualidad / ingreso) * 100;
  const cargaTotal = ((mensualidad + otrasDeudas) / ingreso) * 100;
  const libreAntes = ingreso - gastosFijos - otrasDeudas;
  const libreDespues = libreAntes - mensualidad;

  // Mensualidad máxima sana: 30% del ingreso menos lo que ya pagas de otras deudas.
  const mensualidadMaxSana = Math.max(0, ingreso * 0.3 - otrasDeudas);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (cargaTotal <= 30 && libreDespues > 0) {
    status = 'b';
    tone = 'good';
    title = 'Sí, puedes pagarlo con margen';
    badge = 'Entra cómodo';
  } else if (cargaTotal <= 40 && libreDespues > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Puedes, pero quedas justo: revisa el CAT antes de firmar';
    badge = 'Justo';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Cuidado: esta mensualidad te deja sin aire';
    badge = 'Riesgoso';
  }

  const detail = `La mensualidad es de ${fmtMoney(mensualidad)}, el ${fmtPct(cargaCuota, 0)} de tu ingreso neto. Sumando tus otras deudas, comprometes el ${fmtPct(cargaTotal, 0)} de lo que ganas. Después de gastos fijos, deudas y esta mensualidad te quedan ${fmtMoney(libreDespues)} libres al mes. Tu mensualidad máxima sana es de ${fmtMoney(mensualidadMaxSana)}. Ojo: este cálculo usa la tasa; el CAT real (con comisiones y seguros) encarece el crédito.`;

  // Escenarios: la tasa que te dicen vs el costo con CAT y una mejor oferta (nómina).
  const cuotaCat = mensualidadFija(monto, tasa * 1.25, plazo);
  const cuotaNomina = mensualidadFija(monto, tasa * 0.8, plazo);

  const scenarios = [
    { label: 'Con CAT real (+25% de costo)', value: fmtMoney(cuotaCat) + '/mes', detail: `Si comisiones y seguros suben el costo a ~${fmtPct(tasa * 1.25, 0)} anual. Carga: ${fmtPct((cuotaCat / ingreso) * 100, 0)} de tu ingreso.` },
    { label: 'Probable (tasa que ingresaste)', value: fmtMoney(mensualidad) + '/mes', detail: `Con ${fmtPct(tasa, 0)} anual. Carga: ${fmtPct(cargaCuota, 0)} de tu ingreso.` },
    { label: 'Mejor oferta (crédito de nómina)', value: fmtMoney(cuotaNomina) + '/mes', detail: `Si consigues ~${fmtPct(tasa * 0.8, 0)} anual, típico de nómina con descuento directo. Carga: ${fmtPct((cuotaNomina / ingreso) * 100, 0)}.` },
  ];

  const breakdown = [
    { label: 'Mensualidad (pagos fijos)', value: fmtMoney(mensualidad), hint: `${plazo} mensualidades` },
    { label: 'Total a pagar', value: fmtMoney(totalPagado) },
    { label: 'Costo del crédito (intereses)', value: fmtMoney(costoCredito), hint: `≈ ${fmtPct((costoCredito / monto) * 100, 0)} sobre el monto` },
    { label: 'Mensualidad / ingreso', value: fmtPct(cargaCuota, 0), hint: 'sano: 30% o menos' },
    { label: 'Deuda total / ingreso', value: fmtPct(cargaTotal, 0), hint: 'incluye tus otras deudas' },
    { label: 'Mensualidad máxima sana', value: fmtMoney(mensualidadMaxSana), hint: '30% del ingreso − otras deudas' },
    { label: 'Te queda libre al mes', value: fmtMoney(libreDespues), hint: 'tras fijos, deudas y esta mensualidad' },
  ];

  const nextActions = [
    cargaTotal > 40
      ? `Tus mensualidades se llevarían el ${fmtPct(cargaTotal, 0)} de tu ingreso, arriba del 40% de riesgo. **Pide menos monto o más plazo** para bajar la mensualidad a unos ${fmtMoney(mensualidadMaxSana)}.`
      : 'La mensualidad entra en rango sano. Aun así, antes de firmar **compara por CAT, no por tasa**: el CAT suma comisiones, seguros y anualidad, y es el único número comparable entre bancos.',
    'Cotiza al menos **3 ofertas y ordénalas por CAT** (todas están obligadas a publicarlo). Un crédito de nómina suele tener CAT menor que un personal, porque el banco cobra directo de tu sueldo.',
    `Después de pagar todo te quedan ${fmtMoney(libreDespues)} al mes: ${libreDespues > 0 ? 'confirma que alcanzan para imprevistos y para seguir ahorrando algo.' : 'no alcanza; este crédito te deja en números rojos, no lo tomes así.'}`,
    'Si eliges crédito de nómina, recuerda que **el descuento es directo**: cada quincena vas a cobrar menos, y eso no se puede "saltar" un mes apretado.',
  ];

  const notes = [
    'La mensualidad se calcula con pagos fijos (sistema francés): M = V·i / (1−(1+i)⁻ⁿ), con i = tasa anual/12. No incluye comisión por apertura, seguros ni IVA de intereses, así que el CAT real es mayor.',
    'Referencia CONDUSEF/Banxico: el CAT promedio de créditos de nómina ronda 25–40% y el de personales puede superar 60% según el banco y tu perfil. Compara siempre el CAT informado, no la tasa.',
    'El umbral 30–40% de carga financiera es una guía de salud financiera, no una regla del banco. No es asesoría financiera: lee el contrato y confirma el CAT y el costo de liquidar anticipado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(mensualidad) + '/mes',
      label: 'Mensualidad del crédito',
      sub: `Es el **${fmtPct(cargaCuota, 0)}** de tu ingreso. Tu mensualidad máxima sana: **${fmtMoney(mensualidadMaxSana)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-pagar-este-credito',
  title: '¿Puedo pagar este crédito? Mensualidad, CAT y semáforo México 2026',
  h1: '¿Puedo pagar este crédito?',
  description:
    'Antes de firmar un crédito en México, calcula la mensualidad y crúzala con tu ingreso, gastos y otras deudas. Semáforo por carga financiera (30–40%) y por qué debes comparar por CAT, no por tasa.',
  intro:
    'La pregunta correcta antes de aceptar un crédito no es "¿cuánto me prestan?" sino "¿la mensualidad cabe en mi quincena sin ahorcarme?". Esta sala calcula la mensualidad con pagos fijos, la cruza con tu ingreso neto, tus gastos fijos y tus otras deudas, y te da un semáforo claro. Además te recuerda lo que CONDUSEF repite siempre: compara por CAT, porque la tasa sola esconde comisiones y seguros.',
  icon: '🏦',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    monto: 80000,
    tasaAnual: 36,
    plazoMeses: 24,
    ingresoNeto: 25000,
    gastosFijos: 14000,
    otrasDeudas: 1500,
  },
  fields: [
    { id: 'monto', label: 'Monto del crédito', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '80,000', help: 'Cuánto dinero vas a pedir prestado.', group: 'El crédito', groupIcon: '🏦' },
    { id: 'tasaAnual', label: 'Tasa de interés anual', type: 'number', suffix: '%', required: true, min: 0, placeholder: '36', help: 'Tasa anual que te ofrecen (sin comisiones). El CAT completo sale más alto.', group: 'El crédito' },
    { id: 'plazoMeses', label: 'Plazo (meses)', type: 'number', required: true, min: 1, max: 120, placeholder: '24', help: 'En cuántas mensualidades lo pagas.', group: 'El crédito' },
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '25,000', help: 'Lo que recibes libre al mes (suma tus dos quincenas), ya con ISR e IMSS descontados.', group: 'Tu bolsillo', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: '$', format: 'thousands', recommended: true, min: 0, placeholder: '14,000', help: 'Renta, servicios, súper, transporte, colegiaturas: lo que pagas sí o sí.', group: 'Tu bolsillo' },
    { id: 'otrasDeudas', label: 'Mensualidades de otras deudas', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '1,500', help: 'Suma de pagos mensuales de tarjetas, otros créditos o meses sin intereses.', group: 'Tu bolsillo' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-prestamo-personal-mensualidad-cat-mexico', label: 'Préstamo personal: mensualidad y CAT' },
    { slug: 'mx/calculadora-sueldo-neto-mexico', label: 'Sueldo neto en México' },
    { slug: 'mx/calculadora-tarjeta-credito-cat-mexico-pago-minimo-trampa', label: 'Tarjeta de crédito: la trampa del pago mínimo' },
    { slug: 'mx/calculadora-fonacot-credito-mexico-monto-cat-tasa', label: 'Crédito FONACOT' },
  ],
  howItWorks: `Esta sala no calcula solo la mensualidad: te dice si tu bolsillo la aguanta.

1. **La mensualidad.** Con el monto, la tasa anual y el plazo, calcula el pago fijo mensual (sistema francés): M = V·i / (1−(1+i)⁻ⁿ). Es la fórmula que usan casi todos los créditos personales y de nómina en México.
2. **El costo total.** Multiplica la mensualidad por el plazo para mostrarte cuánto pagas en total y cuánto son puros intereses.
3. **Tu carga financiera.** Divide la mensualidad (más tus otras deudas) entre tu ingreso neto. La guía de salud financiera: 30% o menos es cómodo, entre 30% y 40% vas justo, arriba de 40% es zona roja.
4. **Tu mensualidad máxima sana.** Calcula el 30% de tu ingreso menos lo que ya pagas de otras deudas: ese es el techo recomendable para el nuevo crédito.
5. **El recordatorio del CAT.** La tasa que te dicen no incluye comisión por apertura, seguros ni anualidad. El escenario pesimista simula ese costo extra para que veas la mensualidad con CAT realista, y compares ofertas por CAT como pide CONDUSEF.`,
  faq: [
    { q: '¿Qué porcentaje de mi ingreso puede irse en mensualidades?', a: 'Como guía de salud financiera, la suma de todas tus mensualidades de deuda no debería pasar del 30% de tu ingreso neto para estar cómodo, ni del 40% como límite. Con un ingreso de $25,000 al mes, eso significa un techo cómodo de $7,500 y un límite de $10,000 entre todas tus deudas.' },
    { q: '¿Cómo se calcula la mensualidad de un crédito?', a: 'Con el sistema de pagos fijos (francés): M = V·i / (1−(1+i)⁻ⁿ), donde V es el monto, i la tasa mensual (anual entre 12) y n el número de mensualidades. Por ejemplo, $80,000 a 36% anual a 24 meses da una mensualidad de unos $4,700. Al inicio pagas más interés y menos capital; al final, al revés.' },
    { q: '¿Qué es el CAT y por qué importa más que la tasa?', a: 'El Costo Anual Total incluye la tasa de interés más comisión por apertura, seguros obligatorios, anualidades y otros cargos. Banxico obliga a todas las instituciones a publicarlo, precisamente para que compares. Dos créditos con la misma tasa pueden tener CAT muy distinto: siempre decide por el CAT.' },
    { q: '¿Conviene más un crédito de nómina o uno personal?', a: 'El de nómina suele tener CAT menor (típicamente 25–40%) porque el banco cobra con descuento directo de tu sueldo: menos riesgo para él, mejor tasa para ti. El personal es más caro (el CAT puede superar 60%) pero no toca tu nómina. Ojo con el de nómina: el descuento llega puntual cada quincena, lo puedas pagar cómodo o no.' },
    { q: '¿Me conviene un plazo más largo para bajar la mensualidad?', a: 'Baja la mensualidad, pero pagas muchos más intereses en total. A 36% anual, pasar de 24 a 48 meses en un crédito de $80,000 reduce la mensualidad, pero casi duplica los intereses pagados. Elige el plazo más corto que puedas sostener sin pasar del 30–40% de carga.' },
    { q: '¿Este crédito afecta mi historial en Buró de Crédito?', a: 'Sí, en ambos sentidos. Pagar puntual construye historial y mejora tu score; atrasarte lo daña por años. Además, si tu carga de deuda queda muy alta respecto a tu ingreso, otros bancos te verán como riesgoso aunque estés al corriente. Mantente debajo del 40% también por eso.' },
    { q: '¿Puedo liquidar el crédito antes de tiempo?', a: 'En general sí: la regulación de transparencia mexicana obliga a aceptar pagos anticipados en créditos al consumo y a aplicarlos a capital. Pide tu "saldo insoluto" al banco y confirma en el contrato si hay comisión por prepago (en la mayoría de personales y nómina no la hay).' },
    { q: '¿Qué hago si la mensualidad me deja sin margen para imprevistos?', a: 'Es foco rojo. Si después de gastos fijos, deudas y la nueva mensualidad no te queda un colchón, cualquier imprevisto (una avería, un gasto médico) te empuja a la tarjeta o a otro crédito más caro. Mejor baja el monto, alarga un poco el plazo o pospón la compra.' },
    { q: '¿Esto sustituye la evaluación del banco?', a: 'No. Es una herramienta para que tú decidas con tus números antes de solicitar. El banco hará su propio análisis con tu Buró y comprobantes de ingreso. Para montos grandes, compara también en el simulador de CONDUSEF y consulta a un asesor.' },
  ],
  sources: [
    { name: 'Banxico — CAT (Costo Anual Total)', url: 'https://www.banxico.org.mx/' },
    { name: 'CONDUSEF — Comparativos y simuladores de crédito', url: 'https://www.condusef.gob.mx/' },
  ],
};
