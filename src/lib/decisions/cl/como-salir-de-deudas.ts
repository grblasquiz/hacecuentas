/**
 * Sala de decisión CL — "¿Cómo salgo de mis deudas?"
 *
 * Simula la salida de hasta 3 deudas chilenas (rotativo de tarjeta, avance en
 * efectivo, crédito de consumo, línea de crédito) con dos métodos:
 *   - Avalancha: primero la de mayor CAE → minimiza intereses totales.
 *   - Bola de nieve: primero la de menor saldo → victorias rápidas.
 * Devuelve meses y ahorro de intereses, chequea la regla de carga financiera
 * (≤25% del ingreso líquido) y suma el contexto local: DICOM/Boletín Comercial
 * y la consolidación vía compra de cartera.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

interface Deuda {
  nombre: string;
  saldo: number;
  tasaMensual: number; // CAE anual / 12 / 100
}

/**
 * Simula la cancelación con un pago mensual fijo: capitaliza el interés de cada
 * deuda, aplica el pago en el orden dado y libera capacidad al cancelar cada
 * una (efecto cascada). Corta a 600 meses por seguridad.
 */
function simular(deudas: Deuda[], pagoDisponible: number): { meses: number; interesTotal: number } {
  const ds = deudas.map((d) => ({ ...d }));
  let interesTotal = 0;
  let meses = 0;
  const MAX = 600;
  while (ds.some((d) => d.saldo > 0.5) && meses < MAX) {
    meses++;
    for (const d of ds) {
      if (d.saldo > 0.5) {
        const interes = d.saldo * d.tasaMensual;
        interesTotal += interes;
        d.saldo += interes;
      }
    }
    let pago = pagoDisponible;
    for (const d of ds) {
      if (pago <= 0) break;
      if (d.saldo > 0.5) {
        const aplica = Math.min(pago, d.saldo);
        d.saldo -= aplica;
        pago -= aplica;
      }
    }
    if (pago === pagoDisponible) break;
  }
  return { meses, interesTotal };
}

const fmtMeses = (m: number) => {
  if (m <= 0) return '—';
  if (m >= 600) return 'más de 50 años';
  const a = Math.floor(m / 12);
  const r = m % 12;
  if (a === 0) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  if (r === 0) return `${a} ${a === 1 ? 'año' : 'años'}`;
  return `${a} ${a === 1 ? 'año' : 'años'} y ${r} ${r === 1 ? 'mes' : 'meses'}`;
};

