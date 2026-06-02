/** Calculadora de ELO y Rating */
export interface Inputs {
  eloPropio: number;
  eloRival: number;
  resultado: string;
  kFactor: number;
  __lang?: string;
}
export interface Outputs {
  nuevoElo: number;
  cambio: number;
  probabilidadVictoria: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function rankeoEloPuntos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorEloPropio: 'Ingresá tu ELO actual',
      errorEloRival: 'Ingresá el ELO del rival',
      errorResultado: 'Seleccioná el resultado',
      errorKFactor: 'Ingresá un factor K válido',
      victoria: 'victoria',
      derrota: 'derrota',
      empate: 'empate',
      insightTitle: 'Tu probabilidad antes del partido',
      gaugeLabel: 'tu prob.',
      gaugeAria: 'Probabilidad de victoria esperada según la diferencia de ELO',
      zUnderdog: 'Underdog',
      zParejo: 'Parejo',
      zFavorito: 'Favorito',
    },
    en: {
      errorEloPropio: 'Enter your current ELO',
      errorEloRival: 'Enter the opponent\'s ELO',
      errorResultado: 'Select the result',
      errorKFactor: 'Enter a valid K factor',
      victoria: 'win',
      derrota: 'loss',
      empate: 'draw',
      insightTitle: 'Your odds before the match',
      gaugeLabel: 'your prob.',
      gaugeAria: 'Expected win probability based on the ELO gap',
      zUnderdog: 'Underdog',
      zParejo: 'Even',
      zFavorito: 'Favorite',
    },
  } as const)[__lang];

  const elo = Number(i.eloPropio);
  const eloR = Number(i.eloRival);
  const S = Number(i.resultado);
  const K = Number(i.kFactor);

  if (!elo && elo !== 0) throw new Error(T.errorEloPropio);
  if (!eloR && eloR !== 0) throw new Error(T.errorEloRival);
  if (isNaN(S) || (S !== 0 && S !== 0.5 && S !== 1)) throw new Error(T.errorResultado);
  if (!K || K <= 0) throw new Error(T.errorKFactor);

  // Expected score: E = 1 / (1 + 10^((eloR - elo)/400))
  const E = 1 / (1 + Math.pow(10, (eloR - elo) / 400));
  const cambio = K * (S - E);
  const nuevoElo = Math.round(elo + cambio);

  const resultadoTexto = S === 1 ? T.victoria : S === 0 ? T.derrota : T.empate;
  const signo = cambio >= 0 ? '+' : '';

  const mensaje = __lang === 'en'
    ? `${resultadoTexto.charAt(0).toUpperCase() + resultadoTexto.slice(1)} against opponent with ${eloR} ELO. Expected probability: ${(E * 100).toFixed(1)}%. Change: ${signo}${cambio.toFixed(1)} pts. New ELO: ${nuevoElo}.`
    : `${resultadoTexto.charAt(0).toUpperCase() + resultadoTexto.slice(1)} contra rival de ${eloR} ELO. Probabilidad esperada: ${(E * 100).toFixed(1)}%. Cambio: ${signo}${cambio.toFixed(1)} pts. Nuevo ELO: ${nuevoElo}.`;

  const probPct = E * 100;
  const cambioAbs = Math.abs(cambio);

  // --- Insight dinámico según favoritismo y resultado ---
  const eraFavorito = E > 0.5;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (S === 1) {
    insightText = __lang === 'en'
      ? (eraFavorito
          ? `You were the **favorite** (${probPct.toFixed(0)}% expected) and won, so you only gain **+${cambioAbs.toFixed(1)} pts** — beating who you should doesn't move the needle much.`
          : `As the **underdog** (${probPct.toFixed(0)}% expected) you pulled off the win: a juicy **+${cambioAbs.toFixed(1)} pts**. Upsets pay the most in ELO.`)
      : (eraFavorito
          ? `Eras el **favorito** (${probPct.toFixed(0)}% esperado) y ganaste, así que sumás solo **+${cambioAbs.toFixed(1)} pts**: ganarle a quien debías casi no mueve la aguja.`
          : `Como **underdog** (${probPct.toFixed(0)}% esperado) diste el golpe: jugosos **+${cambioAbs.toFixed(1)} pts**. Las sorpresas son las que más rinden en ELO.`);
    insightTone = 'good';
  } else if (S === 0) {
    insightText = __lang === 'en'
      ? (eraFavorito
          ? `You were the **favorite** (${probPct.toFixed(0)}% expected) but lost: a painful **−${cambioAbs.toFixed(1)} pts**. Losing as favorite is the most expensive outcome.`
          : `You lost as the **underdog** (${probPct.toFixed(0)}% expected), so the damage is contained: only **−${cambioAbs.toFixed(1)} pts**.`)
      : (eraFavorito
          ? `Eras el **favorito** (${probPct.toFixed(0)}% esperado) y perdiste: un golpe de **−${cambioAbs.toFixed(1)} pts**. Perder de favorito es lo que más caro sale.`
          : `Perdiste como **underdog** (${probPct.toFixed(0)}% esperado), así que el daño es acotado: solo **−${cambioAbs.toFixed(1)} pts**.`);
    insightTone = eraFavorito ? 'warn' : 'neutral';
  } else {
    const signo2 = cambio >= 0 ? '+' : '−';
    insightText = __lang === 'en'
      ? `A draw against a ${probPct >= 50 ? 'weaker' : 'stronger'} opponent (${probPct.toFixed(0)}% expected) moves you **${signo2}${cambioAbs.toFixed(1)} pts**: a draw counts as half a win, so it ${probPct >= 50 ? 'costs you' : 'rewards you'} relative to expectation.`
      : `Un empate ante un rival ${probPct >= 50 ? 'más débil' : 'más fuerte'} (${probPct.toFixed(0)}% esperado) te mueve **${signo2}${cambioAbs.toFixed(1)} pts**: el empate vale media victoria, así que ${probPct >= 50 ? 'te resta' : 'te suma'} respecto a lo esperado.`;
    insightTone = cambio >= 0 ? 'good' : 'neutral';
  }

  const _insight = {
    title: T.insightTitle,
    text: insightText,
    tone: insightTone,
    icon: '♟️',
  };

  // --- Gauge: probabilidad de victoria esperada (0-100%) ---
  const _chart = {
    type: 'scale',
    marker: Number(probPct.toFixed(1)),
    markerLabel: `${probPct.toFixed(0)}% ${T.gaugeLabel}`,
    min: 0,
    segments: [
      { nombre: T.zUnderdog, max: 40, color: '#f87171', colorDark: '#dc2626' },
      { nombre: T.zParejo, max: 60, color: '#fbbf24', colorDark: '#d97706' },
      { nombre: T.zFavorito, max: 100, color: '#4ade80', colorDark: '#16a34a' },
    ],
    ariaLabel: T.gaugeAria,
  };

  return {
    nuevoElo,
    cambio: Number(cambio.toFixed(1)),
    probabilidadVictoria: Number((E * 100).toFixed(1)),
    mensaje,
    _insight,
    _chart,
  };
}
