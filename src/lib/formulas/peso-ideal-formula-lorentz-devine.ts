export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }

export function pesoIdealFormulaLorentzDevine(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const alturaCm = Number(i.altura) || 0;
  const sexo = String(i.sexo || '').toLowerCase();
  const isMale = sexo === 'male' || sexo === 'hombre';

  // ── Validate inputs ────────────────────────────────────────────────────────
  if (alturaCm < 100 || alturaCm > 250) {
    const errMsg = __lang === 'en'
      ? 'Please enter a height between 100 and 250 cm.'
      : 'Ingresá una altura entre 100 y 250 cm.';
    return { resultado: errMsg, resumen: '', _insight: { title: __lang === 'en' ? 'Error' : 'Error', text: errMsg, tone: 'alert', icon: '⚠️' } };
  }

  // ── Lorentz formula (1929) ─────────────────────────────────────────────────
  // Men:   IBW = height(cm) − 100 − (height − 150) / 4
  // Women: IBW = height(cm) − 100 − (height − 150) / 2
  const lorentzDivisor = isMale ? 4 : 2;
  const lorentz = alturaCm - 100 - (alturaCm - 150) / lorentzDivisor;

  // ── Devine formula (1974) ──────────────────────────────────────────────────
  // Men:   IBW = 50 + 2.3 × (inches over 5 ft)
  // Women: IBW = 45.5 + 2.3 × (inches over 5 ft)
  // 5 ft = 152.4 cm; 1 inch = 2.54 cm
  const inchesOver5ft = Math.max(0, (alturaCm - 152.4) / 2.54);
  const devineBase = isMale ? 50 : 45.5;
  const devine = devineBase + 2.3 * inchesOver5ft;

  const lorentzRounded = Math.round(lorentz * 10) / 10;
  const devineRounded = Math.round(devine * 10) / 10;

  // Average range midpoint for the insight
  const avg = Math.round(((lorentz + devine) / 2) * 10) / 10;

  // ── IMC range cross-check ─────────────────────────────────────────────────
  // Healthy BMI 18.5–24.9 → weight range at given height
  const heightM = alturaCm / 100;
  const bmiLow = Math.round(18.5 * heightM * heightM * 10) / 10;
  const bmiHigh = Math.round(24.9 * heightM * heightM * 10) / 10;

  // ── Text output ──────────────────────────────────────────────────────────
  const sexLabel = __lang === 'en'
    ? (isMale ? 'male' : 'female')
    : (isMale ? 'varón' : 'mujer');

  const resultado = __lang === 'en'
    ? `Lorentz: ${lorentzRounded} kg | Devine: ${devineRounded} kg`
    : `Lorentz: ${lorentzRounded} kg | Devine: ${devineRounded} kg`;

  const resumen = __lang === 'en'
    ? `For a ${sexLabel} at ${alturaCm} cm — Lorentz: **${lorentzRounded} kg**, Devine: **${devineRounded} kg**. Healthy BMI range (18.5–24.9): **${bmiLow}–${bmiHigh} kg**. These are clinical reference values; individual variation is normal.`
    : `Para ${sexLabel} de ${alturaCm} cm — Lorentz: **${lorentzRounded} kg**, Devine: **${devineRounded} kg**. Rango saludable por IMC (18.5–24.9): **${bmiLow}–${bmiHigh} kg**. Son valores de referencia clínica; la variación individual es normal.`;

  // ── Insight tone based on how close Lorentz and Devine agree ─────────────
  const diff = Math.abs(lorentz - devine);
  let tone: string;
  if (diff <= 3) {
    tone = 'positive';
  } else if (diff <= 6) {
    tone = 'neutral';
  } else {
    tone = 'neutral';
  }

  const _insight = {
    title: __lang === 'en' ? 'Ideal Weight Estimate' : 'Peso ideal estimado',
    text: __lang === 'en'
      ? `For ${alturaCm} cm (${sexLabel}): Lorentz gives **${lorentzRounded} kg** and Devine gives **${devineRounded} kg**. The two formulas agree within ${diff.toFixed(1)} kg. The WHO-based healthy weight range (BMI 18.5–24.9) at this height is **${bmiLow}–${bmiHigh} kg**.`
      : `Para ${alturaCm} cm (${sexLabel}): Lorentz da **${lorentzRounded} kg** y Devine da **${devineRounded} kg**. Las dos fórmulas difieren ${diff.toFixed(1)} kg entre sí. El rango de peso saludable OMS (IMC 18.5–24.9) a esta altura es **${bmiLow}–${bmiHigh} kg**.`,
    tone,
    icon: '⚖️',
  };

  return { resultado, resumen, _insight };
}
