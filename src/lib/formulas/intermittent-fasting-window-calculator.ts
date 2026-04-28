export interface Inputs {
  protocol: string;
  eating_start_hour: number;
  eating_start_minute: number;
}

export interface Outputs {
  eating_window_hours: string;
  eating_start_time: string;
  eating_end_time: string;
  fast_start_time: string;
  fast_end_time: string;
  fasting_hours: string;
  ketosis_estimate: string;
  autophagy_estimate: string;
  tips: string;
}

// Protocol definitions: fasting hours and eating hours
// Source: standard IF nomenclature (16:8, 18:6, 20:4, OMAD)
const PROTOCOLS: Record<string, { fastHours: number; eatHours: number; name: string }> = {
  "16_8": { fastHours: 16, eatHours: 8, name: "16:8" },
  "18_6": { fastHours: 18, eatHours: 6, name: "18:6" },
  "20_4": { fastHours: 20, eatHours: 4, name: "20:4 (Warrior Diet)" },
  "omad":  { fastHours: 23, eatHours: 1, name: "OMAD" },
};

// Ketosis onset range (hours into fast) — NEJM 2019 / NIH NBK534848
const KETOSIS_START_H = 12;
const KETOSIS_END_H   = 18;

// Autophagy onset range (hours into fast) — NIH PMC4111762
const AUTOPHAGY_START_H = 16;
const AUTOPHAGY_END_H   = 24;

function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

function addMinutes(baseMinutes: number, addMin: number): number {
  return ((baseMinutes + addMin) % (24 * 60) + 24 * 60) % (24 * 60);
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

function formatDuration(hours: number): string {
  if (hours === 1) return "1 hour";
  return `${hours} hours`;
}

export function compute(i: Inputs): Outputs {
  const startHour   = Math.floor(Number(i.eating_start_hour)   || 0);
  const startMinute = Math.floor(Number(i.eating_start_minute) || 0);
  const protocolKey = i.protocol || "16_8";

  // Clamp values
  const clampedHour   = Math.max(0, Math.min(23, startHour));
  const clampedMinute = Math.max(0, Math.min(59, startMinute));

  const proto = PROTOCOLS[protocolKey] ?? PROTOCOLS["16_8"];

  const eatStartMin = toMinutes(clampedHour, clampedMinute);
  const eatEndMin   = addMinutes(eatStartMin,  proto.eatHours  * 60); // fast begins here
  const fastEndMin  = addMinutes(eatEndMin,    proto.fastHours * 60); // = eat start next cycle

  // Determine if eating window crosses midnight
  const eatEndRaw = eatStartMin + proto.eatHours * 60;
  const eatsCrossesMidnight = eatEndRaw >= 24 * 60;
  const eatEndSuffix  = eatsCrossesMidnight ? " (+1 day)" : "";

  // Determine if fast end crosses midnight relative to fast start
  const fastEndRaw = eatEndMin + proto.fastHours * 60;
  const fastCrossesMidnight = fastEndRaw >= 24 * 60;
  const fastEndSuffix = fastCrossesMidnight ? " (next day)" : "";

  // Ketosis onset window (absolute clock times from fast start)
  const ketoStartMin = addMinutes(eatEndMin, KETOSIS_START_H * 60);
  const ketoEndMin   = addMinutes(eatEndMin, KETOSIS_END_H   * 60);

  // Autophagy onset window
  const autoStartMin = addMinutes(eatEndMin, AUTOPHAGY_START_H * 60);
  const autoEndMin   = addMinutes(eatEndMin, AUTOPHAGY_END_H   * 60);

  // Check if protocol allows reaching ketosis / autophagy
  const canReachKetosis   = proto.fastHours >= KETOSIS_START_H;
  const canReachAutophagy = proto.fastHours >= AUTOPHAGY_START_H;

  const ketosisEstimate = canReachKetosis
    ? `~${formatTime(ketoStartMin)} – ${formatTime(ketoEndMin)} (hours ${KETOSIS_START_H}–${KETOSIS_END_H} of fast)`
    : `Not reliably reached on a ${proto.fastHours}-hour fast (requires ~12–18 h)`;

  const autophagyEstimate = canReachAutophagy
    ? `~${formatTime(autoStartMin)} – ${formatTime(autoEndMin)} (hours ${AUTOPHAGY_START_H}–${AUTOPHAGY_END_H} of fast)`
    : `Not reliably reached on a ${proto.fastHours}-hour fast (requires ~16–24 h)`;

  // Protocol-specific tips
  let tips = "";
  if (protocolKey === "16_8") {
    tips = "Allowed during the fast: water, plain black coffee, unsweetened black/green tea, plain electrolytes. Avoid anything with calories or artificial sweeteners that spike insulin. Most people find skipping breakfast the easiest way to hit 16 hours.";
  } else if (protocolKey === "18_6") {
    tips = "18:6 extends the 16:8 fast by 2 hours. Consider a 6-hour window like 1:00 PM–7:00 PM. Hunger typically peaks in the first 1–2 weeks and then adapts. Black coffee in the morning helps most people bridge the gap.";
  } else if (protocolKey === "20_4") {
    tips = "20:4 (Warrior Diet) typically uses one large meal plus a small second meal in the 4-hour window. High protein intake (0.7–1 g/lb body weight) and resistance training help preserve muscle mass on this aggressive protocol.";
  } else if (protocolKey === "omad") {
    tips = "OMAD requires careful attention to nutrition density — hit your full protein, fat, and micronutrient targets in a single 1-hour meal. Consult a dietitian if maintaining this long-term. Not recommended for people with blood sugar regulation issues.";
  }

  return {
    eating_window_hours: `${formatDuration(proto.eatHours)} (${proto.name} protocol)`,
    eating_start_time:   formatTime(eatStartMin),
    eating_end_time:     formatTime(eatEndMin) + eatEndSuffix,
    fast_start_time:     formatTime(eatEndMin) + eatEndSuffix,
    fast_end_time:       formatTime(fastEndMin % (24 * 60)) + fastEndSuffix,
    fasting_hours:       `${formatDuration(proto.fastHours)} (${proto.name} protocol)`,
    ketosis_estimate:    ketosisEstimate,
    autophagy_estimate:  autophagyEstimate,
    tips,
  };
}
