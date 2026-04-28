export interface Inputs {
  distance: number;
  distance_unit: string;
  avg_speed: number;
  speed_unit: string;
  break_duration: number;
  break_frequency: number;
  departure_hour: number;
  departure_minute: number;
}

export interface Outputs {
  pure_drive_time: string;
  total_break_time: string;
  total_trip_time: string;
  eta: string;
  number_of_breaks: number;
  overnight_recommendation: string;
}

// Conversion constant: 1 km = 0.621371 mi
const KM_TO_MI = 0.621371;

function formatHoursMinutes(totalHours: number): string {
  if (totalHours < 0) totalHours = 0;
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h 0m`;
  return `${h}h ${m}m`;
}

function formatETA(departureHour: number, departureMinute: number, tripHours: number): string {
  const depTotalMin = departureHour * 60 + departureMinute;
  const tripTotalMin = Math.round(tripHours * 60);
  const arrivalTotalMin = depTotalMin + tripTotalMin;

  const minutesInDay = 24 * 60;
  const normalizedMin = ((arrivalTotalMin % minutesInDay) + minutesInDay) % minutesInDay;
  const daysOver = Math.floor(arrivalTotalMin / minutesInDay);

  const arrHour = Math.floor(normalizedMin / 60);
  const arrMin = normalizedMin % 60;

  const period = arrHour >= 12 ? 'PM' : 'AM';
  const displayHour = arrHour % 12 === 0 ? 12 : arrHour % 12;
  const displayMin = arrMin.toString().padStart(2, '0');

  if (daysOver === 1) {
    return `${displayHour}:${displayMin} ${period} (next day)`;
  } else if (daysOver > 1) {
    return `${displayHour}:${displayMin} ${period} (+${daysOver} days)`;
  }
  return `${displayHour}:${displayMin} ${period}`;
}

export function compute(i: Inputs): Outputs {
  const DEFAULT_OUTPUT: Outputs = {
    pure_drive_time: '—',
    total_break_time: '0m',
    total_trip_time: '—',
    eta: '—',
    number_of_breaks: 0,
    overnight_recommendation: 'Enter a valid distance and speed to get a recommendation.',
  };

  // Parse and validate inputs
  let distance = Number(i.distance) || 0;
  const distance_unit = i.distance_unit || 'miles';
  let avg_speed = Number(i.avg_speed) || 0;
  const speed_unit = i.speed_unit || 'mph';
  const break_duration = Number(i.break_duration) >= 0 ? Number(i.break_duration) : 15;
  const break_frequency = Number(i.break_frequency) > 0 ? Number(i.break_frequency) : 2;
  let departure_hour = Math.floor(Number(i.departure_hour));
  let departure_minute = Math.floor(Number(i.departure_minute) || 0);

  if (distance <= 0 || avg_speed <= 0) {
    return DEFAULT_OUTPUT;
  }

  // Clamp departure time
  if (departure_hour < 0 || departure_hour > 23) departure_hour = 8;
  if (departure_minute < 0 || departure_minute > 59) departure_minute = 0;

  // Normalize to miles and mph for calculation
  let distanceMi = distance_unit === 'kilometers' ? distance * KM_TO_MI : distance;
  let speedMph = speed_unit === 'kph' ? avg_speed * KM_TO_MI : avg_speed;

  if (distanceMi <= 0 || speedMph <= 0) {
    return DEFAULT_OUTPUT;
  }

  // Step 1: Pure drive time in hours
  const pureDriveHours = distanceMi / speedMph;

  // Step 2: Number of breaks
  // A break occurs after each full interval of driving; the final segment does not earn a break
  const numberOfBreaks = Math.floor(pureDriveHours / break_frequency);

  // Step 3: Total break time in hours
  const totalBreakHours = (numberOfBreaks * break_duration) / 60;

  // Step 4: Total trip time
  const totalTripHours = pureDriveHours + totalBreakHours;

  // Step 5: ETA string
  const etaStr = formatETA(departure_hour, departure_minute, totalTripHours);

  // Step 6: Overnight recommendation
  // AAA / NHTSA: >10 hours total trip time warrants an overnight consideration
  const OVERNIGHT_THRESHOLD_HRS = 10; // AAA Foundation research
  let overnightRec: string;
  if (totalTripHours > OVERNIGHT_THRESHOLD_HRS) {
    const splitHours = formatHoursMinutes(totalTripHours / 2);
    overnightRec = `⚠️ Your total trip time (${formatHoursMinutes(totalTripHours)}) exceeds ${OVERNIGHT_THRESHOLD_HRS} hours. Consider splitting into two days (~${splitHours} each) to reduce drowsy-driving risk.`;
  } else if (totalTripHours > 8) {
    overnightRec = `This is a long drive (${formatHoursMinutes(totalTripHours)}). Take all planned breaks and avoid driving in the late-night hours.`;
  } else {
    overnightRec = `Trip length (${formatHoursMinutes(totalTripHours)}) is manageable in a single day with proper breaks.`;
  }

  return {
    pure_drive_time: formatHoursMinutes(pureDriveHours),
    total_break_time: numberOfBreaks > 0 ? formatHoursMinutes(totalBreakHours) : '0m (no breaks scheduled)',
    total_trip_time: formatHoursMinutes(totalTripHours),
    eta: etaStr,
    number_of_breaks: numberOfBreaks,
    overnight_recommendation: overnightRec,
  };
}
