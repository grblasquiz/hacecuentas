/** Calculadora de Masa Molar — Σ(n × masa atómica) */
export interface Inputs { elemento1: number; cantidad1: number; elemento2?: number; cantidad2?: number; elemento3?: number; cantidad3?: number; }
export interface Outputs { masaMolar: number; composicion: string; molesEn100g: number; _insight?: any; _chart?: any; }

export function masaMolarCompuesto(i: Inputs): Outputs {
  const elems: { masa: number; cant: number }[] = [];
  if (Number(i.elemento1) > 0 && Number(i.cantidad1) > 0) elems.push({ masa: Number(i.elemento1), cant: Number(i.cantidad1) });
  if (i.elemento2 && Number(i.elemento2) > 0 && i.cantidad2 && Number(i.cantidad2) > 0) elems.push({ masa: Number(i.elemento2), cant: Number(i.cantidad2) });
  if (i.elemento3 && Number(i.elemento3) > 0 && i.cantidad3 && Number(i.cantidad3) > 0) elems.push({ masa: Number(i.elemento3), cant: Number(i.cantidad3) });
  if (elems.length === 0) throw new Error('Ingresá al menos un elemento con su masa atómica y cantidad');

  const total = elems.reduce((sum, e) => sum + e.masa * e.cant, 0);
  const composicion = elems.map((e, idx) => {
    const pct = (e.masa * e.cant / total) * 100;
    return `Elem. ${idx + 1}: ${e.cant} × ${e.masa} = ${(e.masa * e.cant).toFixed(3)} g/mol (${pct.toFixed(1)}%)`;
  }).join(' | ');

  const totalR = Number(total.toFixed(4));
  const dominante = elems.reduce((a, b) => (a.masa * a.cant >= b.masa * b.cant ? a : b));
  const pctDom = (dominante.masa * dominante.cant / total) * 100;
  const insightText = elems.length > 1
    ? `La masa molar del compuesto es **${totalR} g/mol**, sumando ${elems.length} elementos. El de masa atómica ${dominante.masa} aporta el **${pctDom.toFixed(1)}%** del peso total.`
    : `Con un solo elemento (${dominante.cant} × ${dominante.masa}), la masa molar es **${totalR} g/mol**. En 100 g hay **${Number((100 / total).toFixed(4))} moles**.`;

  return {
    masaMolar: totalR,
    composicion,
    molesEn100g: Number((100 / total).toFixed(4)),
    _insight: {
      title: 'Masa molar del compuesto',
      text: insightText,
      tone: 'neutral',
      icon: '🧪',
    },
    ...(elems.length > 1
      ? {
          _chart: {
            type: 'doughnut',
            slices: elems.map((e, idx) => ({
              label: `Elem. ${idx + 1}`,
              value: Number((e.masa * e.cant).toFixed(3)),
            })),
            prefix: '',
            centerValue: `${totalR}`,
            centerLabel: 'g/mol',
            ariaLabel: `Masa molar de ${totalR} g/mol distribuida entre ${elems.length} elementos`,
          },
        }
      : {}),
  };
}
