/** Brecha cambiaria dólar blue vs oficial Argentina */

export interface Inputs {
  dolarOficial: number;
  dolarBlue: number;
  dolarMep: number;
  dolarCcl: number;
  montoEnPesos: number;
}

export interface Outputs {
  brechaBlue: number;
  brechaMep: number;
  brechaCcl: number;
  dolaresOficial: number;
  dolaresBlue: number;
  dolaresMep: number;
  dolaresCcl: number;
  formula: string;
  explicacion: string;
}

export function dolarBlueVsOficialBrecha(i: Inputs): Outputs {
  const oficial = Number(i.dolarOficial);
  const blue = Number(i.dolarBlue);
  const mep = Number(i.dolarMep) || 0;
  const ccl = Number(i.dolarCcl) || 0;
  const pesos = Number(i.montoEnPesos) || 0;

  if (!oficial || oficial <= 0) throw new Error('Ingresá el dólar oficial');
  if (!blue || blue <= 0) throw new Error('Ingresá el dólar blue');

  const brechaBlue = ((blue - oficial) / oficial) * 100;
  const brechaMep = mep > 0 ? ((mep - oficial) / oficial) * 100 : 0;
  const brechaCcl = ccl > 0 ? ((ccl - oficial) / oficial) * 100 : 0;

  const dolaresOficial = pesos > 0 ? pesos / oficial : 0;
  const dolaresBlue = pesos > 0 ? pesos / blue : 0;
  const dolaresMep = pesos > 0 && mep > 0 ? pesos / mep : 0;
  const dolaresCcl = pesos > 0 && ccl > 0 ? pesos / ccl : 0;

  const formula = `Brecha = ($${blue} - $${oficial}) / $${oficial} × 100 = ${brechaBlue.toFixed(1)}%`;
  const explicacion = `Oficial: $${oficial}. Blue: $${blue} (brecha ${brechaBlue.toFixed(1)}%).${mep > 0 ? ` MEP: $${mep} (brecha ${brechaMep.toFixed(1)}%).` : ''}${ccl > 0 ? ` CCL: $${ccl} (brecha ${brechaCcl.toFixed(1)}%).` : ''}${pesos > 0 ? ` Con $${pesos.toLocaleString()} pesos: al oficial comprás USD ${dolaresOficial.toFixed(2)}, al blue USD ${dolaresBlue.toFixed(2)}${mep > 0 ? `, al MEP USD ${dolaresMep.toFixed(2)}` : ''}${ccl > 0 ? `, al CCL USD ${dolaresCcl.toFixed(2)}` : ''}.` : ''}`;

  return {
    brechaBlue: Number(brechaBlue.toFixed(2)),
    brechaMep: Number(brechaMep.toFixed(2)),
    brechaCcl: Number(brechaCcl.toFixed(2)),
    dolaresOficial: Number(dolaresOficial.toFixed(2)),
    dolaresBlue: Number(dolaresBlue.toFixed(2)),
    dolaresMep: Number(dolaresMep.toFixed(2)),
    dolaresCcl: Number(dolaresCcl.toFixed(2)),
    formula,
    explicacion,
  };
}
