export interface Inputs {
  transfer_date: string;
  embryo_day: string;   // 'day3' | 'day5'
  transfer_type: string; // 'fresh' | 'frozen'
}

export interface Outputs {
  due_date: string;
  gestational_age: string;
  milestone_12w: string;
  milestone_20w: string;
  milestone_28w: string;
  lmp_equivalent: string;
  _insight?: any;
}

// Offsets from transfer date to EDD
// Source: ACOG CO-700 back-calculation from known fertilization date
// Day-5: LMP equiv = Transfer - 19d => EDD = Transfer + 261d
// Day-3: LMP equiv = Transfer - 17d => EDD = Transfer + 263d
const EDD_OFFSET_DAY5 = 261; // days added to transfer date
const EDD_OFFSET_DAY3 = 263; // days added to transfer date

// LMP equivalent offsets (days subtracted from transfer date)
const LMP_OFFSET_DAY5 = 19;
const LMP_OFFSET_DAY3 = 17;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getUTCMonth()]} ${day}, ${year}`;
}

function gestationalAgeText(lmpEquiv: Date, today: Date): string {
  const diffMs = today.getTime() - lmpEquiv.getTime();
  if (diffMs < 0) {
    return 'Transfer date is in the future — gestational age not yet applicable';
  }
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  if (weeks > 44) {
    return `${weeks} weeks ${days} day${days !== 1 ? 's' : ''} (past estimated due date)`;
  }
  return `${weeks} week${weeks !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''} gestational age`;
}

const EMPTY: Outputs = {
  due_date: '',
  gestational_age: 'Please enter a valid transfer date',
  milestone_12w: '',
  milestone_20w: '',
  milestone_28w: '',
  lmp_equivalent: '',
};

export function compute(i: Inputs): Outputs {
  if (!i.transfer_date || i.transfer_date.trim() === '') {
    return EMPTY;
  }

  const transferDate = new Date(i.transfer_date + 'T12:00:00Z');
  if (isNaN(transferDate.getTime())) {
    return { ...EMPTY, gestational_age: 'Invalid transfer date' };
  }

  // Determine offsets based on embryo day
  // Fresh and frozen transfers use the same offsets — freeze/thaw adds no gestational age
  const embryoDay = i.embryo_day === 'day3' ? 'day3' : 'day5';
  const eddOffset = embryoDay === 'day3' ? EDD_OFFSET_DAY3 : EDD_OFFSET_DAY5;
  const lmpOffset = embryoDay === 'day3' ? LMP_OFFSET_DAY3 : LMP_OFFSET_DAY5;

  const eddDate = addDays(transferDate, eddOffset);
  const lmpEquivDate = addDays(transferDate, -lmpOffset);

  // Milestones from LMP equivalent
  // 12 weeks = 84 days, 20 weeks = 140 days, 28 weeks = 196 days
  const milestone12w = addDays(lmpEquivDate, 84);
  const milestone20w = addDays(lmpEquivDate, 140);
  const milestone28w = addDays(lmpEquivDate, 196);

  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));

  const gaText = gestationalAgeText(lmpEquivDate, todayUTC);

  const transferTypeLabel = i.transfer_type === 'frozen' ? 'FET' : 'fresh';
  const embryoDayLabel = embryoDay === 'day3' ? 'Day-3' : 'Day-5';

  // Build a dynamic insight from the current gestational position
  const diffDays = Math.floor((todayUTC.getTime() - lmpEquivDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksDone = Math.floor(diffDays / 7);
  let insight: any;
  if (diffDays < 0) {
    insight = {
      title: 'Transfer not yet completed',
      text: `Based on a **${embryoDayLabel}** ${transferTypeLabel} transfer, your estimated due date will be **${formatDate(eddDate)}**. Counting starts from the transfer date you entered.`,
      tone: 'neutral',
      icon: '🗓️',
    };
  } else if (weeksDone >= 37) {
    insight = {
      title: 'Full term reached',
      text: `You are at **${weeksDone} weeks** — full term (37+). Your **${embryoDayLabel}** ${transferTypeLabel} transfer points to a due date of **${formatDate(eddDate)}**, but labor any time now is considered normal.`,
      tone: 'good',
      icon: '👶',
    };
  } else {
    const trimester = weeksDone < 13 ? 'first trimester' : weeksDone < 27 ? 'second trimester' : 'third trimester';
    const toGo = Math.max(0, 40 - weeksDone);
    insight = {
      title: `You are in the ${trimester}`,
      text: `At about **${weeksDone} weeks**, roughly **${toGo} weeks** remain until your estimated due date of **${formatDate(eddDate)}** (from a ${embryoDayLabel} ${transferTypeLabel} transfer). This is an estimate — your clinic's dating scan takes precedence.`,
      tone: 'neutral',
      icon: '🤰',
    };
  }

  return {
    due_date: formatDate(eddDate),
    gestational_age: gaText,
    milestone_12w: formatDate(milestone12w),
    milestone_20w: formatDate(milestone20w),
    milestone_28w: formatDate(milestone28w),
    lmp_equivalent: formatDate(lmpEquivDate),
    _insight: insight,
  };
}
