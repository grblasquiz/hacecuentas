/**
 * Sala de decisión — "¿Puedo afrontar un crédito UVA?"
 *
 * Patrón VIVIENDA / EVALUACIÓN (¿puedo?). Calcula la cuota inicial francesa del
 * crédito, la relación cuota/ingreso (los bancos exigen <=25%) y corre un STRESS
 * propio del UVA: la cuota ajusta por inflación y tu salario por su evolución;
 * si el salario crece menos que la inflación, la relación cuota/ingreso EMPEORA
 * con el tiempo. Devuelve si podés, con qué colchón, y cuánto se deteriora.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

/** Cuota francesa mensual. V = capital, tna en %, n = meses. */
function cuotaFrancesa(V: number, tnaPct: number, nMeses: number): number {
  if (V <= 0 || nMeses <= 0) return 0;
  const i = tnaPct / 12 / 100;
  if (i === 0) return V / nMeses;
  return (V * i) / (1 - Math.pow(1 + i, -nMeses));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const valor = Math.max(0, num(inputs.valorPropiedad));
  const anticipo = Math.max(0, num(inputs.anticipo));
  const tnaUVA = Math.max(0, num(inputs.tnaUVA));
  const plazoAnios = Math.max(0, num(inputs.plazoAnios));
  const ingreso = Math.max(0, num(inputs.ingresoFamiliar));
  const inflacion = Math.max(0, num(inputs.inflacionAnual));
  const evolucionSalarial = Math.max(0, num(inputs.evolucionSalarialAnual));

  if (!valor || !plazoAnios || !ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el valor de la propiedad, el plazo del crédito y tu ingreso familiar. Con eso calculamos la cuota inicial y la relación cuota/ingreso que miran los bancos.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Relación cuota/ingreso' },
      scenarios: [],
      nextActions: [
        'Cargá el **valor de la propiedad**, el **anticipo** y el **plazo** del crédito.',
        'Cargá tu **ingreso familiar neto** para ver la relación cuota/ingreso que exigen los bancos.',
      ],
    };
  }

  const monto = Math.max(0, valor - anticipo);
  const cuotaInicial = cuotaFrancesa(monto, tnaUVA, plazoAnios * 12);
  const relacionInicial = ingreso > 0 ? (cuotaInicial / ingreso) * 100 : 0;

  // — Stress UVA: cuota ajusta por inflación, salario por evolución —
  const factorInfl = (meses: number) => Math.pow(1 + inflacion / 100, meses / 12);
  const factorSal = (meses: number) => Math.pow(1 + evolucionSalarial / 100, meses / 12);
  const relacionEn = (meses: number) => {
    const cuota = cuotaInicial * factorInfl(meses);
    const salario = ingreso * factorSal(meses);
    return salario > 0 ? (cuota / salario) * 100 : 0;
  };
  const relacion12 = relacionEn(12);
  const relacion24 = relacionEn(24);

  // Ingreso recomendado para entrar holgado (cuota <=25%).
  const ingresoRecomendado = cuotaInicial / 0.25;
  const colchon = ingreso - ingresoRecomendado; // + => tenés margen

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  // El peor caso es la relación proyectada a 24 meses (si la cuota se despega).
  const relacionPeor = Math.max(relacionInicial, relacion24);

  if (relacionInicial <= 25 && relacionPeor <= 30) {
    status = 'b'; // bien
    tone = 'good';
    title = 'Sí, podés afrontar el crédito';
    badge = 'Podés';
    detail = `La cuota inicial de ${fmtMoney(cuotaInicial)} es el ${relacionInicial.toFixed(0)}% de tu ingreso, dentro del 25% que exigen los bancos. Aun proyectando el stress UVA, en 24 meses la relación llega al ${relacion24.toFixed(0)}%: manejable. Tenés ${fmtMoney(Math.max(0, colchon))} de colchón mensual.`;
  } else if (relacionInicial <= 30 || (relacionInicial <= 25 && relacionPeor <= 38)) {
    status = 'tie'; // ajustado
    tone = 'warn';
    title = 'Podés, pero al límite: cuidado con el UVA';
    badge = 'Ajustado';
    detail = `La cuota inicial (${fmtMoney(cuotaInicial)}) es el ${relacionInicial.toFixed(0)}% de tu ingreso. El problema es el ajuste: si la inflación (${fmtPct(inflacion)}) le gana a tu salario (${fmtPct(evolucionSalarial)}), en 24 meses la cuota trepa al ${relacion24.toFixed(0)}% de tu ingreso. Entrás justo y con poco margen para imprevistos.`;
  } else {
    status = 'a'; // riesgo
    tone = 'bad';
    title = 'Es riesgoso: la cuota se come tu ingreso';
    badge = 'Riesgoso';
    detail = `La cuota inicial es el ${relacionInicial.toFixed(0)}% de tu ingreso${relacionInicial > 25 ? ', por encima del 25% que aceptan los bancos' : ''}, y con el stress UVA llega al ${relacion24.toFixed(0)}% en 24 meses. Para entrar holgado necesitarías un ingreso de ${fmtMoney(ingresoRecomendado)} (te faltan ${fmtMoney(Math.abs(colchon))}). Subí el anticipo, estirá el plazo o esperá.`;
  }

  const scenarios = [
    {
      label: 'Hoy (cuota inicial)',
      value: relacionInicial.toFixed(0) + '%',
      detail: `Cuota de ${fmtMoney(cuotaInicial)} sobre un ingreso de ${fmtMoney(ingreso)}.`,
    },
    {
      label: 'A 12 meses (stress UVA)',
      value: relacion12.toFixed(0) + '%',
      detail: `Cuota ajustada por inflación (${fmtPct(inflacion)}) vs salario (${fmtPct(evolucionSalarial)}).`,
    },
    {
      label: 'A 24 meses (stress UVA)',
      value: relacion24.toFixed(0) + '%',
      detail:
        inflacion > evolucionSalarial
          ? 'La inflación le gana al salario: la relación empeora.'
          : 'Tu salario le sigue el ritmo a la inflación: la relación se mantiene o mejora.',
    },
  ];

  const breakdown = [
    { label: 'Monto a financiar', value: fmtMoney(monto), hint: `Valor ${fmtMoney(valor)} − anticipo ${fmtMoney(anticipo)}` },
    { label: 'Cuota inicial (sistema francés)', value: fmtMoney(cuotaInicial), hint: `TNA ${fmtPct(tnaUVA)} · ${plazoAnios} años` },
    { label: 'Relación cuota / ingreso', value: relacionInicial.toFixed(0) + '%', hint: 'Los bancos exigen ≤ 25%' },
    { label: 'Ingreso recomendado (cuota = 25%)', value: fmtMoney(ingresoRecomendado) },
    { label: 'Tu colchón mensual', value: fmtMoney(colchon), hint: colchon >= 0 ? 'Margen sobre el ingreso exigido' : 'Te falta para entrar holgado' },
    { label: 'Cuota proyectada a 24 meses', value: fmtMoney(cuotaInicial * factorInfl(24)), hint: `Relación ${relacion24.toFixed(0)}% del salario proyectado` },
  ];

  const nextActions = [
    `Apuntá a que la cuota no supere el **25% de tu ingreso**: hoy estás en ${relacionInicial.toFixed(0)}%. ${relacionInicial > 25 ? 'Subí el anticipo o estirá el plazo para bajarla.' : 'Estás dentro del límite ✓'}`,
    inflacion > evolucionSalarial
      ? `El UVA es el riesgo: tu cuota ajusta ${fmtPct(inflacion)} y tu salario ${fmtPct(evolucionSalarial)}. Dejá un **colchón** para los meses en que la inflación le gane al sueldo.`
      : 'Si tu salario le sigue el ritmo a la inflación, el UVA no es un problema; igual dejá margen por si cambia el contexto.',
    'Sumá los **gastos de escrituración** (~8% del valor): no se financian y hay que tenerlos en efectivo además del anticipo.',
    'Compará el **CFT de varios bancos**: dos puntos de TNA cambian bastante la cuota a 20 años. No te quedes con el primero.',
  ];

  const notes = [
    'La cuota se calcula con sistema francés (cuota fija en UVA). El stress proyecta la cuota por inflación y el salario por su evolución: es una simulación, no una predicción.',
    'La relación cuota/ingreso recomendada por los bancos es del 25% (algunos llegan al 30%). Por encima de eso, la aprobación es difícil y el riesgo personal alto.',
    'No incluye seguros de vida e incendio que suele exigir el banco (suman a la cuota), ni los gastos de escrituración. Confirmalos antes de decidir.',
    'No es asesoramiento financiero. Es una estimación orientativa: las condiciones reales las define cada banco. Consultá con un asesor matriculado antes de tomar un crédito a 20-30 años.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: relacionInicial.toFixed(0) + '%',
      label: 'Relación cuota / ingreso',
      sub: `Cuota inicial **${fmtMoney(cuotaInicial)}** sobre ingreso **${fmtMoney(ingreso)}**. A 24 meses con stress UVA: ${relacion24.toFixed(0)}%.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-afrontar-un-credito-uva',
  title: '¿Puedo afrontar un crédito UVA? Test de cuota e ingreso 2026',
  h1: '¿Puedo afrontar un crédito UVA?',
  description:
    'Calculá la cuota inicial de tu crédito UVA, la relación cuota/ingreso que exigen los bancos (≤25%) y un stress que proyecta cómo evoluciona la cuota frente a tu salario. Te decimos si podés, con qué colchón y cuánto se deteriora.',
  intro:
    'El crédito UVA tiene una trampa: la cuota arranca accesible pero ajusta por inflación. Si tu salario no le sigue el ritmo, la cuota se va comiendo tu ingreso. Esta sala calcula la cuota inicial, la relación cuota/ingreso que miran los bancos (tope 25%) y corre un stress que proyecta cómo evoluciona la cuota frente a tu salario a 12 y 24 meses, para decirte si de verdad podés afrontarlo.',
  icon: '🏦',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    valorPropiedad: 120000000,
    anticipo: 36000000,
    tnaUVA: 8,
    plazoAnios: 20,
    ingresoFamiliar: 2800000,
    inflacionAnual: 35,
    evolucionSalarialAnual: 30,
  },
  fields: [
    {
      id: 'valorPropiedad',
      label: 'Valor de la propiedad',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '120000000',
      help: 'Precio de la vivienda que querés comprar.',
      group: 'El crédito',
      groupIcon: '🏦',
    },
    {
      id: 'anticipo',
      label: 'Anticipo',
      type: 'number',
      prefix: '$',
      min: 0,
      default: 0,
      placeholder: '36000000',
      profileKey: 'finanzas.ahorros',
      help: 'La plata propia que aportás. El crédito cubre el resto (suele financiar hasta 75-80%).',
      group: 'El crédito',
    },
    {
      id: 'tnaUVA',
      label: 'TNA del crédito UVA',
      type: 'number',
      suffix: '%',
      default: 8,
      min: 0,
      placeholder: '8',
      help: 'Tasa nominal anual en UVA. Suele rondar 4-9% según el banco y si sos cliente.',
      group: 'El crédito',
    },
    {
      id: 'plazoAnios',
      label: 'Plazo (años)',
      type: 'number',
      required: true,
      min: 1,
      max: 40,
      default: 20,
      help: 'A más plazo, menor cuota inicial (pero más intereses totales).',
      group: 'El crédito',
    },
    {
      id: 'ingresoFamiliar',
      label: 'Ingreso familiar neto',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '2800000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'La suma de los ingresos netos del grupo familiar que presentás al banco.',
      group: 'Tu ingreso',
      groupIcon: '💵',
    },
    {
      id: 'inflacionAnual',
      label: 'Inflación anual esperada',
      type: 'number',
      suffix: '%',
      recommended: true,
      default: 35,
      min: 0,
      placeholder: '35',
      help: 'Ajusta la cuota UVA. Es la variable que define el riesgo del crédito.',
      group: 'Stress UVA',
      groupIcon: '⚠️',
    },
    {
      id: 'evolucionSalarialAnual',
      label: 'Aumento anual de tu salario',
      type: 'number',
      suffix: '%',
      recommended: true,
      default: 30,
      min: 0,
      placeholder: '30',
      help: 'Cuánto esperás que suba tu ingreso por año. Si le gana a la inflación, el UVA es seguro.',
      group: 'Stress UVA',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion', label: 'Ingreso mínimo para crédito UVA' },
    { slug: 'calculadora-hipoteca-uva-bbva-argentina', label: 'Hipoteca UVA BBVA' },
    { slug: 'calculadora-hipoteca-mensual-cuota-fija', label: 'Cuota de hipoteca' },
    { slug: 'inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala combina el cálculo de la cuota con el riesgo propio del crédito UVA.

1. **Cuota inicial.** Con el monto a financiar (valor menos anticipo), la TNA y el plazo, calcula la cuota fija del sistema francés. Es lo que pagarías el primer mes.
2. **Relación cuota / ingreso.** Divide la cuota por tu ingreso familiar. Los bancos exigen que no supere el 25% (algunos aceptan hasta 30%). Es el filtro principal de aprobación.
3. **Ingreso recomendado y colchón.** Calcula qué ingreso necesitás para que la cuota sea exactamente el 25%, y cuánto margen te queda.
4. **Stress UVA.** Acá está la clave del UVA: la cuota se ajusta por la inflación esperada y tu salario por su evolución. Proyecta la relación cuota/ingreso a 12 y 24 meses. Si la inflación le gana a tu salario, la cuota se vuelve cada vez más pesada.
5. **Veredicto.** Combina la relación inicial con la proyectada bajo stress para decirte si podés, si entrás al límite o si es riesgoso.`,
  faq: [
    {
      q: '¿Qué relación cuota/ingreso piden los bancos para un crédito UVA?',
      a: 'En general la cuota no puede superar el 25% de tu ingreso familiar neto; algunos bancos llegan al 30%. Si la cuota supera ese porcentaje, lo más probable es que el crédito no se apruebe, y aunque se apruebe el riesgo personal es alto.',
    },
    {
      q: '¿Por qué el crédito UVA es riesgoso?',
      a: 'Porque la cuota se ajusta por inflación (vía el valor de la UVA). Si tu salario sube menos que la inflación, la cuota se lleva una porción cada vez mayor de tu ingreso. El stress de esta sala muestra exactamente cuánto se deteriora la relación cuota/ingreso a 12 y 24 meses.',
    },
    {
      q: '¿Qué pasa si mi salario le gana a la inflación?',
      a: 'Entonces el UVA juega a tu favor: la cuota, medida contra tu ingreso, se vuelve más liviana con el tiempo. El crédito UVA es seguro mientras tu poder adquisitivo no se deteriore frente a la inflación.',
    },
    {
      q: '¿Cómo bajo la cuota si me da muy alta?',
      a: 'Tenés tres palancas: poner un anticipo mayor (financiás menos), estirar el plazo (baja la cuota pero pagás más intereses) o esperar a tener más ingresos. También podés buscar un banco con menor TNA.',
    },
    {
      q: '¿El anticipo es lo único que necesito en efectivo?',
      a: 'No. Además del anticipo necesitás los gastos de escrituración (alrededor del 8% del valor entre escribano, sellos e informes), que no se financian. Y el banco suele exigir seguros de vida e incendio que se suman a la cuota.',
    },
    {
      q: '¿Cuánto puedo financiar con un crédito UVA?',
      a: 'Depende del banco, pero típicamente financian hasta el 75-80% del valor de tasación. El resto sale de tu anticipo. Por eso cuanto mayor sea tu anticipo, menor es la cuota y más fácil la aprobación.',
    },
    {
      q: '¿Conviene un plazo más largo o más corto?',
      a: 'Un plazo más largo baja la cuota inicial (y ayuda a cumplir la relación del 25%), pero pagás muchos más intereses en total. Un plazo más corto sube la cuota pero te ahorra intereses. Elegí el plazo más corto que tu relación cuota/ingreso te permita sostener.',
    },
    {
      q: '¿Esto reemplaza la evaluación del banco?',
      a: 'No. Es una estimación orientativa: cada banco define sus tasas, requisitos y forma de calcular el ingreso. No es asesoramiento financiero. Consultá con tu banco y con un asesor matriculado antes de tomar un crédito a 20-30 años.',
    },
  ],
  sources: [
    { name: 'BCRA — Préstamos hipotecarios UVA', url: 'https://www.bcra.gob.ar/' },
    { name: 'BCRA — Unidad de Valor Adquisitivo (UVA)', url: 'https://www.bcra.gob.ar/' },
  ],
};
