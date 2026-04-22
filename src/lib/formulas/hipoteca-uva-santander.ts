/**
 * Hipoteca UVA Santander Argentina — sistema francés sobre capital en UVAs.
 * Tasa Santander UVA 2026 ~4.75% anual + UVA.
 * Seguro de vida ~0.035%/mes + seguro todo riesgo vivienda ~0.025%/mes.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function hipotecaUvaSantander(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const plazoAnios = Math.max(1, Number(i.plazoAnios) || 20);
  const tnaPct = Math.max(0, Number(i.tna) || 4.75);
  const uvaHoy = Math.max(1, Number(i.uvaActual) || 1400);

  if (monto <= 0) throw new Error('Ingresá el monto del préstamo');

  const capitalUvas = monto / uvaHoy;
  const n = plazoAnios * 12;
  const iMens = tnaPct / 100 / 12;
  const cuotaPuraUvas = capitalUvas * (iMens * Math.pow(1 + iMens, n)) / (Math.pow(1 + iMens, n) - 1);
  const cuotaPuraArs = cuotaPuraUvas * uvaHoy;

  const seguros = monto * 0.0006;
  const cuotaTotal = cuotaPuraArs + seguros;
  const cft = tnaPct + 1.3 + 0.7;
  const totalAPagar = cuotaTotal * n;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  return {
    cuotaInicial: fmt(cuotaTotal),
    cuotaPura: fmt(cuotaPuraArs),
    seguros: fmt(seguros),
    cftUvaAprox: `${cft.toFixed(2)}%`,
    capitalUvas: `${capitalUvas.toFixed(2)} UVAs`,
    totalAproxPagado: fmt(totalAPagar),
    resumen: `Cuota inicial ${fmt(cuotaTotal)} ajustable por UVA. Tasa Santander ${tnaPct}% + UVA.`,
  };
}
