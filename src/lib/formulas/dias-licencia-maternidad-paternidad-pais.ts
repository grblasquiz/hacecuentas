export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function diasLicenciaMaternidadPaternidadPais(i: Inputs): Outputs {
  const p=String(i.pais||'ar'); const t=String(i.tipo||'mat');
  const map:Record<string,Record<string,number>>={ar:{mat:90,pat:2},es:{mat:112,pat:112},mx:{mat:84,pat:5},co:{mat:126,pat:14}};
  const d=(map[p]&&map[p][t])||0;
  return { dias:`${d} días`, remunerada:'Sí', resumen:`${p.toUpperCase()} ${t}: ${d} días remunerados.` };
}
