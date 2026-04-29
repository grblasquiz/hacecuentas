export interface Inputs {
  species: string; // 'dog' or 'cat'
  age_years: number;
  dog_size?: string; // 'small', 'medium', 'large'
}

export interface Outputs {
  human_age: number;
  life_stage: string;
  health_notes: string;
}

export function compute(i: Inputs): Outputs {
  const species = i.species || 'dog';
  const ageYears = Number(i.age_years) || 0;
  const dogSize = i.dog_size || 'medium';

  if (ageYears < 0) {
    return {
      human_age: 0,
      life_stage: 'Edad inválida',
      health_notes: 'Por favor ingresa una edad válida en años.'
    };
  }

  let humanAge = 0;
  let lifeStage = '';
  let healthNotes = '';

  if (species === 'dog') {
    // Perro
    if (ageYears <= 1) {
      humanAge = 15 * ageYears;
    } else if (ageYears <= 2) {
      humanAge = 15 + (ageYears - 1) * 9; // De 15 a 24 en el segundo año
    } else {
      // Años 3+
      const yearsFactor =
        dogSize === 'small' ? 5 : dogSize === 'large' ? 7.5 : 5;
      humanAge = 24 + (ageYears - 2) * yearsFactor;
    }
  } else if (species === 'cat') {
    // Gato
    if (ageYears <= 1) {
      humanAge = 15 * ageYears;
    } else if (ageYears <= 2) {
      humanAge = 15 + (ageYears - 1) * 9; // De 15 a 24 en el segundo año
    } else {
      // Años 3+
      humanAge = 24 + (ageYears - 2) * 4;
    }
  } else {
    return {
      human_age: 0,
      life_stage: 'Especie no soportada',
      health_notes: 'Selecciona perro o gato.'
    };
  }

  // Etapa de vida
  if (humanAge < 15) {
    lifeStage = 'Bebé/Recién nacido';
    healthNotes = 'Desarrollo rápido. Vacunaciones y desparasitación críticas. Socialización temprana.';
  } else if (humanAge < 24) {
    lifeStage = 'Cachorro/Gatito';
    healthNotes = 'Energía máxima, juego constante. Completar esquema de vacunas. Entrenar obediencia.';
  } else if (humanAge < 50) {
    lifeStage = 'Adulto joven';
    healthNotes = 'Pico de salud y vitalidad. Mantén ejercicio regular y dieta equilibrada. Esterilización/castración recomendada.';
  } else if (humanAge < 75) {
    lifeStage = 'Senior';
    healthNotes = 'Cambios metabólicos graduales. Chequeos semestrales. Considera dieta baja en calorías y suplementos articulares.';
  } else {
    lifeStage = 'Geriátrico';
    healthNotes = 'Alto riesgo de enfermedades crónicas. Controles veterinarios cada 3–4 meses. Ambiente confortable y sin estrés.';
  }

  return {
    human_age: Math.round(humanAge * 10) / 10, // 1 decimal
    life_stage: lifeStage,
    health_notes: healthNotes
  };
}
