export interface Inputs {
  voltage: number;
  amperage: number;
  hours_per_day: number;
  days_per_month: number;
  price_per_kwh: number;
}

export interface Outputs {
  watts: number;
  kwh_per_day: number;
  kwh_per_month: number;
  monthly_cost: number;
  annual_cost: number;
}

export function compute(i: Inputs): Outputs {
  const voltage = Number(i.voltage) || 0;
  const amperage = Number(i.amperage) || 0;
  const hours_per_day = Number(i.hours_per_day) || 0;
  const days_per_month = Number(i.days_per_month) || 0;
  const price_per_kwh = Number(i.price_per_kwh) || 0;

  if (voltage <= 0 || amperage <= 0 || hours_per_day <= 0 || days_per_month <= 0 || price_per_kwh < 0) {
    return {
      watts: 0,
      kwh_per_day: 0,
      kwh_per_month: 0,
      monthly_cost: 0,
      annual_cost: 0
    };
  }

  // Cálculo de potencia instantánea: P = V × I
  const watts = voltage * amperage;

  // Cálculo de consumo diario en kWh
  const kwh_per_day = (watts / 1000) * hours_per_day;

  // Cálculo de consumo mensual en kWh
  const kwh_per_month = kwh_per_day * days_per_month;

  // Cálculo del costo mensual
  const monthly_cost = kwh_per_month * price_per_kwh;

  // Cálculo del costo anual (12 meses)
  const annual_cost = monthly_cost * 12;

  return {
    watts: Math.round(watts * 100) / 100,
    kwh_per_day: Math.round(kwh_per_day * 100) / 100,
    kwh_per_month: Math.round(kwh_per_month * 100) / 100,
    monthly_cost: Math.round(monthly_cost * 100) / 100,
    annual_cost: Math.round(annual_cost * 100) / 100
  };
}
