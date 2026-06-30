/**
 * Sala de decisión — "Me despidieron: ¿cuánto me corresponde y cuánto aguanto?"
 *
 * Patrón EMERGENCIA. Orquesta la liquidación por despido sin causa (fórmula
 * `indemnizacion`, que ya bundlea antigüedad Art.245 + preaviso + integración +
 * SAC + vacaciones) y la cruza con tu realidad financiera (gastos, ahorros,
 * deudas, seguro de desempleo) para responder lo que de verdad importa el día
 * que te echan: cuánta plata te tienen que pagar y cuántos meses podés sostenerte.
 */

import { indemnizacion } from '../formulas/indemnizacion';
import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num, bool } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const sueldoBruto = num(inputs.sueldoBruto);
  const antiguedadAnios = num(inputs.antiguedadAnios);
  const antiguedadMeses = Math.max(0, Math.min(11, num(inputs.antiguedadMeses)));
  const gastosMensuales = Math.max(0, num(inputs.gastosMensuales));
  const ahorros = Math.max(0, num(inputs.ahorros));
  const deudas = Math.max(0, num(inputs.deudas));
  const seguroMensual = Math.max(0, num(inputs.seguroDesempleoMensual));
  const mesesSeguro = Math.max(0, Math.min(12, num(inputs.mesesSeguro)));
  const diaDespido = num(inputs.diaDespido) || 15;
  const mesDespido = num(inputs.mesDespido) || undefined;

  if (!sueldoBruto || (!antiguedadAnios && !antiguedadMeses)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu sueldo bruto y tu antigüedad para estimar la liquidación. Sumá tus gastos mensuales y ahorros para saber cuántos meses podés sostenerte.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Liquidación estimada' },
      scenarios: [],
      nextActions: [
        'Cargá tu **sueldo bruto** (el de arriba de los descuentos en el recibo) y tu **antigüedad**.',
        'Sumá tus **gastos mensuales** y **ahorros** para ver cuántos meses de aire tenés.',
      ],
    };
  }

  // Liquidación completa (Art. 245 + preaviso + integración + SAC + vacaciones).
  // topeConvenio=0 → sin tope (caso fuera de convenio, el más favorable y común).
  const liq = indemnizacion({
    sueldoBruto,
    antiguedadAnios,
    antiguedadMeses,
    topeConvenio: 0,
    diaDespido,
    mesDespido,
  });
  const liquidacionTotal = liq.total;

  // Fondo disponible y meses de cobertura.
  const fondoNeto = liquidacionTotal + ahorros - deudas;
  const cobertura = (monto: number) => (gastosMensuales > 0 ? monto / gastosMensuales : 0);
  const mesesSoloLiq = cobertura(liquidacionTotal - deudas);
  const mesesConAhorros = cobertura(fondoNeto);
  const aporteSeguro = seguroMensual * mesesSeguro;
  const mesesConSeguro = cobertura(fondoNeto + aporteSeguro);

  const mesesPrincipal = mesesConAhorros; // el número decisivo
  const fmtMeses = (m: number) =>
    m <= 0 ? '0 meses' : `${m.toFixed(1).replace('.', ',').replace(',0', '')} meses`;

  // — Veredicto: salud del colchón —
  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (mesesPrincipal >= 6) {
    status = 'b';
    tone = 'good';
    title = 'Tenés respaldo para reorganizarte con calma';
    badge = 'Respaldo sólido';
  } else if (mesesPrincipal >= 3) {
    status = 'tie';
    tone = 'neutral';
    title = 'Tenés un colchón ajustado: ordená los gastos ya';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Atención: poco aire, priorizá ingresos y recortes';
    badge = 'Poco aire';
  }
  const detail = `Te corresponde una liquidación estimada de ${fmtMoney(liquidacionTotal)}. Sumada a tus ahorros y descontando deudas, tu fondo es de ${fmtMoney(fondoNeto)}: cubre ${fmtMeses(mesesPrincipal)} de tus gastos${seguroMensual > 0 ? `, o ${fmtMeses(mesesConSeguro)} con el seguro de desempleo` : ''}.`;

  const scenarios = [
    {
      label: 'Solo liquidación',
      value: fmtMeses(mesesSoloLiq),
      detail: 'Cuánto aguantás sin tocar tus ahorros, ya restando deudas.',
    },
    {
      label: 'Con ahorros',
      value: fmtMeses(mesesConAhorros),
      detail: 'Liquidación + ahorros disponibles − deudas.',
    },
    {
      label: 'Con seguro',
      value: fmtMeses(mesesConSeguro),
      detail: seguroMensual > 0
        ? `Sumando ${fmtMoney(seguroMensual)}/mes de seguro por ${mesesSeguro} meses.`
        : 'Cargá el seguro de desempleo de ANSES para ver cuánto extiende tu aire.',
    },
  ];

  const breakdown = [
    { label: 'Indemnización por antigüedad (Art. 245)', value: fmtMoney(liq.antiguedad), hint: liq.aniosComputables },
    { label: 'Preaviso + SAC', value: fmtMoney(liq.preaviso + liq.sacPreaviso) },
    { label: 'Integración mes de despido + SAC', value: fmtMoney(liq.integracionMes + liq.sacIntegracion) },
    { label: 'SAC proporcional (aguinaldo)', value: fmtMoney(liq.sacProporcional) },
    { label: 'Vacaciones no gozadas + SAC', value: fmtMoney(liq.vacacionesProporcionales + liq.sacVacaciones) },
    { label: 'Liquidación total', value: fmtMoney(liquidacionTotal), hint: `≈ ${(liquidacionTotal / sueldoBruto).toFixed(1).replace('.', ',')} sueldos` },
    { label: '+ Ahorros disponibles', value: fmtMoney(ahorros) },
    { label: '− Deudas a cubrir', value: '-' + fmtMoney(deudas).replace('-', '') },
    { label: 'Fondo neto disponible', value: fmtMoney(fondoNeto) },
  ];

  const nextActions = [
    `Revisá que la liquidación incluya **todos** los rubros y dé al menos **${fmtMoney(liquidacionTotal)}**. Si te ofrecen menos, podés reclamar la diferencia.`,
    'Tramitá el **seguro de desempleo en ANSES dentro de los 90 días** del despido: es plata que no se pide sola.',
    mesesPrincipal < 6
      ? `Tu fondo cubre ${fmtMeses(mesesPrincipal)}: recortá ya los gastos no esenciales y priorizá generar ingresos.`
      : `Tenés ${fmtMeses(mesesPrincipal)} de aire: usalos para buscar con calma, no aceptes lo primero por desesperación.`,
    'Antes de firmar el telegrama o acuerdo, confirmá si el despido fue **con o sin causa**: cambia mucho lo que te corresponde. Ante la duda, consultá a un abogado laboral.',
  ];

  const notes = [
    'La liquidación se calcula con las fórmulas de la LCT (Art. 245 antigüedad con doctrina Vizzoti, preaviso, integración del mes, SAC y vacaciones proporcionales), sin tope de convenio.',
    'Son montos brutos orientativos. La indemnización por antigüedad suele estar exenta de Ganancias hasta un tope; otros rubros pueden tener descuentos.',
    'No reemplaza asesoramiento legal: para tu caso exacto (convenio, multas, causa) consultá con un abogado laboral matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMeses(mesesPrincipal),
      label: 'Meses que podés sostenerte',
      sub: `Liquidación estimada: **${fmtMoney(liquidacionTotal)}** · Fondo neto (con ahorros, menos deudas): **${fmtMoney(fondoNeto)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'me-despidieron',
  title: 'Me despidieron: ¿cuánto me corresponde y cuánto aguanto? 2026',
  h1: 'Me despidieron: ¿cuánto deberían pagarme y cuánto tiempo puedo sostenerme?',
  description:
    'Estimá tu liquidación por despido sin causa (indemnización, preaviso, integración, SAC y vacaciones) y cruzala con tus gastos, ahorros y deudas para saber cuántos meses podés sostenerte. Con seguro de desempleo.',
  intro:
    'El día que te echan necesitás dos números: cuánta plata te tienen que pagar y cuánto tiempo te da. Esta sala calcula tu liquidación completa (antigüedad, preaviso, integración del mes, aguinaldo y vacaciones) y la cruza con tus gastos, ahorros y deudas para decirte cuántos meses de aire tenés y qué hacer primero.',
  icon: '📄',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    sueldoBruto: 1500000,
    antiguedadAnios: 6,
    antiguedadMeses: 0,
    gastosMensuales: 900000,
    ahorros: 1000000,
    deudas: 0,
    seguroDesempleoMensual: 0,
    mesesSeguro: 0,
    diaDespido: 15,
    mesDespido: 6,
  },
  fields: [
    {
      id: 'sueldoBruto',
      label: 'Tu sueldo bruto',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoBruto',
      help: 'La mejor remuneración mensual del último año (bruto, antes de descuentos).',
      group: 'Tu trabajo',
      groupIcon: '💼',
    },
    {
      id: 'antiguedadAnios',
      label: 'Antigüedad (años)',
      type: 'number',
      required: true,
      min: 0,
      max: 60,
      profileKey: 'trabajo.antiguedadAnios',
      help: 'Años completos en la empresa. La fracción mayor a 3 meses suma un año entero.',
      group: 'Tu trabajo',
    },
    {
      id: 'antiguedadMeses',
      label: 'Meses extra',
      type: 'number',
      default: 0,
      min: 0,
      max: 11,
      advanced: true,
      help: 'Meses además de los años completos (0 a 11).',
      group: 'Tu trabajo',
    },
    {
      id: 'mesDespido',
      label: 'Mes del despido',
      type: 'number',
      default: 6,
      min: 1,
      max: 12,
      advanced: true,
      help: 'Define el SAC y las vacaciones proporcionales al día del despido.',
      group: 'Tu trabajo',
    },
    {
      id: 'diaDespido',
      label: 'Día del mes',
      type: 'number',
      default: 15,
      min: 1,
      max: 31,
      advanced: true,
      help: 'Para la integración del mes de despido.',
      group: 'Tu trabajo',
    },
    // — Tu realidad financiera —
    {
      id: 'gastosMensuales',
      label: 'Gastos mensuales',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '900000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo que gastás por mes para vivir (alquiler, comida, servicios, etc.).',
      group: 'Tu colchón',
      groupIcon: '🛟',
    },
    {
      id: 'ahorros',
      label: 'Ahorros disponibles',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '1000000',
      profileKey: 'finanzas.ahorros',
      help: 'Plata líquida a la que podés echar mano (pesos, dólares, plazo fijo).',
      group: 'Tu colchón',
    },
    {
      id: 'deudas',
      label: 'Deudas a cubrir',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      profileKey: 'finanzas.deudas',
      help: 'Deudas que vas a tener que pagar igual (tarjeta, préstamos).',
      group: 'Tu colchón',
    },
    {
      id: 'seguroDesempleoMensual',
      label: 'Seguro de desempleo ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Monto mensual estimado del seguro de desempleo de ANSES, si lo vas a cobrar.',
      group: 'Tu colchón',
    },
    {
      id: 'mesesSeguro',
      label: 'Meses de seguro',
      type: 'number',
      default: 0,
      min: 0,
      max: 12,
      advanced: true,
      help: 'Cuántos meses cobrarías el seguro (ANSES paga típicamente entre 4 y 12).',
      group: 'Tu colchón',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-indemnizacion-despido', label: 'Indemnización por despido' },
    { slug: 'calculadora-liquidacion-final-renuncia', label: 'Liquidación final' },
    { slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
    { slug: 'calculadora-vacaciones-no-tomadas-indemnizacion-formula', label: 'Vacaciones no gozadas' },
  ],
  howItWorks: `Esta sala combina el cálculo legal de la liquidación con tu situación financiera real.

1. **Indemnización por antigüedad (Art. 245).** Toma tu mejor remuneración del último año por los años computables (la fracción mayor a 3 meses suma un año). Aplica la doctrina Vizzoti si correspondiera.
2. **Preaviso, integración e indemnizaciones complementarias.** Suma el preaviso (con su SAC), la integración del mes de despido, el SAC proporcional del semestre y las vacaciones no gozadas (con su SAC). Es la liquidación completa que te tienen que pagar.
3. **Tu fondo disponible.** A la liquidación le suma tus ahorros y le resta las deudas que vas a tener que pagar igual.
4. **Meses de cobertura.** Divide tu fondo por tus gastos mensuales para decirte cuántos meses podés sostenerte sin un nuevo ingreso.
5. **Escenarios.** Muestra el aire que tenés solo con la liquidación, sumando ahorros, y sumando el seguro de desempleo de ANSES.`,
  faq: [
    {
      q: '¿Qué incluye la liquidación por despido sin causa?',
      a: 'Indemnización por antigüedad (Art. 245), preaviso y su SAC, integración del mes de despido y su SAC, SAC proporcional del semestre y vacaciones no gozadas con su SAC. Esta sala suma todos esos rubros para darte el total que te corresponde.',
    },
    {
      q: '¿Cómo se calcula la indemnización por antigüedad?',
      a: 'Es tu mejor remuneración mensual, normal y habitual del último año multiplicada por los años de antigüedad, contando como año entero toda fracción mayor a 3 meses. Si un tope de convenio reduce la base más del 33%, por el fallo Vizzoti se toma el 67% de tu sueldo.',
    },
    {
      q: '¿Cuántos meses de gastos debería tener cubiertos?',
      a: 'Lo saludable es un fondo de emergencia de al menos 6 meses de gastos. Esta sala te dice cuántos cubrís entre la liquidación, tus ahorros y el seguro de desempleo, para que sepas si podés buscar con calma o tenés que ajustar ya.',
    },
    {
      q: '¿Puedo cobrar el seguro de desempleo de ANSES?',
      a: 'Si fuiste despedido sin causa y tenías aportes en relación de dependencia, generalmente sí. Se tramita en ANSES dentro de los 90 días y se cobra por varios meses según tu antigüedad. Cargá el monto y los meses estimados para ver cuánto extiende tu aire.',
    },
    {
      q: '¿La indemnización paga Impuesto a las Ganancias?',
      a: 'La indemnización por antigüedad suele estar exenta de Ganancias hasta un tope legal. Otros rubros como vacaciones no gozadas o SAC pueden tener retenciones. Los montos de esta sala son brutos orientativos.',
    },
    {
      q: '¿Qué pasa si el despido fue "con causa"?',
      a: 'Si el despido es con causa justificada, no corresponde la indemnización por antigüedad ni el preaviso (sí los rubros ya devengados como SAC y vacaciones). Si creés que la causa es injusta, podés impugnarla: consultá con un abogado laboral antes de firmar.',
    },
    {
      q: '¿Esto reemplaza a un abogado laboral?',
      a: 'No. Es una estimación orientativa para que sepas cuánto reclamar y cuánto aguantás. Para tu caso exacto (convenio aplicable, multas por trabajo no registrado, diferencias salariales) consultá con un abogado laboral matriculado.',
    },
  ],
  sources: [
    { name: 'Ley 20.744 (LCT) — Arts. 231, 232, 233, 245', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552' },
    { name: 'CSJN — Fallo Vizzoti (tope Art. 245)', url: 'https://www.argentina.gob.ar/normativa' },
    { name: 'ANSES — Prestación por desempleo', url: 'https://www.anses.gob.ar/' },
  ],
};
