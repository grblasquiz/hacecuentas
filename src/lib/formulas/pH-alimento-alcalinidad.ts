/**
 * pH de alimentos comunes según FDA + valores PRAL para "dieta alcalina".
 * Threshold de erosión de esmalte dental: pH < 5.5 (desmineralización de hidroxiapatita).
 */

const PH_TABLE: Record<string, { ph: number; nombre: string }> = {
  limon: { ph: 2.3, nombre: 'Limón' },
  gaseosa: { ph: 2.5, nombre: 'Gaseosa cola' },
  vinagre: { ph: 2.9, nombre: 'Vinagre' },
  kombucha: { ph: 3.0, nombre: 'Kombucha' },
  arandanos: { ph: 3.2, nombre: 'Arándanos' },
  vino: { ph: 3.4, nombre: 'Vino' },
  manzana: { ph: 3.5, nombre: 'Manzana' },
  jugoNaranja: { ph: 3.5, nombre: 'Jugo de naranja' },
  tomate: { ph: 4.3, nombre: 'Tomate' },
  cerveza: { ph: 4.3, nombre: 'Cerveza' },
  yogur: { ph: 4.4, nombre: 'Yogur' },
  kefir: { ph: 4.5, nombre: 'Kéfir' },
  cafe: { ph: 5.0, nombre: 'Café' },
  banana: { ph: 5.0, nombre: 'Banana' },
  carne: { ph: 5.8, nombre: 'Carne roja' },
  brocoli: { ph: 6.3, nombre: 'Brócoli' },
  palta: { ph: 6.4, nombre: 'Palta' },
  espinaca: { ph: 6.5, nombre: 'Espinaca' },
  leche: { ph: 6.7, nombre: 'Leche' },
  agua: { ph: 7.0, nombre: 'Agua pura' },
  almendra: { ph: 7.2, nombre: 'Almendras (PRAL)' },
  teVerde: { ph: 8.0, nombre: 'Té verde' },
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
  if (data.ph < 3) {
    clasif = 'Muy ácido ⚠️';
    imp = 'Erosiona esmalte dental. Empeora reflujo. Enjuagar con agua tras consumir y esperar 30 min antes de cepillar.';
  } else if (data.ph < 4) {
    clasif = 'Ácido';
    imp = 'Erosiona esmalte si se consume frecuente. Evitar en reflujo y gastritis.';
  } else if (data.ph < 5.5) {
    clasif = 'Suavemente ácido';
    imp = 'Aún por debajo del umbral de erosión dental (pH 5.5). Consumo frecuente puede afectar esmalte.';
  } else if (data.ph < 7) {
    clasif = 'Cercano a neutro';
    imp = 'Bien tolerado. Sin riesgo de erosión dental.';
  } else if (data.ph < 7.5) {
    clasif = 'Neutro';
    imp = 'Apto para todos. Ideal para dietas balanceadas.';
  } else if (data.ph < 8.5) {
    clasif = 'Ligeramente alcalino';
    imp = 'Útil en dietas alcalinas. Buen complemento si hay reflujo.';
  } else {
    clasif = 'Alcalino';
    imp = 'Alto poder alcalinizante. Útil para pH urinario. Consumo moderado.';
  }
  return { ph: data.ph, clasificacion: clasif, impacto: imp };
}
