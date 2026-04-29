export interface Inputs {
  seniority_years: number;
  gross_salary: number;
  vacation_start_month: string;
}

export interface Outputs {
  vacation_days: number;
  vacation_gross_pay: number;
  vacation_plus_pay: number;
  total_vacation_payment: number;
  vacation_period: string;
}

export function compute(i: Inputs): Outputs {
  const seniorityYears = Number(i.seniority_years) || 0;
  const grossSalary = Number(i.gross_salary) || 0;
  const vacationStartMonth = String(i.vacation_start_month || 'diciembre');

  // Validaciones defensivas
  if (seniorityYears < 0 || grossSalary <= 0) {
    return {
      vacation_days: 0,
      vacation_gross_pay: 0,
      vacation_plus_pay: 0,
      total_vacation_payment: 0,
      vacation_period: 'Ingresá valores válidos (antigüedad ≥0, sueldo >0)'
    };
  }

  // Si antigüedad < 1 año, vacaciones proporcionales (14 días por año)
  let vacationDays: number;
  if (seniorityYears < 1) {
    vacationDays = Math.round((seniorityYears / 1) * 14 * 100) / 100;
  } else if (seniorityYears <= 5) {
    vacationDays = 14;
  } else if (seniorityYears <= 10) {
    vacationDays = 21;
  } else if (seniorityYears <= 20) {
    vacationDays = 28;
  } else {
    vacationDays = 35;
  }

  // Cálculo de pago: sueldo bruto / 30 días × días de vacaciones
  const dailyRate = grossSalary / 30;
  const vacationGrossPay = dailyRate * vacationDays;

  // Plus vacacional 3% según CCT 130/75
  const VACATION_PLUS_RATE = 0.03;
  const vacationPlusPay = vacationGrossPay * VACATION_PLUS_RATE;

  // Total a percibir
  const totalVacationPayment = vacationGrossPay + vacationPlusPay;

  // Período válido: 1 octubre - 30 abril
  const vacationPeriod = 'Entre 1 de octubre y 30 de abril (según acuerdo con empleador)';

  return {
    vacation_days: Math.round(vacationDays * 100) / 100,
    vacation_gross_pay: Math.round(vacationGrossPay * 100) / 100,
    vacation_plus_pay: Math.round(vacationPlusPay * 100) / 100,
    total_vacation_payment: Math.round(totalVacationPayment * 100) / 100,
    vacation_period: vacationPeriod
  };
}
