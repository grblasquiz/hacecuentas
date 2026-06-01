/**
 * Oxalatos por alimento.
 */

export interface OxalatosCalculosRenalesInputs {
  alimento: string;
  gramos: number;
}

export interface OxalatosCalculosRenalesOutputs {
  oxalatosMg: number;
  categoria: string;
  recomendacion: string;
  resumen: string;
  _chart?: any;
}

export function oxalatosCalculosRenales(inputs: OxalatosCalculosRenalesInputs): OxalatosCalculosRenalesOutputs {
  const g = Number(inputs.gramos);
  if (!g || g <= 0) throw new Error('Ingresá gramos válidos');
  const tabla: Record<string, number> = {
    'espinaca': 750, 'remolacha': 90, 'cacao': 120,
    'almendras': 120, 'ruibarbo': 570, 'te': 14,
    'batata': 50, 'papa': 15, 'lechuga': 5,
  };
  const porCien = tabla[inputs.alimento] ?? 25;
  const total = (g / 100) * porCien;
  let cat: string, rec: string;
  if (total < 10) { cat = 'Bajo ✅'; rec = 'Seguro para cálculos renales.'; }
  else if (total < 50) { cat = 'Moderado'; rec = 'Ocasional con calcio en la comida.'; }
  else if (total < 150) { cat = 'Alto ⚠️'; rec = 'Limitar a 1 vez/semana. Hervir reduce oxalatos.'; }
  else { cat = 'Muy alto 🚨'; rec = 'Evitar si cálculos activos.'; }
  const oxalatosMg = Number(total.toFixed(0));
  const chart = {
    type: 'scale' as const,
    marker: oxalatosMg,
    markerLabel: 'Tu porción: ' + oxalatosMg + ' mg',
    min: 0,
    unit: ' mg',
    segments: [
      { nombre: 'Bajo', max: 10, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderado', max: 50, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alto', max: 150, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy alto', max: Math.max(200, Math.ceil(oxalatosMg) + 20), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de oxalatos por porción: bajo, moderado, alto, muy alto.',
  };
  return {
    oxalatosMg,
    categoria: cat,
    recomendacion: rec,
    resumen: `${g}g aportan ${total.toFixed(0)} mg oxalatos (${cat}).`,
    _chart: chart,
  };
}
