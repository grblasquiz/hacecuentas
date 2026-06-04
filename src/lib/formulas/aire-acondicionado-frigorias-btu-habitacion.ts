export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Air conditioning sizing calculator — Cooling load method used in Argentina.
 * Formula: (largo × ancho × alto × 50) + (personas × 150) + (watts_artefactos × 0.86)
 * Then apply correction factors for solar orientation and insulation.
 * Sources: Climadesign AR, Climastore AR, Carrier Argentina, industry standard HVAC practice.
 * 1 frigoría (kcal/h) = 3.968 BTU/h
 */

export function aireAcondicionadoFrigoriasBtuHabitacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const largo = Math.max(0, Number(i.largo) || 0);
  const ancho = Math.max(0, Number(i.ancho) || 0);
  const alto  = Math.max(0, Number(i.alto)  || 2.6);
  const personas    = Math.max(0, Number(i.personas) || 0);
  const watts       = Math.max(0, Number(i.watts)    || 0);
  const orientacion = String(i.orientacion || 'sur');
  const aislacion   = String(i.aislacion   || 'media');
  const ultimoPiso  = String(i.ultimo_piso  || 'no');

  // Base thermal load: volume × 50 (kcal/h·m³ coefficient)
  const baseVolumen = largo * ancho * alto * 50;

  // Occupant heat: 150 frigorías per person
  const cargaPersonas = personas * 150;

  // Appliance heat: watts × 0.86 (1 W = 0.86 kcal/h)
  const cargaWatts = watts * 0.86;

  let frigorias = baseVolumen + cargaPersonas + cargaWatts;

  // Orientation correction (solar exposure)
  let factorOrientacion = 1.0;
  if (orientacion === 'oeste')  factorOrientacion = 1.20;   // West: strongest afternoon sun
  else if (orientacion === 'norte') factorOrientacion = 1.15; // North: high solar gain (southern hemisphere)
  else if (orientacion === 'este')  factorOrientacion = 1.10; // East: morning sun
  else                              factorOrientacion = 1.00; // South: minimal direct sun

  frigorias *= factorOrientacion;

  // Insulation correction
  let factorAislacion = 1.0;
  if (aislacion === 'mala')       factorAislacion = 1.20;  // Old building, no insulation
  else if (aislacion === 'buena') factorAislacion = 0.90;  // Modern, well-insulated
  else                            factorAislacion = 1.00;  // Average / standard

  frigorias *= factorAislacion;

  // Top-floor penalty (exposed roof)
  if (ultimoPiso === 'si') {
    frigorias *= 1.18; // +18% for direct roof solar gain
  }

  // Round to nearest whole number
  frigorias = Math.round(frigorias);

  // Convert to BTU/h: 1 frigoria = 3.968 BTU/h
  const btu = Math.round(frigorias * 3.968);

  // If no real input, return zeros without a split recommendation
  if (frigorias <= 0) {
    const emptyInsight = {
      title: __lang === 'en' ? 'Sizing result' : 'Resultado de dimensionamiento',
      text: __lang === 'en'
        ? 'Enter your room dimensions to get a recommendation.'
        : 'Ingresá las dimensiones del ambiente para obtener una recomendación.',
      tone: 'neutral',
      icon: '❄️',
    };
    return { resultado: '0', frigorias: '0', btu: '0', resumen: '', _insight: emptyInsight };
  }

  // Recommend nearest commercial split size available in Argentina
  const comerciales = [2600, 3200, 3500, 4500, 5500, 7500, 9000];
  let splitRecomendado = comerciales.find(c => c >= frigorias) ?? comerciales[comerciales.length - 1];

  // BTU of recommended split
  const splitBtu = Math.round(splitRecomendado * 3.968);

  // Insight tone
  const diff = splitRecomendado - frigorias;
  const pctMargen = Math.round((diff / frigorias) * 100);

  const tono = diff > frigorias * 0.3 ? 'warning' : 'positive';
  const insightIcon = diff > frigorias * 0.3 ? '⚠️' : '✅';

  let resumen: string;
  let insightTitle: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen = `Cooling load: ${frigorias.toLocaleString()} frigorías (${btu.toLocaleString()} BTU/h). Recommended split: ${splitRecomendado.toLocaleString()} frig (${splitBtu.toLocaleString()} BTU/h) — ${pctMargen}% safety margin.`;
    insightTitle = 'Sizing result';
    insightText = `Your room needs **${frigorias.toLocaleString()} frigorías** (${btu.toLocaleString()} BTU/h). The nearest commercial split is **${splitRecomendado.toLocaleString()} frig** (${splitBtu.toLocaleString()} BTU/h), giving a ${pctMargen}% safety margin. Orientation: **${orientacion}** (×${factorOrientacion.toFixed(2)}), insulation: **${aislacion}** (×${factorAislacion.toFixed(2)})${ultimoPiso === 'si' ? ', top floor (+18%)' : ''}.`;
  } else {
    resumen = `Carga térmica: ${frigorias.toLocaleString()} frigorías (${btu.toLocaleString()} BTU/h). Split recomendado: ${splitRecomendado.toLocaleString()} frig (${splitBtu.toLocaleString()} BTU/h) — margen ${pctMargen}%.`;
    insightTitle = 'Resultado de dimensionamiento';
    insightText = `Tu ambiente necesita **${frigorias.toLocaleString()} frigorías** (${btu.toLocaleString()} BTU/h). El split comercial más cercano es **${splitRecomendado.toLocaleString()} frig** (${splitBtu.toLocaleString()} BTU/h), con un margen del ${pctMargen}%. Orientación: **${orientacion}** (×${factorOrientacion.toFixed(2)}), aislación: **${aislacion}** (×${factorAislacion.toFixed(2)})${ultimoPiso === 'si' ? ', último piso (+18%)' : ''}.`;
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: tono,
    icon: insightIcon,
  };

  return {
    resultado: String(splitRecomendado),
    frigorias: String(frigorias),
    btu: String(btu),
    resumen,
    _insight,
  };
}
