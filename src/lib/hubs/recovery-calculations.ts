import { MEXICO_2026, isrMensual2026, subsidioEmpleoMensual2026, cuotaImssObreroMensual } from '../data/mexico-2026';
import { COLOMBIA_2026 } from '../data/colombia-2026';
const nonnegative = (n: number) => Number.isFinite(n) ? Math.max(0, n) : 0;
export function payrollMexico(gross: number, infonavit = 0) {
  const g = Math.round(nonnegative(gross) * 100) / 100;
  // Subsidio DOF 1-may-2024 y 31-dic-2025: no se entrega diferencia en efectivo.
  const isr = Math.max(0, isrMensual2026(g) - subsidioEmpleoMensual2026(g));
  const imss = cuotaImssObreroMensual(g); // aproximación SBC=bruto, explicitada en la UI
  const inf = g * Math.min(50, nonnegative(infonavit)) / 100;
  return { isr, imss, infonavit: inf, net: Math.max(0, g-isr-imss-inf) };
}
export function grossForNetMexico(target: number, inf = 0) {
  if (!(target > 0)) return 0;
  let lo = 0, hi = target;
  while (payrollMexico(hi, inf).net < target && hi < 1e10) hi *= 2;
  for (let i=0;i<80;i++) { const mid=(lo+hi)/2; if(payrollMexico(mid,inf).net<target)lo=mid;else hi=mid; }
  return Math.round(hi*100)/100;
}
export function sdiMexico(salary: number, monthly: boolean, years: number, bonus: number, premium: number, extra = 0) {
  if (![salary,years,bonus,premium,extra].every(Number.isFinite) || salary<=0 || years<1 || bonus<15 || premium<25 || extra<0) throw new Error('Revisa los datos: salario positivo, un año o más, aguinaldo desde 15 días y prima desde 25%.');
  const y=Math.floor(years), v=MEXICO_2026.lft.vacacionesPorAnio;
  const vacation=y<=v.length?v[y-1]:v[v.length-1]+MEXICO_2026.lft.vacacionesIncrementoQuinquenal*Math.ceil((y-v.length)/5);
  // LSS art.29 II: salario pactado por mes /30; no confundir con UMA mensual /30.4.
  const daily=monthly?salary/30:salary, factor=1+bonus/365+vacation*premium/100/365;
  const bonusDaily=daily*bonus/365, premiumDaily=daily*vacation*premium/100/365;
  const integrated=daily+bonusDaily+premiumDaily+extra/30;
  const cap=MEXICO_2026.uma.diaria*MEXICO_2026.imss.topeSbcUmas;
  return {daily,factor,vacation,bonusDaily,premiumDaily,extraDaily:extra/30,integrated,sbc:Math.min(integrated,cap),cap};
}
export function arlColombia(base: number, risk: string, workers: number) {
  const rates=COLOMBIA_2026.aportes.arl;
  if(!Number.isFinite(base)||base<=0||!(risk in rates)||!Number.isInteger(workers)||workers<1)throw new Error('Indica un IBC positivo, una clase I a V y al menos un trabajador.');
  const rate=rates[risk as keyof typeof rates], monthly=base*rate;
  return {rate,monthly,total:monthly*workers,annual:monthly*workers*12,employee:0};
}
export function colombiaHour(date: string, mode: string, salary: number, hours: number, night = false, extra = false) {
  if(!/^2026-\d{2}-\d{2}$/.test(date))throw new Error('Elige una fecha de 2026.');
  const j=COLOMBIA_2026.jornada,r=COLOMBIA_2026.recargos;
  const divisor=date<'2026-07-15'?j.divisorMensualHasta14Jul2026:j.divisorMensualDesde15Jul2026;
  const sunday=date<'2026-07-01'?r.dominicalFestivoHasta30Jun2026:r.dominicalFestivoDesde01Jul2026;
  const premium=mode==='sunday'?sunday+(night?(extra?r.extraNocturna:r.nocturno):(extra?r.extraDiurna:0)):mode==='night'?r.nocturno:mode==='nightextra'?r.extraNocturna:r.extraDiurna;
  const factor=mode==='night'?premium:1+premium,ordinary=nonnegative(salary)/divisor;
  return {divisor,premium,factor,ordinary,each:ordinary*factor,total:ordinary*factor*nonnegative(hours),additional:ordinary*premium*nonnegative(hours)};
}
