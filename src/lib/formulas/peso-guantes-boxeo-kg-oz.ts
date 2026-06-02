/** Peso de guantes de boxeo: oz a kg y recomendación */
export interface Inputs {
  onzas: number;
  pesoCorporal: number;
  uso: string;
}

export interface Outputs {
  result: number;
  pesoKg: number;
  recomendacion: string;
  detalle: string;
  _insight?: any;
}

export function pesoGuantesBoxeoKgOz(i: Inputs): Outputs {
  const oz = Number(i.onzas);
  const peso = Number(i.pesoCorporal);
  const uso = String(i.uso || 'sparring');

  if (!oz || oz <= 0) throw new Error('Ingresá el peso de los guantes en onzas');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso corporal en kg');

  const gramos = oz * 28.3495;
  const kg = gramos / 1000;

  // Recomendación según peso y uso
  let ozRecomendado = '';
  if (uso === 'bolsa') {
    if (peso < 50) ozRecomendado = '8-10 oz';
    else if (peso < 65) ozRecomendado = '10-12 oz';
    else if (peso < 80) ozRecomendado = '12-14 oz';
    else ozRecomendado = '14-16 oz';
  } else if (uso === 'sparring') {
    if (peso < 55) ozRecomendado = '12-14 oz';
    else if (peso < 75) ozRecomendado = '14-16 oz';
    else ozRecomendado = '16-18 oz';
  } else {
    // competición
    if (peso <= 66.7) ozRecomendado = '8 oz (profesional) / 10 oz (amateur)';
    else ozRecomendado = '10 oz (profesional) / 12 oz (amateur)';
  }

  const usoNombre = uso === 'bolsa' ? 'bolsa/pads' : uso === 'sparring' ? 'sparring' : 'competición';

  // Rango recomendado (números del string) para comparar con la elección del usuario.
  const nums = (ozRecomendado.match(/\d+/g) || []).map(Number);
  const recMin = nums.length ? Math.min(...nums) : 0;
  const recMax = nums.length ? Math.max(...nums) : 0;

  let insightTone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insightText: string;
  if (recMin && oz < recMin) {
    insightTone = 'warn';
    insightText = `Tus **${oz} oz** quedan por debajo de lo aconsejado para ${usoNombre} con ${peso} kg (**${ozRecomendado}**). Guantes demasiado livianos protegen menos los nudillos y a tu compañero: subí el gramaje antes de pegar fuerte.`;
  } else if (recMax && oz > recMax) {
    insightTone = 'good';
    insightText = `Tus **${oz} oz** superan el rango sugerido para ${usoNombre} con ${peso} kg (**${ozRecomendado}**). Más onzas = más relleno y más protección, ideal para cuidar manos y sparring; solo pesan un poco más al entrenar.`;
  } else if (recMin) {
    insightTone = 'good';
    insightText = `Tus **${oz} oz** caen justo en el rango ideal para ${usoNombre} con ${peso} kg (**${ozRecomendado}**). Buen equilibrio entre protección y velocidad para tu peso.`;
  } else {
    insightText = `Tus **${oz} oz** equivalen a **${Math.round(gramos)} g**. Para ${usoNombre} con ${peso} kg lo aconsejado es **${ozRecomendado}**.`;
  }

  return {
    result: Math.round(gramos),
    pesoKg: Number(kg.toFixed(3)),
    recomendacion: `Para ${usoNombre} con ${peso} kg: ${ozRecomendado}`,
    detalle: `Guantes de **${oz} oz** = **${Math.round(gramos)} gramos** (${kg.toFixed(3)} kg). Recomendación para ${usoNombre} con ${peso} kg: **${ozRecomendado}**.`,
    _insight: {
      title: 'Tu gramaje vs. lo recomendado',
      text: insightText,
      tone: insightTone,
      icon: '🥊',
    },
  };
}
