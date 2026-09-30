/** Matemática pura de escenarios editables; importes nominales en la misma moneda. */
export const nonnegative = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
export function comparePurchase(v: { price: number; discount: number; surcharge: number; months: number; rate: number; first: number; available: number; monthlyBudget: number }) {
  const price = nonnegative(v.price);
  const months = Math.min(120, Math.max(1, Math.trunc(nonnegative(v.months))));
  const cash = price * (1 - Math.min(100, nonnegative(v.discount)) / 100);
  const financed = price * (1 + nonnegative(v.surcharge) / 100);
  const installment = financed / months;
  const rate = nonnegative(v.rate) / 100;
  const first = v.first === 0 ? 0 : 1;
  let present = 0;
  for (let k = 0; k < months; k++) present += installment / (1 + rate) ** (k + first);
  return { cash, financed, installment, present, saving: cash - present, cashAffordable: cash <= nonnegative(v.available), installmentsAffordable: installment <= nonnegative(v.monthlyBudget) && (first !== 0 || installment <= nonnegative(v.available)), months };
}
export function rentalCosts(v: { rent: number; expenses: number; deposit: number; commission: number; insurance: number; other: number; services: number; income: number; ratio: number }) {
  const rent = nonnegative(v.rent), expenses = nonnegative(v.expenses), deposit = nonnegative(v.deposit), commission = nonnegative(v.commission), insurance = nonnegative(v.insurance), other = nonnegative(v.other), services = nonnegative(v.services), income = nonnegative(v.income);
  const monthly = rent + expenses + services;
  return { rent, expenses, deposit, commission, insurance, other, services, initial: rent + expenses + deposit + commission + insurance + other, monthly, burden: income > 0 ? monthly / income * 100 : null, recommended: monthly / Math.max(.01, Math.min(1, nonnegative(v.ratio))), maxRent: Math.max(0, income * Math.min(1, nonnegative(v.ratio)) - expenses - services) };
}
export interface SalaryMonth { key: string; valor: number }
export function salaryRecovery(base: number, series: SalaryMonth[], wages: Record<string, number | null> = {}) {
  let factor = 1;
  return series.map(({ key, valor }) => {
    if (!Number.isFinite(valor) || valor <= -100) throw new Error('IPC inválido');
    factor *= 1 + valor / 100;
    const needed = nonnegative(base) * factor;
    const wage = wages[key] == null ? null : nonnegative(wages[key]);
    return { key, ipc: valor, factor, needed, wage, real: wage != null && needed > 0 ? (wage / needed - 1) * 100 : null, recovery: wage != null && wage > 0 ? Math.max(0, (needed / wage - 1) * 100) : null };
  });
}
export function recoveryCsv(base: number, rows: ReturnType<typeof salaryRecovery>, source: string) {
  const headers = ['periodo','ipc_mensual_pct','factor_acumulado','sueldo_base_ars','sueldo_para_empatar_ars','sueldo_cargado_ars','variacion_real_pct','aumento_para_recuperar_pct','fuente'];
  // Separador ; y coma decimal para hojas de cálculo en español. Sin redondeo intermedio.
  const cell = (v: unknown) => typeof v === 'number' ? String(v).replace('.', ',') : '"' + String(v ?? '').replaceAll('"', '""') + '"';
  return '\uFEFF' + [headers, ...rows.map(r => [r.key,r.ipc,r.factor,base,r.needed,r.wage,r.real,r.recovery,source])].map(r => r.map(cell).join(';')).join('\r\n');
}
