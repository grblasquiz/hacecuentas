export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function raidCapacidadDiscosRedundancia(i: Inputs): Outputs {
  const t=String(i.tipo||'0'); const n=Math.floor(Number(i.n)||0); const tb=Number(i.tb)||0;
  let util=0; let tol='0';
  if (t==='0') { util=n*tb; tol='0'; }
  else if (t==='1') { util=tb; tol=`${n-1}`; }
  else if (t==='5') { util=(n-1)*tb; tol='1'; }
  else if (t==='6') { util=(n-2)*tb; tol='2'; }
  else if (t==='10') { util=(n/2)*tb; tol='1+'; }
  return { util:`${util.toFixed(1)} TB`, tolerancia:tol, resumen:`RAID ${t} con ${n}×${tb}TB: ${util.toFixed(1)}TB útil, tolera ${tol} fallo(s).` };
}
