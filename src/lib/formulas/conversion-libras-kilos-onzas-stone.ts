export interface Inputs {
  amount: number;
  unit: string;
}

export interface Outputs {
  result_kg: number;
  result_lb: number;
  result_oz: number;
  result_st: number;
}

export function compute(i: Inputs): Outputs {
  const amount = Number(i.amount) || 0;
  const unit = String(i.unit || 'lb').toLowerCase();

  // Factores de conversión internacionales (BIPM, 1959)
  const LB_TO_KG = 0.45359237;
  const KG_TO_LB = 1 / LB_TO_KG;
  const OZ_TO_G = 28.349523125;
  const STONE_TO_KG = 6.35029318;

  let kg = 0;

  // Convertir a kilogramos como unidad base
  if (unit === 'lb') {
    kg = amount * LB_TO_KG;
  } else if (unit === 'kg') {
    kg = amount;
  } else if (unit === 'oz') {
    kg = (amount * OZ_TO_G) / 1000;
  } else if (unit === 'st') {
    kg = amount * STONE_TO_KG;
  } else {
    // Unidad no reconocida, retornar ceros
    return { result_kg: 0, result_lb: 0, result_oz: 0, result_st: 0 };
  }

  // Validar cantidad no negativa
  if (kg < 0) {
    return { result_kg: 0, result_lb: 0, result_oz: 0, result_st: 0 };
  }

  // Convertir desde kilogramos a todas las unidades
  const result_kg = Math.round(kg * 100) / 100;
  const result_lb = Math.round(kg * KG_TO_LB * 100) / 100;
  const result_oz = Math.round((kg * 1000) / OZ_TO_G * 100) / 100;
  const result_st = Math.round((kg / STONE_TO_KG) * 100) / 100;

  return {
    result_kg,
    result_lb,
    result_oz,
    result_st
  };
}
