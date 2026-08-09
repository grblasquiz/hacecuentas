type Values = Record<string, any>;
type Caso = { id?: string } | null | undefined;
type Row = {
  k: string;
  ref?: string;
  v: number;
  extra?: boolean;
  format?: 'ars' | 'plain' | 'unit';
  unit?: string;
  decimals?: number;
};
type Result = {
  total: string;
  sub: string;
  rows: Row[];
  chart: Array<{ label: string; value: number; tone?: string }>;
};

const n = (v: Values, key: string, fallback = 0): number => {
  const value = Number(v[key]);
  return Number.isFinite(value) ? value : fallback;
};
const positive = (v: Values, key: string, fallback = 0): number => Math.max(0, n(v, key, fallback));
const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));
const usd = (value: number): string => {
  const rounded = Math.round(value);
  return (rounded < 0 ? '−US$' : 'US$') + Math.abs(rounded).toLocaleString('es-AR');
};
const USD = { format: 'unit' as const, unit: 'US$' };

function pmt(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return principal * r * factor / (factor - 1);
}

function monthsText(months: number): string {
  const whole = Math.max(0, Math.round(months));
  const years = Math.floor(whole / 12);
  const rest = whole % 12;
  if (years === 0) return `${rest} ${rest === 1 ? 'mes' : 'meses'}`;
  if (rest === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years} año${years === 1 ? '' : 's'} y ${rest} mes${rest === 1 ? '' : 'es'}`;
}

function amortizedLoan(principal: number, annualRatePct: number, months: number, extra = 0) {
  const rate = Math.max(0, annualRatePct) / 100 / 12;
  const scheduled = pmt(principal, annualRatePct, months);
  const payment = scheduled + Math.max(0, extra);
  let balance = principal;
  let interest = 0;
  let count = 0;
  while (balance > 0.01 && count < 1_000) {
    count++;
    const charge = balance * rate;
    const principalPaid = Math.min(balance, Math.max(0, payment - charge));
    if (principalPaid <= 0) return { payment, months: 1_000, interest: 0, scheduled };
    interest += charge;
    balance -= principalPaid;
  }
  return { payment, months: count, interest, scheduled };
}

function result(total: number, sub: string, rows: Row[], chart: Result['chart']): Result {
  return { total: usd(total), sub, rows, chart };
}

export function importarAuto(v: Values, caso: Caso): Result {
  const vehicle = positive(v, 'vehicle_price');
  const shipping = positive(v, 'vehicle_shipping');
  const insurance = positive(v, 'vehicle_insurance');
  const dutyRate = clamp(positive(v, 'vehicle_duty_rate'), 0, 200);
  const exciseRate = clamp(positive(v, 'vehicle_excise_rate'), 0, 200);
  const vatRate = clamp(positive(v, 'vehicle_vat_rate'), 0, 100);
  const port = positive(v, 'port_fees');
  const compliance = positive(v, 'compliance_cost');
  const registration = positive(v, 'registration_cost');
  const localPrice = positive(v, 'local_price');
  const customs = vehicle + shipping + insurance;
  const duty = customs * dutyRate / 100;
  const excise = (customs + duty) * exciseRate / 100;
  const vat = (customs + duty + excise) * vatRate / 100;
  const total = customs + duty + excise + vat + port + compliance + registration;
  const difference = localPrice - total;
  const id = caso?.id || 'importar';
  const rows: Row[] = [
    { k: 'Auto + flete + seguro', v: customs, ...USD },
    { k: 'Derecho de importación', ref: `${dutyRate.toFixed(2)}%`, v: duty, ...USD },
    { k: 'Impuesto selectivo o ambiental', ref: `${exciseRate.toFixed(2)}% después del derecho`, v: excise, ...USD },
    { k: 'IVA o impuesto de importación', ref: `${vatRate.toFixed(2)}% sobre la base indicada`, v: vat, ...USD },
    { k: 'Puerto, despachante y traslado', v: port, ...USD },
    { k: 'Homologación, inspección y registro', v: compliance + registration, ...USD },
    { k: 'Costo total nacionalizado', v: total, ...USD, extra: true },
  ];
  if (id === 'comparar') rows.push({ k: difference >= 0 ? 'Ahorro frente a comprarlo localmente' : 'Costo extra frente a comprarlo localmente', v: Math.abs(difference), ...USD, extra: true });
  return result(
    id === 'comparar' ? difference : total,
    id === 'comparar'
      ? (difference >= 0 ? `${usd(difference)} por debajo del precio local.` : `${usd(Math.abs(difference))} por encima del precio local.`)
      : `${usd(total)} estimados antes de financiación, mantenimiento y seguro anual.`,
    rows,
    [
      { label: 'Auto y logística', value: Math.round(customs), tone: 'main' },
      { label: 'Impuestos', value: Math.round(duty + excise + vat), tone: 'warn' },
      { label: 'Registro y cumplimiento', value: Math.round(port + compliance + registration), tone: 'prop' },
    ],
  );
}

export function mudarseExterior(v: Values, caso: Caso): Result {
  const annualGross = positive(v, 'annual_gross');
  const taxRate = clamp(positive(v, 'host_tax_rate'), 0, 100);
  const netMonthly = annualGross * (1 - taxRate / 100) / 12;
  const rent = positive(v, 'monthly_rent');
  const living = positive(v, 'monthly_living');
  const health = positive(v, 'monthly_health');
  const homeCosts = positive(v, 'home_country_costs');
  const relocation = positive(v, 'relocation_cost');
  const visa = positive(v, 'visa_cost');
  const gapMonths = positive(v, 'income_gap_months');
  const initial = relocation + visa + netMonthly * gapMonths;
  const monthlySurplus = netMonthly - rent - living - health - homeCosts;
  const yearOne = monthlySurplus * 12 - initial;
  const fiveYear = monthlySurplus * 60 - initial;
  const id = caso?.id || 'trabajo';
  const rows: Row[] = [
    { k: 'Ingreso mensual neto estimado', ref: `${taxRate.toFixed(2)}% de impuestos en destino`, v: netMonthly, ...USD, decimals: 2 },
    { k: 'Vivienda mensual', v: rent, ...USD },
    { k: 'Comida, transporte y vida diaria', v: living, ...USD },
    { k: 'Salud y seguro médico', v: health, ...USD },
    { k: 'Costos que mantenés en tu país', v: homeCosts, ...USD },
    { k: 'Mudanza, visa y puesta en marcha', v: relocation + visa, ...USD },
    { k: 'Excedente mensual', v: monthlySurplus, ...USD, extra: true },
    { k: 'Posición neta del primer año', v: yearOne, ...USD, extra: true },
    { k: 'Posición neta a cinco años', ref: id === 'jubilacion' ? 'Sin rendimientos ni cambios de salud' : 'Sin subas salariales ni rendimientos', v: fiveYear, ...USD },
  ];
  return result(
    id === 'cinco-anos' ? fiveYear : yearOne,
    monthlySurplus >= 0 ? `${usd(monthlySurplus)} libres por mes después del presupuesto del destino.` : `${usd(Math.abs(monthlySurplus))} de faltante mensual antes de los costos iniciales.`,
    rows,
    [
      { label: 'Ingreso neto', value: Math.round(netMonthly), tone: 'main' },
      { label: 'Costos recurrentes', value: Math.round(Math.max(0, netMonthly - monthlySurplus)), tone: 'warn' },
      { label: 'Mudanza y visa', value: Math.round(initial), tone: 'prop' },
    ],
  );
}

export function residenciaFiscalNomada(v: Values, caso: Caso): Result {
  const currentDays = positive(v, 'current_days');
  const previousDays = positive(v, 'previous_days');
  const olderDays = positive(v, 'older_days');
  const currentMinimum = positive(v, 'current_minimum_days', 31);
  const weighted = currentDays + previousDays / 3 + olderDays / 6;
  const substantialPresence = currentDays >= currentMinimum && weighted >= positive(v, 'residency_threshold', 183);
  const foreignDays = positive(v, 'foreign_days');
  const physicalPresence = foreignDays >= positive(v, 'foreign_threshold', 330);
  const income = positive(v, 'foreign_income');
  const homeTax = clamp(positive(v, 'home_tax_rate'), 0, 100);
  const hostTax = clamp(positive(v, 'host_tax_rate'), 0, 100);
  const estimatedDifference = income * Math.abs(homeTax - hostTax) / 100;
  const id = caso?.id || 'nomada';
  const rows: Row[] = [
    { k: 'Días en el país este año', v: currentDays, format: 'unit', unit: 'días' },
    { k: 'Presencia ponderada de tres años', ref: 'Año actual + 1/3 del anterior + 1/6 del previo', v: weighted, format: 'unit', unit: 'días', decimals: 1, extra: true },
    { k: 'Mínimo del año actual', ref: `${currentMinimum} días`, v: currentDays >= currentMinimum ? 1 : 0, format: 'unit', unit: 'cumple' },
    { k: 'Días completos fuera del país', v: foreignDays, format: 'unit', unit: 'días' },
    { k: 'Prueba de presencia física', ref: physicalPresence ? 'Umbral alcanzado' : 'Umbral no alcanzado', v: foreignDays, format: 'unit', unit: 'días' },
    { k: 'Diferencia estimada de impuesto', ref: `${homeTax.toFixed(1)}% de origen vs ${hostTax.toFixed(1)}% de destino`, v: estimatedDifference, ...USD, extra: true },
  ];
  return {
    total: id === 'diferencia' ? usd(estimatedDifference) : (substantialPresence ? 'Pasa' : 'Revisar'),
    sub: id === 'diferencia'
      ? `${usd(estimatedDifference)} es la brecha aproximada sobre el ingreso cargado; tratados y reglas de fuente pueden cambiarla.`
      : substantialPresence ? 'Los días cargados pasan la prueba ponderada.' : 'Los días cargados no pasan la prueba ponderada.',
    rows,
    chart: [
      { label: 'Días del año actual', value: Math.round(currentDays), tone: 'main' },
      { label: 'Días ponderados', value: Math.round(weighted), tone: substantialPresence ? 'good' : 'warn' },
      { label: 'Días fuera del país', value: Math.round(foreignDays), tone: physicalPresence ? 'good' : 'prop' },
    ],
  };
}
