export interface Inputs {
  weight: number;
  distance: number;
  time_minutes: number;
  intensity: string;
  terrain: string;
  bike_type: string;
}

export interface Outputs {
  calories: number;
  met_value: number;
  speed_kmh: number;
  intensity_label: string;
}

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;
  const distance = Number(i.distance) || 0;
  const timeMinutes = Number(i.time_minutes) || 1;
  const intensity = String(i.intensity) || 'moderate';
  const terrain = String(i.terrain) || 'flat';
  const bikeType = String(i.bike_type) || 'hybrid';

  if (weight <= 0 || distance <= 0 || timeMinutes <= 0) {
    return {
      calories: 0,
      met_value: 0,
      speed_kmh: 0,
      intensity_label: 'Datos inválidos'
    };
  }

  const timeHours = timeMinutes / 60;
  const speedKmh = distance / timeHours;

  // Base MET by intensity
  let metBase = 4.0;
  let intensityLabel = 'Lento';

  if (intensity === 'slow') {
    metBase = 4.0;
    intensityLabel = 'Lento (recreativo)';
  } else if (intensity === 'moderate') {
    metBase = 8.0;
    intensityLabel = 'Moderado (conversación)';
  } else if (intensity === 'vigorous') {
    metBase = 10.0;
    intensityLabel = 'Vigoroso (esfuerzo)';
  } else if (intensity === 'race') {
    metBase = 12.0;
    intensityLabel = 'Carrera (máximo)';
  }

  // Adjust MET by terrain
  let terrainMultiplier = 1.0;
  if (terrain === 'flat') {
    terrainMultiplier = 1.0;
  } else if (terrain === 'mixed') {
    terrainMultiplier = 1.15;
  } else if (terrain === 'hilly') {
    terrainMultiplier = 1.25;
  }

  // Adjust MET by bike type
  let bikeMultiplier = 1.0;
  if (bikeType === 'urban') {
    bikeMultiplier = 1.05;
  } else if (bikeType === 'hybrid') {
    bikeMultiplier = 1.0;
  } else if (bikeType === 'mtb') {
    bikeMultiplier = 1.08;
  } else if (bikeType === 'road') {
    bikeMultiplier = 0.95;
  }

  // Final MET calculation
  const metFinal = metBase * terrainMultiplier * bikeMultiplier;

  // Calories = weight (kg) * MET * time (hours)
  const calories = Math.round(weight * metFinal * timeHours);

  return {
    calories: Math.max(calories, 0),
    met_value: Math.round(metFinal * 100) / 100,
    speed_kmh: Math.round(speedKmh * 100) / 100,
    intensity_label: intensityLabel
  };
}
