export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function escaleraHuellaContrahuellaLeyBlondel(i: Inputs): Outputs {
  const H = Number(i.altura) || 0; const P = Number(i.profundidad) || 0;
  const nEscalones = Math.ceil(H / 18);
  const c = H / nEscalones; const h = P / nEscalones;
  const blondel = h + 2 * c;

  // --- Insight narrativo ---
  const enRango = blondel >= 62 && blondel <= 64;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (enRango) {
    insightText = `Con **${nEscalones} escalones** de huella **${h.toFixed(1)} cm** y contrahuella **${c.toFixed(1)} cm**, el valor de Blondel da **${blondel.toFixed(1)} cm**: dentro del rango cómodo de **62–64 cm**. Es una escalera segura y de paso natural.`;
    insightTone = 'good';
    insightIcon = '✅';
  } else if (blondel < 62) {
    insightText = `El valor de Blondel da **${blondel.toFixed(1)} cm**, por debajo del rango cómodo de **62–64 cm**: la escalera queda corta y empinada, cansa al subir. Probá reducir la contrahuella (${c.toFixed(1)} cm) o agrandar la huella.`;
    insightTone = 'warn';
    insightIcon = '📐';
  } else {
    insightText = `El valor de Blondel da **${blondel.toFixed(1)} cm**, por encima del rango cómodo de **62–64 cm**: el paso queda demasiado largo y forzado. Probá agregar un escalón o reducir la huella (${h.toFixed(1)} cm).`;
    insightTone = 'warn';
    insightIcon = '📐';
  }
  const _insight = {
    title: 'Comodidad según Blondel',
    text: insightText,
    tone: insightTone,
    icon: insightIcon,
  };

  // --- Gráfico: dónde cae el valor de Blondel respecto al rango ideal ---
  const _chart = {
    type: 'scale',
    marker: Math.round(blondel * 10) / 10,
    markerLabel: `${blondel.toFixed(1)} cm`,
    min: 50,
    segments: [
      { nombre: 'Empinada', max: 62, color: '#f97316', colorDark: '#ea580c' },
      { nombre: 'Ideal', max: 64, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Forzada', max: Math.max(76, Math.ceil(blondel) + 2), color: '#f97316', colorDark: '#ea580c' },
    ],
    ariaLabel: `Ley de Blondel: el valor ${blondel.toFixed(1)} cm frente al rango ideal de 62 a 64 cm.`,
  };

  return {
    escalones: nEscalones.toString(), huella: h.toFixed(1), contrahuella: c.toFixed(1),
    resumen: `${nEscalones} escalones: huella ${h.toFixed(0)} cm, contrahuella ${c.toFixed(0)} cm. Blondel: ${blondel.toFixed(0)} ${blondel >= 62 && blondel <= 64 ? '✓' : '(ajustar)'}.`,
    _insight, _chart
  };
}
