/**
 * Calorías del perro por raza y edad (MER = RER × factor).
 */
export interface Inputs { raza: string; peso: number; edad: string; actividad: string; castrado: string; __lang?: string; }
export interface Outputs { kcalDia: number; rer: number; factor: number; gramosAlimento: number; _insight?: any; _chart?: any; }

export function caloriasPerroPorRazaEdad(inputs: Inputs): Outputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const peso = Number(inputs.peso);
  const edad = String(inputs.edad || 'adulto');
  const actividad = String(inputs.actividad || 'media');
  const castrado = String(inputs.castrado || 'si') === 'si';
  if (!peso || peso <= 0) throw new Error(__lang === 'en' ? 'Enter a valid weight' : 'Ingresá peso válido');

  const rer = 70 * Math.pow(peso, 0.75);

  let factor = 1.6;
  if (edad === 'cachorro_2_4m') factor = 3.0;
  else if (edad === 'cachorro_4_12m') factor = 2.0;
  else if (edad === 'senior') factor = 1.4;
  else if (edad === 'adulto') {
    factor = castrado ? 1.6 : 1.8;
  }

  // actividad override sólo para adulto/senior
  if (edad === 'adulto' || edad === 'senior') {
    if (actividad === 'baja') factor = castrado ? 1.3 : 1.4;
    else if (actividad === 'alta') factor = 2.2;
  }

  const mer = rer * factor;
  const gramos = (mer / 380) * 100;

  const kcalDia = Math.round(mer);
  const rerRound = Math.round(rer);
  const surcharge = kcalDia - rerRound;

  const edadLabel = __lang === 'en'
    ? (edad === 'cachorro_2_4m' ? 'puppy (2–4 months)' : edad === 'cachorro_4_12m' ? 'puppy (4–12 months)' : edad === 'senior' ? 'senior' : 'adult')
    : (edad === 'cachorro_2_4m' ? 'cachorro (2–4 meses)' : edad === 'cachorro_4_12m' ? 'cachorro (4–12 meses)' : edad === 'senior' ? 'senior' : 'adulto');
  const esCachorro = edad === 'cachorro_2_4m' || edad === 'cachorro_4_12m';

  return {
    kcalDia,
    rer: rerRound,
    factor: Number(factor.toFixed(2)),
    gramosAlimento: Math.round(gramos),
    _insight: {
      title: __lang === 'en' ? "Your dog's daily energy" : 'La energía diaria de tu perro',
      text: __lang === 'en'
        ? `A **${peso} kg ${edadLabel}** dog needs about **${kcalDia} kcal/day** (~${Math.round(gramos)} g of dry food at 380 kcal/100g). ${esCachorro ? 'A growing puppy burns far more per kilo — split it into several small meals.' : 'Adjust if your vet recommends a different food density or your dog gains or loses weight.'}`
        : `Un perro **${edadLabel} de ${peso} kg** necesita unas **${kcalDia} kcal/día** (~${Math.round(gramos)} g de alimento seco a 380 kcal/100g). ${esCachorro ? 'Un cachorro en crecimiento gasta mucho más por kilo: repartilo en varias comidas chicas.' : 'Ajustá si tu veterinario recomienda otra densidad de alimento o si tu perro sube o baja de peso.'}`,
      tone: 'neutral',
      icon: '🐶',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: __lang === 'en' ? 'Resting (RER)' : 'En reposo (RER)', value: rerRound },
        { label: __lang === 'en' ? 'Activity & life stage' : 'Actividad y etapa', value: surcharge },
      ],
      prefix: '',
      centerValue: `${kcalDia}`,
      centerLabel: __lang === 'en' ? 'kcal/day' : 'kcal/día',
      ariaLabel: __lang === 'en'
        ? `Total of ${kcalDia} kcal per day: ${rerRound} resting energy plus ${surcharge} for activity and life stage`
        : `Total de ${kcalDia} kcal por día: ${rerRound} de energía en reposo más ${surcharge} por actividad y etapa de vida`,
    },
  };
}
