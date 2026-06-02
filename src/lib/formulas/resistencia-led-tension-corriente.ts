/**
 * Calculadora de resistencia para LED por tensión y corriente
 */

export interface Inputs {
  vFuente: number; vLed: number; iLed: number;
}

export interface Outputs {
  resistencia: string; comercial: string; potenciaDisipada: string; potenciaResistencia: string;
  _insight?: any; _chart?: any;
}

export function resistenciaLedTensionCorriente(inputs: Inputs): Outputs {
  const vf = Number(inputs.vFuente);
  const vl = Number(inputs.vLed);
  const iMa = Number(inputs.iLed);
  if (!vf || !vl || !iMa) throw new Error('Completá los campos');
  if (vl >= vf) throw new Error('La fuente debe ser mayor que V del LED');
  const i = iMa / 1000;
  const r = (vf - vl) / i;
  const p = (vf - vl) * i;
  // Valores comerciales E12
  const e12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82, 100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820, 1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200, 10000];
  const comercial = e12.find(v => v >= r) || Math.ceil(r);
  const potRes = p < 0.125 ? '1/8 W' : p < 0.25 ? '1/4 W' : p < 0.5 ? '1/2 W' : p < 1 ? '1 W' : p < 5 ? '5 W' : '10 W o mayor';
  const pMw = p * 1000;
  const tone = p >= 0.25 ? 'warn' : 'good';
  const gaugeMax = Math.max(5000, pMw * 1.25);
  return {
    resistencia: `${r.toFixed(1)} Ω`,
    comercial: `${comercial} Ω`,
    potenciaDisipada: `${pMw.toFixed(0)} mW (${p.toFixed(3)} W)`,
    potenciaResistencia: potRes,
    _insight: {
      title: 'Resistencia para tu LED',
      text: `Para caer de **${vf} V** a **${vl} V** a **${iMa} mA** necesitás **${r.toFixed(1)} Ω** (comercial **${comercial} Ω**). Disipa **${pMw.toFixed(0)} mW**, así que usá una resistencia de **${potRes}**.`,
      tone,
      icon: '💡',
    },
    _chart: {
      type: 'scale',
      marker: Number(pMw.toFixed(1)),
      markerLabel: `${pMw.toFixed(0)} mW`,
      min: 0,
      segments: [
        { nombre: '1/8 W', max: 125, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: '1/4 W', max: 250, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: '1/2 W', max: 500, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: '1 W', max: 1000, color: '#f97316', colorDark: '#ea580c' },
        { nombre: '5 W o más', max: Number(gaugeMax.toFixed(0)), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `La resistencia disipa ${pMw.toFixed(0)} mW; tamaño recomendado ${potRes}`,
    },
  };
}
