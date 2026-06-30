/**
 * Sala de decisión — "¿Me conviene estudiar esta carrera o curso?"
 *
 * Patrón ROI EDUCATIVO. Una formación cuesta dos cosas: la plata directa
 * (matrícula, materiales) y el ingreso que resignás mientras estudiás (costo de
 * oportunidad). Contra eso se pone la mejora de ingreso esperada al recibirte.
 * El número decisivo: cuántos años tardás en recuperar la inversión total.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const costoTotal = Math.max(0, num(inputs.costoTotal));
  const duracionAnios = Math.max(0, num(inputs.duracionAnios));
  const ingresoActual = Math.max(0, num(inputs.ingresoActualMensual));
  const ingresoPost = Math.max(0, num(inputs.ingresoEsperadoPostMensual));
  const empleabilidad = String(inputs.empleabilidad || 'media');

  if (!duracionAnios || !ingresoPost) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá la duración de la formación y el ingreso mensual que esperás al recibirte. Sumá el costo total y el ingreso que resignás mientras estudiás para el ROI completo.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Años para recuperar la inversión' },
      scenarios: [],
      nextActions: [
        'Cargá la **duración** (en años) y el **ingreso mensual esperado** al terminar.',
        'Sumá el **costo total** (matrícula + materiales) y el **ingreso que resignás** mientras estudiás.',
      ],
    };
  }

  // Ingreso resignado: el que dejás de ganar (parcial o total) durante la cursada.
  const ingresoResignadoTotal = ingresoActual * 12 * duracionAnios;
  const inversionTotal = costoTotal + ingresoResignadoTotal;

  // Retorno mensual = mejora de ingreso al recibirte.
  const retornoMensual = ingresoPost - ingresoActual;
  const retornoAnual = retornoMensual * 12;

  const mesesRecuperacion =
    retornoMensual > 0 ? inversionTotal / retornoMensual : Infinity;
  const aniosRecuperacion = mesesRecuperacion / 12;

  const fmtAnios = (a: number) =>
    !Number.isFinite(a)
      ? 'nunca (no mejora el ingreso)'
      : a <= 0
        ? 'de inmediato'
        : `${a.toFixed(1).replace('.', ',').replace(',0', '')} años`;

  // Factor de empleabilidad: ajusta el plazo realista (probabilidad de ejercer).
  const factorEmp =
    empleabilidad === 'alta' ? 1 : empleabilidad === 'baja' ? 1.6 : 1.25;
  const aniosAjustado = aniosRecuperacion * factorEmp;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (retornoMensual <= 0) {
    status = 'a';
    tone = 'warn';
    title = 'Por la plata, no se recupera la inversión';
    badge = 'No conviene';
    detail = `El ingreso esperado al recibirte (${fmtMoney(ingresoPost)}/mes) no supera al actual (${fmtMoney(ingresoActual)}/mes): no hay retorno económico que recupere la inversión de ${fmtMoney(inversionTotal)}. Si la hacés, que sea por vocación o por puertas que abre, no por la plata.`;
  } else if (aniosAjustado <= 5) {
    status = 'b';
    tone = 'good';
    title = 'Buena inversión: se recupera rápido';
    badge = 'Conviene';
    detail = `Te mejora el ingreso en ${fmtMoney(retornoMensual)}/mes. Recuperás la inversión total de ${fmtMoney(inversionTotal)} en ${fmtAnios(aniosRecuperacion)} (≈${fmtAnios(aniosAjustado)} ajustado por empleabilidad ${empleabilidad}). De ahí en más, es ganancia neta.`;
  } else if (aniosAjustado <= 10) {
    status = 'tie';
    tone = 'neutral';
    title = 'Conviene, pero el repago es largo';
    badge = 'A evaluar';
    detail = `Mejora tu ingreso en ${fmtMoney(retornoMensual)}/mes, pero recuperar la inversión lleva ${fmtAnios(aniosRecuperacion)} (≈${fmtAnios(aniosAjustado)} ajustado por empleabilidad ${empleabilidad}). Tiene sentido si tu horizonte laboral es largo y la formación abre otras puertas.`;
  } else {
    status = 'a';
    tone = 'warn';
    title = 'El repago es muy largo para justificarlo solo por plata';
    badge = 'Repago lento';
    detail = `El retorno (${fmtMoney(retornoMensual)}/mes) tarda ${fmtAnios(aniosRecuperacion)} en recuperar la inversión de ${fmtMoney(inversionTotal)} (≈${fmtAnios(aniosAjustado)} ajustado). Económicamente es flojo; revisá si hay opciones más cortas o baratas para el mismo objetivo.`;
  }

  const ganancia10 = retornoAnual * 10 - inversionTotal;
  const ganancia20 = retornoAnual * 20 - inversionTotal;

  const scenarios = [
    {
      label: 'Conservador',
      value: fmtAnios(aniosRecuperacion * 1.3),
      detail: 'Si el ingreso post resulta ~20% menor de lo esperado.',
    },
    {
      label: 'Probable',
      value: fmtAnios(aniosRecuperacion),
      detail: 'Con los datos que cargaste.',
    },
    {
      label: 'Ganancia a 20 años',
      value: fmtMoney(ganancia20),
      detail: 'Retorno acumulado en 20 años de carrera, ya neto de la inversión.',
    },
  ];

  const comparison = {
    columns: ['Sin estudiar', 'Estudiando'] as [string, string],
    rows: [
      {
        label: 'Ingreso mensual',
        a: fmtMoney(ingresoActual),
        b: fmtMoney(ingresoPost),
        hint: `${retornoMensual >= 0 ? '+' : ''}${fmtMoney(retornoMensual)}/mes al recibirte`,
      },
      {
        label: 'Costo directo (matrícula + materiales)',
        a: '—',
        b: '-' + fmtMoney(costoTotal).replace('-', ''),
      },
      {
        label: `Ingreso resignado (${duracionAnios} años)`,
        a: '—',
        b: '-' + fmtMoney(ingresoResignadoTotal).replace('-', ''),
        hint: 'costo de oportunidad mientras estudiás',
      },
      {
        label: 'Inversión total',
        a: '—',
        b: fmtMoney(inversionTotal),
        hint: `se recupera en ${fmtAnios(aniosRecuperacion)}`,
      },
      {
        label: 'Ganancia neta a 10 años',
        a: '$0',
        b: fmtMoney(ganancia10),
      },
    ],
  };

  const nextActions = [
    `Tu número clave: recuperás la inversión en **${fmtAnios(aniosRecuperacion)}**. Si tu vida laboral por delante es mucho mayor que eso, conviene.`,
    'No subestimes el **ingreso que resignás** mientras estudiás: suele ser el costo más grande, más que la matrícula. Si podés estudiar y trabajar a la vez, el ROI mejora muchísimo.',
    empleabilidad === 'baja'
      ? 'Marcaste **empleabilidad baja**: averiguá la tasa real de inserción y el sueldo inicial de egresados antes de invertir. El título no garantiza el ingreso esperado.'
      : 'Validá el **ingreso esperado** con egresados reales y portales de empleo, no con el folleto de la institución.',
    'Compará alternativas más cortas o baratas (cursos, certificaciones, bootcamps) que lleguen al mismo objetivo de ingreso por menos plata y tiempo.',
  ];

  const notes = [
    'La inversión total suma el costo directo más el ingreso que resignás durante la cursada (costo de oportunidad). El retorno es la mejora de ingreso al recibirte; el repago = inversión ÷ retorno mensual.',
    'El factor de empleabilidad ajusta el plazo de forma conservadora (alta ×1; media ×1,25; baja ×1,6) para reflejar que no todos consiguen el ingreso esperado al instante.',
    'No considera aumentos salariales futuros, inflación, ni el valor no económico de la formación (red de contactos, vocación, otras puertas). No es asesoramiento financiero ni educativo.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtAnios(aniosRecuperacion),
      label: 'Años para recuperar la inversión',
      sub: `Inversión total **${fmtMoney(inversionTotal)}** · mejora de ingreso **${fmtMoney(retornoMensual)}/mes**. Ajustado por empleabilidad ${empleabilidad}: ≈${fmtAnios(aniosAjustado)}.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'me-conviene-estudiar-esta-carrera',
  title: '¿Me conviene estudiar esta carrera o curso? ROI educativo 2026',
  h1: '¿Me conviene estudiar esta carrera o curso?',
  description:
    'Calculá el retorno real de una carrera o curso: cuánto cuesta (matrícula + ingreso que resignás) contra cuánto mejora tu sueldo al recibirte, y en cuántos años recuperás la inversión. Con ajuste por empleabilidad.',
  intro:
    'Estudiar es una inversión: cuesta plata y, sobre todo, el ingreso que resignás mientras lo hacés. Esta sala pone esa inversión total contra la mejora de sueldo esperada al recibirte y te dice en cuántos años la recuperás (el ROI educativo), ajustado por la empleabilidad de la carrera. Así decidís con números, no con expectativas.',
  icon: '🎓',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    costoTotal: 3000000,
    duracionAnios: 4,
    ingresoActualMensual: 600000,
    ingresoEsperadoPostMensual: 1400000,
    empleabilidad: 'alta',
  },
  fields: [
    {
      id: 'costoTotal',
      label: 'Costo total de la formación',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '3000000',
      help: 'Matrícula, cuotas, materiales y todo el gasto directo de toda la carrera o curso.',
      group: 'La inversión',
      groupIcon: '🎓',
    },
    {
      id: 'duracionAnios',
      label: 'Duración (años)',
      type: 'number',
      required: true,
      min: 0,
      max: 12,
      step: 0.5,
      placeholder: '4',
      help: 'Cuántos años dura. Para un curso de meses, poné la fracción (ej. 0,5 = medio año).',
      group: 'La inversión',
    },
    {
      id: 'ingresoActualMensual',
      label: 'Ingreso que resignás (mensual)',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '600000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'El ingreso mensual que dejás de ganar mientras estudiás (total si no trabajás, parcial si trabajás menos). Poné 0 si seguís ganando igual.',
      group: 'La inversión',
    },
    {
      id: 'ingresoEsperadoPostMensual',
      label: 'Ingreso esperado al recibirte (mensual)',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1400000',
      help: 'El sueldo neto mensual que esperás cobrar una vez recibido y ejerciendo.',
      group: 'El retorno',
      groupIcon: '📈',
    },
    {
      id: 'empleabilidad',
      label: 'Empleabilidad de la carrera',
      type: 'select',
      default: 'media',
      options: [
        { value: 'alta', label: 'Alta (sale trabajo enseguida)' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja (cuesta insertarse)' },
      ],
      help: 'Qué tan fácil es conseguir trabajo en el área. Ajusta el plazo de repago de forma realista.',
      group: 'El retorno',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala calcula el retorno de tu formación como una inversión.

1. **Inversión total.** Suma el costo directo (matrícula, cuotas, materiales) más el ingreso que resignás mientras estudiás. Ese ingreso resignado es el costo de oportunidad y suele ser el más grande.
2. **Retorno mensual.** Es la mejora de ingreso: el sueldo esperado al recibirte menos el que tenés (o tendrías) sin estudiar.
3. **Años de repago.** Divide la inversión total por el retorno mensual y lo pasa a años. Es el tiempo que tardás en recuperar todo lo invertido.
4. **Ajuste por empleabilidad.** Aplica un factor según lo fácil que sea ejercer (alta ×1, media ×1,25, baja ×1,6) para no asumir que conseguís el sueldo esperado de inmediato.
5. **Veredicto.** Conviene si recuperás la inversión bastante antes del fin de tu vida laboral. Cuanto más corto el repago y más largo tu horizonte, mejor el negocio.`,
  faq: [
    {
      q: '¿Por qué cuentan el ingreso que resigno como costo?',
      a: 'Porque es plata que dejás de ganar por estudiar: es el costo de oportunidad. Si renunciás a un sueldo de $600.000 durante 4 años, eso son casi $29 millones que no entraron. Ignorarlo hace parecer cualquier carrera más rentable de lo que es.',
    },
    {
      q: '¿Qué pasa si estudio y trabajo a la vez?',
      a: 'El ROI mejora muchísimo. Si seguís ganando lo mismo mientras estudiás, poné 0 (o el ingreso parcial que resignás) en "ingreso que resignás": la inversión se reduce al costo directo y el repago se acorta mucho.',
    },
    {
      q: '¿Cómo estimo el ingreso esperado al recibirme?',
      a: 'Con datos reales: hablá con egresados, mirá portales de empleo y sueldos de mercado para el puesto, no el folleto de la institución. Es el número más sensible del cálculo; si lo inflás, el resultado miente.',
    },
    {
      q: '¿Qué es el ajuste por empleabilidad?',
      a: 'Un factor que estira el plazo de repago según lo difícil que sea conseguir trabajo en el área. Carreras con alta inserción no se penalizan; las de baja inserción se ajustan ×1,6 porque no todos consiguen el sueldo esperado al instante.',
    },
    {
      q: '¿La sala considera los aumentos de sueldo a futuro?',
      a: 'No: trabaja con la mejora de ingreso a valores de hoy para no ser optimista de más. En la práctica, las carreras de mayor calificación suelen tener mejor trayectoria salarial, así que el repago real puede ser algo más corto.',
    },
    {
      q: '¿Sirve para cursos cortos y certificaciones?',
      a: 'Sí. Poné la duración como fracción de año (0,5 = seis meses) y el costo y la mejora de ingreso esperada. Los cursos cortos y bootcamps suelen tener ROI muy rápido justamente porque resignás poco ingreso.',
    },
    {
      q: '¿Esto reemplaza la decisión vocacional?',
      a: 'No. Mide solo el lado económico. Vocación, disfrute, prestigio, red de contactos y puertas que abre una formación tienen valor real que no entra en el número. Usá el ROI como un dato más, no como el único.',
    },
  ],
  sources: [
    { name: 'OCDE — Education at a Glance (retorno de la educación)', url: 'https://www.oecd.org/education/' },
    { name: 'INDEC — Encuesta Permanente de Hogares (ingresos por nivel educativo)', url: 'https://www.indec.gob.ar/' },
  ],
};
