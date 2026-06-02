export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function pamiPrestacionesMontoCopago2026(i: Inputs): Outputs {
  const p=String(i.prestacion||'med');
  const cov: Record<string,[string,string]> = {
    med:['50-100% según vademecum','Copago nominal en ciertos'],
    odont:['100% prestaciones básicas','Sin copago urgencia'],
    opt:['Lentes cada 2 años','Copago material estándar'],
    rehab:['100% kinesio, fonoaudiología','Sin copago'],
    intern:['100% urgencia y programada','Sin copago afiliado']
  };
  const nombre: Record<string,string> = {
    med:'medicamentos', odont:'odontología', opt:'óptica', rehab:'rehabilitación', intern:'internación'
  };
  const [c,cp]=cov[p]||cov.med;
  const n = nombre[p] || nombre.med;
  const conSubsidio = p === 'med';
  return {
    cobertura:c,
    copago:cp,
    resumen:`PAMI ${p}: ${c}, ${cp}.`,
    _insight: {
      title: `Cobertura PAMI en ${n}`,
      text: conSubsidio
        ? `En **${n}** la cobertura va del **${c}** según el vademécum, con **${cp.toLowerCase()}**. Pedí siempre el subsidio social al 100% si tu jubilación está cerca del haber mínimo.`
        : `En **${n}** tenés **${c}**, con **${cp.toLowerCase()}**. Confirmá que el prestador esté en cartilla PAMI antes de la atención para que aplique sin sorpresas.`,
      tone: 'neutral',
      icon: '🏥',
    },
  };
}
