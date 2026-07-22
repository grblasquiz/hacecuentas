/**
 * Sales Tax Holiday 2026 Savings Calculator (US) — EN, audience global.
 * Picks the shopper's state, applies the 2026 back-to-school holiday rules
 * (dates, covered categories, per-item price caps) and the state sales tax
 * rate to estimate how much tax they skip on clothing, school supplies,
 * and computers. Data: state DOR announcements / Tax Foundation 2026.
 */
export interface Inputs {
  state: string;
  clothing_total: number | string;
  clothing_max_item: number | string;
  supplies_total: number | string;
  supplies_max_item: number | string;
  computer_price: number | string;
}
export interface Outputs {
  total_savings: number;
  clothing_savings: number;
  supplies_savings: number;
  computer_savings: number;
  holiday_dates: string;
  eligibility_notes: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: number | string | undefined, d = 0): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : d;
};

interface HolidayRule {
  name: string;
  dates: string;
  /** Percentage points of state sales tax waived during the holiday. */
  rate: number;
  /** Per-item price cap in USD. null = covered with no cap; 0 = category NOT covered. */
  clothingCap: number | null | 0;
  suppliesCap: number | null | 0;
  computerCap: number | null | 0;
  note?: string;
}

// 2026 back-to-school sales tax holidays. Rates = state-level base rate waived
// (local taxes may still apply in some states). Sources: state DORs via
// Tax Foundation "Sales Tax Holidays by State, 2026".
export const HOLIDAYS_2026: Record<string, HolidayRule> = {
  AL: { name: 'Alabama', dates: 'July 17-19, 2026', rate: 4, clothingCap: 156, suppliesCap: 78, computerCap: 1173, note: 'Books $47 or less also exempt. Many localities waive their local tax too.' },
  AR: { name: 'Arkansas', dates: 'August 1-2, 2026', rate: 6.5, clothingCap: 100, suppliesCap: null, computerCap: null, note: 'Clothing must be under $100 per item; school supplies and electronic devices have no cap. State AND local tax waived.' },
  CT: { name: 'Connecticut', dates: 'August 16-22, 2026', rate: 6.35, clothingCap: 300, suppliesCap: 0, computerCap: 0, note: 'Clothing and footwear under $300 per item only. Supplies and computers stay taxable.' },
  FL: { name: 'Florida', dates: 'July 20 - August 20, 2026', rate: 6, clothingCap: 100, suppliesCap: 50, computerCap: 1500, note: 'Month-long holiday. Learning aids $30 or less also exempt.' },
  IA: { name: 'Iowa', dates: 'August 7-8, 2026', rate: 6, clothingCap: 100, suppliesCap: 0, computerCap: 0, note: 'Clothing and footwear under $100 per item only.' },
  IL: { name: 'Illinois', dates: 'August 7-16, 2026', rate: 5, clothingCap: 125, suppliesCap: null, computerCap: 0, note: 'Not a full exemption: state rate drops from 6.25% to 1.25% (you save 5 points). Local taxes still apply.' },
  MA: { name: 'Massachusetts', dates: 'August 8-9, 2026', rate: 6.25, clothingCap: 2500, suppliesCap: 2500, computerCap: 2500, note: 'General holiday: almost ALL retail items $2,500 or less. Clothing under $175 is exempt year-round anyway.' },
  MD: { name: 'Maryland', dates: 'August 9-15, 2026', rate: 6, clothingCap: 100, suppliesCap: 0, computerCap: 0, note: 'Clothing and footwear $100 or less; first $40 of a backpack also exempt. Computers not covered.' },
  MO: { name: 'Missouri', dates: 'August 7-9, 2026', rate: 4.225, clothingCap: 100, suppliesCap: 50, computerCap: 1500, note: 'Software $350 or less and graphing calculators $150 or less also exempt. Statewide, local tax also waived since 2023.' },
  MS: { name: 'Mississippi', dates: 'July 10-12, 2026', rate: 7, clothingCap: 100, suppliesCap: 100, computerCap: 0, note: 'Clothing and school supplies under $100 per item. Computers not covered.' },
  NM: { name: 'New Mexico', dates: 'July 31 - August 2, 2026', rate: 4.875, clothingCap: 100, suppliesCap: 30, computerCap: 1000, note: 'Computers $1,000 or less; related hardware $500 or less; calculators under $200.' },
  OH: { name: 'Ohio', dates: 'August 7-9, 2026', rate: 5.75, clothingCap: 75, suppliesCap: 20, computerCap: 0, note: 'Clothing $75 or less and school supplies/instructional materials $20 or less.' },
  OK: { name: 'Oklahoma', dates: 'August 7-9, 2026', rate: 4.5, clothingCap: 100, suppliesCap: 0, computerCap: 0, note: 'Clothing and footwear under $100 per item only.' },
  SC: { name: 'South Carolina', dates: 'August 7-9, 2026', rate: 6, clothingCap: null, suppliesCap: null, computerCap: null, note: 'No price caps at all — clothing, supplies, computers, printers, even bed and bath items are exempt.' },
  TN: { name: 'Tennessee', dates: 'July 31 - August 2, 2026', rate: 7, clothingCap: 100, suppliesCap: 100, computerCap: 1500, note: 'Clothing and supplies $100 or less per item; computers/laptops/tablets $1,500 or less. Local tax also waived.' },
  TX: { name: 'Texas', dates: 'August 7-9, 2026', rate: 6.25, clothingCap: 100, suppliesCap: 100, computerCap: 0, note: 'Clothing, footwear, school supplies and backpacks under $100 per item. Computers not covered. Local tax also waived.' },
  VA: { name: 'Virginia', dates: 'August 7-9, 2026', rate: 5.3, clothingCap: 100, suppliesCap: 20, computerCap: 0, note: 'Clothing $100 or less, supplies $20 or less. Hurricane-prep and Energy Star items are also in Virginia’s combined holiday.' },
  WV: { name: 'West Virginia', dates: 'July 31 - August 3, 2026', rate: 6, clothingCap: 125, suppliesCap: 50, computerCap: 500, note: 'Laptops/tablets $500 or less; instructional materials $20 or less; sports equipment $150 or less.' },
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function categorySavings(
  total: number,
  maxItem: number,
  cap: number | null | 0,
  rate: number,
  label: string,
  notes: string[],
): number {
  if (total <= 0) return 0;
  if (cap === 0) {
    notes.push(`${label}: NOT covered in this state — you pay full sales tax.`);
    return 0;
  }
  if (cap !== null && maxItem > 0 && maxItem > cap) {
    notes.push(`${label}: your priciest item ($${fmt(maxItem)}) is over the $${fmt(cap)} per-item cap — that item stays taxable. Savings shown exclude it.`);
    const remaining = Math.max(0, total - maxItem);
    return remaining * (rate / 100);
  }
  return total * (rate / 100);
}

export function compute(i: Inputs): Outputs {
  const rule = HOLIDAYS_2026[i.state];
  if (!rule) throw new Error('Pick a state with a 2026 sales tax holiday');

  const clothingTotal = num(i.clothing_total);
  const clothingMax = num(i.clothing_max_item);
  const suppliesTotal = num(i.supplies_total);
  const suppliesMax = num(i.supplies_max_item);
  const computerPrice = num(i.computer_price);

  if (clothingTotal + suppliesTotal + computerPrice <= 0) {
    throw new Error('Enter at least one cart amount greater than 0');
  }

  const notes: string[] = [];
  const clothing = categorySavings(clothingTotal, clothingMax, rule.clothingCap, rule.rate, 'Clothing', notes);
  const supplies = categorySavings(suppliesTotal, suppliesMax, rule.suppliesCap, rule.rate, 'School supplies', notes);

  let computer = 0;
  if (computerPrice > 0) {
    if (rule.computerCap === 0) {
      notes.push('Computers: NOT covered in this state — the computer stays taxable.');
    } else if (rule.computerCap !== null && computerPrice > rule.computerCap) {
      notes.push(`Computers: your $${fmt(computerPrice)} device is over the $${fmt(rule.computerCap)} cap — the WHOLE price is taxable (caps are all-or-nothing, not a deductible).`);
    } else {
      computer = computerPrice * (rule.rate / 100);
    }
  }
  if (notes.length === 0) notes.push('All your items qualify — everything below the caps is tax-free during the holiday.');

  const total = round2(clothing + supplies + computer);
  const cartTotal = clothingTotal + suppliesTotal + computerPrice;

  return {
    total_savings: total,
    clothing_savings: round2(clothing),
    supplies_savings: round2(supplies),
    computer_savings: round2(computer),
    holiday_dates: `${rule.name}: ${rule.dates}`,
    eligibility_notes: notes.join(' '),
    _insight: {
      title: `Shop ${rule.dates} in ${rule.name}`,
      text: `On a **$${fmt(cartTotal)}** back-to-school cart you skip about **$${fmt(total)}** of sales tax (${rule.rate}% waived). ${rule.note ?? ''}`,
      tone: total > 0 ? 'positive' : 'warning',
      icon: '🛒',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Clothing tax saved', value: round2(clothing) },
        { label: 'Supplies tax saved', value: round2(supplies) },
        { label: 'Computer tax saved', value: round2(computer) },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: `$${fmt(total)}`,
      centerLabel: 'Tax saved',
      ariaLabel: `Estimated sales tax saved during the ${rule.name} 2026 holiday: $${fmt(total)}.`,
    },
  };
}
