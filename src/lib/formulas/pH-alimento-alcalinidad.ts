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
  __lang?: string;
}

export interface PHAlimentoAlcalinidadOutputs {
  ph: number;
  clasificacion: string;
  impacto: string;
  _chart?: any;
}

export function pHAlimentoAlcalinidad(inputs: PHAlimentoAlcalinidadInputs): PHAlimentoAlcalinidadOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorAlimento: 'Seleccioná un alimento válido',
      clasifMuyAcido: 'Muy ácido ⚠️',
      impMuyAcido: 'Erosiona esmalte dental. Empeora reflujo. Enjuagar con agua tras consumir y esperar 30 min antes de cepillar.',
      clasifAcido: 'Ácido',
      impAcido: 'Erosiona esmalte si se consume frecuente. Evitar en reflujo y gastritis.',
      clasifSuaveAcido: 'Suavemente ácido',
      impSuaveAcido: 'Aún por debajo del umbral de erosión dental (pH 5.5). Consumo frecuente puede afectar esmalte.',
      clasifCercanoNeutro: 'Cercano a neutro',
      impCercanoNeutro: 'Bien tolerado. Sin riesgo de erosión dental.',
      clasifNeutro: 'Neutro',
      impNeutro: 'Apto para todos. Ideal para dietas balanceadas.',
      clasifLigeAlcalino: 'Ligeramente alcalino',
      impLigeAlcalino: 'Útil en dietas alcalinas. Buen complemento si hay reflujo.',
      clasifAlcalino: 'Alcalino',
      impAlcalino: 'Alto poder alcalinizante. Útil para pH urinario. Consumo moderado.',
      segMuyAcido: 'Muy ácido',
      segAcido: 'Ácido',
      segSuaveAcido: 'Suave ácido',
      segNeutro: 'Neutro',
      segAlcalino: 'Alcalino',
      ariaLabel: 'Escala de pH del alimento: del muy ácido al alcalino. Umbral de erosión dental en pH 5,5.',
    },
    en: {
      errorAlimento: 'Please select a valid food',
      clasifMuyAcido: 'Very acidic ⚠️',
      impMuyAcido: 'Erodes tooth enamel. Worsens acid reflux. Rinse with water after consuming and wait 30 min before brushing.',
      clasifAcido: 'Acidic',
      impAcido: 'Erodes enamel with frequent consumption. Avoid with reflux or gastritis.',
      clasifSuaveAcido: 'Mildly acidic',
      impSuaveAcido: 'Still below the enamel erosion threshold (pH 5.5). Frequent consumption may affect enamel.',
      clasifCercanoNeutro: 'Near neutral',
      impCercanoNeutro: 'Well tolerated. No risk of enamel erosion.',
      clasifNeutro: 'Neutral',
      impNeutro: 'Suitable for everyone. Ideal for balanced diets.',
      clasifLigeAlcalino: 'Slightly alkaline',
      impLigeAlcalino: 'Useful in alkaline diets. A good complement if you have reflux.',
      clasifAlcalino: 'Alkaline',
      impAlcalino: 'High alkalizing power. Useful for urinary pH. Consume in moderation.',
      segMuyAcido: 'Very acidic',
      segAcido: 'Acidic',
      segSuaveAcido: 'Mildly acidic',
      segNeutro: 'Neutral',
      segAlcalino: 'Alkaline',
      ariaLabel: 'Food pH scale: from very acidic to alkaline. Enamel erosion threshold at pH 5.5.',
    },
  } as const)[__lang];

  const data = PH_TABLE[inputs.alimento];
  if (!data) throw new Error(T.errorAlimento);
  let clasif = '', imp = '';
  if (data.ph < 3) {
    clasif = T.clasifMuyAcido;
    imp = T.impMuyAcido;
  } else if (data.ph < 4) {
    clasif = T.clasifAcido;
    imp = T.impAcido;
  } else if (data.ph < 5.5) {
    clasif = T.clasifSuaveAcido;
    imp = T.impSuaveAcido;
  } else if (data.ph < 7) {
    clasif = T.clasifCercanoNeutro;
    imp = T.impCercanoNeutro;
  } else if (data.ph < 7.5) {
    clasif = T.clasifNeutro;
    imp = T.impNeutro;
  } else if (data.ph < 8.5) {
    clasif = T.clasifLigeAlcalino;
    imp = T.impLigeAlcalino;
  } else {
    clasif = T.clasifAlcalino;
    imp = T.impAlcalino;
  }
  const chart = {
    type: 'scale' as const,
    marker: data.ph,
    markerLabel: 'pH ' + data.ph + ' — ' + data.nombre,
    min: 0,
    unit: '',
    segments: [
      { nombre: T.segMuyAcido, max: 3, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.segAcido, max: 4, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: T.segSuaveAcido, max: 5.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.segNeutro, max: 7.5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segAlcalino, max: 14, color: '#bae6fd', colorDark: '#075985' },
    ],
    ariaLabel: T.ariaLabel,
  };
  return { ph: data.ph, clasificacion: clasif, impacto: imp, _chart: chart };
}
