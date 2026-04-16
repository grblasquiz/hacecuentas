/** Calculadora de Golden Hour */
export interface Inputs { latitud: number; diaDelAno: number; }
export interface Outputs { amanecer: string; atardecer: string; duracionGolden: number; horasLuz: number; }

export function goldenHourHorario(i: Inputs): Outputs {
  const lat = Number(i.latitud);
  const dia = Number(i.diaDelAno);
  if (isNaN(lat) || lat < -90 || lat > 90) throw new Error('Ingresá una latitud válida (-90 a 90)');
  if (!dia || dia < 1 || dia > 365) throw new Error('Ingresá un día del año (1-365)');

  const toRad = (d: number) => d * Math.PI / 180;
  const toDeg = (r: number) => r * 180 / Math.PI;

  // Solar declination (approximate)
  const decl = -23.45 * Math.cos(toRad(360 / 365 * (dia + 10)));

  // Hour angle at sunrise/sunset
  const cosHA = -Math.tan(toRad(lat)) * Math.tan(toRad(decl));
  const clamped = Math.max(-1, Math.min(1, cosHA));
  const HA = toDeg(Math.acos(clamped));

  const horasLuz = (2 * HA) / 15;
  const amanecerDecimal = 12 - HA / 15;
  const atardecerDecimal = 12 + HA / 15;

  const formatHora = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} (hora solar)`;
  };

  // Golden hour duration: approximate based on sun speed near horizon
  // At equator, sun moves 15 deg/hour, golden hour is ~6 deg = 24 min
  // At higher latitudes, sun crosses horizon at an angle, taking longer
  const sunAngle = Math.abs(Math.cos(toRad(lat - decl)));
  const duracionGolden = Math.round(6 / (15 * Math.max(sunAngle, 0.3)) * 60);

  return {
    amanecer: formatHora(amanecerDecimal),
    atardecer: formatHora(atardecerDecimal),
    duracionGolden: Math.min(duracionGolden, 120),
    horasLuz: Number(horasLuz.toFixed(1)),
  };
}
