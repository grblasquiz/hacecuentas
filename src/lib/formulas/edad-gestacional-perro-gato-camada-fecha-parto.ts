export interface Inputs {
  species: string;  // 'dog' | 'cat'
  mating_date: string;  // YYYY-MM-DD
  breed?: string;
}

export interface Outputs {
  estimated_due_date: string;  // YYYY-MM-DD
  earliest_date: string;  // YYYY-MM-DD
  latest_date: string;  // YYYY-MM-DD
  days_remaining: number;
  premonitory_signs: string;
  expected_litter_size: string;
  preparation_notes: string;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function dateDifference(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getExpectedLitterSize(species: string, breed?: string): string {
  if (species === 'dog') {
    const breedLower = (breed || '').toLowerCase();
    if (breedLower.includes('chihuahua') || breedLower.includes('toy') || breedLower.includes('pinscher')) {
      return '2–4 crías (raza pequeña)';
    } else if (breedLower.includes('labrador') || breedLower.includes('golden') || breedLower.includes('beagle')) {
      return '5–8 crías (raza mediana)';
    } else if (breedLower.includes('pastor alemán') || breedLower.includes('doberman') || breedLower.includes('gran danés')) {
      return '6–10 crías (raza grande)';
    } else if (!breed) {
      return '4–7 crías (raza no especificada, promedio)';
    } else {
      return '4–7 crías (promedio genérico, consultar veterinario)';
    }
  } else if (species === 'cat') {
    return '3–5 gatitos (gatos, rango típico)';
  }
  return 'No especificado';
}

export function compute(i: Inputs): Outputs {
  if (!i.mating_date) {
    return {
      estimated_due_date: '',
      earliest_date: '',
      latest_date: '',
      days_remaining: 0,
      premonitory_signs: 'Ingresa una fecha de cubrición válida (YYYY-MM-DD).',
      expected_litter_size: '',
      preparation_notes: ''
    };
  }

  const species = (i.species || 'dog').toLowerCase();
  const gestationDays = species === 'cat' ? 64 : 63;
  const marginDays = 5;

  const estimatedDueDate = addDays(i.mating_date, gestationDays);
  const earliestDate = addDays(i.mating_date, gestationDays - marginDays);
  const latestDate = addDays(i.mating_date, gestationDays + marginDays);

  const today = new Date().toISOString().split('T')[0];
  const daysRemaining = dateDifference(today, estimatedDueDate);

  const premonitorySigns = `Espera estos signos aproximadamente 5–7 días antes de la fecha estimada:\n\n` +
    `• Caída de temperatura corporal: de 38–39 °C a 37 °C (mide dos veces al día con termómetro rectal).\n` +
    `• Búsqueda de nido: inquietud, excavación, aislamiento en área cómoda.\n` +
    `• Cambios conductuales: apego inusual a la propietaria, nerviosismo.\n` +
    `• Rechazo de comida: normal 24–48 horas antes.\n` +
    `• Cambios físicos: abdomen más blando, expansión vulvar, secreción mucosa clara.\n\n` +
    `24–36 horas antes del parto: ausencia total de apetito, vocalización, posturas de incomodidad frecuentes.`;

  const expectedLitterSize = getExpectedLitterSize(species, i.breed);

  const preparationNotes = `Preparación recomendada:\n\n` +
    `1. Ahora (${Math.max(7 - daysRemaining, 0)} días antes de lo estimado): Acondiciona área de parto (caja limpia, sábanas, temperatura 24–26 °C, privacidad).\n` +
    `2. A los 5 días antes (aprox. ${addDays(estimatedDueDate, -5)}): Inicia monitoreo de temperatura dos veces al día.\n` +
    `3. A los 2 días antes: Ten teléfono veterinario 24/7 disponible.\n` +
    `4. Prepara: guantes estériles, toallas limpias, hilo estéril, agua fresca para la madre.\n` +
    `5. Durante parto: Permite privacidad; intervén solo si hay signos de angustia materna (más de 2 horas sin expulsión de primera cría, o más de 30 minutos entre crías).\n` +
    `6. Recomendación: Radiografía a los 60 días para contar fetos y ecografía a los 50–55 días (consulta veterinario).`;

  return {
    estimated_due_date: estimatedDueDate,
    earliest_date: earliestDate,
    latest_date: latestDate,
    days_remaining: Math.max(0, daysRemaining),
    premonitory_signs: premonitorySigns,
    expected_litter_size: expectedLitterSize,
    preparation_notes: preparationNotes
  };
}
