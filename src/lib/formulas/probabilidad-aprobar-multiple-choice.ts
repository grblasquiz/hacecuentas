/** Probabilidad de aprobar un examen multiple choice adivinando */

export interface Inputs {
  totalPreguntas: number;
  opcionesPorPregunta: number;
  preguntasSabidas: number;
  paraAprobar: number;
}

export interface Outputs {
  probabilidadAprobar: number;
  notaEsperada: number;
  porcentajeEsperado: number;
  analisis: string;
  _insight?: any;
  _chart?: any;
}

/** Logaritmo del coeficiente binomial: log(C(n, k)) */
function logBinom(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  if (k === 0 || k === n) return 0;
  let result = 0;
  for (let i = 0; i < k; i++) {
    result += Math.log(n - i) - Math.log(i + 1);
  }
  return result;
}

/** Probabilidad binomial P(X = k) con n intentos y probabilidad p */
function binomProb(n: number, k: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logP = logBinom(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(logP);
}

/** Probabilidad acumulada P(X >= k) */
function binomCdfUpper(n: number, k: number, p: number): number {
  let sum = 0;
  for (let j = k; j <= n; j++) {
    sum += binomProb(n, j, p);
  }
  return Math.min(1, Math.max(0, sum));
}

export function probabilidadAprobarMultipleChoice(i: Inputs): Outputs {
  const total = Math.round(Number(i.totalPreguntas));
  const opciones = Math.round(Number(i.opcionesPorPregunta));
  const sabidas = Math.round(Number(i.preguntasSabidas));
  const paraAprobar = Math.round(Number(i.paraAprobar));

  if (isNaN(total) || total <= 0) throw new Error('Ingresá el total de preguntas');
  if (isNaN(opciones) || opciones < 2) throw new Error('Debe haber al menos 2 opciones por pregunta');
  if (isNaN(sabidas) || sabidas < 0) throw new Error('Las preguntas sabidas no pueden ser negativas');
  if (sabidas > total) throw new Error('No podés saber más preguntas de las que tiene el examen');
  if (isNaN(paraAprobar) || paraAprobar <= 0) throw new Error('Ingresá cuántas correctas necesitás para aprobar');
  if (paraAprobar > total) throw new Error('No podés necesitar más correctas de las que hay');

  const preguntasAdivinar = total - sabidas;
  const probAcertar = 1 / opciones;

  // Necesitamos acertar al menos (paraAprobar - sabidas) de las que adivinamos
  const necesitasAdivinar = Math.max(0, paraAprobar - sabidas);

  let probabilidadAprobar: number;
  if (necesitasAdivinar <= 0) {
    // Ya sabés suficiente para aprobar
    probabilidadAprobar = 100;
  } else if (necesitasAdivinar > preguntasAdivinar) {
    // Imposible: necesitás adivinar más de las que hay
    probabilidadAprobar = 0;
  } else {
    probabilidadAprobar = Math.round(binomCdfUpper(preguntasAdivinar, necesitasAdivinar, probAcertar) * 10000) / 100;
  }

  // Nota esperada: sabidas + esperanza de adivinadas
  const esperanzaAdivinadas = preguntasAdivinar * probAcertar;
  const notaEsperada = Math.round((sabidas + esperanzaAdivinadas) * 100) / 100;
  const porcentajeEsperado = Math.round((notaEsperada / total) * 10000) / 100;

  let analisis: string;
  if (probabilidadAprobar >= 100) {
    analisis = `Ya sabés ${sabidas} de ${total} preguntas, suficiente para aprobar (necesitás ${paraAprobar}). No necesitás adivinar nada.`;
  } else if (probabilidadAprobar >= 70) {
    analisis = `Tenés buenas chances (${probabilidadAprobar}%). Sabés ${sabidas} y necesitás adivinar ${necesitasAdivinar} de ${preguntasAdivinar} con ${opciones} opciones cada una. Nota esperada: ${notaEsperada} correctas (${porcentajeEsperado}%).`;
  } else if (probabilidadAprobar >= 30) {
    analisis = `Chances moderadas (${probabilidadAprobar}%). Necesitás adivinar ${necesitasAdivinar} de ${preguntasAdivinar}. Es arriesgado pero posible. Cada pregunta más que estudies mejora mucho tus chances.`;
  } else if (probabilidadAprobar > 0) {
    analisis = `Chances bajas (${probabilidadAprobar}%). Necesitás adivinar ${necesitasAdivinar} de ${preguntasAdivinar} con probabilidad ${Math.round(probAcertar * 100)}% por pregunta. Recomendación: estudiá más antes de presentarte.`;
  } else {
    analisis = `Imposible aprobar. Necesitás ${paraAprobar} correctas pero solo podés llegar a ${sabidas + preguntasAdivinar} como máximo. Revisá los datos ingresados.`;
  }

  // Insight narrativo dinámico
  let _insight: any;
  if (necesitasAdivinar <= 0) {
    _insight = {
      title: 'Aprobás sin adivinar',
      text: `Con **${sabidas} de ${total}** preguntas que ya sabés cubrís el mínimo de **${paraAprobar}** correctas: tu probabilidad de aprobar es del **100%** sin depender del azar.`,
      tone: 'good',
      icon: '✅',
    };
  } else if (probabilidadAprobar <= 0) {
    _insight = {
      title: 'Imposible con estos datos',
      text: `Necesitás **${paraAprobar}** correctas pero como máximo podés llegar a **${sabidas + preguntasAdivinar}**: aprobar es imposible. Tenés que estudiar más preguntas.`,
      tone: 'warn',
      icon: '🚫',
    };
  } else {
    const tone = probabilidadAprobar >= 70 ? 'good' : probabilidadAprobar >= 30 ? 'neutral' : 'warn';
    _insight = {
      title: `Probabilidad de aprobar: ${probabilidadAprobar}%`,
      text: `Sabés **${sabidas} de ${total}** y necesitás adivinar **${necesitasAdivinar}** de las **${preguntasAdivinar}** restantes (cada una con **${Math.round(probAcertar * 100)}%** de acertar): chance de aprobar **${probabilidadAprobar}%**, con una nota esperada de **${notaEsperada}** correctas (${porcentajeEsperado}%).`,
      tone,
      icon: '🎲',
    };
  }

  // Gráfico gauge: dónde cae tu probabilidad de aprobar
  const _chart = {
    type: 'scale',
    marker: probabilidadAprobar,
    markerLabel: `${probabilidadAprobar}%`,
    min: 0,
    segments: [
      { nombre: 'Bajas', max: 30, color: '#fca5a5', colorDark: '#ef4444' },
      { nombre: 'Moderadas', max: 70, color: '#fcd34d', colorDark: '#f59e0b' },
      { nombre: 'Altas', max: 100.01, color: '#86efac', colorDark: '#22c55e' },
    ],
    ariaLabel: `Probabilidad de aprobar de ${probabilidadAprobar}% sobre una escala de 0 a 100`,
  };

  return { probabilidadAprobar, notaEsperada, porcentajeEsperado, analisis, _insight, _chart };
}
