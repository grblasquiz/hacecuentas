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

  return {
    gramosDia: gramos,
    hojasVerdesGr: hojas,
    vegetalesGr: veg,
    frutaGr: fruta,
    frecuencia,
    suplementos: supl,
  };
}
