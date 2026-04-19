export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pamiPrestacionesMontoCopago2026(i: Inputs): Outputs {
  const p=String(i.prestacion||'med');
  const cov: Record<string,[string,string]> = {
    med:['50-100% según vademecum','Copago nominal en ciertos'],
    odont:['100% prestaciones básicas','Sin copago urgencia'],
    opt:['Lentes cada 2 años','Copago material estándar'],
    rehab:['100% kinesio, fonoaudiología','Sin copago'],
    intern:['100% urgencia y programada','Sin copago afiliado']
  };
  const [c,cp]=cov[p]||cov.med;
  return { cobertura:c, copago:cp, resumen:`PAMI ${p}: ${c}, ${cp}.` };
}
