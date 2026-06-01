export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function consumoElectronicaHogarWattsMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const w=Number(i.w)||0; const h=Number(i.hdia)||0; const t=Number(i.tarifa)||0.15;
  const k=w*h*30/1000; const c=k*t;
  const resumen = __lang === 'en'
    ? `${w}W × ${h}h/day = ${k.toFixed(1)} kWh/month ≈ $${c.toFixed(2)}.`
    : `${w}W × ${h}h/día = ${k.toFixed(1)} kWh/mes ≈ $${c.toFixed(2)}.`;
  return { kwhMes:`${k.toFixed(1)} kWh`, costo:`$${c.toFixed(2)}`, anual:`$${(c*12).toFixed(2)}`, resumen };
}
