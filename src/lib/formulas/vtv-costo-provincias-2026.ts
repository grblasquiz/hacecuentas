export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vtvCostoProvincias2026(i: Inputs): Outputs {
  const p=String(i.provincia||'pba'); const t=String(i.tipo||'auto');
  const base={'caba':45000,'pba':40000,'cordoba':38000,'santa_fe':35000,'mendoza':32000,'otras':40000}[p];
  const mult={'auto':1,'camioneta':1.3,'moto':0.5,'taxi':1.2}[t];
  const total=base*mult;
  const frecuencia=t==='taxi'?'Anual':'Cada 2 años (autos <10 años)';
  const out: Outputs = { costo:`$${Math.round(total).toLocaleString('es-AR')}`, frecuencia, penalizacion:'Multa + impedimento circular' };
  if (Number.isFinite(total)) {
    out._insight = {
      title: 'Costo y cada cuánto',
      text: `La VTV de tu **${t}** en **${p.replace('_',' ').toUpperCase()}** cuesta unos **$${Math.round(total).toLocaleString('es-AR')}** y se renueva **${frecuencia.toLowerCase()}**. Circular sin VTV vigente implica multa e impedimento de circulación.`,
      tone: 'warn',
      icon: '🔧',
    };
  }
  return out;
}
