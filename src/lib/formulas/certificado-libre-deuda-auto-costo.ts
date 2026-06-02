export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function certificadoLibreDeudaAutoCosto(i: Inputs): Outputs {
  const p=String(i.provincia||'caba');
  const c: Record<string,number> = { caba:15000, pba:18000, cba:14000 };
  const costo = c[p] || 15000;
  const costoFmt = '$' + costo.toLocaleString('es-AR');
  const provLabel: Record<string,string> = { caba:'CABA', pba:'Buenos Aires', cba:'Córdoba' };
  const pl = provLabel[p] || p.toUpperCase();
  const _insight = {
    title: 'Costo del libre deuda',
    text: `El certificado de libre deuda del auto en **${pl}** cuesta **${costoFmt}** y se tramita **online en 24-48 h**. Pedilo cerca de la fecha de la transferencia, ya que suele exigirse vigente al momento de firmar.`,
    tone: 'neutral',
    icon: '🚗',
  };
  return { costo: costoFmt, tiempo:'24-48h online', resumen:`Libre deuda ${p}: ${costoFmt}.`, _insight };
}
