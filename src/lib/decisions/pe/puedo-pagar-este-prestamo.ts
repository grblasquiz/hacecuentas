/**
 * Sala de decisión (Perú) — "¿Puedo pagar este préstamo?"
 *
 * Calcula la cuota por sistema francés partiendo de la TCEA — la tasa de costo
 * efectivo anual que la SBS obliga a publicar, con comisiones y seguro de
 * desgravamen incluidos — y la cruza con tu ingreso neto, tus gastos fijos y
 * tus otras deudas. Semáforo peruano: cuotas totales ≤30% del ingreso neto es
 * cómodo, 30-40% es justo, más de 40% es rojo.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

/** Cuota francesa desde tasa EFECTIVA anual (TCEA): i = (1+TCEA)^(1/12) − 1. */
function cuotaDesdeTcea(monto: number, tceaPct: number, n: number): number {
  if (n <= 0) return 0;
  const i = Math.pow(1 + tceaPct / 100, 1 / 12) - 1;
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const monto = Math.max(0, num(inputs.monto));
  const tcea = Math.max(0, num(inputs.tceaPorcentaje));
  const plazo = Math.max(0, num(inputs.plazoMeses));
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const gastosFijos = Math.max(0, num(inputs.gastosFijos));
  const otrasDeudas = Math.max(0, num(inputs.otrasDeudas));

  if (!monto || !tcea || !plazo || !ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa el monto, la TCEA y el plazo del préstamo, más tu sueldo neto mensual. Con eso calculamos la cuota y te decimos si entra en tu bolsillo sin ahogarte.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Cuota mensual del préstamo' },
      scenarios: [],
      nextActions: [
        'Ingresa el **monto, la TCEA y el plazo** del préstamo que te ofrecen (la TCEA está en la hoja resumen, por ley).',
        'Suma tu **sueldo neto mensual** y tus **gastos fijos** para ver si la cuota entra.',
      ],
    };
  }

  const cuota = cuotaDesdeTcea(monto, tcea, plazo);
  const totalPagado = cuota * plazo;
  const costoCredito = totalPagado - monto;

  // Carga financiera: cuota / ingreso neto. Con otras deudas, carga total.
  const cargaCuota = (cuota / ingreso) * 100;
  const cargaTotal = ((cuota + otrasDeudas) / ingreso) * 100;
  const libreAntes = ingreso - gastosFijos - otrasDeudas;
  const libreDespues = libreAntes - cuota;

  // Cuota máxima cómoda: 30% del ingreso neto menos otras deudas.
  const cuotaMaxComoda = Math.max(0, ingreso * 0.3 - otrasDeudas);

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
    title = 'Puedes, pero quedas justo: revisa los números';
    badge = 'Justo';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Cuidado: la cuota te deja sin aire';
    badge = 'Riesgoso';
  }

  const detail = `La cuota sale en ${fmtMoney(cuota)} al mes, el ${fmtPct(cargaCuota, 0)} de tu ingreso neto. Sumando tus otras deudas, comprometes el ${fmtPct(cargaTotal, 0)} de lo que ganas. Después de gastos fijos, deudas y esta cuota te quedan ${fmtMoney(libreDespues)} libres al mes. Tu cuota máxima cómoda es ${fmtMoney(cuotaMaxComoda)}.`;

  // Escenarios: en Perú la brecha entre entidades es enorme (misma persona puede
  // conseguir 25% en un banco y 40% en una financiera). Variamos la TCEA.
  const cuotaCara = cuotaDesdeTcea(monto, tcea * 1.25, plazo);
  const cuotaBarata = cuotaDesdeTcea(monto, tcea * 0.8, plazo);

  const scenarios = [
    { label: 'Entidad cara (+25% TCEA)', value: fmtMoney(cuotaCara) + '/mes', detail: `Si aceptas la primera oferta sin comparar (TCEA ${fmtPct(tcea * 1.25, 0)}). Carga ${fmtPct((cuotaCara / ingreso) * 100, 0)} de tu ingreso.` },
    { label: 'Tu oferta', value: fmtMoney(cuota) + '/mes', detail: `Con la TCEA que ingresaste (${fmtPct(tcea, 0)}). Carga ${fmtPct(cargaCuota, 0)}.` },
    { label: 'Comparando (−20% TCEA)', value: fmtMoney(cuotaBarata) + '/mes', detail: `Si consigues TCEA ${fmtPct(tcea * 0.8, 0)} cotizando en 3 o 4 entidades. Carga ${fmtPct((cuotaBarata / ingreso) * 100, 0)}.` },
  ];

  const breakdown = [
    { label: 'Cuota mensual (sistema francés)', value: fmtMoney(cuota), hint: `${plazo} cuotas, desde la TCEA` },
    { label: 'Total a pagar', value: fmtMoney(totalPagado) },
    { label: 'Costo del crédito', value: fmtMoney(costoCredito), hint: `≈ ${fmtPct((costoCredito / monto) * 100, 0)} sobre el capital` },
    { label: 'Cuota / ingreso neto', value: fmtPct(cargaCuota, 0), hint: 'cómodo: hasta 30%' },
    { label: 'Deuda total / ingreso neto', value: fmtPct(cargaTotal, 0), hint: 'incluye tus otras cuotas' },
    { label: 'Cuota máxima cómoda', value: fmtMoney(cuotaMaxComoda), hint: '30% del ingreso − otras deudas' },
    { label: 'Te queda libre al mes', value: fmtMoney(libreDespues), hint: 'tras gastos fijos, deudas y esta cuota' },
  ];

  const nextActions = [
    cargaTotal > 40
      ? `Tus cuotas comprometen el ${fmtPct(cargaTotal, 0)} del ingreso, por encima del 40% que ya es zona roja. **Pide un monto menor o un plazo más largo** para bajar la cuota hacia ${fmtMoney(cuotaMaxComoda)}.`
      : 'La cuota entra en zona sana. Aun así, antes de firmar **compara por TCEA, no por la tasa publicitada**: la TCEA ya incluye comisiones y el seguro de desgravamen, y es la única cifra comparable entre entidades.',
    'Cotiza en **al menos 3 entidades** (bancos, financieras, cajas municipales): para el mismo perfil, la TCEA de un préstamo personal puede ir de 20% a 40%. La SBS publica las tasas de todas las entidades en su web.',
    `Después de pagar todo te quedan ${fmtMoney(libreDespues)} al mes: ${libreDespues > 0 ? 'verifica que alcancen para imprevistos y algo de ahorro.' : 'no alcanza — este préstamo te deja en rojo, no lo tomes en estas condiciones.'}`,
    'En Perú tienes **derecho a pagar por adelantado sin penalidad** y con reducción de intereses. Usar parte de la gratificación de julio o diciembre para amortizar capital acorta el préstamo y baja el costo total.',
  ];

  const notes = [
    'La cuota se calcula por sistema francés con la tasa mensual derivada de la TCEA: i = (1+TCEA)^(1/12) − 1. Si ingresas la TCEA real de tu oferta, la cuota ya refleja comisiones y desgravamen prorrateados.',
    'El semáforo usa la carga financiera total (todas tus cuotas / ingreso neto): hasta 30% cómodo, 30-40% justo, más de 40% riesgoso. Es una guía de salud financiera, no una regla de la SBS.',
    'No es asesoría financiera. Antes de firmar, revisa la hoja resumen (obligatoria por la Ley de Transparencia), confirma la TCEA y las condiciones del pago anticipado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(cuota) + '/mes',
      label: 'Cuota del préstamo',
      sub: `Es el **${fmtPct(cargaCuota, 0)}** de tu ingreso neto. Tu cuota máxima cómoda: **${fmtMoney(cuotaMaxComoda)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-pagar-este-prestamo',
  title: '¿Puedo pagar este préstamo? Cuota, TCEA y semáforo Perú 2026',
  h1: '¿Puedo pagar este préstamo?',
  description:
    'Calcula la cuota de un préstamo en soles desde la TCEA (con comisiones y desgravamen) y crúzala con tu sueldo neto. Semáforo peruano: cuotas hasta 30% del ingreso es cómodo, 30-40% justo, más de 40% rojo.',
  intro:
    'En el Perú la trampa clásica es comparar préstamos por la tasa publicitada, cuando lo único comparable es la TCEA: la tasa de costo efectivo anual que ya incluye comisiones y el seguro de desgravamen, y que toda entidad está obligada a mostrarte. Esta sala calcula la cuota real desde la TCEA y la cruza con tu sueldo neto, tus gastos fijos y tus otras deudas para darte un semáforo claro: si entra cómodo, si quedas justo o si te deja en rojo.',
  icon: '🏦',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    monto: 15000,
    tceaPorcentaje: 32,
    plazoMeses: 24,
    ingresoNeto: 3500,
    gastosFijos: 2200,
    otrasDeudas: 200,
  },
  fields: [
    { id: 'monto', label: 'Monto del préstamo', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '15000', help: 'Capital que vas a pedir, en soles.', group: 'El préstamo', groupIcon: '🏦' },
    { id: 'tceaPorcentaje', label: 'TCEA', type: 'number', suffix: '%', required: true, min: 0, max: 200, placeholder: '32', help: 'Tasa de costo efectivo anual de la oferta (está en la hoja resumen). Personales: 20-40%. Vehicular: 12-18%.', group: 'El préstamo' },
    { id: 'plazoMeses', label: 'Plazo (meses)', type: 'number', required: true, min: 1, max: 120, placeholder: '24', help: 'En cuántas cuotas lo pagas.', group: 'El préstamo' },
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '3500', help: 'Lo que te llega libre al mes, ya con descuentos de planilla (AFP/ONP) o tus honorarios netos.', group: 'Tu economía', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: 'S/', format: 'thousands', recommended: true, min: 0, placeholder: '2200', help: 'Alquiler o mantenimiento, servicios, comida, transporte: lo que pagas sí o sí.', group: 'Tu economía' },
    { id: 'otrasDeudas', label: 'Cuotas de otras deudas', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '200', help: 'Suma de cuotas mensuales de otros préstamos o tarjetas de crédito.', group: 'Tu economía' },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-prestamo-personal-tcea-peru', label: 'Préstamo personal por TCEA' },
    { slug: 'pe/calculadora-credito-vehicular-peru', label: 'Crédito vehicular' },
    { slug: 'pe/calculadora-tarjeta-credito-pago-minimo-peru', label: 'Pago mínimo de tarjeta' },
    { slug: 'pe/calculadora-sueldo-bruto-a-neto-peru', label: 'Sueldo bruto a neto' },
  ],
  howItWorks: `Esta sala no calcula solo la cuota: te dice si tu bolsillo la aguanta.

1. **La cuota desde la TCEA.** Convierte la TCEA (efectiva anual) a tasa mensual y aplica el sistema francés, el más usado en préstamos personales y vehiculares en el Perú. Como la TCEA ya incluye comisiones y desgravamen, la cuota que ves es la real.
2. **El costo total.** Multiplica la cuota por el plazo para mostrarte cuánto pagas en total y cuánto de eso es costo del crédito.
3. **Carga financiera.** Divide la cuota (más tus otras deudas) entre tu ingreso neto. El semáforo: hasta 30% cómodo, 30-40% justo, más de 40% rojo.
4. **Tu cuota máxima cómoda.** Calcula el 30% de tu ingreso menos lo que ya se llevan otras deudas: ese es el techo razonable para la nueva cuota.
5. **El veredicto.** Cruza ingreso, gastos fijos, otras deudas y la cuota, y te dice cuánto te queda libre al mes y en qué color del semáforo caes.`,
  faq: [
    { q: '¿Qué porcentaje de mi sueldo puede irse en cuotas?', a: 'Como guía, la suma de todas tus cuotas no debería pasar del 30% de tu ingreso neto para estar cómodo. Entre 30% y 40% vas justo: cualquier imprevisto te complica. Más de 40% es zona roja: alta probabilidad de atrasarte y terminar refinanciando caro.' },
    { q: '¿Qué diferencia hay entre TEA y TCEA?', a: 'La TEA es solo la tasa de interés efectiva anual. La TCEA (tasa de costo efectivo anual) suma además comisiones, portes y el seguro de desgravamen: es el costo total real del préstamo. Por eso la ley obliga a las entidades a publicarla y es la única cifra que sirve para comparar ofertas.' },
    { q: '¿Cuánto cuesta un préstamo personal en el Perú?', a: 'Depende mucho de la entidad y de tu perfil: los préstamos personales suelen moverse entre 20% y 40% de TCEA, y los vehiculares entre 12% y 18%. Para el mismo cliente la diferencia entre la entidad más cara y la más barata puede significar miles de soles, así que cotiza siempre en varias.' },
    { q: '¿Qué es el seguro de desgravamen?', a: 'Un seguro obligatorio en la práctica: si falleces o quedas con invalidez total, cancela la deuda para que no pase a tu familia. Su costo mensual está incluido en la TCEA. Puedes contratar un desgravamen externo más barato que el que ofrece la entidad, y por ley deben aceptarlo.' },
    { q: '¿Conviene un plazo más largo para bajar la cuota?', a: 'Baja la cuota mensual, pero pagas bastante más en intereses totales. Alargar el plazo solo se justifica si es la única forma de que la cuota entre bajo el 30-40% de tu ingreso. Si puedes, elige el plazo más corto que aguante tu presupuesto.' },
    { q: '¿Puedo adelantar pagos sin penalidad?', a: 'Sí. En el Perú tienes derecho a hacer pagos anticipados totales o parciales con reducción de intereses y sin penalidad ni comisión. Es una de las mejores jugadas: amortizar capital con la gratificación de julio o diciembre puede recortar meses enteros del préstamo.' },
    { q: '¿Debo incluir mis otras deudas en el cálculo?', a: 'Sí. Lo que mide tu salud financiera —y lo que evalúa cualquier entidad antes de prestarte— es la suma de TODAS tus cuotas contra tu ingreso, no solo la nueva. Por eso esta sala te pide las cuotas de tarjetas y otros préstamos y calcula la carga total.' },
    { q: '¿Esto reemplaza la evaluación del banco?', a: 'No. Es una herramienta para que decidas con tus propios números antes de pedir. La entidad hará su propia evaluación crediticia (centrales de riesgo, historial). Para montos grandes, conviene además revisar tu reporte de deudas en la SBS, que es gratuito.' },
  ],
  sources: [
    { name: 'SBS — Comparativo de tasas y TCEA por entidad', url: 'https://www.sbs.gob.pe/' },
    { name: 'BCRP — Tasas de interés del sistema financiero', url: 'https://www.bcrp.gob.pe/' },
  ],
};
