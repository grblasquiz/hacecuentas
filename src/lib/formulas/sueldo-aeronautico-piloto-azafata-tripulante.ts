export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoAeronauticoPilotoAzafataTripulante(i: Inputs): Outputs {
  const p=String(i.puesto||'trip'); const hv=Number(i.horasVuelo)||0; const ant=Number(i.antiguedad)||0;
  const bases: Record<string,[number,number]> = {
    'piloto-com': [3500000, 45000],
    'copilot': [2200000, 32000],
    'trip': [900000, 12000],
    'despach': [1100000, 0]
  };
  const [b,hora]=bases[p]||bases.trip;
  const basicoAntig=b*(1+ant*0.01);
  const horas=hora*hv;
  const bruto=basicoAntig+horas;
  const neto=bruto*0.80;
  return { basico:'$'+basicoAntig.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), horasPago:'$'+horas.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${p} con ${hv} horas vuelo + antigüedad ${ant}y: neto ~$${neto.toFixed(0)}.` };
}