function compute(inputs: Record<string, any>): DecisionResult {
  const raw: Deuda[] = [
    { nombre: 'Deuda 1', saldo: Math.max(0, num(inputs.deuda1Monto)), tasaMensual: Math.max(0, num(inputs.deuda1Cae)) / 12 / 100 },
    { nombre: 'Deuda 2', saldo: Math.max(0, num(inputs.deuda2Monto)), tasaMensual: Math.max(0, num(inputs.deuda2Cae)) / 12 / 100 },
    { nombre: 'Deuda 3', saldo: Math.max(0, num(inputs.deuda3Monto)), tasaMensual: Math.max(0, num(inputs.deuda3Cae)) / 12 / 100 },
  ];
  const deudas = raw.filter((d) => d.saldo > 0);
  const pagoMensual = Math.max(0, num(inputs.pagoMensual));
  const ingreso = Math.max(0, num(inputs.ingresoLiquido));

  const saldoTotal = deudas.reduce((s, d) => s + d.saldo, 0);
  const cargaPct = ingreso > 0 ? (pagoMensual / ingreso) * 100 : 0;

  if (deudas.length === 0 || pagoMensual <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Carga al menos una deuda (saldo y CAE) y cuánto puedes destinar al mes a pagarlas. Con eso simulamos tu salida con los métodos avalancha y bola de nieve, y te decimos cuál te libera antes y cuánto ahorras.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para quedar sin deudas' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo y el CAE** de cada deuda: rotativo de la tarjeta, avance en efectivo, crédito de consumo, línea de crédito.',
        'Indica **cuánto puedes pagar al mes** en total, más allá de los mínimos.',
      ],
    };
  }

  const ordenAvalancha = [...deudas].sort((a, b) => b.tasaMensual - a.tasaMensual);
  const ordenBola = [...deudas].sort((a, b) => a.saldo - b.saldo);

  const resAval = simular(ordenAvalancha, pagoMensual);
  const resBola = simular(ordenBola, pagoMensual);

  const interesMensualTotal = deudas.reduce((s, d) => s + d.saldo * d.tasaMensual, 0);
  if (pagoMensual <= interesMensualTotal) {
    return {
      status: 'a',
      verdict: {
        title: 'Tu pago no cubre ni los intereses',
        detail: `Con ${fmtMoney(pagoMensual)} al mes no alcanzas a cubrir los ${fmtMoney(interesMensualTotal)} de intereses que generan tus deudas: el saldo crece solo. Antes de cualquier método, necesitas liberar más plata o renegociar — una compra de cartera o repactación puede bajar la tasa antes de que la bola se agrande y termines en DICOM.`,
        tone: 'bad',
        badge: 'Pago insuficiente',
      },
      decisiveNumber: {
        value: fmtMoney(interesMensualTotal) + '/mes',
        label: 'Intereses que generas cada mes',
        sub: `Tu pago (${fmtMoney(pagoMensual)}) no los cubre: la deuda se agranda sola.`,
      },
      scenarios: [
        { label: 'Intereses al mes', value: fmtMoney(interesMensualTotal), detail: 'Lo mínimo para que la deuda al menos no crezca.' },
        { label: 'Tu pago actual', value: fmtMoney(pagoMensual), detail: 'Lo que estás destinando hoy.' },
        { label: 'Falta cubrir', value: fmtMoney(interesMensualTotal - pagoMensual), detail: 'Plata extra al mes solo para frenar el crecimiento.' },
      ],
      nextActions: [
        `**Libera al menos ${fmtMoney(interesMensualTotal - pagoMensual)} más al mes**, o estarás pagando para siempre sin bajar el capital.`,
        'Cotiza una **compra de cartera o crédito de consolidación**: cambiar deuda de tarjeta al 35% por un consumo al 20% baja el interés mensual de inmediato.',
        'Deja de usar la **tarjeta, el avance y la línea** ya: cada peso nuevo entra a la tasa más cara.',
        'Si ya estás atrasado, negocia ANTES de que la mora escale: una deuda castigada te deja en DICOM y sin acceso a crédito barato por años.',
      ],
      notes: [
        'Estimación orientativa con el CAE que cargaste. No es asesoría financiera.',
        'Si la deuda es sencillamente impagable, infórmate sobre la renegociación y la Ley de Insolvencia (procedimientos concursales para personas) antes de tomar más crédito.',
      ],
    };
  }

  const ahorroIntereses = resBola.interesTotal - resAval.interesTotal;
  const ahorroMeses = resBola.meses - resAval.meses;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (resAval.meses <= 24) {
    status = 'b';
    tone = 'good';
    badge = 'Salida cercana';
  } else if (resAval.meses <= 60) {
    status = 'tie';
    tone = 'neutral';
    badge = 'Largo pero sale';
  } else {
    status = 'a';
    tone = 'warn';
    badge = 'Plazo muy largo';
  }

  const ordenTxt = ordenAvalancha
    .map((d, idx) => `${idx + 1}º ${fmtMoney(d.saldo)} al ${fmtPct(d.tasaMensual * 12 * 100, 0).replace('+', '')}`)
    .join(' → ');

  const detail = `Destinando ${fmtMoney(pagoMensual)} al mes con el método avalancha (la deuda de mayor CAE primero), sales de tus ${fmtMoney(saldoTotal)} en ${fmtMeses(resAval.meses)} pagando ${fmtMoney(resAval.interesTotal)} de intereses. Frente a la bola de nieve, ahorras ${fmtMoney(Math.abs(ahorroIntereses))}${ahorroMeses > 0 ? ` y te liberas ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} antes` : ''}.${ingreso > 0 && cargaPct > 25 ? ` Ojo: este plan ocupa el ${cargaPct.toFixed(0)}% de tu ingreso líquido — sobre el 25% de carga financiera recomendado, así que es exigente.` : ''}`;

  const scenarios = [
    { label: 'Avalancha (recomendado)', value: fmtMeses(resAval.meses), detail: `Primero la deuda de mayor CAE. Intereses totales: ${fmtMoney(resAval.interesTotal)}.` },
    { label: 'Bola de nieve', value: fmtMeses(resBola.meses), detail: `Primero la deuda más chica (victorias rápidas). Intereses: ${fmtMoney(resBola.interesTotal)}.` },
    { label: 'Con +50% de pago', value: fmtMeses(simular(ordenAvalancha, pagoMensual * 1.5).meses), detail: `Si logras destinar ${fmtMoney(pagoMensual * 1.5)} al mes, la salida se acorta bastante.` },
  ];

  const breakdown = [
    { label: 'Deuda total a saldar', value: fmtMoney(saldoTotal) },
    { label: 'Pago disponible al mes', value: fmtMoney(pagoMensual), hint: ingreso > 0 ? `${cargaPct.toFixed(0)}% de tu ingreso líquido` : undefined },
    { label: 'Orden de pago (avalancha)', value: `${deudas.length} ${deudas.length === 1 ? 'deuda' : 'deudas'}`, hint: ordenTxt },
    { label: 'Tiempo con avalancha', value: fmtMeses(resAval.meses) },
    { label: 'Intereses con avalancha', value: fmtMoney(resAval.interesTotal) },
    { label: 'Intereses con bola de nieve', value: fmtMoney(resBola.interesTotal) },
    { label: 'Ahorro eligiendo avalancha', value: fmtMoney(Math.abs(ahorroIntereses)), hint: ahorroMeses > 0 ? `y ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} menos` : 'mismo plazo' },
  ];

  const nextActions = [
    `Ataca **primero la deuda más cara**: ${fmtMoney(ordenAvalancha[0].saldo)} al ${fmtPct(ordenAvalancha[0].tasaMensual * 12 * 100, 0).replace('+', '')} de CAE. Paga el mínimo del resto y vuelca todo el excedente ahí.`,
    'Cuando canceles una, **traspasa ese mismo pago a la siguiente** (efecto cascada): la salida se acelera mes a mes sin poner más plata.',
    'Cotiza una **compra de cartera**: los bancos compiten por refinanciar deuda de tarjeta cara con un consumo más barato. Compara por CAE y exige que no te alarguen el plazo más de lo necesario.',
    deudas.length > 1 && resBola.meses < resAval.meses + 6
      ? 'Si te cuesta la constancia, la **bola de nieve** (la más chica primero) da victorias rápidas por un costo extra menor. El mejor método es el que vas a cumplir.'
      : 'Congela la **tarjeta, el avance y la línea** mientras pagas: cada compra nueva entra a la tasa más cara y alarga todo.',
    ingreso > 0 && cargaPct > 25
      ? `Tu carga financiera (${cargaPct.toFixed(0)}% del líquido) supera el 25% recomendado: prioriza renegociar tasas para bajar la cuota antes que estirarte más.`
      : 'Mantente al día: un atraso te manda al Boletín Comercial (DICOM) y encarece o bloquea cualquier crédito futuro, incluido el hipotecario.',
  ];

  const notes = [
    'La simulación capitaliza intereses mes a mes con el CAE de cada deuda (convertido a tasa mensual) y aplica tu pago según el método. Es una estimación orientativa: tu cartola exacta puede diferir.',
    'Referencias de CAE en Chile: rotativo de tarjeta y avances 25-40% anual, crédito de consumo 20-35%, línea de crédito 25-40%. Pide el CAE real de cada producto — tu banco está obligado a informarlo.',
    'La regla de salud financiera: las cuotas de deuda no deberían superar el 25% de tu ingreso líquido (carga financiera). Sobre eso, cualquier imprevisto te desordena el plan.',
    'No es asesoría financiera. Si la deuda es impagable, existen la renegociación y los procedimientos concursales de la Ley de Insolvencia para personas: infórmate antes de tomar más crédito.',
  ];

  return {
    status,
    verdict: {
      title:
        status === 'b'
          ? 'Tienes la salida cerca: parte por la más cara'
          : status === 'tie'
            ? 'Sale, pero es un plan largo: parte por la más cara'
            : 'El plazo es muy largo: baja tasas y sube el pago',
      detail,
      tone,
      badge,
    },
    decisiveNumber: {
      value: fmtMeses(resAval.meses),
      label: 'Tiempo para quedar sin deudas (avalancha)',
      sub: `Pagas ${fmtMoney(resAval.interesTotal)} de intereses y ahorras **${fmtMoney(Math.abs(ahorroIntereses))}** frente a la bola de nieve.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'como-salir-de-deudas',
  title: '¿Cómo salir de las deudas en Chile? Avalancha vs bola de nieve 2026',
  h1: '¿Cómo salgo de mis deudas?',
  description:
    'Carga tus deudas (tarjeta, consumo, línea, avance) con su CAE y cuánto puedes pagar al mes: te decimos en cuántos meses te liberas y cuánto ahorras con avalancha frente a bola de nieve. Con carga financiera, DICOM y compra de cartera en el radar.',
  intro:
    'Rotativo de la tarjeta, un avance en efectivo, la línea de crédito sobregirada y un consumo que no baja: ¿por cuál partir? Esta sala simula tu salida mes a mes con los dos métodos probados — avalancha (primero la de mayor CAE, minimiza intereses) y bola de nieve (primero la más chica, victorias rápidas) — usando tasas chilenas reales. Te dice en cuántos meses quedas libre, cuánto pagas de intereses con cada método, si tu carga financiera supera el 25% recomendado, y cuándo conviene una compra de cartera antes de que un atraso te deje en DICOM.',
  icon: '🪜',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    deuda1Monto: 2000000,
    deuda1Cae: 32,
    deuda2Monto: 1000000,
    deuda2Cae: 22,
    deuda3Monto: 500000,
    deuda3Cae: 28,
    pagoMensual: 250000,
    ingresoLiquido: 1100000,
  },
  fields: [
    { id: 'deuda1Monto', label: 'Deuda 1 — saldo', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '2000000', help: 'El saldo de tu deuda más grande o más cara (rotativo de tarjeta, avance, consumo).', group: 'Tus deudas', groupIcon: '💳' },
    { id: 'deuda1Cae', label: 'Deuda 1 — CAE', type: 'number', suffix: '%', required: true, min: 0, max: 100, placeholder: '32', help: 'El CAE anual. Rotativo de tarjeta y avances: 25-40%; consumo: 20-35%.', group: 'Tus deudas' },
    { id: 'deuda2Monto', label: 'Deuda 2 — saldo', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '1000000', help: 'Una segunda deuda (opcional).', group: 'Tus deudas' },
    { id: 'deuda2Cae', label: 'Deuda 2 — CAE', type: 'number', suffix: '%', default: 0, min: 0, max: 100, placeholder: '22', group: 'Tus deudas' },
    { id: 'deuda3Monto', label: 'Deuda 3 — saldo', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '500000', help: 'Una tercera deuda (opcional): línea de crédito, casa comercial.', group: 'Tus deudas', advanced: true },
    { id: 'deuda3Cae', label: 'Deuda 3 — CAE', type: 'number', suffix: '%', default: 0, min: 0, max: 100, placeholder: '28', group: 'Tus deudas', advanced: true },
    { id: 'pagoMensual', label: 'Pago mensual que puedes destinar', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '250000', help: 'El total que puedes volcar al mes a pagar deudas, sumando los mínimos y el excedente.', group: 'Tu capacidad de pago', groupIcon: '💪' },
    { id: 'ingresoLiquido', label: 'Ingreso líquido mensual', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '1100000', advanced: true, help: 'Opcional: sirve para chequear tu carga financiera (las cuotas no deberían pasar del 25% del líquido).', group: 'Tu capacidad de pago' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-tarjeta-credito-chile-tasa-rotativa-pago-minimo', label: 'Tarjeta: rotativo y pago mínimo' },
    { slug: 'cl/calculadora-prestamo-personal-chile-cae-cmf-cuota', label: 'Crédito de consumo y CAE' },
    { slug: 'cl/calculadora-sueldo-liquido-chile-2026-impuesto-segunda-categoria', label: 'Sueldo líquido' },
    { slug: 'cl/calculadora-fondo-emergencia-chile-meses-gastos-recomendado', label: 'Fondo de emergencia' },
  ],
  howItWorks: `Esta sala simula tu salida de deudas mes a mes con dos estrategias y tasas chilenas.

1. **Tus deudas y tu pago.** Cargas hasta tres deudas con su saldo y su CAE (el costo anual real, con comisiones y seguros) y el total que puedes pagar al mes.
2. **Método avalancha.** Ordena las deudas de mayor a menor CAE: pagas el mínimo de todas y vuelcas el excedente a la más cara — típicamente el rotativo de la tarjeta o el avance en efectivo. Es el método que **minimiza los intereses totales**.
3. **Método bola de nieve.** Ordena de menor a mayor saldo: cancelas primero la más chica para tener una victoria rápida y sostener la motivación. Cuesta algo más en intereses, pero a mucha gente le funciona mejor.
4. **Efecto cascada.** En ambos métodos, al cancelar una deuda su pago se traspasa a la siguiente: cada mes avanzas más rápido sin poner más plata.
5. **Chequeos locales.** Si cargas tu ingreso líquido, la sala revisa tu carga financiera contra la regla del 25%, y en los próximos pasos te dice cuándo conviene una compra de cartera y por qué evitar caer en DICOM.`,
  faq: [
    { q: '¿Qué es el método avalancha?', a: 'Pagar el mínimo de todas tus deudas y volcar todo el excedente a la de mayor CAE. Cuando la cancelas, pasas a la siguiente más cara. Es el método matemáticamente óptimo: minimiza los intereses totales y en general te libera antes. En Chile, la primera víctima suele ser el rotativo de la tarjeta o el avance en efectivo.' },
    { q: '¿Qué es el método bola de nieve?', a: 'Atacar primero la deuda de menor saldo, sin importar la tasa, para cancelarla rápido y anotarte una victoria. Cuesta algo más en intereses que la avalancha, pero la motivación de ir cerrando deudas hace que más gente lo sostenga hasta el final. Esta sala te muestra exactamente cuánto cuesta esa diferencia.' },
    { q: '¿Qué CAE pongo si no lo sé?', a: 'Pídelo: tu banco o casa comercial está obligado a informarlo. Como referencia en Chile: rotativo de tarjeta y avances en efectivo, 25-40% anual; crédito de consumo, 20-35%; línea de crédito, 25-40%. Usa el CAE y no la tasa de interés pelada, porque incluye comisiones y seguros.' },
    { q: '¿Qué es la carga financiera y cuál es el límite sano?', a: 'Es el porcentaje de tu ingreso líquido que se va en cuotas de deudas. La regla de salud financiera — la misma que miran los bancos al evaluarte — es que no supere el 25%. Sobre eso, cualquier imprevisto te desordena y el acceso a crédito nuevo (como un hipotecario) se complica.' },
    { q: '¿Me conviene una compra de cartera para consolidar?', a: 'Suele convenir cuando cambias deuda cara por barata: por ejemplo, rotativo de tarjeta al 35% por un consumo al 18-22%. Baja el interés y ordena todo en una cuota. Dos advertencias: compara por CAE (no por cuota) y ojo con alargar demasiado el plazo, porque una cuota más chica por más años puede terminar costando más.' },
    { q: '¿Qué es DICOM y cómo me afecta?', a: 'DICOM es el registro comercial más conocido donde quedan las morosidades informadas al Boletín Comercial. Estar ahí encarece o bloquea créditos, y puede pesar en arriendos y hasta en algunos empleos. Al pagar una deuda morosa, la aclaración debe reflejarse; la mejor estrategia es negociar antes de caer en mora.' },
    { q: '¿Qué pasa si mi pago no cubre ni los intereses?', a: 'El saldo crece solo y nunca terminas de pagar: es la trampa del pago mínimo de la tarjeta. La sala te lo advierte y calcula cuánta plata extra necesitas al mes solo para frenar el crecimiento. En ese escenario, renegociar la tasa o consolidar es urgente, no opcional.' },
    { q: '¿Y si mis deudas son sencillamente impagables?', a: 'Chile tiene procedimientos concursales para personas (Ley de Insolvencia y Reemprendimiento): la renegociación ante la Superintendencia de Insolvencia es gratuita y ordena la deuda con todos los acreedores a la vez. Infórmate antes de tomar más crédito para tapar hoyos — eso solo agranda la bola.' },
  ],
  sources: [
    { name: 'CMF — Endeudamiento y CAE', url: 'https://www.cmfchile.cl/' },
    { name: 'SERNAC — Deudas, cobranzas y DICOM', url: 'https://www.sernac.cl/' },
    { name: 'Banco Central de Chile — Informe de cuentas de hogares', url: 'https://www.bcentral.cl/' },
  ],
};
