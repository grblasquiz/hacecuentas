/**
 * Sala de decisión — "¿Cuánto sueldo necesito para mantener mi nivel de vida?"
 *
 * Patrón OBJETIVO INVERSO. Toma tus gastos actuales, los proyecta con inflación a
 * un año y busca (por bisección sobre sueldoAR) el sueldo BRUTO cuyo NETO en mano
 * alcanza a cubrir esos gastos actualizados. Responde el bruto que tenés que pedir
 * o ganar para no perder poder adquisitivo.
 */

import { sueldoAR } from '../formulas/sueldo-ar';
import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num, bool } from './types';

function neto(bruto: number, conyuge: boolean, hijos: number): number {
  if (!bruto || bruto <= 0) return 0;
  return sueldoAR({ bruto, conyuge, hijos }).neto;
}

/** Bruto cuyo neto ≈ targetNeto (sueldoAR es monótona creciente). */
function brutoDesdeNeto(targetNeto: number, conyuge: boolean, hijos: number): number {
  if (targetNeto <= 0) return 0;
  let lo = targetNeto; // bruto ≥ neto
  let hi = targetNeto * 2.5; // techo holgado
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (neto(mid, conyuge, hijos) < targetNeto) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

function compute(inputs: Record<string, any>): DecisionResult {
  const gastos = Math.max(0, num(inputs.gastosActuales));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));
  const conyuge = bool(inputs.conyuge);
  const hijos = Math.max(0, Math.min(10, num(inputs.hijos)));

  if (!gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tus gastos mensuales actuales y la inflación anual esperada. Calculamos el sueldo bruto que necesitás para mantener tu nivel de vida dentro de un año.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Sueldo bruto necesario' },
      scenarios: [],
      nextActions: [
        'Cargá tus **gastos mensuales actuales** (lo que gastás hoy para vivir).',
        'Indicá la **inflación anual esperada** y tu situación familiar.',
      ],
    };
  }

  // Gastos proyectados a 12 meses por inflación.
  const gastosActualizados = gastos * (1 + inflacionAnual / 100);
  // El neto tiene que cubrir esos gastos → buscamos el bruto.
  const brutoNecesario = brutoDesdeNeto(gastosActualizados, conyuge, hijos);
  const netoResultante = neto(brutoNecesario, conyuge, hijos);
  const det = brutoNecesario > 0 ? sueldoAR({ bruto: brutoNecesario, conyuge, hijos }) : null;

  // Bruto necesario para mantener gastos de HOY (sin inflación), como referencia.
  const brutoHoy = brutoDesdeNeto(gastos, conyuge, hijos);

  // Escenarios: distintas inflaciones.
  const brutoInflBaja = brutoDesdeNeto(gastos * (1 + (inflacionAnual * 0.7) / 100), conyuge, hijos);
  const brutoInflAlta = brutoDesdeNeto(gastos * (1 + (inflacionAnual * 1.3) / 100), conyuge, hijos);

  const detail = `Para cubrir tus gastos actuales (${fmtMoney(gastos)}/mes) dentro de un año, con una inflación del ${fmtPct(inflacionAnual, 0)} esos gastos pasan a ${fmtMoney(gastosActualizados)}/mes. Para que tu sueldo en mano alcance, necesitás un bruto de ${fmtMoney(brutoNecesario)}: de ahí, tras aportes y Ganancias, te quedan ${fmtMoney(netoResultante)} netos, justo para sostener tu nivel de vida.`;

  const status: DecisionResult['status'] = 'b';

  const scenarios = [
    { label: 'Mantener gastos de hoy', value: fmtMoney(brutoHoy) + ' bruto', detail: `Lo que necesitás hoy mismo para cubrir ${fmtMoney(gastos)} netos, sin proyectar inflación.` },
    { label: `Con inflación ${fmtPct(inflacionAnual, 0)}`, value: fmtMoney(brutoNecesario) + ' bruto', detail: `Para mantener tu nivel de vida dentro de un año.` },
    { label: 'Si la inflación es mayor', value: fmtMoney(brutoInflAlta) + ' bruto', detail: `Si los precios suben un 30% más de lo previsto (${fmtPct(inflacionAnual * 1.3, 0)}).` },
  ];

  const breakdown = [
    { label: 'Gastos actuales (mensual)', value: fmtMoney(gastos) },
    { label: `Gastos en 1 año (inflación ${fmtPct(inflacionAnual, 0)})`, value: fmtMoney(gastosActualizados) },
    { label: 'Neto en mano necesario', value: fmtMoney(netoResultante), hint: 'tiene que cubrir los gastos actualizados' },
    { label: 'Aportes (17% topeado)', value: det ? fmtMoney(det.aportes) : '—' },
    { label: 'Impuesto a las Ganancias', value: det ? fmtMoney(det.ganancias) : '—' },
    { label: 'Sueldo BRUTO necesario', value: fmtMoney(brutoNecesario), hint: `${det ? fmtPct(det.porcentajeDescuento, 0) : ''} se va en descuentos` },
  ];

  const nextActions = [
    `Tu objetivo de ingreso es **${fmtMoney(brutoNecesario)} brutos**: con eso mantenés tu nivel de vida frente a una inflación del ${fmtPct(inflacionAnual, 0)}. Si negociás aumento, ese es el piso a pedir.`,
    `Hoy, para cubrir tus gastos actuales sin proyectar, alcanza con ${fmtMoney(brutoHoy)} brutos. La diferencia con el objetivo es lo que la inflación te obliga a recuperar en el año.`,
    'Si tu sueldo no llega a ese bruto, la salida es **recortar gastos no esenciales** o sumar ingresos: el poder adquisitivo se defiende por los dos lados.',
    'Revisá tu situación familiar (cónyuge e hijos): cambia las deducciones de Ganancias y, por lo tanto, el bruto necesario para un mismo neto.',
  ];

  const notes = [
    'El neto se calcula con aportes personales del 17% (topeados en la base imponible máxima, Ley 24.241) y la escala de Ganancias 2026 con deducciones por cónyuge e hijos (ARCA). Es la misma lógica de nuestra calculadora de sueldo en mano.',
    'Proyectamos tus gastos por la inflación que cargás. Si tus consumos suben distinto al IPC general (por ejemplo, mucho alquiler), ajustá el número.',
    'No es asesoramiento financiero ni laboral. Es una estimación orientativa para fijar un objetivo de ingreso; para tu caso impositivo exacto consultá con un contador matriculado.',
  ];

  return {
    status,
    verdict: { title: `Necesitás ${fmtMoney(brutoNecesario)} brutos para no perder poder adquisitivo`, detail, tone: 'good', badge: 'Objetivo de sueldo' },
    decisiveNumber: {
      value: fmtMoney(brutoNecesario),
      label: 'Sueldo bruto necesario en 1 año',
      sub: `Te deja **${fmtMoney(netoResultante)}** netos, justo para cubrir tus gastos actualizados por inflación.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-sueldo-para-mantener-mi-nivel-de-vida',
  title: '¿Cuánto sueldo necesito para mantener mi nivel de vida? 2026',
  h1: '¿Cuánto sueldo necesito para mantener mi nivel de vida?',
  description:
    'Calculá el sueldo bruto que necesitás para que tu neto en mano cubra tus gastos proyectados por inflación. Considera aportes, Ganancias y tu situación familiar. El número exacto a pedir en tu próxima negociación.',
  intro:
    'La inflación te obliga a ganar más solo para quedarte igual. Esta sala toma tus gastos de hoy, los proyecta un año con la inflación esperada y calcula —por dentro, con la escala real de Ganancias— el sueldo bruto que necesitás para que tu neto en mano cubra esos gastos. Es el objetivo concreto de ingreso para no perder poder adquisitivo.',
  icon: '📊',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    gastosActuales: 950000,
    inflacionAnual: 30,
    conyuge: 'no',
    hijos: 0,
  },
  fields: [
    { id: 'gastosActuales', label: 'Tus gastos mensuales actuales', type: 'number', prefix: '$', required: true, min: 0, placeholder: '950000', profileKey: 'gastos.recurrentesMensual', help: 'Todo lo que gastás hoy por mes para sostener tu nivel de vida.', group: 'Tu nivel de vida', groupIcon: '🏠' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', required: true, min: 0, max: 500, placeholder: '30', help: 'Cuánto esperás que suban los precios en un año.', group: 'Tu nivel de vida' },
    { id: 'conyuge', label: 'Cónyuge a cargo', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }], help: 'Afecta la deducción de Ganancias.', group: 'Tu situación', groupIcon: '👨‍👩‍👧' },
    { id: 'hijos', label: 'Hijos a cargo', type: 'select', default: '0', options: [{ value: '0', label: 'No tengo' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5 o más' }], help: 'Afecta la deducción de Ganancias.', group: 'Tu situación' },
  ],
  compute,
  componentCalcs: [
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-sueldo-bruto-desde-neto', label: 'Sueldo bruto desde el neto' },
    { slug: 'calculadora-impuesto-ganancias-sueldo', label: 'Impuesto a las Ganancias' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala trabaja al revés que una calculadora de sueldo: parte de tus gastos y llega al bruto.

1. **Tus gastos de hoy.** Toma lo que gastás por mes para mantener tu nivel de vida actual.
2. **Proyección por inflación.** Actualiza esos gastos un año hacia adelante con la inflación esperada: lo que hoy cuesta $100, mañana cuesta más.
3. **El neto que necesitás.** Tu sueldo en mano (neto) tiene que alcanzar a cubrir esos gastos actualizados. Ese es el objetivo de neto.
4. **Del neto al bruto.** Por búsqueda inversa sobre la escala real de Ganancias y los aportes, encuentra el sueldo bruto cuyo neto coincide con el objetivo. Considera tu situación familiar, que cambia las deducciones.
5. **El número a pedir.** El resultado es el bruto que necesitás para no perder poder adquisitivo, con escenarios según distintas inflaciones.`,
  faq: [
    { q: '¿Por qué necesito ganar más solo para mantenerme igual?', a: 'Porque la inflación encarece tus gastos: lo que hoy cubrís con cierto sueldo, en un año cuesta más. Para sostener el mismo nivel de vida, tu ingreso tiene que crecer al menos al ritmo de la inflación; si no, perdés poder adquisitivo.' },
    { q: '¿Por qué parten del bruto y no del neto?', a: 'Porque vos negociás y cobrás en bruto, pero vivís con el neto. Como entre bruto y neto se interponen los aportes y Ganancias (que no son proporcionales), hay que hacer la cuenta inversa: a partir del neto que necesitás, encontrar el bruto correspondiente.' },
    { q: '¿Cómo calculan el neto desde el bruto?', a: 'Con aportes personales del 17% (jubilación 11%, obra social 3%, PAMI 3%, topeados en la base imponible máxima de Ley 24.241) y la escala progresiva de Ganancias 2026 con el mínimo no imponible y las deducciones por cónyuge e hijos de ARCA.' },
    { q: '¿Influye tener cónyuge o hijos?', a: 'Sí: cada carga de familia aumenta las deducciones de Ganancias, así que para un mismo neto necesitás un bruto algo menor. Por eso la sala te pide tu situación familiar.' },
    { q: '¿Qué inflación debería usar?', a: 'La que esperes para los próximos 12 meses. Podés guiarte por el REM (Relevamiento de Expectativas de Mercado) del BCRA o por la inflación interanual reciente del INDEC. Si tus consumos suben distinto al promedio, ajustá el número.' },
    { q: '¿Sirve para pedir un aumento?', a: 'Es exactamente para eso: te da el bruto mínimo que necesitás para no perder contra la inflación. Es tu piso de negociación; por encima de ese número, recién empezás a mejorar tu poder adquisitivo real.' },
    { q: '¿Y si mi sueldo no llega a ese bruto?', a: 'Tenés dos palancas: recortar gastos no esenciales (baja el neto necesario) o sumar ingresos. El poder adquisitivo se defiende por los dos lados; la sala te muestra cuánto te falta para que decidas dónde apretar.' },
    { q: '¿Esto reemplaza a un contador?', a: 'No. Es una estimación orientativa con la escala vigente de Ganancias. Para tu situación impositiva exacta (otras deducciones, pluriempleo, autónomo o monotributo) consultá con un contador público matriculado.' },
  ],
  sources: [
    { name: 'Ley 24.241 — Base imponible de aportes (SIPA)', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-24241-639' },
    { name: 'ARCA — Deducciones y escala de Ganancias 2026', url: 'https://www.arca.gob.ar/' },
    { name: 'BCRA — Relevamiento de Expectativas de Mercado (REM)', url: 'https://www.bcra.gob.ar/' },
  ],
};
