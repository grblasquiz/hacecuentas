/** Final Grade Calculator — EN, audience global. "What do I need on the final to get X?" */
export interface Inputs {
  current_grade: number | string;
  final_weight: number | string;
  desired_grade: number | string;
}
export interface Outputs {
  required_final: number;
  achievable: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function finalGradeCalculator(i: Inputs): Outputs {
  const current = num(i.current_grade);
  const weight = num(i.final_weight);
  const desired = num(i.desired_grade);

  if (!Number.isFinite(current) || current < 0) throw new Error('Enter your current grade (%)');
  if (!Number.isFinite(weight) || weight <= 0 || weight > 100) throw new Error('Final exam weight must be between 0 and 100%');
  if (!Number.isFinite(desired) || desired < 0) throw new Error('Enter the grade you want (%)');

  const w = weight / 100;
  const required = (desired - current * (1 - w)) / w;
  const reqR = Math.round(required * 100) / 100;

  let tone = 'good', verdict = '';
  if (required > 100) { tone = 'bad'; verdict = `You'd need **${reqR}%** on the final — above 100%, so a **${desired}%** course grade isn't reachable from the final alone. Aim for the highest score you can, or check for extra credit.`; }
  else if (required <= 0) { tone = 'good'; verdict = `You've already secured **${desired}%** — even a **0** on the final keeps you at or above your target.`; }
  else { tone = required > 90 ? 'neutral' : 'good'; verdict = `You need **${reqR}%** on the final (worth ${weight}% of the grade) to finish with **${desired}%** overall.`; }

  return {
    required_final: reqR,
    achievable: required > 100 ? 'Not achievable from the final alone' : required <= 0 ? 'Already secured' : 'Achievable',
    _insight: { title: 'Score you need on the final', text: verdict, tone, icon: '🎓' },
    _chart: {
      type: 'gauge',
      value: Math.max(0, Math.min(100, reqR)),
      min: 0, max: 100,
      label: `${reqR}% needed`,
      ariaLabel: `You need ${reqR}% on the final to reach ${desired}% overall.`,
    },
  };
}
