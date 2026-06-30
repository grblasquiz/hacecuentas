/**
 * Sala de decisión — "¿Cuánto aumento tengo que pedir?"
 *
 * Patrón NEGOCIACIÓN. La trampa clásica es pedir "un número" sin anclar en la
 * inflación acumulada desde tu último aumento. Esta sala calcula tres cifras:
 *   - recuperación mínima (lo que perdiste contra la inflación) → para no atrasarte,
 *   - razonable (recuperación + valor por más responsabilidades) → el pedido,
 *   - ideal (razonable + tu objetivo de mejora real) → el techo de negociación.
 * Todo en % y en $ sobre tu bruto, para que entres a la charla con números.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

/** Puntos extra de pedido según cuánto cambió tu rol. */
const RESP_PTS: Record<string, number> = { no: 0, algo: 5, muchas: 12 };

function compute(inputs: Record<string, any>): DecisionResult {
  const sueldo = Math.max(0, num(inputs.sueldoBrutoActual));
  const meses = Math.max(0, Math.min(36, num(inputs.mesesDesdeUltimoAumento)));
  const inflMensual = Math.max(0, num(inputs.inflacionMensualProm));
  const respKey = String(inputs.cambioResponsabilidades || 'no');
  const objetivo = Math.max(0, num(inputs.objetivoMejoraReal));

  if (!sueldo || !meses || !inflMensual) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu sueldo bruto actual, hace cuántos meses fue tu último aumento y la inflación mensual promedio del período. Con eso calculamos cuánto deberías pedir para no atrasarte.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Aumento razonable a pedir' },
      scenarios: [],
      nextActions: [
        'Cargá tu **sueldo bruto actual** y **hace cuántos meses** fue tu último aumento.',
        'Sumá la **inflación mensual promedio** del período para anclar el pedido en datos, no en intuición.',
      ],
    };
  }

  // Inflación acumulada desde el último aumento (interés compuesto mensual).
  const inflAcum = Math.pow(1 + inflMensual / 100, meses) - 1; // fracción
  const recuperacionPct = inflAcum * 100; // lo que perdiste vs inflación
  const respPts = RESP_PTS[respKey] ?? 0;
  const razonablePct = recuperacionPct + respPts;
  const idealPct = razonablePct + objetivo;

  const montoDe = (pct: number) => sueldo * (1 + pct / 100);
  const sueldoRecup = montoDe(recuperacionPct);
  const sueldoRazonable = montoDe(razonablePct);
  const sueldoIdeal = montoDe(idealPct);

  // — Veredicto — el "razonable" es el número que llevás a pedir.
  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (recuperacionPct >= 30) {
    status = 'a';
    tone = 'warn';
    title = 'Te atrasaste fuerte: el pedido es para recuperar, no para mejorar';
    badge = 'Muy atrasado';
  } else if (recuperacionPct >= 12) {
    status = 'tie';
    tone = 'neutral';
    title = 'Estás atrasado contra la inflación: corresponde pedir';
    badge = 'Atrasado';
  } else {
    status = 'b';
    tone = 'good';
    title = 'Estás cerca de la inflación: podés enfocarte en mejorar el real';
    badge = 'Al día';
  }
  const detail = `Desde tu último aumento la inflación acumuló ${fmtPct(recuperacionPct, 1)}: ese es el piso solo para no perder poder de compra. Sumando ${respPts > 0 ? `el valor de tus nuevas responsabilidades (+${respPts} pts) ` : ''}el pedido razonable es ${fmtPct(razonablePct, 1)} (llegás a ${fmtMoney(sueldoRazonable)}). Si querés además mejorar en serio, apuntá a ${fmtPct(idealPct, 1)} (${fmtMoney(sueldoIdeal)}).`;

  const scenarios = [
    {
      label: 'Recuperación mínima',
      value: fmtPct(recuperacionPct, 1),
      detail: `Solo empatar la inflación de ${meses} meses → ${fmtMoney(sueldoRecup)}. Debajo de esto, perdés plata.`,
    },
    {
      label: 'Razonable (tu pedido)',
      value: fmtPct(razonablePct, 1),
      detail: `Inflación + responsabilidades → ${fmtMoney(sueldoRazonable)}. Es el número con el que entrás a la charla.`,
    },
    {
      label: 'Ideal (tu techo)',
      value: fmtPct(idealPct, 1),
      detail: `Razonable + tu objetivo de mejora real → ${fmtMoney(sueldoIdeal)}. Pedí por acá para tener margen de negociación.`,
    },
  ];

  const breakdown = [
    { label: 'Sueldo bruto actual', value: fmtMoney(sueldo) },
    { label: `Inflación acumulada (${meses} meses)`, value: fmtPct(recuperacionPct, 1), hint: `${fmtPct(inflMensual, 1)} mensual promedio compuesto` },
    { label: 'Recuperación mínima', value: fmtMoney(sueldoRecup), hint: 'Solo para no atrasarte' },
    { label: `Plus por responsabilidades`, value: respPts > 0 ? `+${respPts} pts` : 'Sin cambio de rol', hint: respKey === 'muchas' ? 'Asumiste muchas tareas nuevas' : respKey === 'algo' ? 'Sumaste algunas responsabilidades' : undefined },
    { label: 'Pedido razonable', value: fmtMoney(sueldoRazonable), hint: fmtPct(razonablePct, 1) },
    { label: `Objetivo de mejora real (+${objetivo}%)`, value: objetivo > 0 ? `+${objetivo} pts` : 'Sin objetivo extra' },
    { label: 'Pedido ideal (techo)', value: fmtMoney(sueldoIdeal), hint: fmtPct(idealPct, 1) },
  ];

  const nextActions = [
    `Entrá a pedir el **número ideal (${fmtMoney(sueldoIdeal)}, ${fmtPct(idealPct, 1)})**: dejá margen para que la negociación aterrice cerca del razonable.`,
    `Anclá el pedido en datos: "desde mi último aumento la inflación fue **${fmtPct(recuperacionPct, 1)}**", no en una sensación. Es mucho más difícil de rebatir.`,
    respPts > 0
      ? `Listá por escrito las **responsabilidades nuevas** que asumiste: justifican los ${respPts} puntos por encima de la inflación.`
      : 'Si asumiste tareas nuevas, anotalas: cada responsabilidad extra justifica pedir por encima de la inflación.',
    'Pactá una **fecha de revisión** (cada 3 o 6 meses): en alta inflación, un aumento anual te deja atrasado todo el año.',
  ];

  const notes = [
    'La inflación acumulada se calcula componiendo la inflación mensual promedio por la cantidad de meses (no es una suma simple).',
    'Los puntos por responsabilidades (0 / 5 / 12) son una referencia orientativa: ajustalos según tu mercado y el valor real de las tareas nuevas.',
    'Es una guía de negociación, no asesoramiento laboral. El resultado depende de tu convenio, tu desempeño y la situación de la empresa.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtPct(razonablePct, 1),
      label: 'Aumento razonable a pedir',
      sub: `≈ ${fmtMoney(sueldoRazonable)} de sueldo. Piso para no perder: **${fmtPct(recuperacionPct, 1)}** · Techo para mejorar: **${fmtPct(idealPct, 1)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-aumento-pedir',
  title: '¿Cuánto aumento tengo que pedir? Calculadora de pedido 2026',
  h1: '¿Cuánto aumento tengo que pedir?',
  description:
    'Calculá cuánto aumento pedir según la inflación acumulada desde tu último aumento, tus nuevas responsabilidades y tu objetivo de mejora real. Tres cifras: piso, razonable e ideal, en % y en pesos.',
  intro:
    'Pedir aumento "a ojo" te deja atrasado o pidiendo de menos. Esta sala calcula tres números concretos: cuánto necesitás solo para empatar la inflación desde tu último aumento, cuánto es razonable pedir sumando tus nuevas responsabilidades, y cuál es el techo ideal si además querés mejorar tu poder de compra. Entrás a la charla con datos, no con una sensación.',
  icon: '📈',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    sueldoBrutoActual: 1500000,
    mesesDesdeUltimoAumento: 6,
    inflacionMensualProm: 3.5,
    cambioResponsabilidades: 'algo',
    objetivoMejoraReal: 8,
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
      help: 'El bruto figura arriba de los descuentos en tu recibo.',
      group: 'Tu situación',
      groupIcon: '💼',
    },
    {
      id: 'mesesDesdeUltimoAumento',
      label: 'Meses desde tu último aumento',
      type: 'number',
      required: true,
      min: 1,
      max: 36,
      placeholder: '6',
      help: 'Cuántos meses pasaron desde la última vez que te aumentaron el sueldo.',
      group: 'Tu situación',
    },
    {
      id: 'inflacionMensualProm',
      label: 'Inflación mensual promedio',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      placeholder: '3.5',
      help: 'Promedio mensual de inflación en el período (IPC INDEC). Ej: 3,5%.',
      group: 'Tu situación',
    },
    {
      id: 'cambioResponsabilidades',
      label: '¿Cambiaron tus responsabilidades?',
      type: 'select',
      default: 'no',
      options: [
        { value: 'no', label: 'No, las mismas tareas' },
        { value: 'algo', label: 'Sí, algunas nuevas' },
        { value: 'muchas', label: 'Sí, muchas más' },
      ],
      help: 'Asumir más responsabilidades justifica pedir por encima de la inflación.',
      group: 'Tu situación',
    },
    {
      id: 'objetivoMejoraReal',
      label: 'Objetivo de mejora real',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      max: 100,
      recommended: true,
      placeholder: '8',
      help: 'Cuánto querés ganar por encima de la inflación, en poder de compra real.',
      group: 'Tu situación',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
  ],
  howItWorks: `Esta sala convierte "quiero un aumento" en tres números defendibles.

1. **Recuperación mínima.** Toma la inflación mensual promedio y la compone por los meses desde tu último aumento. Ese porcentaje es lo que perdiste de poder de compra: el piso solo para no atrasarte.
2. **Valor de tus responsabilidades.** Si asumiste tareas nuevas, suma puntos por encima de la inflación (0 si no cambió nada, +5 si sumaste algunas, +12 si cambió mucho tu rol).
3. **Pedido razonable.** Recuperación + responsabilidades. Es el número con el que conviene entrar a la conversación: justo y bien fundado.
4. **Pedido ideal.** Razonable + tu objetivo de mejora real (lo que querés ganar por encima de la inflación). Es el techo: pedí por acá para que la negociación aterrice cerca del razonable.
5. **En pesos y en porcentaje.** Cada cifra se muestra como porcentaje y como sueldo resultante, para que sepas exactamente qué estás pidiendo.`,
  faq: [
    {
      q: '¿Cuánto aumento es razonable pedir?',
      a: 'Como mínimo, la inflación acumulada desde tu último aumento, para no perder poder de compra. Si además asumiste responsabilidades nuevas o querés mejorar tu salario real, conviene pedir por encima de ese piso. Esta sala te da las tres cifras: piso, razonable e ideal.',
    },
    {
      q: '¿Cómo calculo la inflación acumulada desde mi último aumento?',
      a: 'No se suman los porcentajes mensuales: se componen. Esta sala toma la inflación mensual promedio y la eleva a la cantidad de meses transcurridos. Por ejemplo, 3,5% mensual durante 6 meses acumula alrededor de 23%, no 21%.',
    },
    {
      q: '¿Por qué pedir más de lo que espero conseguir?',
      a: 'Porque casi toda negociación termina por debajo del pedido inicial. Si entrás pidiendo el número ideal, hay margen para que la contraoferta caiga cerca del razonable. Si pedís justo lo razonable, terminás por debajo.',
    },
    {
      q: '¿Cómo justifico pedir por encima de la inflación?',
      a: 'Con responsabilidades nuevas, mejoras de desempeño medibles o porque tu sueldo quedó por debajo del mercado. Anclá siempre el pedido en datos concretos (inflación acumulada, tareas que asumiste) en lugar de una sensación general.',
    },
    {
      q: '¿Cada cuánto debería pedir aumento en alta inflación?',
      a: 'Cuando la inflación es alta, un aumento anual te deja atrasado todo el año. Conviene pactar revisiones cada 3 o 6 meses. Esta sala te ayuda a ver cuánto te atrasaste según los meses transcurridos.',
    },
    {
      q: '¿Sirve si estoy bajo convenio colectivo?',
      a: 'Sirve como referencia, pero si estás en convenio tu aumento básico lo fija la paritaria. Esta sala es más útil para pedir por encima del básico (fuera de convenio o por mérito), o para chequear si la paritaria te está dejando atrasado.',
    },
    {
      q: '¿El aumento debería calcularse sobre el bruto o el neto?',
      a: 'Sobre el bruto, que es como se expresan los sueldos y los aumentos. Tené en cuenta que el neto sube algo menos por los aportes y, si pagás Ganancias, por el impuesto. Podés ver el impacto en el bolsillo con nuestra calculadora de sueldo en mano.',
    },
    {
      q: '¿Esto es asesoramiento laboral?',
      a: 'No. Es una guía orientativa para entrar a negociar con números fundados. El resultado real depende de tu convenio, tu desempeño y la situación de la empresa. Para temas legales consultá con un profesional matriculado.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice de Precios al Consumidor (IPC)', url: 'https://www.indec.gob.ar/' },
    { name: 'Ley 20.744 (LCT) — Contrato de trabajo', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552' },
  ],
};
