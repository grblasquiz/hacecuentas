export interface Inputs {
  date_input_type: string;
  input_date: string;
}

export interface Outputs {
  due_date: string;
  current_week: number;
  trimester: string;
  baby_size: string;
  weeks_remaining: number;
  calendar_data: string;
  key_appointments: string;
}

interface SizeData {
  week: number;
  size: string;
  crl: string;
  weight: string;
}

interface AppointmentData {
  week_range: string;
  description: string;
  date_range?: string;
}

const BABY_SIZES: SizeData[] = [
  { week: 8, size: "Raspberry", crl: "1.6 cm", weight: "<1 g" },
  { week: 12, size: "Poppy seed", crl: "5.4 cm", weight: "14 g" },
  { week: 16, size: "Avocado", crl: "11.6 cm", weight: "100 g" },
  { week: 20, size: "Banana", crl: "16.4 cm", weight: "300 g" },
  { week: 24, size: "Corn on the cob", crl: "20 cm", weight: "600 g" },
  { week: 28, size: "Eggplant", crl: "25 cm", weight: "1.0 kg" },
  { week: 32, size: "Squash", crl: "28 cm", weight: "1.7 kg" },
  { week: 36, size: "Romaine lettuce", crl: "32 cm", weight: "2.6 kg" },
  { week: 40, size: "Watermelon", crl: "36 cm", weight: "3.4 kg" }
];

const KEY_APPOINTMENTS: AppointmentData[] = [
  { week_range: "8–10", description: "Dating ultrasound, confirm viability, initial bloodwork" },
  { week_range: "11–13", description: "Nuchal translucency (NT) scan – screens for chromosomal abnormalities" },
  { week_range: "15–20", description: "Quad screen & integrated screening (first/second trimester)" },
  { week_range: "18–22", description: "Anatomy ultrasound – fetal organs, sex, placenta position" },
  { week_range: "24–28", description: "Gestational diabetes screening (oral glucose tolerance test)" },
  { week_range: "28–34", description: "RhoGAM (if Rh-negative), repeat bloodwork" },
  { week_range: "35–37", description: "Group B Streptococcus (GBS) vaginal/rectal swab" },
  { week_range: "36–40", description: "Biweekly then weekly visits; cervical exams; NST if post-term" }
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekNumber(date: Date, lmpDate: Date): number {
  const diffTime = date.getTime() - lmpDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

function getTrimesterInfo(weekNum: number): string {
  if (weekNum <= 13) return "First Trimester (weeks 1–13)";
  if (weekNum <= 27) return "Second Trimester (weeks 14–27)";
  return "Third Trimester (weeks 28–40+)";
}

function getBabySizeAtWeek(weekNum: number): string {
  let closestSize = BABY_SIZES[0];
  for (const size of BABY_SIZES) {
    if (Math.abs(weekNum - size.week) < Math.abs(weekNum - closestSize.week)) {
      closestSize = size;
    }
  }
  return `${closestSize.size} (Week ${closestSize.week}: ${closestSize.crl}, ~${closestSize.weight})`;
}

function buildCalendarData(lmpDate: Date, currentDate: Date): string {
  const weeks: string[] = [];
  weeks.push("**Week-by-Week Calendar Summary**\\n\\n");
  
  for (let w = 1; w <= 40; w += 4) {
    const weekStartDate = addDays(lmpDate, (w - 1) * 7);
    const weekEndDate = addDays(lmpDate, (w + 3) * 7);
    const isCurrentWeek = w <= getWeekNumber(currentDate, lmpDate) && w + 3 >= getWeekNumber(currentDate, lmpDate);
    const marker = isCurrentWeek ? "★" : " ";
    weeks.push(`${marker} **Weeks ${w}–${w + 3}:** ${formatDate(weekStartDate)} to ${formatDate(weekEndDate)}\\n`);
  }
  
  return weeks.join("");
}

function buildAppointmentsList(lmpDate: Date): string {
  const appts: string[] = [];
  appts.push("**Key Prenatal Appointment Timeline**\\n\\n");
  
  for (const appt of KEY_APPOINTMENTS) {
    const weekRange = appt.week_range.split("–");
    const startWeek = parseInt(weekRange[0]);
    const apptDate = addDays(lmpDate, startWeek * 7);
    appts.push(`- **${appt.week_range}:** ${appt.description} (circa ${formatDate(apptDate)})\\n`);
  }
  
  return appts.join("");
}

export function compute(i: Inputs): Outputs {
  let lmpDate: Date;
  const inputDate = new Date(i.input_date);

  if (i.date_input_type === "lmp") {
    lmpDate = inputDate;
  } else if (i.date_input_type === "due_date") {
    // Due date is LMP + 280 days, so LMP = due date - 280 days
    lmpDate = addDays(inputDate, -280);
  } else {
    return {
      due_date: "",
      current_week: 0,
      trimester: "Invalid input type",
      baby_size: "",
      weeks_remaining: 0,
      calendar_data: "",
      key_appointments: ""
    };
  }

  const dueDate = addDays(lmpDate, 280);
  const today = new Date();
  const currentWeek = getWeekNumber(today, lmpDate);
  const trimester = getTrimesterInfo(currentWeek);
  const babySize = getBabySizeAtWeek(currentWeek);
  
  const weeksRemaining = Math.max(0, getWeekNumber(dueDate, today));
  
  const calendarData = buildCalendarData(lmpDate, today);
  const appointmentsList = buildAppointmentsList(lmpDate);

  return {
    due_date: formatDate(dueDate),
    current_week: Math.max(1, currentWeek),
    trimester: trimester,
    baby_size: babySize,
    weeks_remaining: weeksRemaining,
    calendar_data: calendarData,
    key_appointments: appointmentsList
  };
}
