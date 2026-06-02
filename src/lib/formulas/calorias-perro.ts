/** Calorías diarias recomendadas para un perro */
export interface Inputs {
  pesoPerro: number;
  edad?: string;
  actividad?: string;
  esterilizado?: string;
}
export interface Outputs {
  caloriasDiarias: number;
  gramosBalanceado: number;
  detalle: string;
  _insight?: any;
}

export function caloriasPerro(i: Inputs): Outputs {
  const peso = Number(i.pesoPerro);
  const edad = String(i.edad || 'adulto');
  const actividad = String(i.actividad || 'normal');
  const esterilizado = String(i.esterilizado || 'no');

  if (!peso || peso <= 0) throw new Error('Ingresá el peso del perro');

  // RER (Resting Energy Requirement) = 70 × peso^0.75
  const rer = 70 * Math.pow(peso, 0.75);

  // Factor de mantenimiento
  let factor = 1.6; // adulto entero normal

  if (edad === 'cachorro') {
    factor = peso < 10 ? 3.0 : 2.0; // <4 meses o 4-12 meses aprox
  } else if (edad === 'senior') {
    factor = esterilizado === 'si' ? 1.2 : 1.3;
  } else {
    // Adulto
    if (esterilizado === 'si') {
      if (actividad === 'baja') factor = 1.2;
      else if (actividad === 'normal') factor = 1.4;
      else factor = 1.6;
    } else {
      if (actividad === 'baja') factor = 1.4;
      else if (actividad === 'normal') factor = 1.6;
      else factor = 2.0;
    }
  }

  const calorias = Math.round(rer * factor);

  // Gramos de balanceado premium (~350 kcal/100g)
  const gramos = Math.round(calorias / 3.5);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const tazas = (gramos / 100).toFixed(1);
  let insTitle: string;
  let insText: string;
  let insTone: 'good' | 'warn' | 'neutral';
  let insIcon: string;
  if (edad === 'cachorro') {
    insTitle = 'Cachorro en crecimiento';
    insText = `Tu cachorro necesita **${fmt.format(calorias)} kcal/día** (factor alto ${factor.toFixed(1)} por el crecimiento): **${fmt.format(gramos)} g** de balanceado, repartidos en 3-4 comidas. La ración baja a medida que crece.`;
    insTone = 'good';
    insIcon = '🐶';
  } else if (edad === 'senior') {
    insTitle = 'Perro senior: cuidá el peso';
    insText = `Un senior gasta menos: **${fmt.format(calorias)} kcal/día** (~**${fmt.format(gramos)} g**). El sobrepeso es el riesgo más común a esta edad, así que pesalo cada tanto y ajustá si se redondea.`;
    insTone = 'warn';
    insIcon = '🐕';
  } else {
    insTitle = 'Ración diaria estimada';
    insText = `Tu perro adulto necesita **${fmt.format(calorias)} kcal/día**, unos **${fmt.format(gramos)} g** de balanceado premium (~${tazas} tazas). Pesá la porción: ajustá según se mantenga, suba o baje de peso.`;
    insTone = 'neutral';
    insIcon = '🐕';
  }

  return {
    caloriasDiarias: calorias,
    gramosBalanceado: gramos,
    detalle: `Perro de ${fmt.format(peso)} kg (${edad}, ${esterilizado === 'si' ? 'esterilizado' : 'entero'}, actividad ${actividad}): ~${fmt.format(calorias)} kcal/día. Equivale a ~${fmt.format(gramos)} g de balanceado premium (350 kcal/100g). Factor usado: ${factor.toFixed(1)}.`,
    _insight: { title: insTitle, text: insText, tone: insTone, icon: insIcon },
  };
}
