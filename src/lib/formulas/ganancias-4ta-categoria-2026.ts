export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ganancias4taCategoria2026(i: Inputs): Outputs {
  const b=Number(i.sueldoBruto)||0; const cf=Number(i.cargasFamiliares)||0;
  const aportes=b*0.17; const neto=b-aportes;
  const ingresoAnual=neto*13; const mni=1800000; const cargaFam=cf*900000;
  const baseImponible=Math.max(0, ingresoAnual-mni-cargaFam);
  let imp=0;
  const tramos=[[1000000,0.05],[2000000,0.09],[3000000,0.12],[5000000,0.15],[8000000,0.19],[12000000,0.23],[20000000,0.27],[40000000,0.31],[Infinity,0.35]];
  let restante=baseImponible; let ant=0;
  for (const [tope,tasa] of tramos){ const seg=Math.min(restante, (tope as number)-ant); if (seg<=0) break; imp+=seg*(tasa as number); restante-=seg; ant=tope as number; if(restante<=0) break; }
  const impMensual=Math.round(imp/13);
  const alicEf=ingresoAnual>0?(imp/ingresoAnual*100).toFixed(2):'0';
  return { impuestoMensual:`$${impMensual.toLocaleString('es-AR')}`, alicuotaEfectiva:`${alicEf}%`, sueldoNeto:`$${Math.round(neto-impMensual).toLocaleString('es-AR')}` };
}
