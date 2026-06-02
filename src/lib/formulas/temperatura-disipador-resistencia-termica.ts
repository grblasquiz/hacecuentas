export interface TemperaturaDisipadorResistenciaTermicaInputs { potenciaDisipada: number; ambiente: number; thetaJC: number; thetaCS: number; thetaSA: number; tjMax?: number; }
export interface TemperaturaDisipadorResistenciaTermicaOutputs { tj: string; margenSeguridad: string; resumen: string; _insight?: any; _chart?: any; }
export function temperaturaDisipadorResistenciaTermica(i: TemperaturaDisipadorResistenciaTermicaInputs): TemperaturaDisipadorResistenciaTermicaOutputs {
  const p = Number(i.potenciaDisipada); const ta = Number(i.ambiente);
  const jc = Number(i.thetaJC); const cs = Number(i.thetaCS); const sa = Number(i.thetaSA);
  const tjMax = Number(i.tjMax ?? 125);
  if (!p || ta === null) throw new Error('Completá campos');
  const theta = jc + cs + sa;
  const tj = ta + p * theta;
  const margen = tjMax - tj;
  const seguro = margen > 30, ajustado = margen > 10 && margen <= 30;
  const tjR = Number(tj.toFixed(1));
  const segUltimoMax = Math.max(tjMax + 5, tjR + 5);
  return { tj: tj.toFixed(1) + '°C', margenSeguridad: margen.toFixed(1) + '°C',
    resumen: `Tj = ${tj.toFixed(1)}°C (ambiente ${ta}°C + P×θ). Margen ${margen.toFixed(0)}°C vs Tj máx ${tjMax}°C. ${margen > 30 ? '✅ Seguro' : margen > 10 ? '⚠️ Ajustado' : '❌ Peligroso — mejorar disipador'}.`,
    _insight: {
      title: seguro ? 'Diseño seguro' : ajustado ? 'Margen ajustado' : 'Riesgo térmico',
      text: seguro
        ? `La juntura llega a **${tjR}°C** con un ambiente de ${ta}°C, dejando **${margen.toFixed(0)}°C** de margen frente al máximo de ${tjMax}°C. Es un diseño térmico holgado: el disipador está bien dimensionado.`
        : ajustado
          ? `La juntura llega a **${tjR}°C** y el máximo es ${tjMax}°C: te quedan solo **${margen.toFixed(0)}°C** de margen. Funciona, pero cualquier suba de ambiente o de potencia te acerca al límite. Conviene un disipador con menor θSA.`
          : `La juntura alcanzaría **${tjR}°C** contra un máximo de ${tjMax}°C: el margen es de apenas **${margen.toFixed(0)}°C**${margen < 0 ? ' (lo superás)' : ''}. El componente se degrada o falla. Necesitás mejor disipador, ventilación forzada o bajar la potencia disipada (${p} W).`,
      tone: seguro ? 'good' : ajustado ? 'neutral' : 'warn',
      icon: '🌡️',
    },
    _chart: {
      type: 'scale',
      marker: tjR,
      markerLabel: `Tj ${tjR}°C`,
      min: Math.min(ta, 0),
      segments: [
        { nombre: 'Seguro', max: tjMax - 30, color: '#86efac', colorDark: '#22c55e' },
        { nombre: 'Ajustado', max: tjMax - 10, color: '#fde68a', colorDark: '#f59e0b' },
        { nombre: 'Límite', max: tjMax, color: '#fdba74', colorDark: '#f97316' },
        { nombre: 'Sobre Tj máx', max: segUltimoMax, color: '#fca5a5', colorDark: '#ef4444' },
      ],
      ariaLabel: `Temperatura de juntura ${tjR}°C frente al máximo de ${tjMax}°C.`,
    },
  };
}
