export interface Inputs {
  initial_capital: number;
  monthly_contribution: number;
  annual_rate: number;
  years: number;
  compounding_frequency: string;
}

export interface Outputs {
  final_balance: number;
  total_contributed: number;
  total_interest: number;
  interest_percentage: number;
  monthly_breakdown: string;
}

export function compute(i: Inputs): Outputs {
  const initialCapital = Number(i.initial_capital) || 0;
  const monthlyContribution = Number(i.monthly_contribution) || 0;
  const annualRate = Number(i.annual_rate) || 0;
  const years = Number(i.years) || 0;
  const compoundingFrequency = String(i.compounding_frequency) || 'monthly';

  if (initialCapital < 0 || monthlyContribution < 0 || annualRate < 0 || years <= 0) {
    return {
      final_balance: 0,
      total_contributed: 0,
      total_interest: 0,
      interest_percentage: 0,
      monthly_breakdown: 'Por favor ingresa valores válidos (capital y aporte >= 0, tasa >= 0, años > 0).'
    };
  }

  const totalMonths = Math.round(years * 12);
  let balance = initialCapital;
  let monthlyBalances: Array<{ month: number; start: number; contribution: number; interest: number; end: number }> = [];

  let compoundsPerYear = 12;
  if (compoundingFrequency === 'quarterly') {
    compoundsPerYear = 4;
  } else if (compoundingFrequency === 'annual') {
    compoundsPerYear = 1;
  }

  const monthlyRateDecimal = annualRate / 100 / 12;
  const ratePerCompoundingPeriod = (annualRate / 100) / compoundsPerYear;
  const monthsPerPeriod = 12 / compoundsPerYear;

  for (let month = 1; month <= totalMonths; month++) {
    const startBalance = balance;
    balance += monthlyContribution;

    let interestThisMonth = 0;
    if (compoundingFrequency === 'monthly') {
      interestThisMonth = balance * monthlyRateDecimal;
      balance += interestThisMonth;
    } else {
      if (month % monthsPerPeriod === 0) {
        interestThisMonth = balance * ratePerCompoundingPeriod;
        balance += interestThisMonth;
      }
    }

    if (month <= 12) {
      monthlyBalances.push({
        month,
        start: startBalance,
        contribution: monthlyContribution,
        interest: interestThisMonth,
        end: balance
      });
    }
  }

  const totalContributed = initialCapital + (monthlyContribution * totalMonths);
  const totalInterest = balance - totalContributed;
  const interestPercentage = totalContributed > 0 ? (totalInterest / balance) * 100 : 0;

  let breakdownTable = 'Mes | Balance Inicial | Aporte | Interés | Balance Final\n';
  breakdownTable += '---|---|---|---|---\n';
  for (const row of monthlyBalances) {
    breakdownTable += `${row.month} | $${row.start.toFixed(2)} | $${row.contribution.toFixed(2)} | $${row.interest.toFixed(2)} | $${row.end.toFixed(2)}\n`;
  }

  return {
    final_balance: Number(balance.toFixed(2)),
    total_contributed: Number(totalContributed.toFixed(2)),
    total_interest: Number(totalInterest.toFixed(2)),
    interest_percentage: Number(interestPercentage.toFixed(2)),
    monthly_breakdown: breakdownTable
  };
}
