export interface ResonanciaLcCircuitoInputs { l: number; unidadL: string; c: number; unidadC: string; r?: number; }
export interface ResonanciaLcCircuitoOutputs { fResonancia: string; angFrec: string; xL: string; xC: string; q: string; resumen: string; _insight?: any; _chart?: any; }

const ML: Record<string, number> = { nH: 1e-9, uH: 1e-6, mH: 1e-3, H: 1 };
const MC: Record<string, number> = { pF: 1e-12, nF: 1e-9, uF: 1e-6 };

function fmtHz(f: number): string { if (f >= 1e6) return (f/1e6).toFixed(3)+' MHz'; if (f >= 1e3) return (f/1e3).toFixed(2)+' kHz'; return f.toFixed(1)+' Hz'; }
function fmtOhm(o: number): string { if (o >= 1e3) return (o/1e3).toFixed(2)+' kΩ'; return o.toFixed(2)+' Ω'; }

export function resonanciaLcCircuito(i: ResonanciaLcCircuitoInputs): ResonanciaLcCircuitoOutputs {
  const l = Number(i.l) * (ML[i.unidadL] ?? 1e-6);
  const c = Number(i.c) * (MC[i.unidadC] ?? 1e-9);
  if (!l || l <= 0 || !c || c <= 0) throw new Error('Ingresá L y C');
  const fr = 1 / (2 * Math.PI * Math.sqrt(l * c));
  const omega = 2 * Math.PI * fr;
  const xL = omega * l; const xC = 1 / (omega * c);
  const r = Number(i.r ?? 0);
  const q = r > 0 ? Math.sqrt(l / c) / r : 0;
  const insight = r > 0
    ? {
        title: q >= 50 ? 'Circuito muy selectivo' : q >= 10 ? 'Selectividad moderada' : 'Banda ancha',
        text: `A la resonancia de **${fmtHz(fr)}** las reactancias se cancelan (XL = XC = **${fmtOhm(xL)}**) y el factor de calidad es **Q = ${q.toFixed(1)}**, ${q >= 50 ? 'un pico muy agudo ideal para filtrar una frecuencia precisa' : q >= 10 ? 'un compromiso típico entre ancho de banda y selectividad' : 'una respuesta ancha, poco selectiva'}.`,
        tone: q >= 10 ? 'good' : 'neutral',
        icon: q >= 10 ? '📡' : '📻',
      }
    : {
        title: 'Frecuencia de resonancia',
        text: `Con L y C dados, el circuito resuena en **${fmtHz(fr)}**, donde XL = XC = **${fmtOhm(xL)}** se anulan entre sí. Ingresá la resistencia **R** para obtener el factor de calidad Q y el ancho de banda.`,
        tone: 'neutral',
        icon: '〰️',
      };
  const out: ResonanciaLcCircuitoOutputs = {
    fResonancia: fmtHz(fr), angFrec: (omega / 1e6).toFixed(3) + ' Mrad/s',
    xL: fmtOhm(xL), xC: fmtOhm(xC),
    q: r > 0 ? q.toFixed(1) : 'Ingresá R para calcular Q',
    resumen: `Resonancia a ${fmtHz(fr)}. XL = XC = ${fmtOhm(xL)} en el punto resonante.${r > 0 ? ' Factor Q = ' + q.toFixed(1) + '.' : ''}`,
    _insight: insight,
  };
  if (r > 0) {
    out._chart = {
      type: 'scale',
      marker: Number(q.toFixed(1)),
      markerLabel: 'Q = ' + q.toFixed(1),
      min: 0,
      segments: [
        { nombre: 'Banda ancha', max: 10, color: '#fbbf24', colorDark: '#f59e0b' },
        { nombre: 'Moderada', max: 50, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Muy selectivo', max: Math.max(100, q * 1.2), color: '#34d399', colorDark: '#10b981' },
      ],
      ariaLabel: `Factor de calidad Q de ${q.toFixed(1)} en la escala de selectividad del circuito`,
    };
  }
  return out;
}
