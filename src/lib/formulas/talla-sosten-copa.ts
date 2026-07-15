/** Calculadora de talla de corpiño/sostén */
export interface Inputs {
  contornoBajo: number;
  contornoPecho: number;
  sistema: string;
  unidad?: string;
}
export interface Outputs {
  tallaContorno: number;
  copa: string;
  tallaCompleta: string;
  tallaUS: string;
  tallaEU: string;
  tallaUK: string;
  tallaAR: string;
  tallaES: string;
  tallaMX: string;
  tallaCO: string;
  alternativas: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function tallaSostenCopa(i: Inputs): Outputs {
  const factor = i.unidad === 'in' ? 2.54 : 1;
  const contornoBajo = Number(i.contornoBajo) * factor; // cm bajo el busto
  const contornoPecho = Number(i.contornoPecho) * factor; // cm en la parte más ancha
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
  // En US/UK la copa EU/AR "E (DD)" se llama "DD" (no "E"); el resto coincide.
  const tallaUS = `${bandaUS}${copa === 'E (DD)' ? 'DD' : copa}`;

  // UK: similar a US
  const tallaUK = tallaUS;
  const tallaAR = `${tallaContorno + 15}${copa}`;
  const tallaES = tallaAR;
  const tallaMX = tallaUS;
  const tallaCO = tallaUS;
  const copaSimple = copa.replace(' (DD)', '');
  const alternativas = `${Math.max(55, tallaContorno - 5)}${String.fromCharCode(Math.min(90, copaSimple.charCodeAt(0) + 1))} o ${tallaContorno + 5}${String.fromCharCode(Math.max(65, copaSimple.charCodeAt(0) - 1))}`;

  const diffFmt = diferencia.toFixed(0);
  const _insight = {
    title: 'Tu talla de corpiño',
    text: `Tu talla es **${tallaCompleta}** (EU): banda **${tallaContorno}** y copa **${copa}**, surgida de **${diffFmt} cm** de diferencia entre pecho y contorno bajo el busto. Si la copa te queda al límite, probá una banda menos con una copa más.`,
    tone: 'neutral',
    icon: '👙',
  };
  // Gauge: la diferencia pecho-contorno cae en zonas de copa
  const _chart = {
    type: 'scale',
    marker: Number(diferencia.toFixed(1)),
    markerLabel: `Copa ${copa}`,
    min: 8,
    segments: [
      { nombre: 'AA', max: 11, color: '#bae6fd', colorDark: '#0c4a6e' },
      { nombre: 'A', max: 13, color: '#7dd3fc', colorDark: '#075985' },
      { nombre: 'B', max: 15, color: '#38bdf8', colorDark: '#0369a1' },
      { nombre: 'C', max: 17, color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'D', max: 19, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'E (DD)', max: 21, color: '#facc15', colorDark: '#a16207' },
      { nombre: 'F', max: 23, color: '#fb923c', colorDark: '#c2410c' },
      { nombre: 'G+', max: Math.max(30, diferencia + 2), color: '#f87171', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Diferencia de ${diffFmt} cm ubicada en la zona de copa ${copa}`,
  };

  return {
    tallaContorno,
    copa,
    tallaCompleta,
    tallaUS,
    tallaEU,
    tallaUK,
    tallaAR,
    tallaES,
    tallaMX,
    tallaCO,
    alternativas,
    mensaje: `Tu talla es ${tallaCompleta} (EU). US/UK: ${tallaUS}. Contorno: ${tallaContorno}, Copa: ${copa}.`,
    _insight,
    _chart,
  };
}
