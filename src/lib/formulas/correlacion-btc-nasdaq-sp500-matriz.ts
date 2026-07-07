export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }

/** Coeficiente de correlación de Pearson entre dos series de retornos/valores. */
export function correlacionBtcNasdaqSp500Matriz(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      pedirA: 'Ingresá la serie del activo A (números separados por coma)',
      pedirB: 'Ingresá la serie del activo B (números separados por coma)',
      noNum: 'Todos los valores deben ser números (separados por coma)',
      pocos: 'Necesitás al menos 3 valores en cada serie',
      distinto: 'Ambas series deben tener la misma cantidad de valores',
      varCero: 'Una de las series es constante (sin variación), no se puede calcular correlación',
      fuertePos: 'Correlación positiva fuerte',
      moderadaPos: 'Correlación positiva moderada',
      debilPos: 'Correlación positiva débil',
      nula: 'Correlación prácticamente nula',
      debilNeg: 'Correlación negativa débil',
      moderadaNeg: 'Correlación negativa moderada',
      fuerteNeg: 'Correlación negativa fuerte',
      tituloDiv: (s: string) => `Diversificación: ${s}`,
      poca: 'poca',
      parcial: 'parcial',
      buena: 'buena',
      detalle: (n: number, r: string) => `${n} pares de datos. r de Pearson = ${r}.`,
      muevenJuntos: 'los activos se mueven en el mismo sentido',
      muevenOpuesto: 'los activos se mueven en sentido contrario (útil como cobertura)',
      muevenIndep: 'los activos se mueven de forma casi independiente',
    },
    en: {
      pedirA: 'Enter the series for asset A (comma-separated numbers)',
      pedirB: 'Enter the series for asset B (comma-separated numbers)',
      noNum: 'All values must be numbers (comma-separated)',
      pocos: 'You need at least 3 values in each series',
      distinto: 'Both series must have the same number of values',
      varCero: 'One series is constant (no variation), correlation cannot be computed',
      fuertePos: 'Strong positive correlation',
      moderadaPos: 'Moderate positive correlation',
      debilPos: 'Weak positive correlation',
      nula: 'Virtually no correlation',
      debilNeg: 'Weak negative correlation',
      moderadaNeg: 'Moderate negative correlation',
      fuerteNeg: 'Strong negative correlation',
      tituloDiv: (s: string) => `Diversification: ${s}`,
      poca: 'little',
      parcial: 'partial',
      buena: 'good',
      detalle: (n: number, r: string) => `${n} data pairs. Pearson r = ${r}.`,
      muevenJuntos: 'the assets move in the same direction',
      muevenOpuesto: 'the assets move in opposite directions (useful as a hedge)',
      muevenIndep: 'the assets move almost independently',
    },
  } as const)[__lang];

  const err = (m: string): Outputs => ({ coeficiente: '—', interpretacion: '—', detalle: m });
  const aStr = String(i.serieA ?? '').trim();
  const bStr = String(i.serieB ?? '').trim();
  if (!aStr) return err(T.pedirA);
  if (!bStr) return err(T.pedirB);

  const splitNums = (raw: string): number[] =>
    raw
      .split(/[,;\s]+/)
      .filter(s => s.length > 0)
      .map(s => Number(s.trim()));

  const a = splitNums(aStr);
  const b = splitNums(bStr);

  if (a.some(v => !Number.isFinite(v)) || b.some(v => !Number.isFinite(v))) return err(T.noNum);
  if (a.length !== b.length) return err(T.distinto);
  if (a.length < 3) return err(T.pocos);

  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;

  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let k = 0; k < n; k++) {
    const da = a[k] - meanA;
    const db = b[k] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }

  if (varA === 0 || varB === 0) return err(T.varCero);

  let r = cov / Math.sqrt(varA * varB);
  // Clamp por errores de punto flotante
  if (r > 1) r = 1;
  if (r < -1) r = -1;

  const abs = Math.abs(r);
  // Interpretación por fuerza + signo
  let interp: string;
  if (abs < 0.1) interp = T.nula;
  else if (r >= 0.7) interp = T.fuertePos;
  else if (r >= 0.4) interp = T.moderadaPos;
  else if (r >= 0.1) interp = T.debilPos;
  else if (r <= -0.7) interp = T.fuerteNeg;
  else if (r <= -0.4) interp = T.moderadaNeg;
  else interp = T.debilNeg;

  // Diversificación según magnitud
  const divNivel = abs >= 0.6 ? T.poca : abs >= 0.3 ? T.parcial : T.buena;
  const tone = abs >= 0.6 ? 'warn' : abs >= 0.3 ? 'neutral' : 'good';

  const direccion = abs < 0.1 ? T.muevenIndep : r > 0 ? T.muevenJuntos : T.muevenOpuesto;
  const rTxt = r.toFixed(2);

  const _insight = {
    title: T.tituloDiv(divNivel),
    text:
      __lang === 'en'
        ? `Over **${n} data pairs**, the Pearson correlation is **${rTxt}**: ${direccion}. With |r| of ${abs.toFixed(2)}, the diversification benefit is **${divNivel}**.`
        : `Sobre **${n} pares de datos**, la correlación de Pearson es **${rTxt}**: ${direccion}. Con un |r| de ${abs.toFixed(2)}, el aporte de diversificación es **${divNivel}**.`,
    tone,
    icon: '🔗',
  };

  // Gauge sobre |r| (0 a 1)
  const _chart = {
    type: 'scale',
    marker: Number(abs.toFixed(2)),
    markerLabel: `r = ${rTxt}`,
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Weak' : 'Débil', max: 0.3, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: __lang === 'en' ? 'Moderate' : 'Moderada', max: 0.6, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: __lang === 'en' ? 'Strong' : 'Fuerte', max: 1, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel:
      __lang === 'en'
        ? `Pearson correlation of ${rTxt}; absolute value ${abs.toFixed(2)} on a 0 to 1 strength scale.`
        : `Correlación de Pearson de ${rTxt}; valor absoluto ${abs.toFixed(2)} en una escala de fuerza de 0 a 1.`,
  };

  return {
    coeficiente: rTxt,
    interpretacion: interp,
    detalle: T.detalle(n, rTxt),
    _insight,
    _chart,
  };
}
