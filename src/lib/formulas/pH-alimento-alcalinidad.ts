/**
 * pH de alimentos comunes según FDA.
 */

const PH_TABLE: Record<string, { ph: number; nombre: string }> = {
  limon: { ph: 2.3, nombre: 'Limón' },
  vinagre: { ph: 2.9, nombre: 'Vinagre' },
  gaseosa: { ph: 2.5, nombre: 'Gaseosa cola' },
  cafe: { ph: 5.0, nombre: 'Café' },
  tomate: { ph: 4.3, nombre: 'Tomate' },
  manzana: { ph: 3.5, nombre: 'Manzana' },
  leche: { ph: 6.7, nombre: 'Leche' },
  agua: { ph: 7.0, nombre: 'Agua pura' },
  espinaca: { ph: 6.5, nombre: 'Espinaca' },
  brocoli: { ph: 6.3, nombre: 'Brócoli' },
  banana: { ph: 5.0, nombre: 'Banana' },
  carne: { ph: 5.8, nombre: 'Carne roja' },
  palta: { ph: 6.4, nombre: 'Palta' },
  almendra: { ph: 7.2, nombre: 'Almendras' },
  bicarbonato: { ph: 9.0, nombre: 'Bicarbonato' },
};

export interface PHAlimentoAlcalinidadInputs {
  alimento: string;
}

export interface PHAlimentoAlcalinidadOutputs {
  ph: number;
  clasificacion: string;
  impacto: string;
}

export function pHAlimentoAlcalinidad(inputs: PHAlimentoAlcalinidadInputs): PHAlimentoAlcalinidadOutputs {
  const data = PH_TABLE[inputs.alimento];
  if (!data) throw new Error('Seleccioná un alimento válido');
  let clasif = '', imp = '';
  if (data.ph < 3) { clasif = 'Muy ácido ⚠️'; imp = 'Erosiona esmalte dental. Malo para reflujo. Enjuagar con agua tras consumir.'; }
  else if (data.ph < 5) { clasif = 'Ácido'; imp = 'Puede erosionar esmalte en exceso. Evitar en reflujo.'; }
  else if (data.ph < 7) { clasif = 'Suavemente ácido'; imp = 'Bien tolerado por la mayoría.'; }
  else if (data.ph < 8) { clasif = 'Neutro / Ligeramente alcalino'; imp = 'Apto para todos.'; }
  else { clasif = 'Alcalino'; imp = 'Útil para pH urinario. Consumo moderado.'; }
  return { ph: data.ph, clasificacion: clasif, impacto: imp };
}
