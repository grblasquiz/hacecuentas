/** Calculadora de talla de corpiño/sostén */
export interface Inputs {
  contornoBajo: number;
  contornoPecho: number;
  sistema: string;
}
export interface Outputs {
  tallaContorno: number;
  copa: string;
  tallaCompleta: string;
  tallaUS: string;
  tallaEU: string;
  tallaUK: string;
  mensaje: string;
}

export function tallaSostenCopa(i: Inputs): Outputs {
  const contornoBajo = Number(i.contornoBajo); // cm bajo el busto
  const contornoPecho = Number(i.contornoPecho); // cm en la parte más ancha
  if (!contornoBajo || contornoBajo < 55 || contornoBajo > 130) throw new Error('Ingresá el contorno bajo el busto en cm');
  if (!contornoPecho || contornoPecho < 60 || contornoPecho > 150) throw new Error('Ingresá el contorno del pecho en cm');

  // Talla contorno: se redondea al múltiplo de 5 más cercano
  const tallaContorno = Math.round(contornoBajo / 5) * 5;

  // Copa: diferencia entre pecho y contorno
  const diferencia = contornoPecho - contornoBajo;

  const copas: Record<number, string> = {
    10: 'AA', 12: 'A', 14: 'B', 16: 'C', 18: 'D',
    20: 'E (DD)', 22: 'F', 24: 'G', 26: 'H', 28: 'I',
  };

  // Buscar copa más cercana
  let copa = 'A';
  let minDist = Infinity;
  for (const [diff, letter] of Object.entries(copas)) {
    const d = Math.abs(diferencia - Number(diff));
    if (d < minDist) { minDist = d; copa = letter; }
  }

  const tallaCompleta = `${tallaContorno}${copa}`;

  // Conversiones
  // EU usa el mismo sistema cm
  const tallaEU = tallaCompleta;

  // US: contorno en pulgadas
  const contornoUS = Math.round(contornoBajo / 2.54);
  // Si es par sumamos 4, si es impar sumamos 5
  const bandaUS = contornoUS % 2 === 0 ? contornoUS + 4 : contornoUS + 5;
  const tallaUS = `${bandaUS}${copa.replace(/ \(DD\)/, '')}`;

  // UK: similar a US
  const tallaUK = tallaUS;

  return {
    tallaContorno,
    copa,
    tallaCompleta,
    tallaUS,
    tallaEU,
    tallaUK,
    mensaje: `Tu talla es ${tallaCompleta} (EU). US/UK: ${tallaUS}. Contorno: ${tallaContorno}, Copa: ${copa}.`,
  };
}
