export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }
export function maternidadLicenciaSueldoAnsesDuracion(i: Inputs): Outputs {
  const r=String(i.regimen||'lct_empleada'); const s=Number(i.sueldoBruto)||0;
  const data={'lct_empleada':{dias:90,pct:'100%',pag:'ANSES (acreditado por empleador)'},'monotributo':{dias:0,pct:'Asignación por Hijo',pag:'No aplica licencia, sí AUH'},'autonoma':{dias:0,pct:'Asignación por Hijo',pag:'No aplica'},'ama_casa':{dias:0,pct:'Asignación universal',pag:'No corresponde'}}[r];
  const tieneLicencia = data.dias > 0;
  const insight = tieneLicencia
    ? {
        title: 'Tu licencia por maternidad',
        text: `Como empleada en relación de dependencia tenés **${data.dias} días** de licencia con el **${data.pct} del sueldo**${s>0?` (≈ $${s.toLocaleString('es-AR')} brutos)`:''}, pagados por ${data.pag}.`,
        tone: 'good',
        icon: '🤰',
      }
    : {
        title: 'Sin licencia paga',
        text: `Tu régimen **no incluye licencia por maternidad paga**: el respaldo es la ${data.pct.toLowerCase()}. Lo cubre: ${data.pag}.`,
        tone: 'warn',
        icon: '🤰',
      };
  return { diasLicencia:`${data.dias} días`, porcentajeSueldo:data.pct, quienPaga:data.pag, _insight: insight };
}
