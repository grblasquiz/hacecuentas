/** Calculadora watts / amperes / volts */
export interface Inputs { voltaje: number; conocido: string; valor: number; }
export interface Outputs { watts: string; amperes: string; voltaje: string; info: string; _insight?: any; _chart?: any; }

export function potenciaElectricaWatts(i: Inputs): Outputs {
  const v = Number(i.voltaje);
  const val = Number(i.valor);
  if (!v || v <= 0) throw new Error('Ingresá el voltaje');
  if (!val || val <= 0) throw new Error('Ingresá el valor conocido');

  let w: number, a: number;
  if (i.conocido === 'watts') { w = val; a = val / v; }
  else { a = val; w = val * v; }

  let cableRecomendado = '1.5 mm2';
  if (a > 32) cableRecomendado = '10 mm2';
  else if (a > 25) cableRecomendado = '6 mm2';
  else if (a > 16) cableRecomendado = '4 mm2';
  else if (a > 10) cableRecomendado = '2.5 mm2';

  const tone = a > 25 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Consumo y cableado',
    text: `${w.toFixed(0)} W a ${v} V circulan como **${a.toFixed(2)} A**, así que necesitás cable de **${cableRecomendado}** y una térmica de **${Math.ceil(a / 4) * 4} A**.` +
      (a > 25 ? ' Es una corriente alta: verificá la sección del cable y que el circuito esté bien dimensionado.' : ''),
    tone,
    icon: '⚡',
  };

  const _chart = {
    type: 'scale' as const,
    marker: Number(a.toFixed(2)),
    markerLabel: `${a.toFixed(2)} A`,
    min: 0,
    segments: [
      { nombre: '1.5 mm²', max: 10, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: '2.5 mm²', max: 16, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: '4 mm²', max: 25, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: '6 mm²', max: 32, color: '#f97316', colorDark: '#fb923c' },
      { nombre: '10 mm²', max: Math.max(40, Math.ceil(a) + 5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Corriente de ${a.toFixed(2)} A y la sección de cable recomendada según rangos de amperaje`,
  };

  return {
    watts: `${w.toFixed(0)} W`,
    amperes: `${a.toFixed(2)} A`,
    voltaje: `${v} V`,
    info: `Cable recomendado: ${cableRecomendado}. Termomagnética mínima: ${Math.ceil(a / 4) * 4}A.`,
    _insight,
    _chart,
  };
}
