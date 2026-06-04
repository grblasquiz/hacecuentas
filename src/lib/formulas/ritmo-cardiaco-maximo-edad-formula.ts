export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function ritmoCardiacoMaximoEdadFormula(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const edad = Number(i.edad) || 0;
  const fcReposo = Number(i.fcReposo) || 0;

  // Guard: need at least a valid age
  if (edad < 5 || edad > 120) {
    const msg = __lang === 'en'
      ? 'Enter a valid age (5–120 years).'
      : 'Ingresá una edad válida (5–120 años).';
    return { resultado: '-', resumen: msg, _insight: { title: __lang === 'en' ? 'Invalid input' : 'Entrada inválida', text: msg, tone: 'warning', icon: '⚠️' } };
  }

  // ── HRmax by Tanaka 2001: HRmax = 208 − 0.7 × age
  // Source: Tanaka H et al. J Am Coll Cardiol 2001;37(1):153-156 (n=18,712)
  const hrmax = Math.round(208 - 0.7 * edad);

  // ── Training zones as % of HRmax (AHA / ACSM framework)
  const z1Lo = Math.round(hrmax * 0.50);
  const z1Hi = Math.round(hrmax * 0.60);
  const z2Lo = Math.round(hrmax * 0.60);
  const z2Hi = Math.round(hrmax * 0.70);
  const z3Lo = Math.round(hrmax * 0.70);
  const z3Hi = Math.round(hrmax * 0.80);
  const z4Lo = Math.round(hrmax * 0.80);
  const z4Hi = Math.round(hrmax * 0.90);
  const z5Lo = Math.round(hrmax * 0.90);
  const z5Hi = hrmax;

  // ── Karvonen zones (only when a valid resting HR is provided)
  const useKarvonen = fcReposo >= 30 && fcReposo <= 100;
  let karvonenText = '';
  let kZ2Lo = 0, kZ2Hi = 0, kZ3Lo = 0, kZ3Hi = 0, kZ4Lo = 0, kZ4Hi = 0;

  if (useKarvonen) {
    const hrr = hrmax - fcReposo;
    kZ2Lo = Math.round(hrr * 0.60 + fcReposo);
    kZ2Hi = Math.round(hrr * 0.70 + fcReposo);
    kZ3Lo = Math.round(hrr * 0.70 + fcReposo);
    kZ3Hi = Math.round(hrr * 0.80 + fcReposo);
    kZ4Lo = Math.round(hrr * 0.80 + fcReposo);
    kZ4Hi = Math.round(hrr * 0.90 + fcReposo);

    karvonenText = __lang === 'en'
      ? `\nKarvonen zones (HRR = ${hrr} bpm): Zone 2 ${kZ2Lo}–${kZ2Hi} bpm · Zone 3 ${kZ3Lo}–${kZ3Hi} bpm · Zone 4 ${kZ4Lo}–${kZ4Hi} bpm`
      : `\nZonas Karvonen (Reserva FC = ${hrr} lpm): Zona 2 ${kZ2Lo}–${kZ2Hi} lpm · Zona 3 ${kZ3Lo}–${kZ3Hi} lpm · Zona 4 ${kZ4Lo}–${kZ4Hi} lpm`;
  }

  // ── Also compute the classic Fox formula for comparison
  const hrmaxFox = 220 - Math.round(edad);

  // ── Resumen text
  let resumen: string;
  if (__lang === 'en') {
    resumen =
      `HRmax (Tanaka): ${hrmax} bpm | Fox (220−age): ${hrmaxFox} bpm\n` +
      `Zone 1 (50–60%): ${z1Lo}–${z1Hi} bpm · Zone 2 (60–70%): ${z2Lo}–${z2Hi} bpm · Zone 3 (70–80%): ${z3Lo}–${z3Hi} bpm · Zone 4 (80–90%): ${z4Lo}–${z4Hi} bpm · Zone 5 (90–100%): ${z5Lo}–${z5Hi} bpm` +
      karvonenText;
  } else {
    resumen =
      `FC máx (Tanaka): ${hrmax} lpm | Fox (220−edad): ${hrmaxFox} lpm\n` +
      `Zona 1 (50–60%): ${z1Lo}–${z1Hi} lpm · Zona 2 (60–70%): ${z2Lo}–${z2Hi} lpm · Zona 3 (70–80%): ${z3Lo}–${z3Hi} lpm · Zona 4 (80–90%): ${z4Lo}–${z4Hi} lpm · Zona 5 (90–100%): ${z5Lo}–${z5Hi} lpm` +
      karvonenText;
  }

  // ── Insight
  let insightText: string;
  let insightTone: string;

  if (__lang === 'en') {
    insightText = `Your estimated HRmax is **${hrmax} bpm** (Tanaka 2001 formula: 208 − 0.7×${edad}). ` +
      `Zone 2 aerobic base: **${z2Lo}–${z2Hi} bpm**. ` +
      (useKarvonen ? `Karvonen Zone 2 (more precise): **${kZ2Lo}–${kZ2Hi} bpm**. ` : '') +
      `Individual variability is ±10–15 bpm — consider a field test if precise zones matter.`;
    insightTone = 'info';
  } else {
    insightText = `Tu FC máxima estimada es **${hrmax} lpm** (fórmula Tanaka 2001: 208 − 0.7×${edad}). ` +
      `Zona 2 base aeróbica: **${z2Lo}–${z2Hi} lpm**. ` +
      (useKarvonen ? `Zona 2 Karvonen (más precisa): **${kZ2Lo}–${kZ2Hi} lpm**. ` : '') +
      `La variabilidad individual es ±10–15 lpm — considerá un test de campo si los rangos son críticos.`;
    insightTone = 'info';
  }

  const _insight = {
    title: __lang === 'en' ? 'Your Maximum Heart Rate' : 'Tu FC Máxima',
    text: insightText,
    tone: insightTone,
    icon: '❤️',
  };

  return {
    resultado: `${hrmax} bpm`,
    resumen,
    _insight,
  };
}
