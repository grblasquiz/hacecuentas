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
  return {
    oxalatosMg: Number(total.toFixed(0)),
    categoria: cat,
    recomendacion: rec,
    resumen: `${g}g aportan ${total.toFixed(0)} mg oxalatos (${cat}).`,
  };
}
