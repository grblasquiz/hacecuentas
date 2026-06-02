/** Setup Streamer Presupuesto */
export interface Inputs { nivel: string; yaTienePC: string; plataforma: string; }
export interface Outputs { presupuestoTotal: string; desglose: string; recomendacion: string; nota: string; _insight?: any; _chart?: any; }

export function streamerSetupPresupuesto(i: Inputs): Outputs {
  const n = String(i.nivel);
  const pc = String(i.yaTienePC);
  const plat = String(i.plataforma);
  if (!n || !pc || !plat) throw new Error('Seleccioná todos los campos');
  const baseByNivel: Record<string, { pc: number; cam: number; mic: number; luz: number; extras: number }> = {
    'Starter (lo básico)': { pc: 600, cam: 70, mic: 60, luz: 30, extras: 40 },
    'Medio (quality)': { pc: 1800, cam: 200, mic: 320, luz: 150, extras: 230 },
    'Pro (broadcast quality)': { pc: 4500, cam: 1200, mic: 600, luz: 700, extras: 600 },
  };
  const base = baseByNivel[n] || baseByNivel['Starter (lo básico)'];
  let pcCost = base.pc;
  if (pc.startsWith('Sí (no')) pcCost = 0;
  else if (pc.includes('segundo')) pcCost = Math.round(pcCost * 0.7);
  const extrasPlat = plat === 'Multi-plataforma' ? 30 * 12 : 0;
  const extrasTotal = base.extras + extrasPlat;
  const total = pcCost + base.cam + base.mic + base.luz + extrasTotal;
  const rec = n.startsWith('Starter') ? 'Priorizá invertir en micrófono antes que en cámara: 80% de la calidad percibida es el audio' : (n.startsWith('Medio') ? 'Stream Deck + mic XLR son los mejores upgrades después del básico' : 'En pro, el ROI está en 2-PC setup + cámara DSLR');

  const items = [
    { label: 'PC', value: pcCost },
    { label: 'Cámara', value: base.cam },
    { label: 'Micrófono', value: base.mic },
    { label: 'Iluminación', value: base.luz },
    { label: 'Extras', value: extrasTotal },
  ].filter(s => s.value > 0);
  const pcPct = total > 0 ? Math.round((pcCost / total) * 100) : 0;
  const sinPC = pcCost === 0;
  const _insight = {
    title: 'Tu presupuesto de arranque',
    text: sinPC
      ? `Como ya tenés PC, el setup de streaming te sale **$${total.toLocaleString('en-US')} USD**: cámara, micrófono, luz y extras. ${rec}.`
      : `Armar este setup cuesta **$${total.toLocaleString('en-US')} USD**, y la PC se lleva el **${pcPct}% ($${pcCost.toLocaleString('en-US')})**. ${rec}.`,
    tone: 'neutral',
    icon: '🎙️',
  };

  const _chart = {
    type: 'doughnut',
    slices: items,
    prefix: '$',
    centerValue: `$${total.toLocaleString('en-US')}`,
    centerLabel: 'USD total',
    ariaLabel: `Presupuesto de streaming de $${total} USD repartido entre ${items.map(s => s.label).join(', ')}`,
  };

  return {
    presupuestoTotal: `$${total.toLocaleString('en-US')} USD`,
    desglose: `PC: $${pcCost} | Cámara: $${base.cam} | Mic: $${base.mic} | Luz: $${base.luz} | Extras: $${extrasTotal}`,
    recomendacion: rec,
    nota: pc.includes('segundo') ? 'Segundo PC dedicado a stream asume reutilizar monitores y periféricos' : 'Presupuesto no incluye internet (50-150 USD/mes aparte)',
    _insight,
    _chart,
  };
}
