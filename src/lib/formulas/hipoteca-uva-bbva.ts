/**
 * Hipoteca UVA BBVA Argentina — sistema francés sobre capital en UVAs.
 * Tasa BBVA UVA 2026 ~4.5% anual + actualización UVA.
 * Seguro de vida ~0.04%/mes s/saldo + seguro incendio ~0.02%/mes.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function hipotecaUvaBbva(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const plazoAnios = Math.max(1, Number(i.plazoAnios) || 20);
  const tnaPct = Math.max(0, Number(i.tna) || 4.5);
  const uvaHoy = Math.max(1, Number(i.uvaActual) || 1400);

  if (monto <= 0) throw new Error('Ingresá el monto del préstamo');

  const capitalUvas = monto / uvaHoy;
  const n = plazoAnios * 12;
  const iMens = tnaPct / 100 / 12;
  const cuotaPuraUvas = capitalUvas * (iMens * Math.pow(1 + iMens, n)) / (Math.pow(1 + iMens, n) - 1);
  const cuotaPuraArs = cuotaPuraUvas * uvaHoy;

  const seguroVida = monto * 0.0004;
  const seguroIncendio = monto * 0.0002;
  const cuotaTotal = cuotaPuraArs + seguroVida + seguroIncendio;

  const cft = tnaPct + 1.2 + 0.8; // TNA + seguros + costos ~ CFT UVA
  const totalAPagar = cuotaTotal * n;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  return {
    cuotaInicial: fmt(cuotaTotal),
    cuotaPura: fmt(cuotaPuraArs),
    seguros: fmt(seguroVida + seguroIncendio),
    cftUvaAprox: `${cft.toFixed(2)}%`,
    capitalUvas: `${capitalUvas.toFixed(2)} UVAs`,
    totalAproxPagado: fmt(totalAPagar),
    resumen: `Cuota inicial ${fmt(cuotaTotal)} — se ajusta mensualmente por UVA. Tasa ${tnaPct}% + UVA.`,
  };
}
