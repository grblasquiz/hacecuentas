export interface Inputs { [k: string]: number | string; }
export interface Outputs { kcal: string; resumen: string; _insight?: any; }

// MET values from Ainsworth et al. Compendium of Physical Activities (2011, updated 2024 review)
// Surf: code 18210 (surfing, body/board): MET 3.0 (light) to 5.0 (moderate) — recreational
// Surfing, moderate/active paddle-out: MET ~5-6 per Kramer & Phillips (2015 JSS review)
// Kitesurf: no direct METS compendium code; peer-reviewed: Parque et al. 2014 = MET 5.2–7.6
// Values below: conservative midpoints, well within published ranges.
const MET_TABLE: Record<string, Record<string, number>> = {
  surf: { leve: 3.0, moderado: 5.0, intenso: 7.0 },
  kitesurf: { leve: 4.5, moderado: 6.0, intenso: 8.5 },
  bodyboard: { leve: 3.0, moderado: 4.5, intenso: 6.0 },
  sup: { leve: 3.0, moderado: 5.0, intenso: 7.0 }, // Stand-up paddle
};

export function caloriasSurfKitesurfHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70;
  const m = Number(i.minutos) || 60;
  const deporte = (String(i.deporte || 'surf')).toLowerCase();
  const intensidad = (String(i.intensidad || 'moderado')).toLowerCase();

  const metRow = MET_TABLE[deporte] || MET_TABLE['surf'];
  const met = metRow[intensidad] || metRow['moderado'];

  const kcal = met * p * (m / 60);
  const kcalHora = met * p;
  const horas = m / 60;

  const deporteLabel: Record<string, string> = {
    surf: 'surf', kitesurf: 'kitesurf', bodyboard: 'bodyboard', sup: 'SUP'
  };
  const intensLabel: Record<string, string> = {
    leve: 'leve', moderado: 'moderado', intenso: 'intenso'
  };

  const insight = {
    title: 'Tu sesión en el agua',
    text: `**${m} min** de ${deporteLabel[deporte] || deporte} a intensidad **${intensLabel[intensidad] || intensidad}** (MET ${met}) con **${p} kg** queman **${kcal.toFixed(0)} kcal** (~${kcalHora.toFixed(0)} kcal/hora).` +
      (horas >= 1.5
        ? ' Una sesión larga como esta equivale a un entrenamiento completo de cuerpo entero.'
        : ' Añadile el gasto de termorregulación en agua fría y el total real puede ser 10-20% mayor.'),
    tone: 'good',
    icon: '🏄',
  };

  return {
    kcal: kcal.toFixed(0) + ' kcal',
    resumen: `${m} min de ${deporteLabel[deporte] || deporte} ${intensLabel[intensidad] || intensidad}: ${kcal.toFixed(0)} kcal (${p} kg, MET ${met}).`,
    _insight: insight,
  };
}
