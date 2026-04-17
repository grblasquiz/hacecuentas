/** WPM Teclas por Minuto (Typing) */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  wpmBruto: number;
  wpmNeto: number;
  accuracy: number;
  categoria: string;
}

export function teclaPorMinutoTypingTest(i: Inputs): Outputs {
  const pal = Number(i.palabrasEscritas) || 0;
  const min = Number(i.minutosTest) || 1;
  const err = Number(i.erroresSinCorregir) || 0;
  if (pal <= 0 || min <= 0) throw new Error('Datos inválidos');

  const wpmBruto = pal / min;
  const wpmNeto = Math.max(0, wpmBruto - (err / min));
  const accuracy = Math.max(0, ((pal - err) / pal) * 100);

  let cat = '';
  if (wpmNeto < 25) cat = 'Muy lento';
  else if (wpmNeto < 40) cat = 'Promedio (2 dedos)';
  else if (wpmNeto < 55) cat = 'Normal';
  else if (wpmNeto < 70) cat = 'Bueno';
  else if (wpmNeto < 90) cat = 'Muy bueno (profesional)';
  else if (wpmNeto < 120) cat = 'Excelente';
  else cat = 'Experto mundial';

  return {
    wpmBruto: Math.round(wpmBruto),
    wpmNeto: Math.round(wpmNeto),
    accuracy: Math.round(accuracy * 10) / 10,
    categoria: cat,
  };

}
