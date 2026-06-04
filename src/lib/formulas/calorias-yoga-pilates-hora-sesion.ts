export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calcula calorías quemadas en yoga o pilates usando la fórmula MET
 * (Metabolic Equivalent of Task) del Compendium of Physical Activities.
 *
 * Fórmula estándar:
 *   Calorías = MET × peso_kg × duración_horas
 *
 * Fuente: 2024 Adult Compendium of Physical Activities (pacompendium.com)
 * Ainsworth BE et al. (2011) Med Sci Sports Exerc 43(8):1575-81
 */

const MET_TABLE: Record<string, { met: number; label: string }> = {
  yoga_restaurativo:  { met: 2.0,  label: 'Yoga restaurativo / Yin' },
  yoga_hatha:         { met: 3.0,  label: 'Yoga Hatha clásico' },
  yoga_vinyasa:       { met: 5.0,  label: 'Yoga Vinyasa / Power Yoga' },
  yoga_ashtanga:      { met: 5.5,  label: 'Yoga Ashtanga' },
  yoga_bikram:        { met: 6.0,  label: 'Bikram / Hot Yoga' },
  pilates_mat:        { met: 3.5,  label: 'Pilates Mat' },
  pilates_reformer:   { met: 4.5,  label: 'Pilates Reformer' },
};

export function caloriasYogaPilatesHoraSesion(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const tipo = (i.tipo as string) || 'yoga_hatha';
  const pesoKg = Math.max(30, Math.min(250, Number(i.peso_kg) || 70));
  const duracionMin = Math.max(10, Math.min(240, Number(i.duracion_min) || 60));

  const entry = MET_TABLE[tipo] ?? MET_TABLE['yoga_hatha'];
  const met = entry.met;
  const duracionHoras = duracionMin / 60;

  // Calorías = MET × peso_kg × duración_horas
  const calorias = Math.round(met * pesoKg * duracionHoras);

  // Equivalencias orientativas
  const gramosGrasaEquiv = (calorias / 7700).toFixed(0) === '0'
    ? '<1'
    : (calorias / 7700).toFixed(0);
  const minutosGrasaEquiv = parseFloat((calorias / 7700 * 1000).toFixed(0));

  // Etiqueta de intensidad
  let intensidadLabel: string;
  let intensidadLabelEn: string;
  if (met <= 2.5) {
    intensidadLabel = 'baja'; intensidadLabelEn = 'low';
  } else if (met <= 4.0) {
    intensidadLabel = 'moderada'; intensidadLabelEn = 'moderate';
  } else {
    intensidadLabel = 'alta'; intensidadLabelEn = 'high';
  }

  const nombreActividad = __lang === 'en' ? entry.label : entry.label;

  // Insight
  const _insight = __lang === 'en'
    ? {
        title: 'What this result means',
        text: `A **${duracionMin}-minute** session of **${entry.label}** (MET ${met}) burns approximately **${calorias} kcal** for a ${pesoKg} kg person — ${intensidadLabelEn}-intensity exercise. Compare: running at 10 km/h burns ~10 kcal/min, yoga/pilates burns ${(met * pesoKg / 60).toFixed(1)} kcal/min.`,
        tone: 'neutral',
        icon: '🧘',
      }
    : {
        title: 'Qué significa este resultado',
        text: `Una sesión de **${duracionMin} minutos** de **${entry.label}** (MET ${met}) quema aproximadamente **${calorias} kcal** para una persona de ${pesoKg} kg — ejercicio de intensidad ${intensidadLabel}. Referencia: correr a 10 km/h quema ~10 kcal/min; esta práctica quema ${(met * pesoKg / 60).toFixed(1)} kcal/min.`,
        tone: 'neutral',
        icon: '🧘',
      };

  if (__lang === 'en') {
    return {
      resultado: `${calorias} kcal`,
      met_valor: `MET ${met}`,
      resumen: `${calorias} kcal in ${duracionMin} min of ${entry.label} (${pesoKg} kg, MET ${met}, ${intensidadLabelEn} intensity).`,
      _insight,
    };
  }

  return {
    resultado: `${calorias} kcal`,
    met_valor: `MET ${met}`,
    resumen: `${calorias} kcal en ${duracionMin} min de ${entry.label} (${pesoKg} kg, MET ${met}, intensidad ${intensidadLabel}).`,
    _insight,
  };
}
