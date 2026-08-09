/**
 * Sensibilidad ±10% del dato principal (Nivel 1 "salas de decisión").
 *
 * Re-ejecuta la fórmula dos veces con el driver un 10% abajo y un 10% arriba
 * y devuelve el array `sensitivity` que espera `HubResult`. Es deliberadamente
 * conservador: ante cualquier cosa rara (driver no numérico, la fórmula tira,
 * el resultado no es extraíble) devuelve `[]` y el hub queda como hoy.
 */

export interface SensitivityItem {
  label: string;
  value: string;
}

export interface SensitivityOpts {
  /** Variación relativa. Default 0.1 (±10%). */
  pct?: number;
  /** Nombre humano del driver para las etiquetas ("tu sueldo"). Default: la clave. */
  driverLabel?: string;
  /** Extrae el número principal del resultado de la fórmula. Obligatorio en la práctica. */
  extract?: (result: any) => number | null;
  /** Formatea el número extraído. Default: toLocaleString del locale. */
  format?: (n: number) => string;
  /** Locale para el formato default. Default 'es'. */
  locale?: string;
  /** Etiquetas propias por dirección; pisan las default. */
  labels?: { down?: string; up?: string };
}

export function computeSensitivity(
  fn: (inputs: Record<string, unknown>) => any,
  inputs: Record<string, unknown>,
  driverKey: string,
  opts: SensitivityOpts = {},
): SensitivityItem[] {
  const base = Number(inputs?.[driverKey]);
  if (!Number.isFinite(base) || base === 0) return [];

  const pct = opts.pct ?? 0.1;
  const locale = opts.locale || 'es';
  const extract =
    opts.extract ??
    ((r: any) => (typeof r === 'number' && Number.isFinite(r) ? r : null));
  const format =
    opts.format ?? ((n: number) => n.toLocaleString(locale, { maximumFractionDigits: 2 }));
  const driver = opts.driverLabel || driverKey.replace(/_/g, ' ');
  const pctLabel = Math.round(pct * 100);

  const out: SensitivityItem[] = [];
  const runs: Array<{ dir: 'down' | 'up'; mult: number }> = [
    { dir: 'down', mult: 1 - pct },
    { dir: 'up', mult: 1 + pct },
  ];
  for (const { dir, mult } of runs) {
    try {
      const result = fn({ ...inputs, [driverKey]: base * mult });
      const n = extract(result);
      if (n === null || !Number.isFinite(n)) return [];
      const label =
        opts.labels?.[dir] ??
        (dir === 'down' ? `Si ${driver} baja ${pctLabel}%` : `Si ${driver} sube ${pctLabel}%`);
      out.push({ label, value: format(n) });
    } catch {
      // La fórmula tiró con el input perturbado: sin sensibilidad, sin romper nada.
      return [];
    }
  }
  return out;
}
