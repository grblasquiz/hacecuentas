export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function maternidadLicenciaSueldoAnsesDuracion(i: Inputs): Outputs {
  const r=String(i.regimen||'lct_empleada'); const s=Number(i.sueldoBruto)||0;
  const data={'lct_empleada':{dias:90,pct:'100%',pag:'ANSES (acreditado por empleador)'},'monotributo':{dias:0,pct:'Asignación por Hijo',pag:'No aplica licencia, sí AUH'},'autonoma':{dias:0,pct:'Asignación por Hijo',pag:'No aplica'},'ama_casa':{dias:0,pct:'Asignación universal',pag:'No corresponde'}}[r];
  return { diasLicencia:`${data.dias} días`, porcentajeSueldo:data.pct, quienPaga:data.pag };
}
