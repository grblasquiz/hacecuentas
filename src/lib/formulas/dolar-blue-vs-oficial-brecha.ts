/** Brecha cambiaria dólar blue vs oficial Argentina */

export interface Inputs {
  dolarOficial: number;
  dolarBlue: number;
  dolarMep?: number;
  dolarCcl?: number;
  montoEnPesos?: number;
  montoPesos?: number;
}

export interface Outputs {
  brechaBlue: number;
  brechaPct: string;
  brechaMep: number;
  brechaCcl: number;
  diferenciaPesos: number;
  dolaresOficial: number;
  dolaresBlue: number;
  usdOficial: string;
  usdBlue: string;
  dolaresMep: number;
  dolaresCcl: number;
  detalle: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function dolarBlueVsOficialBrecha(i: Inputs): Outputs {
  const oficial = Number(i.dolarOficial);
  const blue = Number(i.dolarBlue);
  const mep = Number(i.dolarMep) || 0;
  const ccl = Number(i.dolarCcl) || 0;
  // El campo del JSON puede llamarse montoPesos o montoEnPesos
  const pesos = Number(i.montoEnPesos ?? i.montoPesos) || 0;

  if (!oficial || oficial <= 0) throw new Error('Ingresá el dólar oficial');
  if (!blue || blue <= 0) throw new Error('Ingresá el dólar blue');

  const brechaBlue = ((blue - oficial) / oficial) * 100;
  const brechaMep = mep > 0 ? ((mep - oficial) / oficial) * 100 : 0;
  const brechaCcl = ccl > 0 ? ((ccl - oficial) / oficial) * 100 : 0;
  const diferenciaPesos = blue - oficial;

  const dolaresOficial = pesos > 0 ? pesos / oficial : 0;
  const dolaresBlue = pesos > 0 ? pesos / blue : 0;
  const dolaresMep = pesos > 0 && mep > 0 ? pesos / mep : 0;
  const dolaresCcl = pesos > 0 && ccl > 0 ? pesos / ccl : 0;

  // Texto de salida USD oficial / USD blue (incluye monto si lo ingresó)
  const usdOficial = pesos > 0
    ? `USD ${dolaresOficial.toFixed(2)} (con $${Math.round(pesos).toLocaleString()} al oficial $${oficial})`
    : `Cotización oficial: $${oficial}`;
  const usdBlue = pesos > 0
    ? `USD ${dolaresBlue.toFixed(2)} (con $${Math.round(pesos).toLocaleString()} al blue $${blue})`
    : `Cotización blue: $${blue}`;

  // Clasificación de la brecha
  let clasificacionBrecha = '';
  if (brechaBlue < 10) clasificacionBrecha = 'baja (sin incentivo significativo para el blue)';
  else if (brechaBlue < 30) clasificacionBrecha = 'moderada';
  else if (brechaBlue < 50) clasificacionBrecha = 'preocupante';
  else clasificacionBrecha = 'alta (suele anticipar corrección cambiaria)';

  const brechaPct = `${brechaBlue.toFixed(1)}% (${clasificacionBrecha})`;

  const detalle = `Brecha blue/oficial: ${brechaBlue.toFixed(1)}% (${clasificacionBrecha}). Diferencia por dólar: $${diferenciaPesos.toLocaleString()}.${mep > 0 ? ` Brecha MEP: ${brechaMep.toFixed(1)}%.` : ''}${ccl > 0 ? ` Brecha CCL: ${brechaCcl.toFixed(1)}%.` : ''}${pesos > 0 ? ` Con $${Math.round(pesos).toLocaleString()}: oficial USD ${dolaresOficial.toFixed(2)}, blue USD ${dolaresBlue.toFixed(2)} (perdés USD ${(dolaresOficial - dolaresBlue).toFixed(2)} comprando al blue vs oficial).` : ''}`;

  const formula = `Brecha = ($${blue} - $${oficial}) / $${oficial} × 100 = ${brechaBlue.toFixed(1)}%`;
  const explicacion = `Oficial: $${oficial}. Blue: $${blue} (brecha ${brechaBlue.toFixed(1)}%).${mep > 0 ? ` MEP: $${mep} (brecha ${brechaMep.toFixed(1)}%).` : ''}${ccl > 0 ? ` CCL: $${ccl} (brecha ${brechaCcl.toFixed(1)}%).` : ''}${pesos > 0 ? ` Con $${pesos.toLocaleString()} pesos: al oficial comprás USD ${dolaresOficial.toFixed(2)}, al blue USD ${dolaresBlue.toFixed(2)}${mep > 0 ? `, al MEP USD ${dolaresMep.toFixed(2)}` : ''}${ccl > 0 ? `, al CCL USD ${dolaresCcl.toFixed(2)}` : ''}.` : ''}`;

  // Tono del insight según la zona de la brecha
  let tone: 'good' | 'warn' | 'neutral';
  if (brechaBlue < 10) tone = 'good';
  else if (brechaBlue < 30) tone = 'neutral';
  else tone = 'warn';

  const _insight = {
    title: 'Qué dice la brecha',
    text: pesos > 0
      ? `La brecha blue/oficial es **${brechaBlue.toFixed(1)}%** (${clasificacionBrecha}). Con $${Math.round(pesos).toLocaleString()} comprás **USD ${dolaresOficial.toFixed(2)}** al oficial vs **USD ${dolaresBlue.toFixed(2)}** al blue: perdés **USD ${(dolaresOficial - dolaresBlue).toFixed(2)}** yendo al paralelo.`
      : `El blue ($${blue}) está **${brechaBlue.toFixed(1)}%** sobre el oficial ($${oficial}): brecha ${clasificacionBrecha}. Cada dólar paralelo cuesta **$${diferenciaPesos.toLocaleString()}** más que el oficial.`,
    tone,
    icon: '💵',
  };

  // Gauge: zona de la brecha (mismos umbrales que la clasificación)
  const segTop = Math.max(70, Math.ceil((brechaBlue + 10) / 10) * 10);
  const _chart = {
    type: 'scale',
    marker: Number(brechaBlue.toFixed(1)),
    markerLabel: `${brechaBlue.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 10, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderada', max: 30, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Preocupante', max: 50, color: '#ea580c', colorDark: '#f97316' },
      { nombre: 'Alta', max: segTop, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Brecha del ${brechaBlue.toFixed(1)}% sobre una escala: baja hasta 10%, moderada hasta 30%, preocupante hasta 50%, alta por encima.`,
  };

  return {
    brechaBlue: Number(brechaBlue.toFixed(2)),
    brechaPct,
    brechaMep: Number(brechaMep.toFixed(2)),
    brechaCcl: Number(brechaCcl.toFixed(2)),
    diferenciaPesos: Number(diferenciaPesos.toFixed(2)),
    dolaresOficial: Number(dolaresOficial.toFixed(2)),
    dolaresBlue: Number(dolaresBlue.toFixed(2)),
    usdOficial,
    usdBlue,
    dolaresMep: Number(dolaresMep.toFixed(2)),
    dolaresCcl: Number(dolaresCcl.toFixed(2)),
    detalle,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
