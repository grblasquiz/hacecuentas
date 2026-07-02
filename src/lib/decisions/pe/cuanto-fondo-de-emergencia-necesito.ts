/**
 * Sala de decisión (Perú) — "¿Cuánto fondo de emergencia necesito?"
 *
 * Dimensiona el fondo entre 3 y 6+ meses de gastos esenciales según la
 * estabilidad del ingreso (planilla indefinida, contrato a plazo, recibos por
 * honorarios / informal) y las cargas (hijos, alquiler). Trata la CTS como
 * colchón COMPLEMENTARIO — hoy es de libre disponibilidad, pero su rol natural
 * es de respaldo, no de gasto — y te dice la meta, cuánto te falta y en cuántos
 * meses la completas con tu aporte mensual.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { num, bool } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const gastos = Math.max(0, num(inputs.gastosEsenciales));
  const tipoIngreso = String(inputs.tipoIngreso || 'planilla'); // planilla | plazo | independiente
  const hijos = bool(inputs.hijos);
  const alquiler = bool(inputs.pagaAlquiler);
  const ahorro = Math.max(0, num(inputs.ahorroActual));
  const aporte = Math.max(0, num(inputs.aporteMensual));
  const cts = Math.max(0, num(inputs.ctsAcumulada));

  if (!gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa tus gastos esenciales del mes para dimensionar tu fondo de emergencia. Ajustamos los meses según cómo ganas tu plata: planilla, contrato a plazo o recibos por honorarios.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Fondo de emergencia recomendado' },
      scenarios: [],
      nextActions: [
        'Ingresa tus **gastos esenciales mensuales** (lo mínimo para vivir un mes).',
        'Indica **cómo recibes tu ingreso** (planilla, contrato a plazo, honorarios) y tus cargas.',
      ],
    };
  }

  // Base por estabilidad del ingreso: planilla indefinida 3, contrato a plazo 4,
  // independiente/informal 6 (sin CTS, sin seguro de desempleo, ingreso variable).
  let meses = tipoIngreso === 'independiente' ? 6 : tipoIngreso === 'plazo' ? 4 : 3;
  const factores: Array<{ label: string; value: string }> = [
    {
      label:
        tipoIngreso === 'independiente'
          ? 'Recibos por honorarios / ingreso informal'
          : tipoIngreso === 'plazo'
            ? 'Planilla con contrato a plazo'
            : 'Planilla con contrato indefinido',
      value: `${meses} meses base`,
    },
  ];
  if (hijos) {
    meses += 1;
    factores.push({ label: 'Hijos o personas a tu cargo', value: '+1 mes' });
  }
  if (alquiler) {
    meses += 1;
    factores.push({ label: 'Pagas alquiler', value: '+1 mes' });
  }

  const meta = meses * gastos;
  const falta = Math.max(0, meta - ahorro);
  const progreso = meta > 0 ? (ahorro / meta) * 100 : 0;
  const colchonTotal = ahorro + cts;
  const mesesParaCompletar = falta > 0 && aporte > 0 ? Math.ceil(falta / aporte) : 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let title: string;
  if (falta <= 0) {
    status = 'b';
    tone = 'good';
    badge = 'Meta cumplida';
    title = 'Ya tienes tu fondo completo';
  } else if (progreso >= 50 || colchonTotal >= meta) {
    status = 'tie';
    tone = 'neutral';
    badge = 'A medio camino';
    title = `Vas bien: te faltan ${fmtMoney(falta)}`;
  } else {
    status = 'a';
    tone = 'warn';
    badge = 'Colchón corto';
    title = `Tu colchón está corto: junta ${fmtMoney(falta)} más`;
  }

  const detail = `Por tu situación te corresponden ${meses} meses de gastos esenciales: ${fmtMoney(meta)}. Tienes ${fmtMoney(ahorro)} ahorrados (${Math.round(progreso)}% de la meta)${cts > 0 ? ` más ${fmtMoney(cts)} en tu CTS como respaldo complementario` : ''}. ${falta > 0 ? `Te faltan ${fmtMoney(falta)}${aporte > 0 ? `: guardando ${fmtMoney(aporte)} al mes, completas la meta en ${mesesParaCompletar} ${mesesParaCompletar === 1 ? 'mes' : 'meses'}` : ''}.` : 'Tu fondo está completo: ahora cuida que siga líquido y no lo toques salvo emergencia real.'}`;

  const scenarios = [
    { label: 'Piso (3 meses)', value: fmtMoney(3 * gastos), detail: 'El mínimo para cualquiera, incluso con planilla estable.' },
    { label: 'Tu meta', value: fmtMoney(meta), detail: `${meses} meses, ajustados a tu tipo de ingreso y tus cargas.` },
    { label: 'Holgado (9 meses)', value: fmtMoney(9 * gastos), detail: 'Para ingresos muy variables o si eres el único sostén del hogar.' },
  ];

  const breakdown = [
    { label: 'Gastos esenciales al mes', value: fmtMoney(gastos), hint: 'la base del cálculo' },
    ...factores,
    { label: 'Meta del fondo', value: fmtMoney(meta), hint: `${meses} meses de gastos` },
    { label: 'Ahorro líquido actual', value: fmtMoney(ahorro), hint: `${Math.round(progreso)}% de la meta` },
    ...(cts > 0 ? [{ label: 'CTS acumulada (respaldo)', value: fmtMoney(cts), hint: 'complementa, no reemplaza' }] : []),
    { label: 'Te falta juntar', value: fmtMoney(falta) },
    ...(falta > 0 && aporte > 0
      ? [{ label: 'Tiempo para completarla', value: `${mesesParaCompletar} ${mesesParaCompletar === 1 ? 'mes' : 'meses'}`, hint: `guardando ${fmtMoney(aporte)}/mes` }]
      : []),
  ];

  const nextActions = [
    falta > 0
      ? `Tu meta es **${fmtMoney(meta)}**. Sepáralo en automático: programa una transferencia de ${aporte > 0 ? fmtMoney(aporte) : 'un monto fijo'} apenas te paguen, antes de gastar en lo demás.`
      : `Meta cumplida: mantén los **${fmtMoney(meta)}** en instrumentos líquidos y revisa el monto cuando suban tus gastos.`,
    'Dónde guardarlo: una parte en **cuenta de ahorros** (disponible al toque) y el resto en **depósitos a plazo cortos**. Las cajas municipales suelen pagar más que los bancos grandes y están igual de cubiertas por el Fondo de Seguro de Depósitos.',
    cts > 0
      ? 'Tu CTS es el segundo anillo del colchón: aunque hoy es de libre disponibilidad, **no la gastes** — déjala acumulando como respaldo para una pérdida de empleo, que es exactamente para lo que nació.'
      : 'Si estás en planilla, recuerda que tu empleador deposita **CTS en mayo y noviembre**: déjala acumulando como segundo anillo del colchón en vez de retirarla.',
    'No mezcles este fondo con inversiones de riesgo: para emergencias sirven cuenta de ahorros, depósito a plazo o a lo sumo un fondo mutuo conservador de muy corto plazo. La bolsa y las criptos no esperan tu emergencia.',
  ];

  const notes = [
    'El cálculo parte de 3 meses de gastos esenciales y sube según el riesgo: contrato a plazo (4), recibos por honorarios o ingreso informal (6), más un mes por hijos y otro por alquiler. Es una guía, no una fórmula exacta.',
    'Usa tus gastos ESENCIALES (alimentación, vivienda, servicios, transporte, educación), no tu sueldo completo: el fondo cubre subsistencia mientras te reacomodas.',
    'La CTS se trata como respaldo complementario, no como parte de la meta: es plata tuya y hoy de libre retiro, pero conviene reservarla para el escenario de quedarte sin trabajo.',
    'No es asesoría financiera. Ajusta el monto a tu realidad: si eres el único ingreso del hogar o tu rubro es inestable, apunta al escenario holgado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(meta),
      label: 'Fondo de emergencia recomendado',
      sub: `**${meses} meses** de tus gastos esenciales (${fmtMoney(gastos)}/mes). Te falta: **${fmtMoney(falta)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-fondo-de-emergencia-necesito',
  title: '¿Cuánto fondo de emergencia necesito? Meta y plazo Perú 2026',
  h1: '¿Cuánto fondo de emergencia necesito?',
  description:
    'Dimensiona tu fondo de emergencia en soles: 3 a 6 meses de gastos esenciales según si estás en planilla, con contrato a plazo o emites recibos por honorarios. Incluye tu CTS como respaldo y te dice cuánto te falta y en cuántos meses lo completas.',
  intro:
    'La regla dice "3 a 6 meses de gastos", pero el número correcto depende de cómo ganas tu plata: no es lo mismo una planilla con contrato indefinido que vivir de recibos por honorarios. Esta sala ajusta los meses a tu situación, suma tus cargas (hijos, alquiler), trata tu CTS como el respaldo complementario que es —de libre disponibilidad hoy, pero pensada para cuando te quedas sin trabajo— y te dice la meta exacta, cuánto te falta y cuándo la completas.',
  icon: '🛟',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    gastosEsenciales: 2500,
    tipoIngreso: 'planilla',
    hijos: 'si',
    pagaAlquiler: 'si',
    ahorroActual: 6000,
    aporteMensual: 500,
    ctsAcumulada: 4000,
  },
  fields: [
    { id: 'gastosEsenciales', label: 'Gastos esenciales al mes', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '2500', help: 'Lo mínimo para vivir un mes: alimentación, alquiler o mantenimiento, servicios, transporte, colegio.', group: 'Tus gastos', groupIcon: '🧾' },
    {
      id: 'tipoIngreso', label: '¿Cómo recibes tu ingreso?', type: 'select', default: 'planilla', recommended: true,
      options: [
        { value: 'planilla', label: 'Planilla, contrato indefinido' },
        { value: 'plazo', label: 'Planilla, contrato a plazo fijo' },
        { value: 'independiente', label: 'Recibos por honorarios / informal' },
      ],
      help: 'En planilla tienes CTS y beneficios; como independiente no hay red: necesitas más meses.', group: 'Tu riesgo', groupIcon: '⚖️',
    },
    { id: 'hijos', label: '¿Tienes hijos o personas a cargo?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }], help: 'Más personas que dependen de ti = más colchón.', group: 'Tu riesgo' },
    { id: 'pagaAlquiler', label: '¿Pagas alquiler?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No (casa propia o familiar)' }, { value: 'si', label: 'Sí' }], help: 'El alquiler no se puede recortar ante un imprevisto.', group: 'Tu riesgo' },
    { id: 'ahorroActual', label: 'Ahorro líquido que ya tienes', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '6000', help: 'Plata disponible en cuentas de ahorro o depósitos cortos (sin contar la CTS).', group: 'Tu avance', groupIcon: '📈' },
    { id: 'aporteMensual', label: 'Cuánto puedes guardar al mes', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '500', help: 'Lo que puedes separar cada mes para completar el fondo.', group: 'Tu avance' },
    { id: 'ctsAcumulada', label: 'CTS acumulada', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '4000', advanced: true, help: 'Saldo en tu cuenta CTS. La contamos como respaldo complementario, no como parte de la meta.', group: 'Tu avance' },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-cts-peru-deposito-semestral', label: 'Depósito de CTS' },
    { slug: 'pe/calculadora-retiro-cts-desempleo-peru', label: 'Retiro de CTS por desempleo' },
    { slug: 'pe/calculadora-deposito-plazo-fijo-peru', label: 'Depósito a plazo fijo' },
    { slug: 'pe/calculadora-costo-vida-mensual-peru', label: 'Costo de vida mensual' },
  ],
  howItWorks: `Esta sala convierte la regla genérica de los "3 a 6 meses" en una meta concreta en soles.

1. **La base según tu ingreso.** Planilla con contrato indefinido: 3 meses. Contrato a plazo: 4. Recibos por honorarios o ingreso informal: 6, porque no tienes CTS ni liquidación que amortigüe el golpe.
2. **Tus cargas.** Suma un mes si tienes hijos o personas a cargo y otro si pagas alquiler: son gastos que no bajan cuando el ingreso desaparece.
3. **La meta en soles.** Multiplica los meses por tus gastos esenciales reales (no por tu sueldo): eso cubre la subsistencia mientras te reacomodas.
4. **Tu avance.** Compara la meta con tu ahorro líquido, te dice cuánto falta y —con tu aporte mensual— en cuántos meses la completas. La CTS aparece aparte, como segundo anillo.
5. **Dónde guardarlo.** Te sugiere el mix: cuenta de ahorros para lo inmediato y depósitos a plazo (cajas pagan más, con la misma cobertura del Fondo de Seguro de Depósitos) para el resto.`,
  faq: [
    { q: '¿Por qué 3 a 6 meses de gastos?', a: 'Porque es el tiempo que suele tomar reemplazar un ingreso perdido. Con planilla estable, 3 meses alcanzan; con contrato a plazo conviene 4; y si vives de recibos por honorarios o en la informalidad, apunta a 6 o más, porque no hay CTS ni liquidación que te sostenga.' },
    { q: '¿La CTS cuenta como fondo de emergencia?', a: 'Como complemento, no como reemplazo. La CTS nació justamente como seguro de desempleo: tu empleador deposita dos veces al año (mayo y noviembre) alrededor de medio sueldo cada vez. Hoy es de libre disponibilidad, pero si la gastas pierdes tu segundo anillo de protección. El fondo líquido cubre imprevistos chicos; la CTS, la pérdida del trabajo.' },
    { q: '¿Dónde guardo el fondo de emergencia?', a: 'En instrumentos líquidos y seguros: cuenta de ahorros para 1 mes de gastos y depósitos a plazo cortos para el resto. Las cajas municipales suelen pagar 6-7% frente al 4-5% de los bancos, y ambos están cubiertos por el Fondo de Seguro de Depósitos. Un fondo mutuo conservador de corto plazo también sirve para una parte.' },
    { q: '¿Qué cubre el Fondo de Seguro de Depósitos?', a: 'Protege tus depósitos (ahorros, plazo, CTS) en bancos, financieras, cajas municipales y rurales si la entidad quiebra, hasta un tope que la SBS actualiza cada trimestre (supera los S/ 120,000 por persona por entidad). Por eso ahorrar en una caja que paga más no implica más riesgo, mientras estés bajo el tope.' },
    { q: '¿Calculo sobre mis gastos o sobre mi sueldo?', a: 'Sobre tus gastos esenciales: alimentación, vivienda, servicios, transporte, colegio. El fondo está para sostener la subsistencia mientras consigues otro ingreso, no para mantener el mismo nivel de vida. Si tus gastos esenciales son S/ 2,500, la meta de 5 meses es S/ 12,500.' },
    { q: '¿En soles o en dólares?', a: 'Principalmente en soles, porque tus gastos son en soles y la inflación peruana es baja (alrededor de 2.5% anual, dentro del rango meta del BCRP), así que tu plata no se derrite como en otros países. Si quieres, una porción menor en dólares como diversificación, pero la liquidez inmediata debe estar en la moneda en que gastas.' },
    { q: '¿Qué hago si no llego ni al primer mes?', a: 'Empieza con una meta corta: S/ 1,000 de colchón inicial cambia tu relación con los imprevistos (ya no todo termina en la tarjeta o en un préstamo caro). Sepáralo en automático apenas te paguen y usa ingresos extraordinarios —gratificación de julio y diciembre, utilidades— para dar saltos grandes.' },
    { q: '¿Puedo usar el fondo para una inversión o un negocio?', a: 'No. El fondo es intocable salvo emergencia real: salud, pérdida de ingreso, una reparación urgente. Si lo metes a un negocio o a una inversión y justo llega el imprevisto, terminas endeudándote con la tarjeta al 100% de TCEA, que es exactamente lo que el fondo evita.' },
  ],
  sources: [
    { name: 'SBS — Fondo de Seguro de Depósitos', url: 'https://www.sbs.gob.pe/' },
    { name: 'BCRP — Reporte de inflación y rango meta', url: 'https://www.bcrp.gob.pe/' },
    { name: 'INEI — Condiciones de vida y empleo', url: 'https://www.inei.gob.pe/' },
  ],
};
