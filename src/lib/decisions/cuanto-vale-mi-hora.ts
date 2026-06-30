/**
 * Sala de decisión — "¿Cuánto vale realmente mi hora de trabajo?"
 *
 * Patrón DESGLOSE (1 columna). El valor hora "de folleto" (sueldo / horas
 * contratadas) miente: no cuenta las horas extra que regalás, el tiempo de
 * viaje no pago ni los gastos laborales. Esta sala calcula tu valor hora REAL
 * dividiendo el ingreso disponible (neto − gastos laborales) por TODAS las horas
 * que el trabajo te consume, y lo compara con el valor hora nominal.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

const W = 4.33; // semanas promedio por mes

function compute(inputs: Record<string, any>): DecisionResult {
  // Acepta neto directo; si no, cae al bruto como aproximación.
  const sueldoNeto = Math.max(0, num(inputs.sueldoNeto));
  const sueldoBruto = Math.max(0, num(inputs.sueldoBruto));
  const ingresoBase = sueldoNeto > 0 ? sueldoNeto : sueldoBruto;
  const usaBruto = sueldoNeto <= 0 && sueldoBruto > 0;

  const horasSemana = num(inputs.horasSemana) > 0 ? num(inputs.horasSemana) : 45;
  const minutosViajeDia = Math.max(0, num(inputs.minutosViajeDia));
  const diasOficina = Math.max(0, Math.min(7, num(inputs.diasOficina)));
  const horasExtraNoPagasSem = Math.max(0, num(inputs.horasExtraNoPagasSem));
  const gastosLaboralesMes = Math.max(0, num(inputs.gastosLaboralesMes));

  if (!ingresoBase) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu sueldo neto (o bruto) y las horas que trabajás por semana. Con eso calculamos cuánto vale realmente tu hora, contando viaje, horas extra y gastos.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Valor real de tu hora' },
      scenarios: [],
      nextActions: [
        'Cargá tu **sueldo neto** (lo que cobrás en mano) y las **horas que trabajás por semana**.',
        'Sumá el **tiempo de viaje**, las **horas extra que no te pagan** y los **gastos laborales** para ver el valor real.',
      ],
    };
  }

  // Horas mensuales: contratadas + extra no pagas + tiempo de viaje.
  const horasContratadasMes = horasSemana * W;
  const horasExtraMes = horasExtraNoPagasSem * W;
  const horasViajeMes = (minutosViajeDia / 60) * diasOficina * W;
  const horasTotalesMes = horasContratadasMes + horasExtraMes + horasViajeMes;

  // Ingreso disponible (lo que de verdad te queda del trabajo).
  const ingresoDisponible = Math.max(0, ingresoBase - gastosLaboralesMes);

  // Valor hora nominal (de folleto) vs real.
  const valorHoraNominal = horasContratadasMes > 0 ? ingresoBase / horasContratadasMes : 0;
  const valorHoraReal = horasTotalesMes > 0 ? ingresoDisponible / horasTotalesMes : 0;
  const caida = valorHoraNominal > 0 ? ((valorHoraReal - valorHoraNominal) / valorHoraNominal) * 100 : 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  // status: 'b' = sano (poca caída), 'tie' = moderada, 'a' = tu hora vale mucho menos de lo que creés.
  if (caida >= -10) {
    status = 'b';
    tone = 'good';
    title = 'Tu hora real está cerca de la nominal: bien aprovechada';
    badge = 'Sano';
  } else if (caida >= -25) {
    status = 'tie';
    tone = 'neutral';
    title = 'Tu hora real es bastante menor: revisá viaje y extras';
    badge = 'Atención';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Tu hora vale mucho menos de lo que parece';
    badge = 'Hora diluida';
  }
  const detail = `Tu valor hora "de folleto" es ${fmtMoney(valorHoraNominal)}, pero el real es ${fmtMoney(valorHoraReal)}: ${fmtPct(caida, 0)} ${caida < 0 ? 'menos' : 'más'}. La diferencia viene de las ${horasExtraMes.toFixed(0)} horas extra que no te pagan, las ${horasViajeMes.toFixed(0)} horas de viaje al mes y ${fmtMoney(gastosLaboralesMes)} de gastos laborales.${usaBruto ? ' (Cargaste el bruto; cargá el neto para mayor precisión.)' : ''}`;

  const scenarios = [
    {
      label: 'Hora nominal',
      value: fmtMoney(valorHoraNominal),
      detail: 'Sueldo dividido por las horas contratadas. Es la que figura "en el papel".',
    },
    {
      label: 'Hora real',
      value: fmtMoney(valorHoraReal),
      detail: 'Ingreso disponible dividido por TODAS las horas que el trabajo te consume.',
    },
    {
      label: 'Por día de trabajo',
      value: fmtMoney(valorHoraReal * (horasTotalesMes / (diasOficina > 0 ? diasOficina * W : 22))),
      detail: 'Cuánto te deja realmente cada día de trabajo, con todo descontado.',
    },
  ];

  const breakdown = [
    { label: usaBruto ? 'Sueldo bruto (aprox.)' : 'Sueldo neto en mano', value: fmtMoney(ingresoBase) },
    { label: '− Gastos laborales mensuales', value: '-' + fmtMoney(gastosLaboralesMes).replace('-', ''), hint: 'Transporte, comida, ropa, etc.' },
    { label: 'Ingreso disponible del trabajo', value: fmtMoney(ingresoDisponible) },
    { label: 'Horas contratadas/mes', value: horasContratadasMes.toFixed(0) + ' hs', hint: `${horasSemana} hs/sem` },
    { label: 'Horas extra no pagas/mes', value: '+' + horasExtraMes.toFixed(0) + ' hs', hint: `${horasExtraNoPagasSem} hs/sem que regalás` },
    { label: 'Horas de viaje/mes', value: '+' + horasViajeMes.toFixed(0) + ' hs', hint: `${minutosViajeDia} min × ${diasOficina} días` },
    { label: 'Horas totales que te consume', value: horasTotalesMes.toFixed(0) + ' hs' },
    { label: 'Valor hora real', value: fmtMoney(valorHoraReal), hint: `vs ${fmtMoney(valorHoraNominal)} nominal (${fmtPct(caida, 0)})` },
  ];

  const nextActions = [
    `Tu hora real es **${fmtMoney(valorHoraReal)}**. Usala para decidir si te conviene una changa, una hora extra o pagarle a alguien para que te haga una tarea: si te cobran menos que tu hora, conviene delegar.`,
    horasExtraMes > 0
      ? `Estás regalando **${horasExtraMes.toFixed(0)} horas por mes** sin pago. Eso equivale a ${fmtMoney(horasExtraMes * valorHoraNominal)} a tu valor nominal: negociá que se paguen o se compensen.`
      : 'Si empezás a hacer horas extra no pagas, volvé a esta sala: diluyen tu valor hora rápido.',
    horasViajeMes > 0
      ? `El viaje te quita **${horasViajeMes.toFixed(0)} horas al mes**. Menos días de oficina o trabajo remoto suben tu valor hora real sin que cambie el sueldo.`
      : 'Si volvés a la oficina, el tiempo de viaje va a bajar tu valor hora real: tenelo en cuenta.',
    'Compará tu valor hora real con el de proyectos freelance: si podés cobrar más por hora afuera, quizás convenga reasignar tiempo.',
  ];

  const notes = [
    'El valor hora real divide el ingreso disponible (neto menos gastos laborales) por todas las horas que el trabajo te consume: contratadas, extra no pagas y de viaje.',
    'Si cargás el bruto en vez del neto, el valor hora queda sobreestimado: lo ideal es usar lo que cobrás en mano.',
    'Es una estimación orientativa para tomar mejores decisiones de tiempo, no asesoramiento laboral ni una base para reclamos por horas extra.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(valorHoraReal),
      label: 'Valor real de tu hora',
      sub: `Nominal **${fmtMoney(valorHoraNominal)}** → real **${fmtMoney(valorHoraReal)}** (${fmtPct(caida, 0)}), contando viaje, extras y gastos.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-vale-mi-hora',
  title: '¿Cuánto vale realmente mi hora de trabajo? Calculadora 2026',
  h1: '¿Cuánto vale realmente mi hora de trabajo?',
  description:
    'Calculá tu valor hora real, no el de folleto: descontá las horas extra que no te pagan, el tiempo de viaje y los gastos laborales. Descubrí cuánto vale de verdad cada hora que le dedicás al trabajo y usalo para decidir mejor.',
  intro:
    'Dividir el sueldo por las horas contratadas da un número engañoso: no cuenta las horas extra que regalás, el viaje no pago ni los gastos de ir a trabajar. Esta sala calcula tu valor hora REAL —ingreso disponible sobre todas las horas que el trabajo te consume— y lo compara con el nominal. Es la cifra que te sirve para decidir si conviene una changa, delegar una tarea o hacer una hora extra.',
  icon: '⏱️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    sueldoNeto: 1245000,
    sueldoBruto: 0,
    horasSemana: 45,
    minutosViajeDia: 90,
    diasOficina: 5,
    horasExtraNoPagasSem: 5,
    gastosLaboralesMes: 120000,
  },
  fields: [
    {
      id: 'sueldoNeto',
      label: 'Sueldo neto (en mano)',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1245000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'Lo que cobrás en mano por mes, después de descuentos.',
      group: 'Tu ingreso',
      groupIcon: '💵',
    },
    {
      id: 'sueldoBruto',
      label: 'Sueldo bruto (si no sabés el neto)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoBruto',
      help: 'Opcional. Se usa solo si no cargás el neto (es menos preciso).',
      group: 'Tu ingreso',
    },
    {
      id: 'horasSemana',
      label: 'Horas de trabajo por semana',
      type: 'number',
      suffix: 'hs',
      default: 45,
      min: 1,
      max: 80,
      placeholder: '45',
      help: 'Las horas que figuran en tu contrato o las que trabajás habitualmente.',
      group: 'Tu tiempo',
      groupIcon: '⏱️',
    },
    {
      id: 'horasExtraNoPagasSem',
      label: 'Horas extra NO pagas por semana',
      type: 'number',
      suffix: 'hs',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '5',
      help: 'Horas que trabajás de más y no te pagan ni te compensan.',
      group: 'Tu tiempo',
    },
    {
      id: 'minutosViajeDia',
      label: 'Tiempo de viaje por día (min)',
      type: 'number',
      suffix: 'min',
      default: 0,
      min: 0,
      placeholder: '90',
      help: 'Ida y vuelta al trabajo. Es tiempo que el trabajo te consume.',
      group: 'Tu tiempo',
    },
    {
      id: 'diasOficina',
      label: 'Días de oficina por semana',
      type: 'number',
      default: 5,
      min: 0,
      max: 7,
      placeholder: '5',
      help: 'Cuántos días por semana viajás al trabajo (0 si sos 100% remoto).',
      group: 'Tu tiempo',
    },
    {
      id: 'gastosLaboralesMes',
      label: 'Gastos laborales por mes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '120000',
      help: 'Transporte, comida, ropa, herramientas: lo que gastás por trabajar.',
      group: 'Tu ingreso',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-horas-extra', label: 'Horas extra' },
    { slug: 'regla-50-30-20', label: 'Presupuesto 50/30/20' },
  ],
  howItWorks: `Tu valor hora "de folleto" no cuenta todo lo que el trabajo te saca. Esta sala calcula el real.

1. **Ingreso disponible.** Toma tu sueldo neto (lo que cobrás en mano) y le resta los gastos laborales: transporte, comida, ropa de trabajo, herramientas. Eso es lo que de verdad te queda del trabajo.
2. **Horas que el trabajo te consume.** Suma las horas contratadas, las horas extra que no te pagan y el tiempo de viaje (ida y vuelta por los días de oficina). No son solo las horas del contrato.
3. **Valor hora real.** Divide el ingreso disponible por el total de horas. Es lo que vale de verdad cada hora que le das al trabajo.
4. **Comparación con el nominal.** Muestra el valor hora "de folleto" (sueldo sobre horas contratadas) al lado del real, y cuánto cae. La brecha suele sorprender.
5. **Para qué te sirve.** Usá la hora real para decidir si conviene una changa, delegar una tarea, hacer horas extra o negociar trabajo remoto.`,
  faq: [
    {
      q: '¿Cómo se calcula el valor real de la hora de trabajo?',
      a: 'Se divide tu ingreso disponible (sueldo neto menos los gastos de trabajar) por todas las horas que el trabajo te consume: las contratadas, las horas extra que no te pagan y el tiempo de viaje. Es bastante menor que dividir el sueldo por las horas del contrato.',
    },
    {
      q: '¿Por qué mi valor hora real es más bajo que el nominal?',
      a: 'Porque el nominal usa solo las horas contratadas y el sueldo completo. El real descuenta los gastos de ir a trabajar y suma las horas extra y de viaje que no te pagan. Cuantas más horas regalás y más viajás, más cae.',
    },
    {
      q: '¿Debería usar el sueldo bruto o el neto?',
      a: 'El neto, lo que cobrás en mano. El bruto sobreestima tu hora porque incluye aportes e impuestos que no llegan a tu bolsillo. Si no sabés el neto exacto, podés cargar el bruto como aproximación, pero el resultado será optimista.',
    },
    {
      q: '¿Para qué me sirve saber mi valor hora real?',
      a: 'Para tomar mejores decisiones de tiempo: si una tarea te la hacen por menos que tu valor hora, conviene delegar; si una changa paga más por hora que tu trabajo, vale la pena; y para evaluar cuánto te cuesta realmente una hora extra no paga.',
    },
    {
      q: '¿Cuento el tiempo de viaje como hora de trabajo?',
      a: 'Sí, porque es tiempo que el trabajo te consume aunque no te lo paguen. Dos horas de viaje por día suman muchas horas al mes y diluyen tu valor hora. Trabajar remoto o reducir días de oficina lo sube sin cambiar el sueldo.',
    },
    {
      q: '¿Qué cuento como gastos laborales?',
      a: 'Todo lo que gastás por el hecho de trabajar: transporte, comida afuera, ropa o uniforme, herramientas, conectividad. Son gastos que no tendrías si no fueras a trabajar, así que se descuentan del ingreso que el trabajo realmente te deja.',
    },
    {
      q: '¿Cómo uso esto para freelancear o cobrar por proyecto?',
      a: 'Tu valor hora real es el piso para cobrar afuera: si un proyecto freelance te paga menos por hora que tu trabajo actual, no conviene. Si paga más, puede valer la pena reasignar tiempo o cambiar de esquema.',
    },
    {
      q: '¿Esto sirve como base para reclamar horas extra?',
      a: 'No. Es una herramienta orientativa para tus decisiones personales. Las horas extra tienen un cálculo legal propio (con recargos del 50% o 100%) que ves en nuestra calculadora de horas extra. Para reclamos consultá con un abogado laboral.',
    },
  ],
  sources: [
    { name: 'Ley 20.744 (LCT) — Jornada y horas extra', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552' },
    { name: 'Ley 11.544 — Jornada de trabajo', url: 'https://www.argentina.gob.ar/normativa' },
  ],
};
