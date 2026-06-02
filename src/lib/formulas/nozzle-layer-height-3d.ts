/**
 * Calculadora de nozzle y layer height compatibles
 */

export interface Inputs {
  nozzle: number; objetivo: number;
}

export interface Outputs {
  layerRecomendado: string; rangoPermitido: string; extrusionWidth: string; consejo: string;
  _insight?: any; _chart?: any;
}

export function nozzleLayerHeight3d(inputs: Inputs): Outputs {
  const nz = Number(inputs.nozzle);
  const obj = Math.round(Number(inputs.objetivo));
  if (!nz || nz <= 0) throw new Error('Ingresá nozzle válido');
  const min = nz * 0.25;
  const max = nz * 0.75;
  const factores: Record<number, number> = { 1: 0.30, 2: 0.50, 3: 0.70 };
  const f = factores[obj] || 0.50;
  const rec = nz * f;
  const width = nz * 1.12;
  const consejos: Record<number, string> = {
    1: 'Layer bajo = mejor calidad curva, 2× tiempo. Ideal miniaturas.',
    2: 'Balance óptimo de calidad, tiempo y resistencia. Recomendado general.',
    3: 'Layer alto = velocidad, menos detalle. Prototipos o piezas internas.',
  };
  const pct = Math.round(f * 100);
  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  let perfil: string;
  if (f <= 0.30) { tone = 'neutral'; icon = '💎'; perfil = `prioriza el detalle (capas finas, casi el doble de tiempo de impresión)`; }
  else if (f >= 0.70) { tone = 'warn'; icon = '⚡'; perfil = `prioriza la velocidad (capas gruesas, menos detalle y curvas más escalonadas)`; }
  else { tone = 'good'; icon = '🖨️'; perfil = `equilibra calidad, tiempo y resistencia: es la opción recomendada para uso general`; }
  const _insight = {
    title: 'Tu altura de capa',
    text: `Para un nozzle de **${nz.toFixed(2)} mm**, una capa de **${rec.toFixed(2)} mm** (${pct}% del diámetro) ${perfil}. Mantenete dentro de **${min.toFixed(2)}–${max.toFixed(2)} mm** (regla del 25–75%) para una adhesión y extrusión confiables.`,
    tone,
    icon,
  };

  const _chart = {
    type: 'scale',
    marker: Number(rec.toFixed(2)),
    markerLabel: `Capa ${rec.toFixed(2)} mm`,
    min: 0,
    segments: [
      { nombre: 'Muy fino', max: Number(min.toFixed(2)), color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Detalle', max: Number((nz * 0.4).toFixed(2)), color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Equilibrado', max: Number((nz * 0.6).toFixed(2)), color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Velocidad', max: Number(max.toFixed(2)), color: '#eab308', colorDark: '#ca8a04' },
      { nombre: 'Muy grueso', max: Number(nz.toFixed(2)), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `La altura de capa recomendada de ${rec.toFixed(2)} mm dentro del rango imprimible de un nozzle de ${nz.toFixed(2)} mm`,
  };

  return {
    layerRecomendado: `${rec.toFixed(2)} mm`,
    rangoPermitido: `${min.toFixed(2)} a ${max.toFixed(2)} mm (25-75%)`,
    extrusionWidth: `${width.toFixed(2)} mm (112% del nozzle)`,
    consejo: consejos[obj] || consejos[2],
    _insight,
    _chart,
  };
}
