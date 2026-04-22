/**
 * Hipoteca Banco Ciudad Procrear — línea UVA subsidiada.
 * Tasa Procrear ~3.5% anual + UVA (beneficiarios ANSES/cupo subsidio).
 * Incluye bonificación parcial de seguro si calificás para subsidio.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function hipotecaCiudadProcrear(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const plazoAnios = Math.max(1, Number(i.plazoAnios) || 20);
  const tnaPct = Math.max(0, Number(i.tna) || 3.5);
  const uvaHoy = Math.max(1, Number(i.uvaActual) || 1400);
  const tieneSubsidio = String(i.subsidio || 'no') === 'si';

  if (monto <= 0) throw new Error('Ingresá el monto del préstamo');

  const capitalUvas = monto / uvaHoy;
  const n = plazoAnios * 12;
  const iMens = tnaPct / 100 / 12;
  const cuotaPuraUvas = capitalUvas * (iMens * Math.pow(1 + iMens, n)) / (Math.pow(1 + iMens, n) - 1);
  const cuotaPuraArs = cuotaPuraUvas * uvaHoy;

  const seguros = monto * (tieneSubsidio ? 0.0003 : 0.0006);
  const cuotaTotal = cuotaPuraArs + seguros;
  const cft = tnaPct + 1.0 + 0.5;
  const subsidioMensual = tieneSubsidio ? cuotaTotal * 0.2 : 0;
  const cuotaConSubsidio = cuotaTotal - subsidioMensual;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  return {
    cuotaInicial: fmt(cuotaConSubsidio),
    cuotaSinSubsidio: fmt(cuotaTotal),
    seguros: fmt(seguros),
    subsidioAnses: tieneSubsidio ? fmt(subsidioMensual) : 'No aplica',
    cftUvaAprox: `${cft.toFixed(2)}%`,
    capitalUvas: `${capitalUvas.toFixed(2)} UVAs`,
    resumen: `Cuota inicial ${fmt(cuotaConSubsidio)}${tieneSubsidio ? ' (con subsidio ANSES)' : ''}. Línea Procrear Banco Ciudad tasa ${tnaPct}% + UVA.`,
  };
}
