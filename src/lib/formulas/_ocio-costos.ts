export function n(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function positive(value: unknown, label: string): number {
  const parsed = n(value);
  if (parsed <= 0) throw new Error(`Ingresá ${label}`);
  return parsed;
}

export function round(value: number): number {
  return Math.round(value);
}

export function money(value: number): string {
  return `$${round(value).toLocaleString('es-AR')}`;
}

export function doughnut(slices: Array<{ label: string; value: number }>, total: number, ariaLabel: string) {
  return {
    type: 'doughnut' as const,
    slices: slices.map((s) => ({ ...s, value: round(s.value) })).filter((s) => s.value > 0),
    prefix: '$',
    centerValue: money(total),
    centerLabel: 'total',
    ariaLabel,
  };
}

export function largestLabel(parts: Array<{ label: string; value: number }>): string {
  if (!parts.length) return 'extras';
  return parts.reduce((a, b) => (b.value > a.value ? b : a)).label;
}
