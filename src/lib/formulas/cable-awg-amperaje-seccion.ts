const TABLA_AWG = [{awg: 18, mm2: 0.82, d: 1.02, a: 10}, {awg: 16, mm2: 1.31, d: 1.29, a: 13}, {awg: 14, mm2: 2.08, d: 1.63, a: 15}, {awg: 12, mm2: 3.31, d: 2.05, a: 20}, {awg: 10, mm2: 5.26, d: 2.59, a: 30}, {awg: 8, mm2: 8.37, d: 3.26, a: 40}, {awg: 6, mm2: 13.3, d: 4.11, a: 55}, {awg: 4, mm2: 21.2, d: 5.19, a: 70}, {awg: 2, mm2: 33.6, d: 6.54, a: 95}];
export interface CableAwgAmperajeSeccionInputs { corriente: number; tipoInstalacion: string; __lang?: string; }
export interface CableAwgAmperajeSeccionOutputs { awg: string; seccionMm2: string; diametroMm: string; resumen: string; _insight?: any; _chart?: any; }
export function cableAwgAmperajeSeccion(i: CableAwgAmperajeSeccionInputs): CableAwgAmperajeSeccionOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const c = Number(i.corriente);
  if (!c || c <= 0) throw new Error(__lang === 'en' ? 'Enter current' : 'Ingresá corriente');
  const entry = TABLA_AWG.find(e => e.a >= c) ?? TABLA_AWG[TABLA_AWG.length - 1];
  const carga = (c / entry.a) * 100; // % de uso del cable elegido
  const margen = entry.a - c; // amperes de holgura
  const ajustado = carga > 90;
  const insight = {
    title: __lang === 'en' ? 'Cable headroom' : 'Margen del cable',
    text: __lang === 'en'
      ? `**AWG ${entry.awg}** carries up to **${entry.a} A** and you draw **${c} A**, so it runs at **${carga.toFixed(0)}%** of its limit (${margen.toFixed(0)} A spare). ${ajustado ? 'That is tight — consider the next thicker gauge for long runs or continuous loads.' : 'Comfortable margin for a safe install.'}`
      : `El **AWG ${entry.awg}** soporta hasta **${entry.a} A** y vos consumís **${c} A**, así que trabaja al **${carga.toFixed(0)}%** de su límite (${margen.toFixed(0)} A de margen). ${ajustado ? 'Está justo — para tiradas largas o cargas continuas conviene la sección siguiente.' : 'Margen cómodo para una instalación segura.'}`,
    tone: ajustado ? 'warn' : 'good',
    icon: '🔌',
  };
  const chart = {
    type: 'scale',
    marker: Number(c.toFixed(0)),
    markerLabel: __lang === 'en' ? `Load: ${c} A` : `Carga: ${c} A`,
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Comfortable' : 'Holgado', max: Number((entry.a * 0.7).toFixed(0)), color: '#16a34a', colorDark: '#22c55e' },
      { nombre: __lang === 'en' ? 'Tight' : 'Ajustado', max: Number((entry.a * 0.9).toFixed(0)), color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: __lang === 'en' ? 'At limit' : 'Al límite', max: entry.a, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: __lang === 'en' ? `Load of ${c} A against the ${entry.a} A capacity of AWG ${entry.awg}` : `Carga de ${c} A frente a la capacidad de ${entry.a} A del AWG ${entry.awg}`,
  };
  return { awg: 'AWG ' + entry.awg, seccionMm2: entry.mm2.toFixed(2) + ' mm²', diametroMm: entry.d.toFixed(2) + ' mm',
    resumen: __lang === 'en'
      ? `For ${c} A you need AWG ${entry.awg} (${entry.mm2} mm², diameter ${entry.d} mm). Supports up to ${entry.a} A.`
      : `Para ${c} A necesitás AWG ${entry.awg} (${entry.mm2} mm², diámetro ${entry.d} mm). Soporta hasta ${entry.a} A.`,
    _insight: insight, _chart: chart };
}
