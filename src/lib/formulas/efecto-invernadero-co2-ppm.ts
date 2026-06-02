export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function efectoInvernaderoCo2Ppm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const c = Number(i.c); const c0 = Number(i.c0) || 280;
  if (!c || c <= 0) throw new Error(__lang === 'en' ? 'Enter a concentration' : 'Ingresá concentración');
  const dF = 5.35 * Math.log(c / c0);
  const resumen = __lang === 'en'
    ? `Radiative forcing ΔF = ${dF.toFixed(2)} W/m² (CO₂ ${c} ppm vs ${c0} pre-industrial).`
    : `Forzamiento radiativo ΔF = ${dF.toFixed(2)} W/m² (CO₂ ${c} ppm vs ${c0} pre-industrial).`;
  const pct = ((c / c0 - 1) * 100);
  // Tono dinámico según la magnitud del forzamiento (positivo = calentamiento)
  const tone = dF >= 2 ? 'warn' : dF > 0 ? 'neutral' : 'good';
  const insight = {
    title: __lang === 'en' ? 'What this forcing means' : 'Qué significa este forzamiento',
    text: __lang === 'en'
      ? `At **${c} ppm** CO₂ (vs ${c0} pre-industrial, **+${pct.toFixed(0)}%**) the extra radiative forcing is **${dF.toFixed(2)} W/m²** — energy trapped per square metre that drives warming.`
      : `Con **${c} ppm** de CO₂ (vs ${c0} pre-industrial, **+${pct.toFixed(0)}%**) el forzamiento radiativo extra es de **${dF.toFixed(2)} W/m²**: energía atrapada por metro cuadrado que impulsa el calentamiento.`,
    tone,
    icon: '🌍',
  };
  // Gauge: zonas de forzamiento radiativo (W/m²). Marker > 0 = calentamiento.
  const lastMax = Math.max(4, Math.ceil(dF + 0.5));
  const chart = {
    type: 'scale',
    marker: Number(dF.toFixed(2)),
    markerLabel: dF.toFixed(2) + ' W/m²',
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Low' : 'Bajo', max: 1, color: '#86efac', colorDark: '#4ade80' },
      { nombre: __lang === 'en' ? 'Moderate' : 'Moderado', max: 2, color: '#fde68a', colorDark: '#fbbf24' },
      { nombre: __lang === 'en' ? 'High' : 'Alto', max: lastMax, color: '#fca5a5', colorDark: '#f87171' },
    ],
    ariaLabel: __lang === 'en'
      ? `Radiative forcing of ${dF.toFixed(2)} W/m² on a low-to-high scale`
      : `Forzamiento radiativo de ${dF.toFixed(2)} W/m² en una escala de bajo a alto`,
  };
  return { forzamiento: dF.toFixed(2) + ' W/m²', resumen, _insight: insight, _chart: chart };
}
