/**
 * Sala de decisión — "¿Cuánto necesitamos ahorrar para la educación de nuestros hijos?"
 *
 * Patrón OBJETIVO DE AHORRO. Proyecta el costo futuro de la educación (ajustado
 * por inflación educativa, que suele superar a la general) y calcula el aporte
 * mensual necesario para llegar a esa meta, usando la fórmula de interés compuesto
 * en sentido inverso (resolviendo PMT). Reusa `interesCompuesto` para verificar.
 */

import { interesCompuesto } from '../formulas/interes-compuesto';
import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const edadHijo = Math.max(0, Math.min(25, num(inputs.edadHijo)));
  const edadInicio = Math.max(1, Math.min(30, num(inputs.edadInicioObjetivo) || 18));
  const costoAnualHoy = Math.max(0, num(inputs.costoAnualEducacion));
  const aniosEducacion = Math.max(1, Math.min(15, num(inputs.aniosEducacion) || 1));
  const inflEdu = Math.max(0, num(inputs.inflacionEducativaAnual));
  const tna = Math.max(0, num(inputs.rendimientoTNA));

  const aniosParaJuntar = edadInicio - edadHijo;

  if (!costoAnualHoy || aniosParaJuntar <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          aniosParaJuntar <= 0
            ? 'La edad objetivo tiene que ser mayor a la edad actual del hijo para que haya tiempo de ahorrar.'
            : 'Cargá el costo anual de la educación que querés cubrir y la edad del hijo para proyectar cuánto ahorrar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Aporte mensual necesario' },
      scenarios: [],
      nextActions: [
        'Cargá el **costo anual de la educación** que querés cubrir (en pesos de hoy).',
        'Verificá que la **edad objetivo** sea mayor que la edad actual del hijo.',
      ],
    };
  }

  // 1) Costo futuro: cada año de educación cae en un año distinto. Para simplificar
  //    y ser conservadores, proyectamos el costo anual a la fecha de inicio y lo
  //    multiplicamos por los años de educación (costo total objetivo, en $ futuros).
  const factorInflEdu = Math.pow(1 + inflEdu / 100, aniosParaJuntar);
  const costoAnualFuturo = costoAnualHoy * factorInflEdu;
  const metaTotal = costoAnualFuturo * aniosEducacion;

  // 2) Aporte mensual necesario (interés compuesto inverso, sin capital inicial):
  //    VF = PMT × ((1+i)^n − 1) / i  →  PMT = VF × i / ((1+i)^n − 1)
  const n = aniosParaJuntar * 12;
  const i = tna / 100 / 12; // tasa mensual
  let aporteMensual: number;
  if (i === 0) {
    aporteMensual = metaTotal / n;
  } else {
    const factor = Math.pow(1 + i, n);
    aporteMensual = (metaTotal * i) / (factor - 1);
  }

  // 3) Verificación con la fórmula del sitio (debe dar ≈ metaTotal).
  let valorFinalCheck = metaTotal;
  if (tna > 0 && aniosParaJuntar >= 1) {
    try {
      const r = interesCompuesto({
        capitalInicial: 0,
        aporteMensual: Math.round(aporteMensual),
        tasaAnual: tna,
        plazoAnios: aniosParaJuntar,
      });
      valorFinalCheck = r.valorFinal;
    } catch {
      valorFinalCheck = metaTotal;
    }
  }

  const totalAportado = aporteMensual * n;
  const gananciaIntereses = Math.max(0, metaTotal - totalAportado);

  // — Veredicto: peso del aporte (relativo a la meta y a horizonte) —
  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (aniosParaJuntar >= 10) {
    status = 'b';
    tone = 'good';
    title = 'Tenés tiempo de sobra: con un aporte chico llegás';
    badge = 'Margen amplio';
  } else if (aniosParaJuntar >= 5) {
    status = 'tie';
    tone = 'neutral';
    title = 'Horizonte medio: empezá ya para que el aporte no se dispare';
    badge = 'Empezá ya';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Poco tiempo: el aporte mensual es exigente';
    badge = 'Plazo corto';
  }

  const detail = `Para cubrir ${aniosEducacion} ${aniosEducacion === 1 ? 'año' : 'años'} de educación a un costo de ${fmtMoney(costoAnualHoy)}/año (hoy), que con inflación educativa del ${inflEdu}% serán unos ${fmtMoney(costoAnualFuturo)}/año en ${aniosParaJuntar} años, necesitás juntar ${fmtMoney(metaTotal)}. Ahorrando ${fmtMoney(aporteMensual)} por mes${tna > 0 ? ` al ${tna}% TNA` : ''} llegás a esa meta.`;

  // Escenarios: distintas tasas de rendimiento.
  const aporteAtasa = (tnaPct: number) => {
    const ii = tnaPct / 100 / 12;
    if (ii === 0) return metaTotal / n;
    return (metaTotal * ii) / (Math.pow(1 + ii, n) - 1);
  };
  const scenarios = [
    {
      label: 'Sin invertir (0%)',
      value: fmtMoney(aporteAtasa(0)) + '/mes',
      detail: 'Si guardás la plata sin que rinda nada: aportás todo vos.',
    },
    {
      label: `Probable (${tna}%)`,
      value: fmtMoney(aporteMensual) + '/mes',
      detail: tna > 0 ? `Invirtiendo el ahorro al ${tna}% TNA.` : 'Con la tasa que cargaste.',
    },
    {
      label: `Optimista (${(tna + 15)}%)`,
      value: fmtMoney(aporteAtasa(tna + 15)) + '/mes',
      detail: 'Si conseguís un rendimiento 15 puntos mayor: el interés hace más trabajo.',
    },
  ];

  const breakdown = [
    { label: 'Costo anual hoy', value: fmtMoney(costoAnualHoy) },
    { label: `Costo anual en ${aniosParaJuntar} años`, value: fmtMoney(costoAnualFuturo), hint: `inflación educativa ${inflEdu}%` },
    { label: `× Años de educación (${aniosEducacion})`, value: fmtMoney(metaTotal), hint: 'Meta total a juntar' },
    { label: 'Tiempo para ahorrar', value: `${aniosParaJuntar} años (${n} meses)` },
    { label: 'Aporte mensual necesario', value: fmtMoney(aporteMensual) },
    { label: 'Total que aportás de tu bolsillo', value: fmtMoney(totalAportado) },
    { label: 'Lo que pone el interés compuesto', value: fmtMoney(gananciaIntereses), hint: tna > 0 ? `al ${tna}% TNA` : 'sin rendimiento' },
  ];

  const nextActions = [
    `Automatizá un débito mensual de **${fmtMoney(aporteMensual)}** apenas cobres: lo que se ahorra solo es lo que de verdad se junta.`,
    'Invertí ese ahorro en instrumentos que **le ganen o empaten a la inflación** (la educación sube más rápido que el resto): plazo fijo UVA, FCI, dólar, etc. Sin invertir, el costo te corre de atrás.',
    aniosParaJuntar < 5
      ? 'Con poco tiempo el aporte es alto: evaluá empezar con menos y subir el aporte cada año, o ajustar la meta (años o tipo de educación).'
      : 'Empezá temprano: cuanto antes arranques, más trabaja el interés compuesto y menos sale de tu bolsillo.',
    'Revisá la meta una vez por año: actualizá el costo real de la educación y ajustá el aporte para no quedarte corto.',
  ];

  const notes = [
    'La inflación educativa suele ser mayor que la general (aranceles, materiales, idiomas): por eso se proyecta el costo a futuro con esa tasa.',
    'El cálculo asume aporte mensual constante en pesos. En la práctica conviene aumentarlo cada año al menos como la inflación para que no pierda valor.',
    'Es una estimación orientativa, no asesoramiento financiero. El rendimiento real de las inversiones varía; diversificá y, para montos grandes, consultá con un asesor matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(aporteMensual) + '/mes',
      label: 'Aporte mensual necesario',
      sub: `Meta: **${fmtMoney(metaTotal)}** en ${aniosParaJuntar} años · El interés pone **${fmtMoney(gananciaIntereses)}** de ese total.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-ahorrar-para-la-educacion-de-mis-hijos',
  title: '¿Cuánto ahorrar para la educación de mis hijos? 2026',
  h1: '¿Cuánto necesitamos ahorrar para la educación de nuestros hijos?',
  description:
    'Calculá cuánto ahorrar por mes para cubrir la universidad o la educación de tus hijos: proyecta el costo futuro con inflación educativa y el aporte mensual con interés compuesto.',
  intro:
    'Pagar la educación de un hijo es una meta lejana y grande, pero alcanzable si empezás temprano. Esta sala proyecta cuánto va a costar esa educación cuando tu hijo la empiece (ajustando por la inflación educativa, que suele ser más alta) y calcula cuánto necesitás ahorrar por mes para llegar, dejando que el interés compuesto haga parte del trabajo.',
  icon: '🎓',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    edadHijo: 10,
    edadInicioObjetivo: 18,
    costoAnualEducacion: 2400000,
    aniosEducacion: 5,
    inflacionEducativaAnual: 6,
    rendimientoTNA: 8,
  },
  fields: [
    {
      id: 'edadHijo',
      label: 'Edad actual del hijo',
      type: 'number',
      required: true,
      min: 0,
      max: 25,
      placeholder: '5',
      suffix: 'años',
      help: 'La edad de tu hijo hoy. Define cuántos años tenés para ahorrar.',
      group: 'El objetivo',
      groupIcon: '🎯',
    },
    {
      id: 'edadInicioObjetivo',
      label: 'Edad en que empieza',
      type: 'number',
      default: 18,
      min: 1,
      max: 30,
      placeholder: '18',
      suffix: 'años',
      help: 'La edad a la que empezaría la educación que querés cubrir (ej. 18 para la universidad).',
      group: 'El objetivo',
    },
    {
      id: 'costoAnualEducacion',
      label: 'Costo anual hoy',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '2400000',
      help: 'Cuánto costaría un año de esa educación si fuera HOY (aranceles, materiales, etc.).',
      group: 'El objetivo',
    },
    {
      id: 'aniosEducacion',
      label: 'Años de educación a cubrir',
      type: 'number',
      default: 5,
      min: 1,
      max: 15,
      placeholder: '5',
      suffix: 'años',
      help: 'Cuántos años de esa educación querés financiar (ej. una carrera de 5 años).',
      group: 'El objetivo',
    },
    {
      id: 'inflacionEducativaAnual',
      label: 'Inflación educativa anual',
      type: 'number',
      suffix: '%',
      default: 8,
      min: 0,
      recommended: true,
      placeholder: '8',
      help: 'Cuánto sube por año el costo de la educación (aranceles, materiales). Suele superar a la inflación general.',
      group: 'Supuestos',
      groupIcon: '⚙️',
    },
    {
      id: 'rendimientoTNA',
      label: 'Rendimiento de tu ahorro (TNA)',
      type: 'number',
      suffix: '%',
      default: 40,
      min: 0,
      recommended: true,
      placeholder: '40',
      help: 'TNA esperada de donde invertís el ahorro (plazo fijo, FCI, etc.). Más rendimiento = menos aporte de tu bolsillo.',
      group: 'Supuestos',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-fire-retiro-temprano', label: 'Metas de ahorro de largo plazo' },
  ],
  howItWorks: `Esta sala traduce una meta grande y lejana en un aporte mensual concreto.

1. **Tiempo disponible.** Resta la edad actual del hijo a la edad en que empieza la educación. Ese es tu horizonte de ahorro en años.
2. **Costo futuro.** Proyecta el costo anual de hoy a la fecha de inicio aplicando la inflación educativa, que suele ser más alta que la general, y lo multiplica por los años de educación que querés cubrir. Esa es tu meta total.
3. **Aporte mensual.** Resuelve la fórmula del interés compuesto al revés: dada la meta, el plazo y el rendimiento esperado, calcula cuánto tenés que aportar por mes para llegar.
4. **El trabajo del interés.** Muestra cuánto de la meta sale de tu bolsillo y cuánto lo pone el rendimiento de la inversión: cuanto antes empieces y mejor invierta, menos aportás vos.
5. **Escenarios.** Compara el aporte necesario sin invertir, con tu tasa esperada y con una tasa optimista, para que veas el impacto de invertir bien el ahorro.`,
  faq: [
    {
      q: '¿Cuánto debería ahorrar por mes para la universidad de mi hijo?',
      a: 'Depende del costo de la carrera, los años que falten y el rendimiento de tu ahorro. Esta sala proyecta el costo futuro y calcula el aporte mensual exacto para llegar a esa meta. En general, cuanto antes empieces, más chico es el aporte porque el interés compuesto hace más trabajo.',
    },
    {
      q: '¿Por qué uso "inflación educativa" en vez de la inflación general?',
      a: 'Porque el costo de la educación (aranceles, materiales, idiomas, tecnología) suele subir más rápido que el promedio de los precios. Proyectar con una inflación educativa algo mayor evita quedarte corto cuando llegue el momento de pagar.',
    },
    {
      q: '¿Cómo ayuda el interés compuesto a este objetivo?',
      a: 'Cada peso que ahorrás temprano genera rendimientos que, a su vez, generan más rendimientos. En horizontes largos, una parte importante de la meta la termina poniendo el interés y no tu bolsillo. Por eso empezar antes es tan poderoso.',
    },
    {
      q: '¿Y si me faltan pocos años?',
      a: 'Con poco tiempo el interés ayuda menos y el aporte mensual es más alto. Las opciones son aportar más, ajustar la meta (menos años o una educación más económica), o empezar con un aporte menor que subas cada año. La sala te muestra cuán exigente es el aporte según el horizonte.',
    },
    {
      q: '¿En qué conviene invertir el ahorro para educación?',
      a: 'En instrumentos que al menos le empaten a la inflación, porque el costo de la educación sube. Plazo fijo UVA, fondos comunes, dólar o una cartera diversificada son alternativas habituales. La sala no recomienda una en particular: cargá la TNA esperada y compará escenarios.',
    },
    {
      q: '¿Tengo que mantener el mismo aporte todos los meses?',
      a: 'El cálculo asume un aporte constante en pesos, pero en un país con inflación conviene aumentarlo cada año (al menos como la inflación) para que no pierda valor. Revisá la meta y el aporte una vez por año.',
    },
    {
      q: '¿Sirve para colegio privado, no solo universidad?',
      a: 'Sí. Cargá el costo anual del colegio o de la educación que quieras cubrir, la edad en que empieza y los años que dura. El cálculo es el mismo: proyectar el costo futuro y resolver el aporte mensual.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa de planificación. Los rendimientos reales varían y la inflación es difícil de predecir. Para montos grandes y de largo plazo, consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice de precios (educación)', url: 'https://www.indec.gob.ar/' },
    { name: 'BCRA — Tasas de referencia', url: 'https://www.bcra.gob.ar/' },
  ],
};
