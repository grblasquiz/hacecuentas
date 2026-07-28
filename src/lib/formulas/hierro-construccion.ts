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
  _insight?: any;
  _chart?: any;
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
  const desperd = (Number.isFinite(Number(i.desperdicio)) ? Number(i.desperdicio) : 7);
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

  const kgFinal = Math.round(kgTotales);
  const totalBarras = barras8 + barras10 + barras12;
  const diamUsado = t.diam;
  const fmtKg = (n: number) => `${Math.round(n).toLocaleString('es-AR')} kg`;

  const _insight = {
    title: 'Tu cómputo de acero',
    text: `Para ${m2} m² de **${t.nombre.toLowerCase()}** necesitás **${fmtKg(kgFinal)}** de hierro (**${kgPorM2.toFixed(1)} kg/m²**), que se arman con **${totalBarras} barras de Ø${diamUsado} mm** (12 m c/u) más **${alambre} kg de alambre** de atar. Pedí siempre algún metro de más: el desperdicio por cortes y solapes ya está contemplado al ${desperd}%.`,
    tone: 'neutral' as const,
    icon: '🏗️',
  };

  // Donut: composición del acero a comprar (barras estructurales + alambre de atar = total)
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Barras Ø${diamUsado} mm`, value: kgFinal },
      { label: 'Alambre de atar', value: alambre },
    ],
    prefix: '',
    centerValue: fmtKg(kgFinal + alambre),
    centerLabel: 'Acero total',
    ariaLabel: `El acero total a comprar (${fmtKg(kgFinal + alambre)}) se compone de ${fmtKg(kgFinal)} en barras y ${alambre} kg de alambre de atar.`,
  };

  return {
    kgTotales: kgFinal,
    kgPorM2: Number(kgPorM2.toFixed(2)),
    barras8mm: barras8,
    barras10mm: barras10,
    barras12mm: barras12,
    alambre,
    tipo: t.nombre,
    resumen: `Necesitás ~${kgFinal} kg de hierro (${kgPorM2.toFixed(1)} kg/m²) para ${m2} m² de ${t.nombre.toLowerCase()}.`,
    _insight,
    _chart,
  };
}
