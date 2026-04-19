export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoEnfermeroHospitalPublicoCategoria(i: Inputs): Outputs {
  const sec=String(i.sector||'pub'); const cat=String(i.categoria||'prof'); const g=Number(i.guardias)||0;
  const bases: Record<string,Record<string,number>> = {
    pub: { auxi:800000, prof:900000, lic:1100000 },
    priv: { auxi:900000, prof:1050000, lic:1250000 },
    dom: { auxi:700000, prof:850000, lic:950000 }
  };
  const b=(bases[sec]||bases.pub)[cat]||900000;
  const guardia=(sec==='priv'?90000:70000)*g;
  const bruto=b+guardia;
  const neto=bruto*0.83;
  return { basico:'$'+b.toLocaleString('es-AR'), guardiasM:'$'+guardia.toLocaleString('es-AR'), neto:'$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${cat} ${sec} + ${g} guardias: neto ~$${neto.toFixed(0)}.` };
}
