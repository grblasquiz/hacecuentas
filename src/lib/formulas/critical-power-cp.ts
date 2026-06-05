export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function criticalPowerCp(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorIncomplete: 'Completá todos los campos.',
      errorSameTime: 'Los dos tiempos deben ser distintos.',
      errorSamePower: 'Las dos potencias deben ser distintas.',
      errorNegativeCP: 'Los datos ingresados no producen un CP positivo. Verificá que P1 > P2 con t1 < t2.',
      resumen: (cp: string, w: string) => `CP ≈ ${cp} W | W' ≈ ${w} kJ. Potencia máxima sostenible en estado estable aeróbico.`,
      insightTitle: 'Tu techo aeróbico y tu batería anaeróbica',
      insightText: (cp: string, w: string, tlim: string) => `Tu Critical Power es **${cp} W**: la potencia más alta que podés sostener indefinidamente en estado estable. Por encima de ese umbral tenés una reserva finita (W′) de **${w} kJ**. Por ejemplo, a 50 W sobre tu CP podés mantener ese ritmo ~**${tlim} min** antes de agotar W'.`,
    },
    en: {
      errorIncomplete: 'Fill in all fields.',
      errorSameTime: 'The two durations must be different.',
      errorSamePower: 'The two power values must be different.',
      errorNegativeCP: 'The inputs do not yield a positive CP. Check that P1 > P2 and t1 < t2.',
      resumen: (cp: string, w: string) => `CP ≈ ${cp} W | W' ≈ ${w} kJ. Maximum sustainable power at metabolic steady state.`,
      insightTitle: 'Your aerobic ceiling and anaerobic battery',
      insightText: (cp: string, w: string, tlim: string) => `Your Critical Power is **${cp} W**: the highest power you can hold indefinitely at metabolic steady state. Above that threshold you have a finite reserve (W′) of **${w} kJ**. For example, at 50 W above CP you can sustain that effort for ~**${tlim} min** before W' runs out.`,
    },
  } as const)[__lang];

  const t1 = Number(i.t1); const p1 = Number(i.p1);
  const t2 = Number(i.t2); const p2 = Number(i.p2);

  if (!t1 || !p1 || !t2 || !p2) throw new Error(T.errorIncomplete);
  if (t1 === t2) throw new Error(T.errorSameTime);
  if (p1 === p2) throw new Error(T.errorSamePower);

  // Model: W_total = CP × t + W'  →  solve two equations for CP and W'
  // CP = (P1·t1 − P2·t2) / (t1 − t2)
  // W' = (P1 − CP) × t1   [= (P2 − CP) × t2 within rounding]
  const CP = (p1 * t1 - p2 * t2) / (t1 - t2);
  const wPrimeJ = (p1 - CP) * t1;

  if (CP <= 0 || wPrimeJ <= 0) throw new Error(T.errorNegativeCP);

  const wPrimeKJ = wPrimeJ / 1000;
  // Time to exhaustion at +50 W above CP (illustrative)
  const tlimMin = wPrimeJ / 50 / 60;

  const cpStr = CP.toFixed(0);
  const wKJStr = wPrimeKJ.toFixed(1);
  const tlimStr = tlimMin.toFixed(1);

  return {
    cp: cpStr + ' W',
    wPrime: wPrimeJ.toFixed(0) + ' J  (' + wKJStr + ' kJ)',
    resumen: T.resumen(cpStr, wKJStr),
    _insight: {
      title: T.insightTitle,
      text: T.insightText(cpStr, wKJStr, tlimStr),
      tone: 'neutral',
      icon: '🚴',
    },
  };
}
