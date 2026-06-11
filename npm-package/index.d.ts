// AUTO-GENERADO por scripts/build-data.mjs — no editar a mano.

/** Monotributo Argentina 2026 — categorías, topes de facturación y cuotas */
export declare const argentinaMonotributo: Record<string, unknown>;

/** Feriados Argentina 2026 — nacionales, trasladables y puentes */
export declare const argentinaFeriados: Record<string, unknown>;

/** Brasil 2026 — salário mínimo, INSS, IRRF, FGTS, seguro-desemprego e MEI */
export declare const brasil: Record<string, unknown>;

/** Chile 2026 — ingreso mínimo, topes imponibles e impuesto de 2ª categoría */
export declare const chile: Record<string, unknown>;

/** Colombia 2026 — UVT, retención en la fuente, renta y parámetros laborales */
export declare const colombia: Record<string, unknown>;

/** Ecuador 2026 — SBU, aportes IESS y tabla de impuesto a la renta */
export declare const ecuador: Record<string, unknown>;

/** México 2026 — tarifas ISR, subsidio al empleo y cuotas IMSS */
export declare const mexico: Record<string, unknown>;

/** Perú 2026 — RMV, UIT, IGV, aportes y renta de 5ta categoría */
export declare const peru: Record<string, unknown>;

/** USA 2026 — IRS 401(k) & IRA contribution limits (tax year 2026) */
export declare const usa: Record<string, unknown>;

export declare const datasets: Record<string, Record<string, unknown>>;
export interface DatasetMeta {
  slug: string; country: string; countryCode: string; currency: string | null;
  title: string; year: number; dataAsOf: string | null;
  source: string; sourceUrl: string | null; reference: string;
  license: string; attribution: string; file: string;
}
export declare const meta: DatasetMeta[];
declare const _default: Record<string, Record<string, unknown>>;
export default _default;
