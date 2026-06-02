export interface Inputs { anchoPlacardCm: number; altoPlacardCm: number; profundidadCm: number; tipoUso?: string; }
export interface Outputs { zonaColgar: string; zonaEstantes: string; zonaCajones: string; distribucion: string; _insight?: any; _chart?: any; }
export function organizadorPlacardEspacios(i: Inputs): Outputs {
  const ancho = Number(i.anchoPlacardCm); const alto = Number(i.altoPlacardCm); const prof = Number(i.profundidadCm);
  if (!ancho || !alto || !prof) throw new Error('Ingresá las medidas del placard');
  const tipo = String(i.tipoUso || 'mixto');
  const pColgar = tipo === 'formal' ? 0.6 : tipo === 'casual' ? 0.3 : tipo === 'ninos' ? 0.25 : 0.45;
  const pEstantes = tipo === 'formal' ? 0.2 : tipo === 'casual' ? 0.4 : tipo === 'ninos' ? 0.45 : 0.3;
  const pCajones = 1 - pColgar - pEstantes;
  const cmColgar = Math.round(ancho * pColgar);
  const cmEstantes = Math.round(ancho * pEstantes);
  const cmCajones = ancho - cmColgar - cmEstantes;
  const altoBarra = tipo === 'formal' ? 120 : tipo === 'ninos' ? 80 : 100;
  const zonaDom = cmColgar >= cmEstantes && cmColgar >= cmCajones ? 'colgado' : cmEstantes >= cmCajones ? 'estantes' : 'cajones';
  const nombreUso = tipo === 'formal' ? 'formal (mucho para colgar)' : tipo === 'casual' ? 'casual (predomina el doblado)' : tipo === 'ninos' ? 'infantil (poca barra, más estantes)' : 'mixto (uso equilibrado)';
  return {
    zonaColgar: `${cmColgar} cm — barra a ${altoBarra} cm`,
    zonaEstantes: `${cmEstantes} cm de ancho — estantes cada 30 cm para remeras, buzos, toallas dobladas`,
    zonaCajones: `${cmCajones} cm de ancho — 3-4 cajones de 15-20 cm alto para ropa interior, medias, accesorios`,
    distribucion: `Colgar: ${Math.round(pColgar*100)}% | Estantes: ${Math.round(pEstantes*100)}% | Cajones: ${Math.round(pCajones*100)}%`,
    _insight: {
      title: 'Cómo aprovechar tu placard',
      text: `Con **${ancho} cm** de ancho y uso ${nombreUso}, la zona que más manda es la de **${zonaDom}** (${zonaDom === 'colgado' ? cmColgar : zonaDom === 'estantes' ? cmEstantes : cmCajones} cm). La barra de colgar va a **${altoBarra} cm** del piso.`,
      tone: 'neutral',
      icon: '🚪',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Colgar', value: cmColgar },
        { label: 'Estantes', value: cmEstantes },
        { label: 'Cajones', value: cmCajones },
      ],
      prefix: '',
      centerValue: `${ancho} cm`,
      centerLabel: 'ancho total',
      ariaLabel: `Reparto del ancho del placard: ${cmColgar} cm para colgar, ${cmEstantes} cm de estantes y ${cmCajones} cm de cajones`,
    },
  };
}