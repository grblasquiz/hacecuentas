export interface Inputs {
  monthly_salary: number;
  hours_per_week: number;
  vacation_days: number;
  country_comparison: string;
}

export interface Outputs {
  hourly_rate: number;
  daily_rate: number;
  minute_rate: number;
  annual_hours: number;
  comparison_text: string;
}

function getMinimumWageUSD(country: string): { wage: number; label: string } {
  const wages: Record<string, { wage: number; label: string }> = {
    ar: { wage: 312, label: "Salario mínimo Argentina 2026: ~$312 USD/mes" },
    mx: { wage: 375, label: "Salario mínimo México 2026: ~$375 USD/mes" },
    es: { wage: 1260, label: "Salario mínimo España 2026: ~$1,260 USD/mes" },
    co: { wage: 324, label: "Salario mínimo Colombia 2026: ~$324 USD/mes" },
    cl: { wage: 463, label: "Salario mínimo Chile 2026: ~$463 USD/mes" },
    pe: { wage: 410, label: "Salario mínimo Perú 2026: ~$410 USD/mes" }
  };
  return wages[country] || { wage: 0, label: "" };
}

export function compute(i: Inputs): Outputs {
  const monthlySalary = Number(i.monthly_salary) || 0;
  const hoursPerWeek = Number(i.hours_per_week) || 40;
  const vacationDays = Number(i.vacation_days) || 0;
  const countryComparison = i.country_comparison || "none";

  if (monthlySalary <= 0 || hoursPerWeek <= 0) {
    return {
      hourly_rate: 0,
      daily_rate: 0,
      minute_rate: 0,
      annual_hours: 0,
      comparison_text: "Ingresa valores válidos (salario y horas mayores a 0)"
    };
  }

  // Weeks worked per year = 52 - (vacation days / 5)
  const weeksWorkedPerYear = 52 - (vacationDays / 5);
  const annualHours = weeksWorkedPerYear * hoursPerWeek;
  const annualSalary = monthlySalary * 12;

  const hourlyRate = annualSalary / annualHours;
  const dailyRate = hourlyRate * (hoursPerWeek / 5); // 5 días por semana
  const minuteRate = hourlyRate / 60;

  let comparisonText = "";
  if (countryComparison !== "none") {
    const minWage = getMinimumWageUSD(countryComparison);
    if (minWage.wage > 0) {
      const ratio = (monthlySalary / minWage.wage).toFixed(2);
      comparisonText = `Tu salario es ${ratio}x el mínimo. ${minWage.label}.`;
    }
  } else {
    comparisonText = "Sin comparación seleccionada";
  }

  return {
    hourly_rate: Math.round(hourlyRate * 100) / 100,
    daily_rate: Math.round(dailyRate * 100) / 100,
    minute_rate: Math.round(minuteRate * 100) / 100,
    annual_hours: Math.round(annualHours),
    comparison_text: comparisonText
  };
}
