export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function consumoAireAcondicionadoAutoExtra(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  // rend: fuel economy in km/L (or L/100km treated as km/L if user enters it that way)
  const r = Number(i.rend) || 12;
  const h = Number(i.horas) || 1;
  const p = Number(i.precio) || 1;

  // Real formula: A/C compressor adds ~12% overhead to base fuel consumption.
  // At typical city driving speed of ~30 km/h, base consumption = 30/r L/h.
  // Extra consumption per hour = (30 / r) * 0.12
  // Source: U.S. DOE/ORNL — A/C reduces fuel economy 5–25%; 12% is the median for mixed driving.
  const AC_PENALTY = 0.12; // 12% of base consumption
  const CITY_SPEED_KMH = 30; // representative city/mixed speed
  const lHora = (CITY_SPEED_KMH / r) * AC_PENALTY;

  const dia = lHora * h;
  const litrosMes = dia * 30;
  const costoDia = dia * p;
  const mes = litrosMes * p;

  const extra = __lang === 'en'
    ? `${lHora.toFixed(2)} L/h (${dia.toFixed(2)} L/day)`
    : `${lHora.toFixed(2)} L/h (${dia.toFixed(2)} L/día)`;

  const resumen = __lang === 'en'
    ? `A/C ${h}h/day: ~${litrosMes.toFixed(1)} L/month extra — $${mes.toFixed(2)}/month at your fuel price.`
    : `A/A ${h}h/día: ~${litrosMes.toFixed(1)} L/mes extra — $${mes.toFixed(2)}/mes a tu precio de combustible.`;

  const _insight = {
    title: __lang === 'en' ? 'Your A/C fuel cost' : 'Lo que cuesta el aire',
    text: __lang === 'en'
      ? `At **${r} km/L**, your A/C burns about **${lHora.toFixed(2)} L/h** extra — roughly **${litrosMes.toFixed(1)} L** and **$${mes.toFixed(2)}** per month. At highway speeds (>60 km/h) A/C beats open windows for fuel economy.`
      : `Con **${r} km/L**, el aire acondicionado quema unos **${lHora.toFixed(2)} L/h** extra — cerca de **${litrosMes.toFixed(1)} L** y **$${mes.toFixed(2)}** al mes. A velocidades altas (>60 km/h) el A/A es más eficiente que bajar ventanillas.`,
    tone: 'neutral',
    icon: '❄️'
  };

  return { extra, costoMes: `$${mes.toFixed(2)}`, resumen, _insight };
}
