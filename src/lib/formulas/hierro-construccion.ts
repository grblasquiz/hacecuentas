/** Hierro (acero) por m² de losa según diseño y luz */
export interface Inputs {
  m2: number;
  luz?: number; // luz de la losa en metros
  tipoLosa?: string;
  desperdicio?: number;
}
export interface Outputs {
  kgTotales: number;
  kgPorM2: number;
  barras8mm: number;
  barras10mm: number;
  barras12mm: number;
  alambre: number;
  tipo: string;
  resumen: string;
}

// kg/m² aproximados según tipo de losa y luz típica
const TIPOS: Record<string, { nombre: string; kgPorM2Base: number; diam: number }> = {
  losa_maciza_corta: { nombre: 'Losa maciza luz ≤ 4 m', kgPorM2Base: 10, diam: 8 },
  losa_maciza_media: { nombre: 'Losa maciza luz 4-6 m', kgPorM2Base: 14, diam: 10 },
  losa_maciza_larga: { nombre: 'Losa maciza luz > 6 m', kgPorM2Base: 18, diam: 12 },
  losa_alivianada: { nombre: 'Losa alivianada (vigueta + bovedilla)', kgPorM2Base: 8, diam: 10 },
  platea: { nombre: 'Platea de fundación', kgPorM2Base: 12, diam: 10 },
  contrapiso: { nombre: 'Contrapiso armado', kgPorM2Base: 4, diam: 6 },
};

export function hierroConstruccion(i: Inputs): Outputs {
  const m2 = Number(i.m2);
  const luz = Number(i.luz) || 4;
  const tipo = String(i.tipoLosa || 'losa_maciza_media');
  const desperd = Number(i.desperdicio) || 7;
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m² de losa');
  if (!TIPOS[tipo]) throw new Error('Tipo de losa no válido');

  const t = TIPOS[tipo];
  // Ajuste por luz: +1 kg/m² cada metro por encima de 4 m en losa maciza
  let kgPorM2 = t.kgPorM2Base;
  if (tipo.startsWith('losa_maciza') && luz > 4) {
    kgPorM2 = t.kgPorM2Base + (luz - 4) * 2;
  }

  const factor = 1 + desperd / 100;
  const kgTotales = m2 * kgPorM2 * factor;

  // Distribución de barras (barras de 12 m estándar)
  // peso por metro: 8 mm = 0.395 kg/m; 10 mm = 0.617 kg/m; 12 mm = 0.888 kg/m
  let barras8 = 0, barras10 = 0, barras12 = 0;
  if (t.diam === 8) barras8 = Math.ceil(kgTotales / (0.395 * 12));
  else if (t.diam === 10) barras10 = Math.ceil(kgTotales / (0.617 * 12));
  else if (t.diam === 12) barras12 = Math.ceil(kgTotales / (0.888 * 12));
  else if (t.diam === 6) barras8 = Math.ceil(kgTotales / (0.222 * 12));

  // Alambre de atar: 0.02 kg/kg de hierro
  const alambre = Number((kgTotales * 0.02).toFixed(2));

  return {
    kgTotales: Math.round(kgTotales),
    kgPorM2: Number(kgPorM2.toFixed(2)),
    barras8mm: barras8,
    barras10mm: barras10,
    barras12mm: barras12,
    alambre,
    tipo: t.nombre,
    resumen: `Necesitás ~${Math.round(kgTotales)} kg de hierro (${kgPorM2.toFixed(1)} kg/m²) para ${m2} m² de ${t.nombre.toLowerCase()}.`,
  };
}
