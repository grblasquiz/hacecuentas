/**
 * Sala de decisión CL — "¿Puedo pagar este crédito de consumo?"
 *
 * Patrón SALUD FINANCIERA, lógica chilena: la cuota se calcula desde el CAE
 * (Carga Anual Equivalente, tasa efectiva que exige informar la CMF) y el
 * semáforo usa la carga financiera sobre el sueldo líquido: hasta 25% cómodo,
 * 25-40% justo, más de 40% rojo. Compara por CAE y CTC, no por la cuota
 * publicitaria.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

/** Cuota mensual desde el CAE (efectivo anual): i = (1+CAE)^(1/12) − 1. */
function cuotaDesdeCae(monto: number, caePct: number, n: number): number {
  if (n <= 0) return 0;
  const i = Math.pow(1 + caePct / 100, 1 / 12) - 1;
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

const pct = (n: number) => `${n.toFixed(0).replace('.', ',')}%`;

function compute(inputs: Record<string, any>): DecisionResult {
  const monto = Math.max(0, num(inputs.monto));
  const cae = Math.max(0, num(inputs.caePorcentaje));
  const plazo = Math.max(0, num(inputs.plazoMeses));
  const ingreso = Math.max(0, num(inputs.ingresoLiquido));
  const gastosFijos = Math.max(0, num(inputs.gastosFijos));
  const otrasCuotas = Math.max(0, num(inputs.otrasCuotas));

  if (!monto || !cae || !plazo || !ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa el monto, el CAE y el plazo del crédito, más tu sueldo líquido mensual. Con eso calculamos la cuota y tu carga financiera para saber si te entra sin ahogarte.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Cuota mensual del crédito' },
      scenarios: [],
      nextActions: [
        'Ingresa el **monto, el CAE y el plazo** de la oferta (el CAE aparece obligatoriamente en la cotización).',
        'Suma tu **sueldo líquido** y las **cuotas que ya pagas** para medir tu carga financiera total.',
      ],
    };
  }

  const cuota = cuotaDesdeCae(monto, cae, plazo);
  const ctc = cuota * plazo; // costo total del crédito (aprox. desde el CAE)
  const costoCredito = ctc - monto;

  // Carga financiera: TODAS las cuotas sobre el sueldo líquido (criterio CMF).
  const cargaCuota = (cuota / ingreso) * 100;
  const cargaTotal = ((cuota + otrasCuotas) / ingreso) * 100;
  const sobranteDespues = ingreso - gastosFijos - otrasCuotas - cuota;
  const cuotaMaxComoda = Math.max(0, ingreso * 0.25 - otrasCuotas);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (cargaTotal <= 25 && sobranteDespues > 0) {
    status = 'b';
    tone = 'good';
    title = 'Sí, la cuota te entra con holgura';
    badge = 'Carga sana';
  } else if (cargaTotal <= 40 && sobranteDespues > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Puedes pagarla, pero quedas al justo';
    badge = 'Carga alta';
  } else {
    status = 'a';
    tone = 'bad';
    title = 'Ojo: esta cuota te sobreendeuda';
    badge = 'Zona roja';
  }

  const detail = `La cuota sale en ${fmtMoney(cuota)}/mes con el CAE de ${pct(cae)}. Sumando tus otras cuotas, tu carga financiera queda en ${pct(cargaTotal)} del sueldo líquido (cómodo: hasta 25%; sobre 40% es zona roja según los estudios de endeudamiento de la CMF). Después de gastos fijos, deudas y esta cuota te quedan ${fmtMoney(sobranteDespues)} libres al mes. Tu cuota máxima cómoda es ${fmtMoney(cuotaMaxComoda)}.`;

  // Escenarios: el mismo crédito con CAE peor y mejor (comparar ofertas por CAE).
  const caeAlto = cae + 8;
  const caeBajo = Math.max(1, cae - 6);
  const cuotaAlta = cuotaDesdeCae(monto, caeAlto, plazo);
  const cuotaBaja = cuotaDesdeCae(monto, caeBajo, plazo);

  const scenarios = [
    { label: `Oferta cara (CAE ${pct(caeAlto)})`, value: fmtMoney(cuotaAlta) + '/mes', detail: `Pagarías ${fmtMoney(cuotaAlta * plazo)} en total: ${fmtMoney(cuotaAlta * plazo - ctc)} más que con tu oferta.` },
    { label: `Tu oferta (CAE ${pct(cae)})`, value: fmtMoney(cuota) + '/mes', detail: `CTC de ${fmtMoney(ctc)} en ${plazo} cuotas. Carga financiera ${pct(cargaTotal)}.` },
    { label: `Oferta mejor (CAE ${pct(caeBajo)})`, value: fmtMoney(cuotaBaja) + '/mes', detail: `Cotizando en 2-3 bancos o cajas puedes bajar el CAE: ahorras ${fmtMoney(ctc - cuotaBaja * plazo)} en total.` },
  ];

  const breakdown = [
    { label: 'Cuota mensual', value: fmtMoney(cuota), hint: `${plazo} cuotas, calculada desde el CAE` },
    { label: 'Costo total del crédito (CTC)', value: fmtMoney(ctc), hint: 'todo lo que sale de tu bolsillo' },
    { label: 'Lo que pagas sobre el monto', value: fmtMoney(costoCredito), hint: `${fmtPct((costoCredito / monto) * 100, 0)} sobre lo que te prestan` },
    { label: 'Carga de esta cuota', value: pct(cargaCuota), hint: 'cuota / sueldo líquido' },
    { label: 'Carga financiera total', value: pct(cargaTotal), hint: 'con tus otras cuotas; sano: ≤25%' },
    { label: 'Cuota máxima cómoda', value: fmtMoney(cuotaMaxComoda), hint: '25% del líquido − otras cuotas' },
    { label: 'Te queda libre al mes', value: fmtMoney(sobranteDespues), hint: 'tras fijos, deudas y esta cuota' },
  ];

  const nextActions = [
    cargaTotal > 40
      ? `Tu carga financiera quedaría en ${pct(cargaTotal)}, en zona roja. **Baja el monto o alarga el plazo** hasta que la cuota no pase de ${fmtMoney(cuotaMaxComoda)} — o mejor, no tomes este crédito todavía.`
      : `La cuota entra dentro de lo manejable. Aun así, **cotiza en al menos 3 instituciones y compara por CAE y CTC**, nunca por la cuota publicitaria: dos créditos con la misma cuota pueden costar millones de diferencia.`,
    'Fíjate si la oferta incluye **seguro de desgravamen y comisiones**: si no están dentro del CAE informado, pide la cotización completa. La CMF obliga a informar CAE y CTC antes de firmar.',
    sobranteDespues > 0
      ? `Después de pagar todo te quedan ${fmtMoney(sobranteDespues)}/mes: confirma que alcanzan para imprevistos y algo de ahorro antes de firmar.`
      : 'Después de pagar todo quedas en negativo: este crédito te deja en rojo estructural. No lo tomes en estas condiciones.',
    'Si más adelante te sobra plata, recuerda que en créditos de hasta UF 5.000 tienes **derecho a prepagar** (total o parcial); la comisión de prepago está acotada por ley y casi siempre conviene.',
  ];

  const notes = [
    'La cuota se aproxima desde el CAE como tasa efectiva anual: i mensual = (1+CAE)^(1/12) − 1. El CAE ya incorpora intereses, comisiones y seguros obligatorios, por eso es el número correcto para comparar.',
    'El semáforo usa la carga financiera (cuotas totales / sueldo líquido): hasta 25% cómodo, 25-40% justo, sobre 40% riesgo de sobreendeudamiento — el umbral que usan los estudios de la CMF.',
    'Esto es orientación, no asesoría financiera. Antes de firmar revisa la hoja resumen con CAE y CTC, y compara la misma combinación de monto y plazo entre instituciones.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(cuota) + '/mes',
      label: 'Cuota del crédito de consumo',
      sub: `Carga financiera total: **${pct(cargaTotal)}** de tu líquido. Tu cuota máxima cómoda: **${fmtMoney(cuotaMaxComoda)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-pagar-este-credito',
  title: '¿Puedo pagar este crédito de consumo? Cuota y carga financiera Chile 2026',
  h1: '¿Puedo pagar este crédito de consumo?',
  description:
    'Calcula la cuota de un crédito de consumo en Chile desde el CAE y mide tu carga financiera: hasta 25% del sueldo líquido es cómodo, sobre 40% es zona roja. Compara por CAE y CTC antes de firmar.',
  intro:
    'Antes de firmar un crédito de consumo, la pregunta correcta no es "¿cuánto me prestan?" sino "¿la cuota me entra sin ahogarme?". Esta sala calcula la cuota desde el CAE (la tasa con costos incluidos que exige informar la CMF), la cruza con tu sueldo líquido, tus gastos fijos y las cuotas que ya pagas, y te da un semáforo claro de carga financiera. Además te muestra el costo total del crédito (CTC), que es lo que de verdad hay que comparar entre bancos, cajas y retail.',
  icon: '🏦',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    monto: 3000000,
    caePorcentaje: 28,
    plazoMeses: 24,
    ingresoLiquido: 1100000,
    gastosFijos: 650000,
    otrasCuotas: 100000,
  },
  fields: [
    { id: 'monto', label: 'Monto del crédito', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '3000000', help: 'La plata que te prestan (capital).', group: 'El crédito', groupIcon: '🏦' },
    { id: 'caePorcentaje', label: 'CAE (anual)', type: 'number', suffix: '%', required: true, min: 0, max: 100, placeholder: '28', help: 'Carga Anual Equivalente: la tasa con comisiones y seguros incluidos. Aparece obligatoriamente en la cotización.', group: 'El crédito' },
    { id: 'plazoMeses', label: 'Plazo (meses)', type: 'number', required: true, min: 1, max: 84, placeholder: '24', help: 'En cuántas cuotas lo pagas. Consumo típico: 12 a 48.', group: 'El crédito' },
    { id: 'ingresoLiquido', label: 'Tu sueldo líquido mensual', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '1100000', help: 'Lo que te llega al bolsillo, ya descontadas AFP y salud.', group: 'Tu bolsillo', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: '$', format: 'thousands', recommended: true, min: 0, placeholder: '650000', help: 'Arriendo o dividendo, gastos comunes, cuentas, transporte, comida: lo que pagas sí o sí.', group: 'Tu bolsillo' },
    { id: 'otrasCuotas', label: 'Cuotas de otras deudas', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '100000', help: 'Suma de cuotas mensuales de otros créditos, tarjetas o avances.', group: 'Tu bolsillo' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-prestamo-personal-chile-cae-cmf-cuota', label: 'Préstamo personal (CAE y cuota)' },
    { slug: 'cl/calculadora-sueldo-liquido-chile-2026-impuesto-segunda-categoria', label: 'Sueldo líquido' },
    { slug: 'cl/calculadora-tarjeta-credito-chile-tasa-rotativa-pago-minimo', label: 'Tarjeta de crédito (rotativo)' },
  ],
  howItWorks: `Esta sala no calcula solo la cuota: mide si tu bolsillo la aguanta.

1. **La cuota desde el CAE.** Convierte el CAE (tasa efectiva anual con costos incluidos) a tasa mensual y calcula la cuota fija por sistema francés, el estándar en créditos de consumo chilenos.
2. **El CTC.** Multiplica cuota por plazo para mostrarte el costo total del crédito: cuánta plata sale de tu bolsillo de principio a fin, y cuánto de eso es costo del financiamiento.
3. **Tu carga financiera.** Suma esta cuota a las que ya pagas y la divide por tu sueldo líquido. Ese porcentaje es el que miran los estudios de endeudamiento de la CMF: hasta 25% cómodo, 25-40% justo, sobre 40% zona roja.
4. **Tu cuota máxima cómoda.** Calcula el 25% de tu líquido menos tus otras cuotas: el techo recomendable para la cuota nueva.
5. **El veredicto.** Cruza ingreso, gastos fijos, deudas y cuota, te dice cuánto te queda libre al mes y compara tu oferta contra un CAE mejor y uno peor, para que veas cuánto vale cotizar.`,
  faq: [
    { q: '¿Qué es el CAE y por qué importa más que la tasa de interés?', a: 'El CAE (Carga Anual Equivalente) es el costo anual real del crédito con intereses, comisiones y seguros incluidos, y las instituciones están obligadas a informarlo. Dos ofertas pueden tener la misma tasa de interés y CAE muy distintos por los seguros y comisiones: compara siempre por CAE con el mismo monto y plazo.' },
    { q: '¿Qué porcentaje de mi sueldo líquido puede ir a cuotas?', a: 'Como referencia de salud financiera: hasta el 25% del líquido es una carga cómoda, entre 25% y 40% vas al justo, y sobre el 40% entras en riesgo de sobreendeudamiento, el umbral que usan los informes de endeudamiento de la CMF. El cálculo debe incluir TODAS tus cuotas, no solo la nueva.' },
    { q: '¿Qué es el CTC y en qué se diferencia del CAE?', a: 'El CTC (Costo Total del Crédito) es la suma de todo lo que vas a pagar: capital, intereses, comisiones y seguros. El CAE es la tasa; el CTC es el monto final en pesos. Para dimensionar el sacrificio real, mira el CTC: un crédito de $3.000.000 a 24 cuotas puede terminar costando más de $4.000.000.' },
    { q: '¿Conviene alargar el plazo para que la cuota baje?', a: 'La cuota baja, pero el CTC sube: pagas intereses durante más meses. Alarga el plazo solo si es la única forma de que la carga financiera quede bajo el 40%; si puedes sostener una cuota mayor, el plazo corto siempre sale más barato en total.' },
    { q: '¿Puedo prepagar un crédito de consumo en Chile?', a: 'Sí. En operaciones de hasta UF 5.000 tienes derecho a pago anticipado, total o parcial, y la comisión de prepago está acotada por ley. Si te llega plata extra (bono, finiquito, devolución de impuestos), prepagar un crédito caro suele ser de las mejores inversiones disponibles.' },
    { q: '¿Es lo mismo un crédito de consumo que un avance en efectivo de la tarjeta?', a: 'No. El avance y el rotativo de la tarjeta suelen tener CAE bastante más alto que un crédito de consumo cotizado. Si estás financiando un monto grande con la tarjeta, casi siempre conviene consolidarlo en un crédito de consumo con mejor CAE.' },
    { q: '¿Qué pasa si me atraso en las cuotas?', a: 'Corren intereses de mora, gastos de cobranza regulados y el atraso se informa a los registros de morosidad (el conocido DICOM), lo que te encarece o bloquea el crédito futuro. Si ves que no llegas, negocia con la institución antes de caer en mora: repactar temprano es más barato que la cobranza.' },
    { q: '¿Esta sala reemplaza la evaluación del banco?', a: 'No. Es una herramienta para que decidas con tus propios números antes de pedir; la institución hará su propia evaluación de riesgo. Y recuerda que aunque el banco te apruebe un monto mayor, eso no significa que la cuota sea sana para tu presupuesto.' },
  ],
  sources: [
    { name: 'CMF — CAE y costo total del crédito (educación financiera)', url: 'https://www.cmfchile.cl/' },
    { name: 'CMF — Informe de endeudamiento (carga financiera)', url: 'https://www.cmfchile.cl/portal/estadisticas/617/w3-propertyvalue-29135.html' },
    { name: 'SERNAC — Comparador de créditos de consumo', url: 'https://www.sernac.cl/' },
  ],
};
