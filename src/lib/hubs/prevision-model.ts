/** Régimen general; no certifica historia laboral ni derecho a una prestación. */
export function retirementEstimate(age: number, contributionYears: number, sex: string, continueContributing = true) {
  if (![age, contributionYears].every(Number.isFinite) || age < 18 || age > 100 || contributionYears < 0 || contributionYears > age - 18 || !['f','m'].includes(sex)) throw new Error('Revisá edad y aportes: no pueden superar el tiempo desde los 18 años.');
  const minimumAge = sex === 'f' ? 60 : 65;
  const ageCredit = Math.max(0, age - minimumAge) / 2;
  // Art. 19: 2 años de exceso de edad compensan 1 de servicios faltantes.
  const years = Math.max(0, minimumAge-age, (30-contributionYears-(age-minimumAge)/2) / (continueContributing ? 1.5 : .5));
  return { minimumAge, ageCredit, missingYears: Math.max(0, 30-contributionYears-ageCredit), monthsToWait: Math.max(0, Math.ceil(years*12-1e-8)) };
}
export function ucapBudget(age: number, sex: string, months: number, minimumBase: number) {
  if (!['f','m'].includes(sex) || !Number.isFinite(age) || !Number.isInteger(months) || months < 1 || months > 360 || !Number.isFinite(minimumBase) || minimumBase <= 0) throw new Error('Ingresá entre 1 y 360 meses enteros y una edad válida.');
  const eligibleAge = sex === 'f' ? age >= 50 && age < 60 : age >= 55 && age < 65;
  const unit = Math.round(minimumBase*.29*100)/100;
  return { eligibleAge, unit, total: Math.round(unit*months*100)/100 };
}
/** Sólo fallecimiento de persona jubilada, beneficiarios con derecho confirmado. */
export function survivorDistribution(base: number, spouse: boolean, children: number) {
  if (!Number.isFinite(base) || base <= 0 || !Number.isInteger(children) || children < 0 || children > 20 || (!spouse && children === 0)) throw new Error('Indicá un haber positivo y al menos un derechohabiente.');
  let spousePct = spouse ? (children ? 50 : 70) : 0;
  let childPct = children ? 20 + (spouse ? 0 : 50/children) : 0;
  const raw = spousePct+childPct*children;
  if(raw > 100) { spousePct *= 100/raw; childPct *= 100/raw; }
  return { spousePct, childPct, totalPct: Math.min(100, raw), spouseAmount: base*spousePct/100, childAmount: base*childPct/100, totalAmount: base*Math.min(100,raw)/100 };
}
