export interface Inputs {
  input_method: 'feet_inches' | 'centimeters';
  feet: number;
  inches: number;
  centimeters: number;
  gender: 'male' | 'female';
}

export interface Outputs {
  total_centimeters: number;
  total_meters: number;
  feet_display: number;
  inches_display: number;
  ideal_weight_min: number;
  ideal_weight_max: number;
  bmi_reference: number;
  reference_table: string;
}

export function compute(i: Inputs): Outputs {
  const CM_PER_INCH = 2.54;
  const CM_PER_FOOT = 30.48;
  const INCHES_PER_FOOT = 12;
  
  let totalCm: number;
  
  if (i.input_method === 'feet_inches') {
    const feet = Number(i.feet) || 0;
    const inches = Number(i.inches) || 0;
    totalCm = (feet * CM_PER_FOOT) + (inches * CM_PER_INCH);
  } else {
    totalCm = Number(i.centimeters) || 0;
  }
  
  if (totalCm <= 0) {
    return {
      total_centimeters: 0,
      total_meters: 0,
      feet_display: 0,
      inches_display: 0,
      ideal_weight_min: 0,
      ideal_weight_max: 0,
      bmi_reference: 0,
      reference_table: 'Ingresa una altura válida'
    };
  }
  
  const totalMeters = totalCm / 100;
  const totalFeet = totalCm / CM_PER_FOOT;
  const feetInt = Math.floor(totalFeet);
  const inchesDecimal = (totalFeet - feetInt) * INCHES_PER_FOOT;
  
  const totalInches = (feetInt * INCHES_PER_FOOT) + inchesDecimal;
  
  let idealWeightBase: number;
  if (i.gender === 'male') {
    idealWeightBase = 50 + 2.3 * (totalInches - 60);
  } else {
    idealWeightBase = 45.5 + 2.3 * (totalInches - 60);
  }
  
  const idealWeightMin = idealWeightBase * 0.9;
  const idealWeightMax = idealWeightBase * 1.1;
  const idealWeightMid = idealWeightBase;
  const bmiRef = (idealWeightMid) / (totalMeters * totalMeters);
  
  const refTable = `**Altura registrada:** ${feetInt}'${Math.round(inchesDecimal)}" (${totalCm.toFixed(1)} cm)\n\n` +
    `| Pies y pulgadas | Centímetros | Metros |\n` +
    `|---|---|---|\n` +
    `| 5'0" | 152.4 | 1.52 |\n` +
    `| 5'4" | 162.6 | 1.63 |\n` +
    `| 5'8" | 172.7 | 1.73 |\n` +
    `| 5'10" | 177.8 | 1.78 |\n` +
    `| 6'0" | 182.9 | 1.83 |\n` +
    `| 6'2" | 187.9 | 1.88 |\n` +
    `| 6'5" | 196.0 | 1.96 |\n\n` +
    `**Peso ideal para tu altura (${i.gender === 'male' ? 'hombre' : 'mujer'}):** ${idealWeightMin.toFixed(1)} — ${idealWeightMax.toFixed(1)} kg`;
  
  return {
    total_centimeters: parseFloat(totalCm.toFixed(2)),
    total_meters: parseFloat(totalMeters.toFixed(3)),
    feet_display: parseFloat(totalFeet.toFixed(2)),
    inches_display: parseFloat(totalInches.toFixed(2)),
    ideal_weight_min: parseFloat(idealWeightMin.toFixed(1)),
    ideal_weight_max: parseFloat(idealWeightMax.toFixed(1)),
    bmi_reference: parseFloat(bmiRef.toFixed(1)),
    reference_table: refTable
  };
}
