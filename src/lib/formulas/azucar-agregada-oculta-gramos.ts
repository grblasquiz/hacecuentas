/**
 * Azúcar agregada: gramos → cucharaditas y % del límite OMS.
 */

export interface AzucarAgregadaOcultaGramosInputs {
  gramos: number;
  porciones: number;
}

export interface AzucarAgregadaOcultaGramosOutputs {
  azucarTotal: string;
  cucharaditas: string;
  porcentajeLimite: string;
  evaluacion: string;
  _insight?: any;
  _chart?: any;
}

export function azucarAgregadaOcultaGramos(inputs: AzucarAgregadaOcultaGramosInputs): AzucarAgregadaOcultaGramosOutputs {
  const g = Number(inputs.gramos);
  const p = Number(inputs.porciones);
  if (g < 0) throw new Error('Gramos inválidos');
  if (!p || p <= 0) throw new Error('Porciones inválidas');

  const total = g * p;
  const ctas = total / 4;
  const pct = (total / 25) * 100;

  let eval_ = '';
  if (pct < 20) eval_ = 'Bajo en azúcar ✅';
  else if (pct < 50) eval_ = 'Moderado: cuidar el total del día.';
  else if (pct < 100) eval_ = 'Alto: llegás a más de la mitad del límite diario.';
  else eval_ = 'Excede límite diario OMS ⚠️';

  const tone = pct >= 100 ? 'warn' : pct >= 50 ? 'warn' : pct >= 20 ? 'neutral' : 'good';
  const insightText = pct >= 100
    ? `Estas porciones aportan **${total.toFixed(1)} g** de azúcar (**${ctas.toFixed(1)} cucharaditas**): solas ya superan el límite diario OMS de 25 g (**${pct.toFixed(0)}%**).`
    : pct >= 50
      ? `**${total.toFixed(1)} g** (**${ctas.toFixed(1)} cucharaditas**) cubren el **${pct.toFixed(0)}%** del cupo diario OMS: más de la mitad en un solo alimento, queda poco margen para el resto del día.`
      : pct >= 20
        ? `**${total.toFixed(1)} g** equivalen a **${ctas.toFixed(1)} cucharaditas** y al **${pct.toFixed(0)}%** del límite diario OMS (25 g). Moderado: vigilá el total del día.`
        : `Solo **${total.toFixed(1)} g** (**${ctas.toFixed(1)} cucharaditas**), un **${pct.toFixed(0)}%** del límite OMS. Aporte bajo de azúcar agregada.`;

  return {
    azucarTotal: `${total.toFixed(1)} g`,
    cucharaditas: `${ctas.toFixed(1)} cucharaditas`,
    porcentajeLimite: `${pct.toFixed(0)}% del límite OMS (25 g/día)`,
    evaluacion: eval_,
    _insight: {
      title: 'Tu azúcar vs. el límite OMS',
      text: insightText,
      tone,
      icon: '🍬',
    },
    _chart: {
      type: 'scale',
      marker: Math.round(pct),
      markerLabel: `${pct.toFixed(0)}% del límite`,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: 20, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Moderado', max: 50, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Alto', max: 100, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Excede', max: Math.max(150, Math.ceil(pct) + 10), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `El azúcar de estas porciones representa ${pct.toFixed(0)}% del límite diario OMS de 25 gramos`,
    },
  };
}
