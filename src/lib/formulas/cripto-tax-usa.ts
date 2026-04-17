/** Cripto tax USA capital gains */
export interface Inputs { gainUsd: number; holdingMonths: number; taxableIncomeUsd: number; filingStatus: string; }
export interface Outputs { taxUsd: number; taxType: string; marginalRate: number; netUsd: number; explicacion: string; }
export function criptoTaxUsaCapitalGains(i: Inputs): Outputs {
  const gain = Number(i.gainUsd);
  const months = Number(i.holdingMonths);
  const income = Number(i.taxableIncomeUsd) || 0;
  const status = String(i.filingStatus || 'single');
  if (gain < 0) throw new Error('Ganancia inválida');
  const isLongTerm = months >= 12;
  let rate = 0;
  let taxType = '';
  if (isLongTerm) {
    taxType = 'Long-term capital gains';
    if (status === 'single') {
      if (income < 47025) rate = 0;
      else if (income < 518900) rate = 15;
      else rate = 20;
    } else {
      if (income < 94050) rate = 0;
      else if (income < 583750) rate = 15;
      else rate = 20;
    }
  } else {
    taxType = 'Short-term (ordinary income rate)';
    if (status === 'single') {
      if (income < 11600) rate = 10;
      else if (income < 47150) rate = 12;
      else if (income < 100525) rate = 22;
      else if (income < 191950) rate = 24;
      else if (income < 243725) rate = 32;
      else if (income < 609350) rate = 35;
      else rate = 37;
    } else {
      if (income < 23200) rate = 10;
      else if (income < 94300) rate = 12;
      else if (income < 201050) rate = 22;
      else if (income < 383900) rate = 24;
      else if (income < 487450) rate = 32;
      else if (income < 731200) rate = 35;
      else rate = 37;
    }
  }
  const tax = gain * (rate / 100);
  const net = gain - tax;
  return {
    taxUsd: Number(tax.toFixed(2)),
    taxType: taxType,
    marginalRate: rate,
    netUsd: Number(net.toFixed(2)),
    explicacion: `Ganancia $${gain.toLocaleString()} USD con holding ${months} meses (${isLongTerm ? 'long-term' : 'short-term'}): tasa ${rate}%. Tax $${tax.toFixed(2)}. Neto $${net.toFixed(2)}.`,
  };
}
