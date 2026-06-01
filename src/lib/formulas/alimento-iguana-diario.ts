/** Alimento diario para iguana verde según peso y edad. */
export interface Inputs {
  pesoGr: number;
  edad?: string;
  condicion?: string;
}
export interface Outputs {
  gramosDia: number;
  hojasVerdesGr: number;
  vegetalesGr: number;
  frutaGr: number;
  frecuencia: string;
  suplementos: string;
  _insight?: any;
  _chart?: any;
}

export function alimentoIguanaDiario(i: Inputs): Outputs {
  const peso = Number(i.pesoGr);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso de la iguana en gramos');

  const edad = String(i.edad || 'juvenil');
  const cond = String(i.condicion || 'normal');

  // % del peso según edad
  const pct = edad === 'bebe' ? 0.10 : edad === 'juvenil' ? 0.07 : 0.045;

  let gramos = peso * pct;

  if (cond === 'sobrepeso') gramos *= 0.8;
  else if (cond === 'delgado') gramos *= 1.15;

  gramos = Math.round(gramos);

  const hojas = Math.round(gramos * 0.70);
  const veg = Math.round(gramos * 0.25);
  const fruta = Math.max(1, Math.round(gramos * 0.05));

  const frecuencia = edad === 'bebe'
    ? 'Diario en 2 tomas (mañana y mediodía)'
    : edad === 'juvenil'
      ? 'Diario en una toma al mediodía'
      : cond === 'sobrepeso'
        ? 'Día por medio o diario con ración reducida'
        : 'Diario en una toma al mediodía';

  const supl = edad === 'bebe'
    ? 'Calcio sin D3 en CADA comida + multivitamínico 2 veces por semana. UVB 10.0/12.0 obligatorio.'
    : 'Calcio sin D3 diario espolvoreado + multivitamínico 2 veces por semana. UVB 10.0/12.0, reemplazar cada 6-12 meses.';

  const platoTotal = hojas + veg + fruta;

  const insightTone = cond === 'sobrepeso' ? 'warn' : cond === 'delgado' ? 'warn' : 'good';
  const insightText = cond === 'sobrepeso'
    ? `Tu iguana de **${peso} g** necesita **${gramos} g** diarios (ración reducida por sobrepeso). Mantené el **70% en hojas verdes** y bajá la fruta para no sumar azúcares.`
    : cond === 'delgado'
      ? `Tu iguana de **${peso} g** necesita **${gramos} g** diarios (ración aumentada por bajo peso). Priorizá **${hojas} g de hojas verdes** densas en calcio y controlá el peso cada semana.`
      : `Tu iguana de **${peso} g** necesita **${gramos} g** diarios: **${hojas} g de hojas verdes**, **${veg} g de vegetales** y solo **${fruta} g de fruta**. Las hojas verdes son la base de una dieta sana.`;

  return {
    gramosDia: gramos,
    hojasVerdesGr: hojas,
    vegetalesGr: veg,
    frutaGr: fruta,
    frecuencia,
    suplementos: supl,
    _insight: {
      title: 'Tu plato diario',
      text: insightText,
      tone: insightTone,
      icon: '🦎',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Hojas verdes', value: hojas },
        { label: 'Vegetales', value: veg },
        { label: 'Fruta', value: fruta },
      ],
      prefix: '',
      centerValue: `${platoTotal} g`,
      centerLabel: 'por día',
      ariaLabel: `Composición del plato diario: ${hojas} g de hojas verdes, ${veg} g de vegetales y ${fruta} g de fruta.`,
    },
  };
}
