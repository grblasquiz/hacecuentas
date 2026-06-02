export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function caloriasDeportivasBebidaIsotonica(i: Inputs): Outputs {
  const a = Number(i.azucarG) || 0;
  const kcal = a * 4;
  const pct = (a / 500) * 100;

  // Zonas de concentración de CHO (ciencia del deporte):
  // <6% hipotónica (hidrata rápido, poca energía) | 6-8% isotónica (óptima) | >8% hipertónica (enlentece el vaciado gástrico)
  let zona: string, tone: string;
  if (pct < 6) { zona = 'hipotónica'; tone = 'neutral'; }
  else if (pct <= 8) { zona = 'isotónica (óptima)'; tone = 'good'; }
  else { zona = 'hipertónica'; tone = 'warn'; }

  const pctR = Number(pct.toFixed(1));

  return {
    kcal: kcal.toFixed(0),
    choPorc: pct.toFixed(1) + '%',
    resumen: `${kcal.toFixed(0)} kcal con ${pct.toFixed(1)}% CHO (${a}g azúcar en 500ml).`,
    _insight: {
      title: 'Concentración de carbohidratos',
      text: `Con **${a} g de azúcar en 500 ml** la bebida queda al **${pct.toFixed(1)}% CHO**, una bebida **${zona}**. La franja **6-8%** es la que mejor combina hidratación y energía durante el ejercicio.`,
      tone,
      icon: '🥤',
    },
    _chart: {
      type: 'scale',
      marker: pctR,
      markerLabel: `${pct.toFixed(1)}% CHO`,
      min: 0,
      segments: [
        { nombre: 'Hipotónica', max: 6, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Isotónica', max: 8, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Hipertónica', max: Math.max(12, Math.ceil(pctR) + 1), color: '#f59e0b', colorDark: '#d97706' },
      ],
      ariaLabel: `Concentración de carbohidratos de ${pct.toFixed(1)}% sobre escala de bebida deportiva (hipotónica, isotónica, hipertónica)`,
    },
  };
}
