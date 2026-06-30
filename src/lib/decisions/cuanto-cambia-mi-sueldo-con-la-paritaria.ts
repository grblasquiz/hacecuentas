/**
 * Sala de decisión — "¿Cuánto cambia mi sueldo con la nueva paritaria?"
 *
 * Patrón PODER DE COMPRA. Una paritaria "de 30%" no significa que ganás 30% más
 * de verdad: hay que ver cuánto sube el NETO en mano (las sumas no remunerativas
 * descuentan distinto y mueven Ganancias) y, sobre todo, cuánto sube CONTRA la
 * inflación del período. Esta sala usa sueldoAR() para el neto y compara la suba
 * nominal con la inflación para darte la variación REAL de tu poder de compra.
 */

import { sueldoAR } from '../formulas/sueldo-ar';
import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num, bool } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const brutoActual = Math.max(0, num(inputs.sueldoBrutoActual));
  const aumentoPct = Math.max(0, num(inputs.aumentoTotal));
  const sumaNoRemun = Math.max(0, num(inputs.sumaNoRemunerativa));
  const inflacionPeriodo = Math.max(0, num(inputs.inflacionPeriodo));
  const conyuge = bool(inputs.conyuge);
  const hijos = Math.max(0, Math.min(5, num(inputs.hijos)));

  if (!brutoActual || (!aumentoPct && !sumaNoRemun)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu sueldo bruto actual y el aumento de la paritaria (porcentaje y/o suma no remunerativa). Con eso calculamos cuánto sube tu neto y si le gana a la inflación.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Variación real de tu poder de compra' },
      scenarios: [],
      nextActions: [
        'Cargá tu **sueldo bruto actual** y el **porcentaje de aumento** de la paritaria.',
        'Si hay una **suma no remunerativa**, sumala: descuenta distinto y conviene verla aparte.',
      ],
    };
  }

  // Nuevo bruto = bruto con aumento + suma no remunerativa.
  const brutoConAumento = brutoActual * (1 + aumentoPct / 100);
  const nuevoBruto = brutoConAumento + sumaNoRemun;

  // Netos en mano (aportes + Ganancias). La suma no remunerativa, en teoría, no
  // tributa aportes; como simplificación honesta la sumamos al bruto para el neto
  // y lo aclaramos en notas (el caso más común la termina "blanqueando").
  const netoActual = sueldoAR({ bruto: brutoActual, conyuge, hijos }).neto;
  const netoNuevo = sueldoAR({ bruto: nuevoBruto, conyuge, hijos }).neto;

  // Subas nominales.
  const subaNominalBrutoPct = ((nuevoBruto - brutoActual) / brutoActual) * 100;
  const subaNominalNetoPct = netoActual > 0 ? ((netoNuevo - netoActual) / netoActual) * 100 : 0;

  // Variación REAL = cuánto sube el neto descontando la inflación del período.
  // (1 + neto%) / (1 + inflación%) - 1
  const variacionReal =
    ((1 + subaNominalNetoPct / 100) / (1 + inflacionPeriodo / 100) - 1) * 100;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (variacionReal >= 2) {
    status = 'b';
    tone = 'good';
    title = 'La paritaria le gana a la inflación: mejorás en serio';
    badge = 'Ganás poder';
  } else if (variacionReal >= -2) {
    status = 'tie';
    tone = 'neutral';
    title = 'La paritaria empata la inflación: mantenés el poder de compra';
    badge = 'Empatás';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'La paritaria pierde contra la inflación: te atrasás';
    badge = 'Perdés poder';
  }
  const detail = `Tu neto pasa de ${fmtMoney(netoActual)} a ${fmtMoney(netoNuevo)}: una suba nominal de ${fmtPct(subaNominalNetoPct, 1)}. Pero con una inflación del ${fmtPct(inflacionPeriodo, 1)} en el período, tu poder de compra real ${variacionReal >= 0 ? 'sube' : 'cae'} ${fmtPct(variacionReal, 1)}. Lo que importa no es el porcentaje del titular, sino cuánto te queda contra los precios.`;

  const scenarios = [
    {
      label: 'Suba bruta nominal',
      value: fmtPct(subaNominalBrutoPct, 1),
      detail: `Tu bruto pasa de ${fmtMoney(brutoActual)} a ${fmtMoney(nuevoBruto)}${sumaNoRemun > 0 ? ` (incluye ${fmtMoney(sumaNoRemun)} no remunerativos)` : ''}.`,
    },
    {
      label: 'Suba neta (en mano)',
      value: fmtPct(subaNominalNetoPct, 1),
      detail: `Lo que de verdad cobrás: de ${fmtMoney(netoActual)} a ${fmtMoney(netoNuevo)} después de aportes y Ganancias.`,
    },
    {
      label: 'Variación real',
      value: fmtPct(variacionReal, 1),
      detail: `Tu neto vs la inflación del ${fmtPct(inflacionPeriodo, 1)}. Es tu poder de compra real.`,
    },
  ];

  const breakdown = [
    { label: 'Sueldo bruto actual', value: fmtMoney(brutoActual) },
    { label: `Aumento remunerativo (${fmtPct(aumentoPct, 1)})`, value: '+' + fmtMoney(brutoConAumento - brutoActual).replace('-', '') },
    { label: 'Suma no remunerativa', value: sumaNoRemun > 0 ? '+' + fmtMoney(sumaNoRemun) : '—' },
    { label: 'Nuevo sueldo bruto', value: fmtMoney(nuevoBruto), hint: fmtPct(subaNominalBrutoPct, 1) },
    { label: 'Neto actual (en mano)', value: fmtMoney(netoActual) },
    { label: 'Nuevo neto (en mano)', value: fmtMoney(netoNuevo), hint: fmtPct(subaNominalNetoPct, 1) },
    { label: `Inflación del período`, value: fmtPct(inflacionPeriodo, 1) },
    { label: 'Variación REAL de poder de compra', value: fmtPct(variacionReal, 1), hint: variacionReal >= 0 ? 'Le ganás a la inflación' : 'Perdés contra la inflación' },
  ];

  const nextActions = [
    `Tu poder de compra real ${variacionReal >= 0 ? 'mejora' : 'cae'} **${fmtPct(variacionReal, 1)}**. Mirá este número, no el porcentaje del titular: una paritaria "alta" puede igual hacerte perder si la inflación fue mayor.`,
    sumaNoRemun > 0
      ? `Ojo con la **suma no remunerativa** de ${fmtMoney(sumaNoRemun)}: no suele computar para aguinaldo, vacaciones ni indemnización. Pedí que se "blanquee" al básico cuanto antes.`
      : 'Si la paritaria trae sumas no remunerativas en próximos tramos, recordá que no cuentan para aguinaldo ni indemnización: conviene que pasen al básico.',
    variacionReal < 0
      ? 'Como la paritaria no alcanzó la inflación, revisá si hay **cláusula gatillo o revisión** pactada: muchas paritarias se reabren si los precios suben más de lo previsto.'
      : 'Aprovechá la mejora real para reforzar tu fondo de emergencia o ahorro antes de que la inflación se la coma.',
    'Verificá en tu recibo que el aumento esté **aplicado sobre el básico correcto** y que los adicionales (antigüedad, presentismo) se hayan recalculado sobre el nuevo valor.',
  ];

  const notes = [
    'La variación real compara la suba del neto contra la inflación del período con la fórmula (1+suba)/(1+inflación)−1, que es la forma correcta (no una resta simple).',
    'Las sumas no remunerativas, en rigor, no tributan aportes y no integran la base de aguinaldo/indemnización. Acá se suman al bruto para estimar el neto; el efecto real puede ser algo mayor en el bolsillo y conviene confirmarlo en el recibo.',
    'El neto usa aportes del 17% y la escala de Ganancias 2026. Es orientativo: tu convenio puede tener adicionales propios. No es asesoramiento, consultá tu recibo o a tu sindicato.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtPct(variacionReal, 1),
      label: 'Variación real de tu poder de compra',
      sub: `Suba neta nominal **${fmtPct(subaNominalNetoPct, 1)}** vs inflación **${fmtPct(inflacionPeriodo, 1)}**. Lo real es lo que cuenta.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cambia-mi-sueldo-con-la-paritaria',
  title: '¿Cuánto cambia mi sueldo con la nueva paritaria? Real vs inflación 2026',
  h1: '¿Cuánto cambia mi sueldo con la nueva paritaria?',
  description:
    'Calculá cuánto sube tu sueldo neto con la nueva paritaria y, sobre todo, si le gana a la inflación. Distingue suma remunerativa de no remunerativa y te da la variación real de tu poder de compra.',
  intro:
    'Una paritaria "de 30%" no significa que ganás 30% más de verdad. Hay que ver cuánto sube tu neto en mano (las sumas no remunerativas y Ganancias cambian la cuenta) y, sobre todo, cuánto sube contra la inflación del período. Esta sala calcula tu variación REAL de poder de compra: el único número que dice si mejoraste o te atrasaste.',
  icon: '🤝',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    sueldoBrutoActual: 1500000,
    aumentoTotal: 22,
    sumaNoRemunerativa: 80000,
    inflacionPeriodo: 18,
    conyuge: 'no',
    hijos: 0,
  },
  fields: [
    {
      id: 'sueldoBrutoActual',
      label: 'Tu sueldo bruto actual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoBruto',
      help: 'El bruto que cobrás hoy, antes del aumento de la paritaria.',
      group: 'Tu sueldo',
      groupIcon: '💼',
    },
    {
      id: 'aumentoTotal',
      label: 'Aumento de la paritaria',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      placeholder: '22',
      help: 'El porcentaje de aumento remunerativo (al básico) que dio la paritaria.',
      group: 'La paritaria',
      groupIcon: '🤝',
    },
    {
      id: 'sumaNoRemunerativa',
      label: 'Suma no remunerativa',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '80000',
      help: 'Monto fijo no remunerativo, si la paritaria lo incluye (no computa aguinaldo ni indemnización).',
      group: 'La paritaria',
    },
    {
      id: 'inflacionPeriodo',
      label: 'Inflación del período',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      placeholder: '18',
      help: 'Inflación acumulada del período que cubre la paritaria (IPC INDEC).',
      group: 'La paritaria',
    },
    {
      id: 'conyuge',
      label: 'Cónyuge a cargo',
      type: 'select',
      default: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Afecta la deducción de Ganancias.',
      group: 'Tu situación',
      groupIcon: '👨‍👩‍👧',
    },
    {
      id: 'hijos',
      label: 'Hijos a cargo',
      type: 'select',
      default: '0',
      options: [
        { value: '0', label: 'No tengo' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5 o más' },
      ],
      help: 'Afecta la deducción de Ganancias.',
      group: 'Tu situación',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-impuesto-ganancias-sueldo', label: 'Impuesto a las Ganancias' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
  ],
  howItWorks: `Una paritaria se mide en el neto y contra la inflación, no por el porcentaje del titular.

1. **Nuevo bruto.** Aplica el porcentaje de aumento a tu sueldo básico y le suma la suma no remunerativa, si la hay. Ese es tu nuevo bruto total.
2. **Neto en mano antes y después.** Calcula el neto con aportes (17%) y Ganancias para el sueldo viejo y el nuevo, con la misma lógica de la calculadora de sueldo en mano. La suba en mano suele diferir del porcentaje bruto.
3. **Suba nominal.** Muestra cuánto sube tu neto en porcentaje. Es la mejora "en pesos de hoy", todavía sin descontar la inflación.
4. **Variación real.** Compara la suba del neto contra la inflación del período con la fórmula correcta: (1 + suba) / (1 + inflación) − 1. Si da positivo, le ganaste a los precios; si da negativo, te atrasaste.
5. **Veredicto.** Te dice si mejorás, empatás o perdés poder de compra, y qué revisar (cláusula gatillo, blanqueo de sumas no remunerativas, recálculo de adicionales).`,
  faq: [
    {
      q: '¿Una paritaria del 30% significa que gano 30% más?',
      a: 'No necesariamente. Primero, el aumento se aplica al básico y tu neto sube distinto por los aportes y Ganancias. Segundo, lo que importa es cuánto sube contra la inflación: si los precios subieron más del 30%, en realidad perdiste poder de compra aunque el número suene alto.',
    },
    {
      q: '¿Qué es la variación real de poder de compra?',
      a: 'Es cuánto sube tu sueldo descontando la inflación. Se calcula con (1 + suba del neto) / (1 + inflación) − 1. Si tu neto sube 22% y la inflación fue 18%, tu poder de compra real sube alrededor de 3,4%, no 4%.',
    },
    {
      q: '¿Qué diferencia hay entre suma remunerativa y no remunerativa?',
      a: 'La remunerativa integra el básico: tributa aportes y suma para aguinaldo, vacaciones e indemnización. La no remunerativa es un monto fijo que (en general) no tributa aportes ni computa para esos rubros. Por eso conviene que las sumas no remunerativas se "blanqueen" al básico.',
    },
    {
      q: '¿Por qué conviene que la suma no remunerativa pase al básico?',
      a: 'Porque mientras sea no remunerativa no cuenta para tu aguinaldo, tus vacaciones ni una eventual indemnización, que se calculan sobre el sueldo remunerativo. Cuando se incorpora al básico, todos esos conceptos suben con ella.',
    },
    {
      q: '¿Qué es una cláusula gatillo?',
      a: 'Es una cláusula que reabre la paritaria si la inflación supera lo previsto, ajustando los sueldos automáticamente. Si tu paritaria quedó por debajo de la inflación, revisá si tiene cláusula gatillo o de revisión pactada.',
    },
    {
      q: '¿El aumento afecta lo que pago de Ganancias?',
      a: 'Sí. Al subir tu bruto, podés pasar a un tramo más alto de la escala de Ganancias y retener más. Por eso esta sala calcula el neto antes y después: la suba en mano puede ser algo menor que el porcentaje bruto si entrás a pagar más impuesto.',
    },
    {
      q: '¿Sirve si cobro por convenio con adicionales?',
      a: 'Sirve como estimación. Tené en cuenta que adicionales como antigüedad o presentismo se recalculan sobre el nuevo básico, así que tu aumento real puede ser un poco mayor. Verificá en el recibo que se hayan ajustado.',
    },
    {
      q: '¿Esto es asesoramiento laboral?',
      a: 'No. Es una estimación orientativa del impacto de la paritaria en tu neto y tu poder de compra. Para el detalle exacto de tu convenio consultá tu recibo, tu sindicato o un profesional matriculado.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice de Precios al Consumidor (IPC)', url: 'https://www.indec.gob.ar/' },
    { name: 'Ley 14.250 — Convenciones Colectivas de Trabajo', url: 'https://www.argentina.gob.ar/normativa' },
    { name: 'ARCA — Escala de Ganancias 2026', url: 'https://www.arca.gob.ar/' },
  ],
};
